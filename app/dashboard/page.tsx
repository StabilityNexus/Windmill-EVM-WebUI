'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useContract } from '@/hooks/useContract';
import { SUPPORTED_TOKENS, getTokenAddress, getExplorerTxUrl } from '@/lib/contractConfig';
import WalletModal from '@/components/wallet/WalletModal';
import { Zap, X, ExternalLink, RefreshCw, AlertCircle, ArrowRightLeft, Layers, CheckCircle2 } from 'lucide-react';

interface Order {
  id: number;
  type: 'Buy' | 'Sell';
  tokenIn: string;
  tokenOut: string;
  tokenInSymbol: string;
  tokenOutSymbol: string;
  amount: number;
  startPrice: number;
  currentPrice: number;
  slope: number;
  minPrice: number;
  maxPrice: number;
  expiry: number;
  createdAt: number;
  active: boolean;
  maker: string;
  onChain: boolean;
}

interface SettledMatch {
  id: number;
  buyOrderId: number;
  sellOrderId: number;
  pair: string;
  amount: string;
  price: string;
  age: string;
  txHash: string;
  keeper: string;
}

function parseRay(raw: unknown): number {
  if (raw === undefined || raw === null || raw === '') return 0;
  try {
    const str = typeof raw === 'object' && raw !== null ? raw.toString() : String(raw);
    const big = BigInt(str);
    if (big === BigInt(0)) return 0;
    const sign = big < BigInt(0) ? BigInt(-1) : BigInt(1);
    const absBig = big < BigInt(0) ? -big : big;
    const scale18 = BigInt('1000000000000000000');
    const whole = absBig / scale18;
    const rem = absBig % scale18;
    const num = (Number(whole) / 1e9 + Number(rem) / 1e27) * Number(sign);
    return Math.round(num * 1e8) / 1e8;
  } catch {
    return Number(raw) / 1e27 || 0;
  }
}

function toRayString(val: number): string {
  if (!val || isNaN(val)) return '0';
  const isNeg = val < 0;
  const absVal = Math.abs(val);
  const str = absVal.toFixed(9);
  const [intPart, decPart] = str.split('.');
  const scale27 = BigInt('1000000000000000000000000000');
  const scale18 = BigInt('1000000000000000000');
  const combined = BigInt(intPart) * scale27 + BigInt(decPart) * scale18;
  return (isNeg ? '-' : '') + combined.toString();
}

function formatPrice(val: number): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  const rounded = Math.round(val * 1e6) / 1e6;
  return rounded.toString();
}

export default function DashboardPage() {
  const { isConnected, setWalletModalOpen, fullAddress, chainId, network } = useWallet();
  const { contractAddress, rpcUrl, writeContract, readContract, readERC20, approveERC20, fetchEvents, isReady } = useContract();

  // ── Form State ────────────────────────────────────────────────────
  const [orderType, setOrderType] = useState<'Buy' | 'Sell'>('Buy');
  const [tokenIn, setTokenIn] = useState('WETH');
  const [tokenOut, setTokenOut] = useState('USDC');
  const [amount, setAmount] = useState<number>(1);
  const [startPrice, setStartPrice] = useState<number>(3000);
  const [slope, setSlope] = useState<number>(-0.2);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [expiry, setExpiry] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // ── Token Balance State ───────────────────────────────────────────
  const [userTokenBalance, setUserTokenBalance] = useState<string | null>(null);

  // ── Tab State: 'my-orders' | 'all-orders' | 'matches' ─────────────
  const [activeTab, setActiveTab] = useState<'my-orders' | 'all-orders' | 'matches'>('my-orders');

  // ── Orders State ──────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([]);
  const [settledHistory, setSettledHistory] = useState<SettledMatch[]>([]);
  const [isLoadingOnChain, setIsLoadingOnChain] = useState<boolean>(false);

  // ── Stats ─────────────────────────────────────────────────────────
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // ── Auto-Match Engine State ────────────────────────────────────────
  // Auto-match is permanently and strictly active
  const [matchingPairKeys, setMatchingPairKeys] = useState<Set<string>>(new Set());
  const inFlightMatchesRef = useRef<Set<string>>(new Set());

  // ── Available tokens for current chain ────────────────────────────
  const availableTokens = useMemo(() => {
    if (!chainId) return SUPPORTED_TOKENS;
    return SUPPORTED_TOKENS.filter((t) => t.addresses[chainId]);
  }, [chainId]);

  // ── Filtered Orders ───────────────────────────────────────────────
  const myActiveOrders = useMemo(() => {
    if (!fullAddress) return [];
    return orders.filter(
      (o) => o.active && o.maker && o.maker.toLowerCase() === fullAddress.toLowerCase()
    );
  }, [orders, fullAddress]);

  const allActiveOrders = useMemo(() => {
    return orders.filter((o) => o.active);
  }, [orders]);

  // Detect Matchable Crossover Pairs on-chain
  const matchablePairs = useMemo(() => {
    const pairs: Array<{ buy: Order; sell: Order }> = [];
    const activeBuys = allActiveOrders.filter((o) => o.type === 'Buy');
    const activeSells = allActiveOrders.filter((o) => o.type === 'Sell');

    for (const buy of activeBuys) {
      for (const sell of activeSells) {
        // Matching token pair
        if (
          buy.tokenIn.toLowerCase() === sell.tokenOut.toLowerCase() &&
          buy.tokenOut.toLowerCase() === sell.tokenIn.toLowerCase()
        ) {
          // Cannot match self
          if (buy.maker.toLowerCase() !== sell.maker.toLowerCase()) {
            if (buy.currentPrice >= sell.currentPrice) {
              pairs.push({ buy, sell });
            }
          }
        }
      }
    }
    return pairs;
  }, [allActiveOrders]);

  // ── User Token Balance Fetcher ────────────────────────────────────
  useEffect(() => {
    if (!fullAddress || !chainId) {
      setUserTokenBalance(null);
      return;
    }

    const tokenInAddr = getTokenAddress(tokenIn, chainId);
    if (!tokenInAddr) {
      setUserTokenBalance(null);
      return;
    }

    let isMounted = true;
    const fetchBalance = async () => {
      try {
        const res = await readERC20(tokenInAddr, 'balanceOf', [fullAddress]);
        if (res.data !== null && res.data !== undefined && isMounted) {
          const tokenMeta = SUPPORTED_TOKENS.find((t) => t.symbol === tokenIn);
          const dec = tokenMeta?.decimals || 18;
          const bal = Number(BigInt(String(res.data))) / 10 ** dec;
          setUserTokenBalance(bal.toFixed(4));
        }
      } catch {
        if (isMounted) setUserTokenBalance(null);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fullAddress, chainId, tokenIn, readERC20]);

  // ── Fetch on-chain data ───────────────────────────────────────────
  const fetchOnChainData = useCallback(async () => {
    if (!isReady) return;
    setIsLoadingOnChain(true);

    try {
      const [totalResult, pausedResult, matchedLogs, cancelledLogs, filledLogs] = await Promise.all([
        readContract('totalOrders'),
        readContract('paused'),
        fetchEvents('OrderMatched'),
        fetchEvents('OrderCancelled'),
        fetchEvents('OrderFilled'),
      ]);

      const totalCount = totalResult.data !== null ? Number(totalResult.data) : 0;
      if (totalResult.data !== null) setTotalOrders(totalCount);
      if (pausedResult.data !== null) setIsPaused(Boolean(pausedResult.data));

      // Track inactive order IDs directly from logs
      const inactiveIds = new Set<number>();

      if (matchedLogs.data && Array.isArray(matchedLogs.data)) {
        matchedLogs.data.forEach((log: unknown) => {
          const l = log as { args?: Record<string, unknown> | unknown[] };
          const args = l.args || {};
          const buyId = Number((args as Record<string, unknown>).buyOrderId ?? (args as unknown[])[0] ?? 0);
          const sellId = Number((args as Record<string, unknown>).sellOrderId ?? (args as unknown[])[1] ?? 0);
          if (buyId) inactiveIds.add(buyId);
          if (sellId) inactiveIds.add(sellId);
        });
      }

      if (cancelledLogs.data && Array.isArray(cancelledLogs.data)) {
        cancelledLogs.data.forEach((log: unknown) => {
          const l = log as { args?: Record<string, unknown> | unknown[] };
          const args = l.args || {};
          const orderId = Number((args as Record<string, unknown>).orderId ?? (args as unknown[])[0] ?? 0);
          if (orderId) inactiveIds.add(orderId);
        });
      }

      if (filledLogs.data && Array.isArray(filledLogs.data)) {
        filledLogs.data.forEach((log: unknown) => {
          const l = log as { args?: Record<string, unknown> | unknown[] };
          const args = l.args || {};
          const orderId = Number((args as Record<string, unknown>).orderId ?? (args as unknown[])[0] ?? 0);
          if (orderId) inactiveIds.add(orderId);
        });
      }

      // Build Settled Matches History purely from real on-chain OrderMatched events
      const parsedMatches: SettledMatch[] = [];
      if (matchedLogs.data && Array.isArray(matchedLogs.data)) {
        matchedLogs.data.forEach((log: unknown) => {
          const l = log as { args?: Record<string, unknown> | unknown[]; transactionHash?: string };
          const args = l.args || {};
          const buyId = Number((args as Record<string, unknown>).buyOrderId ?? (args as unknown[])[0] ?? 0);
          const sellId = Number((args as Record<string, unknown>).sellOrderId ?? (args as unknown[])[1] ?? 0);
          const keeper = String((args as Record<string, unknown>).keeper ?? (args as unknown[])[2] ?? '');
          const priceRaw = (args as Record<string, unknown>).settlementPrice ?? (args as unknown[])[3] ?? 0;
          const qtyRaw = (args as Record<string, unknown>).executedQuantity ?? (args as unknown[])[4] ?? 0;

          const priceVal = parseRay(priceRaw);
          const qtyNum = Number(qtyRaw);
          const amountFormatted = qtyNum > 1e10 ? (qtyNum / 1e18).toFixed(4) : (qtyNum / 1e6).toFixed(2);

          parsedMatches.push({
            id: buyId,
            buyOrderId: buyId,
            sellOrderId: sellId,
            pair: `Buy #${buyId} ↔ Sell #${sellId}`,
            amount: amountFormatted,
            price: `$${priceVal > 0 ? formatPrice(priceVal) : '3000'}`,
            age: 'On-Chain Settled',
            txHash: l.transactionHash || '',
            keeper: keeper ? `${keeper.slice(0, 6)}...${keeper.slice(-4)}` : 'Keeper',
          });
        });
      }
      setSettledHistory(parsedMatches.reverse());

      // Fetch on-chain orders 1..totalCount
      if (totalCount > 0) {
        const orderPromises = [];
        for (let i = 1; i <= totalCount; i++) {
          orderPromises.push(readContract('getOrder', [i]));
        }
        const orderResults = await Promise.all(orderPromises);
        const fetchedOrders: Order[] = [];

        orderResults.forEach((res, idx) => {
          if (!res.data) return;
          const o = res.data as Record<string, unknown> | unknown[];
          const id = Number((o as Record<string, unknown>).id ?? (o as unknown[])[0] ?? idx + 1);
          const rawActive = Boolean((o as Record<string, unknown>).active ?? (o as unknown[])[3]);
          const remainingInRaw = (o as Record<string, unknown>).remainingIn ?? (o as unknown[])[7] ?? 0;
          const isBuy = Boolean((o as Record<string, unknown>).isBuy ?? (o as unknown[])[2]);

          const isActive =
            rawActive &&
            BigInt(remainingInRaw.toString()) > BigInt(0) &&
            !inactiveIds.has(id);

          const tokenInAddr = String((o as Record<string, unknown>).tokenIn ?? (o as unknown[])[4] ?? '');
          const tokenOutAddr = String((o as Record<string, unknown>).tokenOut ?? (o as unknown[])[5] ?? '');

          const tokenInMeta = SUPPORTED_TOKENS.find(
            (t) => chainId && t.addresses[chainId]?.toLowerCase() === tokenInAddr.toLowerCase()
          );
          const tokenOutMeta = SUPPORTED_TOKENS.find(
            (t) => chainId && t.addresses[chainId]?.toLowerCase() === tokenOutAddr.toLowerCase()
          );

          const decimals = tokenInMeta?.decimals || (isBuy ? 18 : 6);
          const amountInRaw = (o as Record<string, unknown>).amountIn ?? (o as unknown[])[6] ?? 0;
          const amt = Number(amountInRaw.toString()) / 10 ** decimals;
          const startPriceRaw = (o as Record<string, unknown>).startPrice ?? (o as unknown[])[8] ?? 0;
          const startP = parseRay(startPriceRaw);
          const slopeRaw = (o as Record<string, unknown>).slope ?? (o as unknown[])[9] ?? 0;
          const slopeP = parseRay(slopeRaw);
          const minPriceRaw = (o as Record<string, unknown>).minPrice ?? (o as unknown[])[10] ?? 0;
          const minP = parseRay(minPriceRaw);
          const maxPriceRaw = (o as Record<string, unknown>).maxPrice ?? (o as unknown[])[11] ?? 0;
          const maxP = parseRay(maxPriceRaw);
          const createdAtRaw = (o as Record<string, unknown>).createdAt ?? (o as unknown[])[12] ?? 0;
          const expiryRaw = (o as Record<string, unknown>).expiry ?? (o as unknown[])[13] ?? 0;
          const makerRaw = (o as Record<string, unknown>).maker ?? (o as unknown[])[1] ?? '';

          fetchedOrders.push({
            id,
            type: isBuy ? 'Buy' : 'Sell',
            tokenIn: tokenInAddr,
            tokenOut: tokenOutAddr,
            tokenInSymbol: tokenInMeta?.symbol || (isBuy ? 'WETH' : 'USDC'),
            tokenOutSymbol: tokenOutMeta?.symbol || (isBuy ? 'USDC' : 'WETH'),
            amount: amt > 0 ? amt : isBuy ? 1 : 3000,
            startPrice: startP,
            currentPrice: startP,
            slope: slopeP,
            minPrice: minP,
            maxPrice: maxP,
            expiry: Number(expiryRaw.toString()),
            createdAt: Number(createdAtRaw.toString() || Date.now() / 1000) * 1000,
            active: isActive,
            maker: String(makerRaw),
            onChain: true,
          });
        });

        setOrders(fetchedOrders);
      }
    } catch (err) {
      console.error('Error fetching on-chain data:', err);
    } finally {
      setIsLoadingOnChain(false);
    }
  }, [isReady, readContract, fetchEvents, chainId]);

  useEffect(() => {
    fetchOnChainData();
    const interval = setInterval(fetchOnChainData, 4000);
    return () => clearInterval(interval);
  }, [fetchOnChainData]);

  // ── Dynamic price calculation loop based on curve formula ─────────
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((ord) => {
          if (!ord.active) return ord;
          if (Math.abs(ord.slope) < 1e-9) {
            if (ord.currentPrice !== ord.startPrice) {
              return { ...ord, currentPrice: ord.startPrice };
            }
            return ord;
          }
          const deltaT = (Date.now() - ord.createdAt) / 1000;
          let calculated = ord.startPrice + ord.slope * deltaT;
          if (ord.minPrice > 0) calculated = Math.max(ord.minPrice, calculated);
          if (ord.maxPrice > 0) calculated = Math.min(ord.maxPrice, calculated);
          const currentPrice = Math.max(0.01, Math.round(calculated * 1e4) / 1e4);
          if (ord.currentPrice === currentPrice) return ord;
          return { ...ord, currentPrice };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ── Create Order Handler ──────────────────────────────────────────
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setWalletModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setTxStatus(null);

    if (isReady && chainId) {
      const tokenInAddr = getTokenAddress(tokenIn, chainId);
      const tokenOutAddr = getTokenAddress(tokenOut, chainId);

      if (tokenInAddr && tokenOutAddr) {
        try {
          const tokenMeta = SUPPORTED_TOKENS.find((t) => t.symbol === tokenIn);
          const decimals = tokenMeta?.decimals || 18;
          const amountWei = BigInt(Math.floor(amount * 10 ** decimals)).toString();

          const priceRay = toRayString(startPrice);
          const slopeRay = toRayString(slope);
          const minPriceRay = minPrice > 0 ? toRayString(minPrice) : '0';
          const maxPriceRay = maxPrice > 0 ? toRayString(maxPrice) : '0';
          const expiryTs = expiry ? Math.floor(new Date(expiry).getTime() / 1000).toString() : '0';

          // Check token allowance
          setTxStatus('Verifying token allowance...');
          const allowanceResult = await readERC20(tokenInAddr, 'allowance', [fullAddress, contractAddress]);
          const currentAllowance =
            allowanceResult.data !== null && allowanceResult.data !== undefined
              ? BigInt(String(allowanceResult.data))
              : BigInt(0);

          if (currentAllowance < BigInt(amountWei)) {
            setTxStatus('Requesting ERC-20 approval...');
            const maxApproval = '0x' + 'f'.repeat(64);
            const approveResult = await approveERC20(tokenInAddr, contractAddress!, maxApproval);
            if (approveResult.error) {
              setTxStatus(`Approval error: ${approveResult.error}`);
              setIsSubmitting(false);
              return;
            }
            setTxStatus('Approval confirmed. Submitting order...');
            await new Promise((r) => setTimeout(r, 2000));
          }

          setTxStatus('Submitting order to Windmill Exchange contract...');
          const { txHash, error } = await writeContract('createOrder', [
            tokenInAddr,
            tokenOutAddr,
            amountWei,
            priceRay,
            slopeRay,
            minPriceRay,
            maxPriceRay,
            expiryTs,
            orderType === 'Buy',
          ]);

          if (error) {
            setTxStatus(`Transaction error: ${error}`);
            setIsSubmitting(false);
            return;
          }

          setTxStatus(`Order deployed on-chain! Tx: ${txHash?.slice(0, 10)}...`);
          setIsSubmitting(false);
          setAmount(1);
          fetchOnChainData();
          setTimeout(() => setTxStatus(null), 6000);
          return;
        } catch (err) {
          setTxStatus(`Order deployment failed: ${(err as Error).message}`);
          setIsSubmitting(false);
          return;
        }
      }
    }

    setTxStatus('Contract address not found for connected chain. Please select a supported EVM network.');
    setIsSubmitting(false);
  };

  // ── Cancel Order Handler ──────────────────────────────────────────
  const handleCancelOrder = useCallback(
    async (orderId: number) => {
      if (!isReady) return;
      setTxStatus(`Cancelling Order #${orderId} on-chain...`);
      const { txHash, error } = await writeContract('cancelOrder', [orderId]);
      if (error) {
        setTxStatus(`Cancel failed: ${error}`);
      } else {
        setTxStatus(`Order #${orderId} cancelled. Tx: ${txHash?.slice(0, 10)}...`);
        fetchOnChainData();
      }
      setTimeout(() => setTxStatus(null), 5000);
    },
    [isReady, writeContract, fetchOnChainData]
  );

  // ── Clean up inactive orders from in-flight matching ref ──────────
  useEffect(() => {
    const activeIds = new Set(orders.filter((o) => o.active).map((o) => o.id));
    for (const key of Array.from(inFlightMatchesRef.current)) {
      const [bId, sId] = key.split('-').map(Number);
      if (!activeIds.has(bId) || !activeIds.has(sId)) {
        inFlightMatchesRef.current.delete(key);
      }
    }
  }, [orders]);

  // ── Real On-Chain Match Orders Handler ─────────────────────────────
  const handleExecuteMatch = useCallback(
    async (buyOrderId: number, sellOrderId: number) => {
      const pairKey = `${buyOrderId}-${sellOrderId}`;
      if (inFlightMatchesRef.current.has(pairKey)) return;

      inFlightMatchesRef.current.add(pairKey);
      setMatchingPairKeys((prev) => new Set(prev).add(pairKey));
      setIsSubmitting(true);
      setTxStatus(`Strict auto-match executing: Buy #${buyOrderId} ↔ Sell #${sellOrderId}...`);

      try {
        let matchedSuccess = false;

        // 1. Attempt autonomous keeper backend settlement
        try {
          const res = await fetch('/api/keeper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'match',
              buyOrderId,
              sellOrderId,
              contractAddress,
              rpcUrl,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.ok) {
            matchedSuccess = true;
            setTxStatus(`Orders matched automatically on-chain! Tx: ${data.txHash?.slice(0, 10)}...`);
            await fetchOnChainData();
          }
        } catch (backendErr) {
          console.warn('Keeper API auto-match attempt failed, falling back to wallet:', backendErr);
        }

        // 2. If backend settlement didn't execute and user wallet is connected, fallback to wallet contract call
        if (!matchedSuccess && isConnected && isReady) {
          try {
            const deadline = Math.floor(Date.now() / 1000) + 3600;
            const { txHash, error } = await writeContract('matchOrders', [buyOrderId, sellOrderId, deadline]);

            if (error) {
              setTxStatus(`Match transaction error: ${error}`);
            } else {
              matchedSuccess = true;
              setTxStatus(`Orders matched on-chain! Tx: ${txHash?.slice(0, 10)}... (0.1% keeper fee earned)`);
              await fetchOnChainData();
            }
          } catch (walletErr) {
            setTxStatus(`Match execution failed: ${(walletErr as Error).message}`);
          }
        }
      } finally {
        setIsSubmitting(false);
        setMatchingPairKeys((prev) => {
          const next = new Set(prev);
          next.delete(pairKey);
          return next;
        });
        setTimeout(() => setTxStatus(null), 6000);
      }
    },
    [contractAddress, rpcUrl, isConnected, isReady, writeContract, fetchOnChainData]
  );

  // ── Automatic Matching Loop for Crossing Opportunities (Strictly Autonomous) ──
  useEffect(() => {
    if (isPaused || isSubmitting) return;
    if (matchablePairs.length === 0) return;

    for (const { buy, sell } of matchablePairs) {
      const pairKey = `${buy.id}-${sell.id}`;
      if (!inFlightMatchesRef.current.has(pairKey)) {
        handleExecuteMatch(buy.id, sell.id);
        break; // Match one pair at a time to prevent nonce collisions
      }
    }
  }, [matchablePairs, isPaused, isSubmitting, handleExecuteMatch]);

  // ── Price Curve SVG Mini-renderer ─────────────────────────────────
  const renderPriceCurve = (order: Order) => {
    const points: string[] = [];
    const width = 120;
    const height = 36;
    const steps = 16;
    const timeSpanSec = 300;

    let minP = Infinity,
      maxP = -Infinity;
    const prices: number[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * timeSpanSec;
      let p = order.startPrice + order.slope * t;
      if (order.minPrice > 0) p = Math.max(order.minPrice, p);
      if (order.maxPrice > 0) p = Math.min(order.maxPrice, p);
      prices.push(p);
      if (p < minP) minP = p;
      if (p > maxP) maxP = p;
    }

    const range = maxP - minP || 1;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const y = height - ((prices[i] - minP) / range) * (height - 4) - 2;
      points.push(`${x},${y}`);
    }

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8" preserveAspectRatio="none">
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke={order.type === 'Buy' ? '#10b981' : '#3b82f6'}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <main className="w-full min-h-screen bg-background text-foreground pt-24 transition-colors duration-300">
      <WalletModal />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
              On-Chain Matchmaking Engine
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white mt-1">
              Exchange Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold shadow-xs">
              <span className={`h-1.5 w-1.5 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
              {isReady ? 'Contract Connected' : 'Wallet Disconnected'}
            </span>
            {chainId && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold">
                {network}
              </span>
            )}
            {totalOrders !== null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold">
                {totalOrders} Total Orders
              </span>
            )}
            {isPaused && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-bold">
                ⚠ Protocol Paused
              </span>
            )}
            <button
              type="button"
              onClick={fetchOnChainData}
              disabled={isLoadingOnChain}
              className="p-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Refresh contract data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOnChain ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Transaction status alert */}
        {txStatus && (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-4 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2 shadow-lg animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{txStatus}</span>
          </div>
        )}

        {!isConnected && (
          <div className="rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-8 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl">
              🔌
            </div>
            <h2 className="text-base font-bold text-black dark:text-white">Connect Wallet to Trade</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm">
              Connect your EVM wallet to place dynamic curve orders, cancel active orders, and execute settlements on-chain.
            </p>
            <button
              type="button"
              onClick={() => setWalletModalOpen(true)}
              className="mt-2 rounded-full bg-black dark:bg-white px-6 py-2.5 text-xs font-bold text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-sm cursor-pointer"
            >
              Connect Wallet
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Create Order Form */}
          <div
            className={`lg:col-span-1 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 bg-white dark:bg-neutral-900 shadow-sm transition-opacity duration-300 ${
              !isConnected ? 'opacity-60 pointer-events-none' : ''
            }`}
          >
            <h2 className="text-lg font-bold text-black dark:text-white mb-4">Deploy Curve Order</h2>
            <form
              onSubmit={handleCreateOrder}
              className="flex flex-col gap-4 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
            >
              {/* Buy/Sell Selector */}
              <div className="flex gap-2 bg-neutral-50 dark:bg-neutral-800 p-1 rounded-full border border-neutral-100 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => {
                    setOrderType('Buy');
                    if (slope > 0) setSlope(-Math.abs(slope));
                  }}
                  className={`flex-1 py-2 text-center rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    orderType === 'Buy'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-neutral-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Buy Order (s &lt; 0)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrderType('Sell');
                    if (slope < 0) setSlope(Math.abs(slope));
                  }}
                  className={`flex-1 py-2 text-center rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    orderType === 'Sell'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-neutral-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Sell Order (s &gt; 0)
                </button>
              </div>

              {/* Tokens In/Out */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="token-in-select" className="text-[9px] text-neutral-400 dark:text-neutral-500">
                    Token In
                  </label>
                  <select
                    id="token-in-select"
                    value={tokenIn}
                    onChange={(e) => setTokenIn(e.target.value)}
                    className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-xl text-black dark:text-white font-normal focus:outline-hidden"
                  >
                    {availableTokens.map((t) => (
                      <option key={t.symbol} value={t.symbol}>
                        {t.logoEmoji} {t.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="token-out-select" className="text-[9px] text-neutral-400 dark:text-neutral-500">
                    Token Out
                  </label>
                  <select
                    id="token-out-select"
                    value={tokenOut}
                    onChange={(e) => setTokenOut(e.target.value)}
                    className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-xl text-black dark:text-white font-normal focus:outline-hidden"
                  >
                    {availableTokens.map((t) => (
                      <option key={t.symbol} value={t.symbol}>
                        {t.logoEmoji} {t.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount with User Token Balance */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[9px] text-neutral-400 dark:text-neutral-500">
                  <label htmlFor="amount-input">Amount</label>
                  {userTokenBalance !== null && (
                    <span className="font-mono flex items-center gap-1">
                      Bal: <span className="text-black dark:text-white font-bold">{userTokenBalance}</span> {tokenIn}
                      <button
                        type="button"
                        onClick={() => setAmount(Number(userTokenBalance))}
                        className="px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white text-[8px] font-bold"
                      >
                        MAX
                      </button>
                    </span>
                  )}
                </div>
                <input
                  id="amount-input"
                  type="number"
                  step="0.000001"
                  min="0.000001"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-xl text-black dark:text-white font-normal focus:outline-hidden"
                  placeholder="1.0"
                />
              </div>

              {/* Starting Price */}
              <div className="flex flex-col gap-1">
                <label htmlFor="start-price-input" className="text-[9px] text-neutral-400 dark:text-neutral-500">
                  Starting Price ($)
                </label>
                <input
                  id="start-price-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={startPrice}
                  onChange={(e) => setStartPrice(Number(e.target.value))}
                  className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-xl text-black dark:text-white font-normal focus:outline-hidden"
                  placeholder="3000"
                />
              </div>

              {/* Price Slope */}
              <div className="flex flex-col gap-1">
                <label htmlFor="slope-input" className="text-[9px] text-neutral-400 dark:text-neutral-500">
                  Slope ($ / second)
                </label>
                <input
                  id="slope-input"
                  type="number"
                  step="0.001"
                  required
                  value={slope}
                  onChange={(e) => setSlope(Number(e.target.value))}
                  className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-xl text-black dark:text-white font-normal focus:outline-hidden"
                  placeholder="-0.2"
                />
                <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-normal normal-case mt-0.5">
                  Negative for Buys (descending bid), positive for Sells (increasing ask).
                </span>
              </div>

              {/* Min / Max Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="min-price-input" className="text-[9px] text-neutral-400 dark:text-neutral-500">
                    Min Price (0 = none)
                  </label>
                  <input
                    id="min-price-input"
                    type="number"
                    step="0.01"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-xl text-black dark:text-white font-normal focus:outline-hidden"
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="max-price-input" className="text-[9px] text-neutral-400 dark:text-neutral-500">
                    Max Price (0 = none)
                  </label>
                  <input
                    id="max-price-input"
                    type="number"
                    step="0.01"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-xl text-black dark:text-white font-normal focus:outline-hidden"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Expiry */}
              <div className="flex flex-col gap-1">
                <label htmlFor="expiry-input" className="text-[9px] text-neutral-400 dark:text-neutral-500">
                  Expiry (Optional)
                </label>
                <input
                  id="expiry-input"
                  type="datetime-local"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-xl text-black dark:text-white font-normal focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isPaused || !isConnected}
                className="mt-2 w-full rounded-full bg-black dark:bg-white py-3 text-center text-xs font-bold text-white dark:text-black uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isSubmitting ? 'Deploying Order...' : isPaused ? 'Exchange Paused' : 'Deploy Curve Order'}
              </button>
            </form>
          </div>

          {/* Right Column: Dynamic Order Book & Real Settlement Logs */}
          <div className="lg:col-span-2 flex flex-col gap-6 w-full">
            {/* Match Opportunities Alert Card (Strict Autonomous Execution) */}
            {matchablePairs.length > 0 && (
              <div className="border border-emerald-500/30 rounded-3xl p-6 bg-emerald-50/40 dark:bg-emerald-950/30 backdrop-blur-md shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-current animate-pulse" />
                    <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                      Crossing Match Opportunity Detected ({matchablePairs.length}) — Strictly Auto-Executing
                    </h3>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-2 bg-emerald-500/10 dark:bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200">
                        ⚡ Auto-Match: STRICTLY ACTIVE
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      0.1% Keeper Fee
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {matchablePairs.slice(0, 5).map(({ buy, sell }) => {
                    const pairKey = `${buy.id}-${sell.id}`;
                    const isMatchingThis = matchingPairKeys.has(pairKey);

                    return (
                      <div
                        key={`match-${buy.id}-${sell.id}`}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-emerald-500/20"
                      >
                        <div className="text-xs">
                          <span className="font-bold text-black dark:text-white">Buy #{buy.id}</span> (${formatPrice(buy.currentPrice)})
                          <span className="text-neutral-400 mx-2">↔</span>
                          <span className="font-bold text-black dark:text-white">Sell #{sell.id}</span> (${formatPrice(sell.currentPrice)})
                          <div className="text-[10px] text-neutral-500 mt-0.5 flex items-center gap-1.5">
                            <span>Cross condition satisfied: Buy Price &ge; Sell Price</span>
                            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                              • Auto-executing match strictly on-chain
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isMatchingThis ? (
                            <span className="px-4 py-2 rounded-full bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Executing Match On-Chain...
                            </span>
                          ) : (
                            <span className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
                              Auto-Match In Progress
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Orders Section with Tabs */}
            <div className="border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 bg-white dark:bg-neutral-900 shadow-sm w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                {/* Tabs */}
                <div className="flex gap-2 bg-neutral-50 dark:bg-neutral-800 p-1 rounded-full border border-neutral-200 dark:border-neutral-700 w-fit">
                  <button
                    type="button"
                    onClick={() => setActiveTab('my-orders')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'my-orders'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'text-neutral-500 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    My Active Orders ({myActiveOrders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('all-orders')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'all-orders'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'text-neutral-500 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Public Order Book ({allActiveOrders.length})
                  </button>
                </div>

                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  Live Contract State
                </span>
              </div>

              {/* Order Cards List */}
              <div className="flex flex-col gap-4">
                {(activeTab === 'my-orders' ? myActiveOrders : allActiveOrders).length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center gap-2">
                    <Layers className="w-8 h-8 text-neutral-300 dark:text-neutral-700" />
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">
                      {activeTab === 'my-orders'
                        ? 'You have no active dynamic orders deployed on this contract.'
                        : 'No active orders registered in the on-chain orderbook yet.'}
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                      Use the deployment form on the left to place your first dynamic order.
                    </p>
                  </div>
                ) : (
                  (activeTab === 'my-orders' ? myActiveOrders : allActiveOrders).map((order) => (
                    <div
                      key={order.id}
                      className="border border-neutral-100 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-800/40 rounded-2xl p-4 flex flex-col gap-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-neutral-400 dark:text-neutral-500">
                              #{order.id}
                            </span>
                            <span
                              className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                                order.type === 'Buy'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                              }`}
                            >
                              {order.type}
                            </span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono">
                              Maker: {order.maker.slice(0, 6)}...{order.maker.slice(-4)}
                            </span>
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                              {order.amount} {order.tokenInSymbol} ➔ {order.tokenOutSymbol}
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            <div className="flex items-center gap-4 flex-wrap">
                              <span>
                                Start: <span className="font-semibold text-black dark:text-white">${formatPrice(order.startPrice)}</span>
                              </span>
                              <span>
                                Slope:{' '}
                                <span className="font-semibold text-black dark:text-white font-mono">
                                  {order.slope > 0 ? `+${formatPrice(order.slope)}` : formatPrice(order.slope)}/s
                                </span>
                              </span>
                              {(order.minPrice > 0 || order.maxPrice > 0) && (
                                <>
                                  {order.minPrice > 0 && <span>Min: ${formatPrice(order.minPrice)}</span>}
                                  {order.maxPrice > 0 && <span>Max: ${formatPrice(order.maxPrice)}</span>}
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-neutral-500 dark:text-neutral-400">Current Computed Price:</span>
                              <span className="text-black dark:text-white font-mono font-bold text-sm bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                                ${formatPrice(order.currentPrice)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 shrink-0">
                          {fullAddress && order.maker.toLowerCase() === fullAddress.toLowerCase() && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={isSubmitting}
                              className="rounded-full border border-red-200 dark:border-red-800/80 bg-white dark:bg-neutral-800 px-3.5 py-1.5 text-[10px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                            >
                              Cancel <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Mini-curve visualization */}
                      <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2 flex items-center justify-between gap-4">
                        <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">
                          5m Dynamic Curve Projection
                        </span>
                        <div className="w-32">{renderPriceCurve(order)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Real On-Chain Settled Matches History */}
            <div className="border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 bg-white dark:bg-neutral-900 shadow-sm w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-black dark:text-white">Settled Matches Log</h2>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Contract Event Stream
                </span>
              </div>

              <div className="flex flex-col gap-3 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                {settledHistory.length === 0 ? (
                  <div className="text-neutral-400 dark:text-neutral-500 text-xs py-8 text-center font-sans">
                    No settled matches recorded on-chain yet for this contract deployment.
                  </div>
                ) : (
                  settledHistory.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3 last:border-none last:pb-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-sans text-[9px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 uppercase font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Matched
                        </span>
                        <span className="text-black dark:text-white font-bold font-sans">{item.pair}</span>
                        <span>Qty: {item.amount}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-black dark:text-white font-bold">{item.price}</span>
                        {item.txHash && chainId ? (
                          <a
                            href={getExplorerTxUrl(chainId, item.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <span>Tx: {item.txHash.slice(0, 8)}...</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-neutral-400 text-[10px]">{item.age}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
