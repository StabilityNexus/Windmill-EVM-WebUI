'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useContract } from '@/hooks/useContract';
import { SUPPORTED_TOKENS, getTokenAddress } from '@/lib/contractConfig';
import WalletModal from '@/components/wallet/WalletModal';
import { Zap, X } from 'lucide-react';

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
  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }
  return rounded.toString();
}


export default function DashboardPage() {
  const { isConnected, setWalletModalOpen, fullAddress, chainId, network } = useWallet();
  const { contractAddress, writeContract, readContract, readERC20, approveERC20, isReady } = useContract();

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

  // ── Live ERC-20 Token Balance State ───────────────────────────────
  const [tokenInBalance, setTokenInBalance] = useState<number | null>(null);
  const [isFetchingBalance, setIsFetchingBalance] = useState<boolean>(false);

  // ── Orders State ──────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([]);
  const activeOrders = useMemo(() => {
    if (!fullAddress) return [];
    return orders.filter(
      (o) => o.active && o.maker && o.maker.toLowerCase() === fullAddress.toLowerCase()
    );
  }, [orders, fullAddress]);

  const [settledHistory, setSettledHistory] = useState<Array<{ id: number; pair: string; amount: string; price: string; age: string; txHash: string }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('windmill_settled_history');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // ── Stats ─────────────────────────────────────────────────────────
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // ── Available tokens for current chain ────────────────────────────
  const availableTokens = useMemo(() => {
    if (!chainId) return SUPPORTED_TOKENS;
    return SUPPORTED_TOKENS.filter((t) => t.addresses[chainId]);
  }, [chainId]);

  // Handle Token In change with identical token pair collision prevention
  const handleTokenInChange = (newSymbol: string) => {
    setTokenIn(newSymbol);
    if (newSymbol === tokenOut) {
      const alternative = availableTokens.find((t) => t.symbol !== newSymbol);
      if (alternative) {
        setTokenOut(alternative.symbol);
      }
    }
  };

  // Handle Token Out change with identical token pair collision prevention
  const handleTokenOutChange = (newSymbol: string) => {
    setTokenOut(newSymbol);
    if (newSymbol === tokenIn) {
      const alternative = availableTokens.find((t) => t.symbol !== newSymbol);
      if (alternative) {
        setTokenIn(alternative.symbol);
      }
    }
  };

  // Fetch live ERC-20 balance of tokenIn for connected wallet
  const fetchTokenInBalance = useCallback(async () => {
    if (!isConnected || !fullAddress || !chainId) {
      setTokenInBalance(null);
      return;
    }
    const tokenInAddr = getTokenAddress(tokenIn, chainId);
    if (!tokenInAddr) {
      setTokenInBalance(null);
      return;
    }

    setIsFetchingBalance(true);
    try {
      const tokenMeta = SUPPORTED_TOKENS.find((t) => t.symbol === tokenIn);
      const decimals = tokenMeta?.decimals || 18;

      const balRes = await readERC20(tokenInAddr, 'balanceOf', [fullAddress]);
      if (balRes.data !== null && balRes.data !== undefined) {
        const rawBal = BigInt(balRes.data.toString());
        // Exact formatting with precision
        const formatted = Number(rawBal) / 10 ** decimals;
        setTokenInBalance(formatted);
      } else {
        setTokenInBalance(null);
      }
    } catch {
      setTokenInBalance(null);
    } finally {
      setIsFetchingBalance(false);
    }
  }, [isConnected, fullAddress, chainId, tokenIn, readERC20]);

  useEffect(() => {
    fetchTokenInBalance();
  }, [fetchTokenInBalance]);

  // ── Fetch on-chain data ───────────────────────────────────────────
  const { fetchEvents } = useContract();

  // ── Persistent refs to prevent state overwrites on polling ──────
  const inactiveOrderIdsRef = useRef<Set<number>>(new Set());
  const simulatedSettledRef = useRef<Array<{ id: number; pair: string; amount: string; price: string; age: string; txHash: string }>>([]);

  // Load persistent simulated & inactive state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSim = localStorage.getItem('windmill_simulated_settled');
        if (savedSim) {
          simulatedSettledRef.current = JSON.parse(savedSim);
        }
        const savedInactive = localStorage.getItem('windmill_inactive_order_ids');
        if (savedInactive) {
          const arr = JSON.parse(savedInactive);
          inactiveOrderIdsRef.current = new Set(arr);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const fetchData = async () => {
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

        // Track on-chain deactivated orders
        if (matchedLogs.data && Array.isArray(matchedLogs.data)) {
          matchedLogs.data.forEach((log: unknown) => {
            const l = log as { args?: Record<string, unknown> | unknown[] };
            const args = l.args || {};
            const buyId = Number((args as Record<string, unknown>).buyOrderId ?? (args as unknown[])[0] ?? 0);
            const sellId = Number((args as Record<string, unknown>).sellOrderId ?? (args as unknown[])[1] ?? 0);
            if (buyId) inactiveOrderIdsRef.current.add(buyId);
            if (sellId) inactiveOrderIdsRef.current.add(sellId);
          });
        }

        if (cancelledLogs.data && Array.isArray(cancelledLogs.data)) {
          cancelledLogs.data.forEach((log: unknown) => {
            const l = log as { args?: Record<string, unknown> | unknown[] };
            const args = l.args || {};
            const orderId = Number((args as Record<string, unknown>).orderId ?? (args as unknown[])[0] ?? 0);
            if (orderId) inactiveOrderIdsRef.current.add(orderId);
          });
        }

        if (filledLogs.data && Array.isArray(filledLogs.data)) {
          filledLogs.data.forEach((log: unknown) => {
            const l = log as { args?: Record<string, unknown> | unknown[] };
            const args = l.args || {};
            const orderId = Number((args as Record<string, unknown>).orderId ?? (args as unknown[])[0] ?? 0);
            if (orderId) inactiveOrderIdsRef.current.add(orderId);
          });
        }

        // Build Settled Matches History from OrderMatched logs + simulated settled items
        const parsedOnChain: Array<{ id: number; pair: string; amount: string; price: string; age: string; txHash: string }> = [];
        if (matchedLogs.data && Array.isArray(matchedLogs.data)) {
          matchedLogs.data.forEach((log: unknown) => {
            const l = log as { args?: Record<string, unknown> | unknown[]; transactionHash?: string };
            const args = l.args || {};
            const buyId = Number((args as Record<string, unknown>).buyOrderId ?? (args as unknown[])[0] ?? 0);
            const sellId = Number((args as Record<string, unknown>).sellOrderId ?? (args as unknown[])[1] ?? 0);
            const priceRaw = (args as Record<string, unknown>).settlementPrice ?? (args as unknown[])[3] ?? 0;
            const qtyRaw = (args as Record<string, unknown>).executedQuantity ?? (args as unknown[])[4] ?? 0;

            const priceVal = parseRay(priceRaw);
            const qtyNum = Number(qtyRaw);
            const amountFormatted = qtyNum > 1e10 ? (qtyNum / 1e18).toFixed(4) : (qtyNum / 1e6).toFixed(2);

            parsedOnChain.push({
              id: buyId,
              pair: `Buy #${buyId} ↔ Sell #${sellId}`,
              amount: amountFormatted,
              price: `$${priceVal > 0 ? formatPrice(priceVal) : '3000'}`,
              age: 'Settled',
              txHash: l.transactionHash || '',
            });
          });
        }

        const combinedSettled = [...parsedOnChain.reverse()];
        simulatedSettledRef.current.forEach((sim) => {
          if (!combinedSettled.some((c) => c.id === sim.id)) {
            combinedSettled.push(sim);
          }
        });
        if (combinedSettled.length > 0) {
          setSettledHistory(combinedSettled);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('windmill_settled_history', JSON.stringify(combinedSettled));
            } catch {}
          }
        }

        // Fetch on-chain order details 1..totalCount and sync UI state
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
              !inactiveOrderIdsRef.current.has(id);

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
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [isReady, readContract, fetchEvents, chainId]);

  // ── Dynamic price calculation loop for deployed orders ────────────
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
          // Clamp to min/max bounds
          if (ord.minPrice > 0) calculated = Math.max(ord.minPrice, calculated);
          if (ord.maxPrice > 0) calculated = Math.min(ord.maxPrice, calculated);
          const currentPrice = Math.max(0.01, Math.round(calculated * 1e4) / 1e4);
          if (ord.currentPrice === currentPrice) return ord;
          return { ...ord, currentPrice };
        })
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
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

    // Prevent identical token pairs
    if (tokenIn === tokenOut) {
      setTxStatus('Cannot create order with identical Token In and Token Out.');
      setIsSubmitting(false);
      return;
    }

    // Try on-chain if contract is configured
    if (isReady && chainId) {
      const tokenInAddr = getTokenAddress(tokenIn, chainId);
      const tokenOutAddr = getTokenAddress(tokenOut, chainId);

      if (tokenInAddr && tokenOutAddr) {
        try {
          // Get token decimals
          const tokenMeta = SUPPORTED_TOKENS.find((t) => t.symbol === tokenIn);
          const decimals = tokenMeta?.decimals || 18;
          const amountWei = BigInt(Math.floor(amount * 10 ** decimals)).toString();

          // ── Pre-validate on-chain ERC-20 balance ──────────────────────
          setTxStatus('Validating token balance...');
          const balResult = await readERC20(tokenInAddr, 'balanceOf', [fullAddress]);
          const currentBal = balResult.data ? BigInt(balResult.data.toString()) : BigInt(0);

          if (currentBal < BigInt(amountWei)) {
            const formattedBal = Number(currentBal) / 10 ** decimals;
            setTxStatus(`Insufficient ${tokenIn} balance. You have ${formattedBal.toFixed(4)} ${tokenIn}, but entered ${amount} ${tokenIn}.`);
            setIsSubmitting(false);
            return;
          }

          // Price in RAY (1e27)
          const priceRay = toRayString(startPrice);
          const slopeRay = toRayString(slope);
          const minPriceRay = minPrice > 0 ? toRayString(minPrice) : '0';
          const maxPriceRay = maxPrice > 0 ? toRayString(maxPrice) : '0';
          const expiryTs = expiry ? Math.floor(new Date(expiry).getTime() / 1000).toString() : '0';

          // Check and request ERC-20 approval
          setTxStatus('Checking token approval...');
          const allowanceResult = await readERC20(tokenInAddr, 'allowance', [fullAddress, contractAddress]);
          const currentAllowance = allowanceResult.data ? BigInt(allowanceResult.data as string) : BigInt(0);

          if (currentAllowance < BigInt(amountWei)) {
            setTxStatus('Requesting token approval...');
            const maxApproval = '0x' + 'f'.repeat(64);
            const approveResult = await approveERC20(tokenInAddr, contractAddress!, maxApproval);
            if (approveResult.error) {
              setTxStatus(`Approval failed: ${approveResult.error}`);
              setIsSubmitting(false);
              return;
            }
            setTxStatus('Approval submitted. Waiting for confirmation...');
            // Brief wait for approval confirmation
            await new Promise((r) => setTimeout(r, 3000));
          }

          setTxStatus('Submitting order transaction...');
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
            setTxStatus(`Transaction failed: ${error}`);
            setIsSubmitting(false);
            return;
          }

          setTxStatus(`Order submitted! Tx: ${txHash?.slice(0, 10)}...`);

          setIsSubmitting(false);
          setAmount(1);
          fetchTokenInBalance();
          setTimeout(() => setTxStatus(null), 5000);
          return;
        } catch (err) {
          console.error('On-chain order creation failed:', err);
          setTxStatus(`On-chain transaction failed: ${(err as Error).message}`);
          setIsSubmitting(false);
          return;
        }
      }
    }

    setTxStatus('Smart contract address or provider not connected on this chain. Please connect wallet to active EVM network.');
    setIsSubmitting(false);
  };

  // ── Cancel Order Handler ──────────────────────────────────────────
  const handleCancelOrder = useCallback(
    async (orderId: number) => {
      inactiveOrderIdsRef.current.add(orderId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('windmill_inactive_order_ids', JSON.stringify(Array.from(inactiveOrderIdsRef.current)));
        } catch {}
      }
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, active: false } : o)));

      const order = orders.find((o) => o.id === orderId);
      if (order && order.onChain && isReady) {
        const { error } = await writeContract('cancelOrder', [orderId]);
        if (error) {
          setTxStatus(`Cancel failed: ${error}`);
          return;
        }
        setTxStatus(`Order #${orderId} cancelled on-chain`);
      }

      setTimeout(() => setTxStatus(null), 3000);
    },
    [orders, isReady, writeContract]
  );

  // ── Simulate Sweep Handler ────────────────────────────────────────
  const handleSimulateSweep = useCallback(
    (orderId: number) => {
      inactiveOrderIdsRef.current.add(orderId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('windmill_inactive_order_ids', JSON.stringify(Array.from(inactiveOrderIdsRef.current)));
        } catch {}
      }

      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) return { ...ord, active: false };
          return ord;
        })
      );

      const matched = orders.find((o) => o.id === orderId);
      if (matched) {
        const newItem = {
          id: matched.id,
          pair: `${matched.tokenInSymbol}/${matched.tokenOutSymbol}`,
          amount: matched.amount.toString(),
          price: `$${formatPrice(matched.currentPrice)}`,
          age: 'Just now',
          txHash: '',
        };

        if (!simulatedSettledRef.current.some((s) => s.id === matched.id)) {
          simulatedSettledRef.current = [newItem, ...simulatedSettledRef.current];
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('windmill_simulated_settled', JSON.stringify(simulatedSettledRef.current));
            } catch {}
          }
        }

        setSettledHistory((prev) => {
          const updated = [
            newItem,
            ...prev.filter((item) => item.id !== matched.id || item.txHash !== ''),
          ];
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('windmill_settled_history', JSON.stringify(updated));
            } catch {}
          }
          return updated;
        });
      }
    },
    [orders]
  );

  // ── Price curve SVG renderer ──────────────────────────────────────
  const renderPriceCurve = (order: Order) => {
    const points: string[] = [];
    const width = 120;
    const height = 40;
    const steps = 20;
    const timeSpanSec = 300; // 5 minutes of curve

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
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10" preserveAspectRatio="none">
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke={order.type === 'Buy' ? '#10b981' : '#f59e0b'}
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

      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">EVM Order Matcher</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white mt-1">Exchange Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 text-xs flex-wrap">
            {/* Contract status badges */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold">
              <span className={`h-1.5 w-1.5 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              {isReady ? 'Contract Connected' : 'Demo Mode'}
            </span>
            {chainId && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold">
                {network}
              </span>
            )}
            {totalOrders !== null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold">
                {totalOrders} orders
              </span>
            )}
            {isPaused && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/60 text-red-600 dark:text-red-400 font-bold">
                ⚠ Exchange Paused
              </span>
            )}
          </div>
        </div>

        {/* Transaction status bar */}
        {txStatus && (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 p-4 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2 animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-black dark:bg-white animate-pulse" />
            {txStatus}
          </div>
        )}

        {!isConnected && (
          <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-6 text-center flex flex-col items-center gap-3">
            <span className="text-2xl">🔌</span>
            <h2 className="text-base font-bold text-black dark:text-white">Wallet Connection Required</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm">
              Connect your wallet to start deploying dynamic order curves on-chain.
            </p>
            <button
              onClick={() => setWalletModalOpen(true)}
              className="mt-2 rounded-full bg-black dark:bg-white px-6 py-2 text-xs font-bold text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs cursor-pointer"
            >
              Connect Wallet
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Create Order Form */}
          <div
            className={`lg:col-span-1 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 bg-white dark:bg-neutral-900 shadow-xs transition-opacity duration-300 ${
              !isConnected ? 'opacity-50 pointer-events-none' : ''
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
                  onClick={() => setOrderType('Buy')}
                  className={`flex-1 py-2 text-center rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    orderType === 'Buy' ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Buy Order
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('Sell')}
                  className={`flex-1 py-2 text-center rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    orderType === 'Sell' ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Sell Order
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
                    onChange={(e) => handleTokenInChange(e.target.value)}
                    className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-xl text-black dark:text-white font-normal focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-500"
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
                    onChange={(e) => handleTokenOutChange(e.target.value)}
                    className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-xl text-black dark:text-white font-normal focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-500"
                  >
                    {availableTokens.map((t) => (
                      <option key={t.symbol} value={t.symbol}>
                        {t.logoEmoji} {t.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount with Live Balance & [MAX] Fill */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="amount-input" className="text-[9px] text-neutral-400 dark:text-neutral-500">
                    Amount
                  </label>
                  {isConnected && (
                    <div className="flex items-center gap-1.5 text-[9px]">
                      <span className="text-neutral-400 dark:text-neutral-500">
                        Balance:{' '}
                        <strong className="text-black dark:text-white font-mono">
                          {isFetchingBalance
                            ? '...'
                            : tokenInBalance !== null
                            ? `${tokenInBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${tokenIn}`
                            : `0.00 ${tokenIn}`}
                        </strong>
                      </span>
                      {tokenInBalance !== null && tokenInBalance > 0 && (
                        <button
                          type="button"
                          onClick={() => setAmount(tokenInBalance)}
                          className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white font-bold text-[8px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          MAX
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <input
                  id="amount-input"
                  type="number"
                  step="0.000001"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={`border bg-white dark:bg-neutral-800 p-2.5 rounded-xl text-black dark:text-white font-normal focus:outline-hidden transition-colors ${
                    isConnected && tokenInBalance !== null && amount > tokenInBalance
                      ? 'border-red-500 dark:border-red-500 focus:border-red-500'
                      : 'border-neutral-200 dark:border-neutral-700 focus:border-neutral-400 dark:focus:border-neutral-500'
                  }`}
                  placeholder="1.0"
                />
                {isConnected && tokenInBalance !== null && amount > tokenInBalance && (
                  <span className="text-[9px] text-red-500 font-semibold normal-case">
                    Insufficient {tokenIn} balance ({tokenInBalance.toFixed(4)} available)
                  </span>
                )}
              </div>

              {/* Starting Price */}
              <div className="flex flex-col gap-1">
                <label htmlFor="start-price-input" className="text-[9px] text-neutral-400 dark:text-neutral-500">
                  Start Price (RAY-scaled internally)
                </label>
                <input
                  id="start-price-input"
                  type="number"
                  step="0.01"
                  required
                  value={startPrice}
                  onChange={(e) => setStartPrice(Number(e.target.value))}
                  className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-xl text-black dark:text-white font-normal focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-500"
                  placeholder="3000"
                />
              </div>

              {/* Price Slope */}
              <div className="flex flex-col gap-1">
                <label htmlFor="slope-input" className="text-[9px] text-neutral-400 dark:text-neutral-500">
                  Slope (per second)
                </label>
                <input
                  id="slope-input"
                  type="number"
                  step="0.001"
                  required
                  value={slope}
                  onChange={(e) => setSlope(Number(e.target.value))}
                  className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-xl text-black dark:text-white font-normal focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-500"
                  placeholder="-0.2"
                />
                <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-normal normal-case mt-0.5">
                  Negative for Buys (decreasing), positive for Sells (increasing).
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
                    className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-xl text-black dark:text-white font-normal focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-500"
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
                    className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-xl text-black dark:text-white font-normal focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Expiry */}
              <div className="flex flex-col gap-1">
                <label htmlFor="expiry-input" className="text-[9px] text-neutral-400 dark:text-neutral-500">
                  Expiry (optional)
                </label>
                <input
                  id="expiry-input"
                  type="datetime-local"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 rounded-xl text-black dark:text-white font-normal focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-500"
                />
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  isPaused ||
                  tokenIn === tokenOut ||
                  (isConnected && tokenInBalance !== null && amount > tokenInBalance)
                }
                className="mt-2 w-full rounded-full bg-black dark:bg-white py-3 text-center text-xs font-bold text-white dark:text-black uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isSubmitting
                  ? 'Deploying...'
                  : isPaused
                  ? 'Exchange Paused'
                  : tokenIn === tokenOut
                  ? 'Select Different Tokens'
                  : isConnected && tokenInBalance !== null && amount > tokenInBalance
                  ? `Insufficient ${tokenIn} Balance`
                  : 'Deploy Order'}
              </button>
            </form>
          </div>

          {/* Right Column: Active Orders & History */}
          <div className="lg:col-span-2 flex flex-col gap-8 w-full">
            {/* Active Orders Section */}
            <div className="border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 bg-white dark:bg-neutral-900 shadow-xs w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-black dark:text-white">Your Dynamic Orders</h2>
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  {activeOrders.length} Active
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {activeOrders.length === 0 ? (
                  <p className="text-neutral-400 dark:text-neutral-500 text-xs py-6 text-center">No active dynamic orders deployed.</p>
                ) : (
                  activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-800/40 rounded-2xl p-4 flex flex-col gap-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500">#{order.id}</span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                order.type === 'Buy' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                              }`}
                            >
                              {order.type}
                            </span>
                            {order.onChain && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-bold">
                                On-Chain
                              </span>
                            )}
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                              {order.amount} {order.tokenInSymbol || order.tokenIn} ➔ {order.tokenOutSymbol || order.tokenOut}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            <div className="flex items-center gap-4">
                              <span>
                                Start: <span className="font-semibold text-black dark:text-white">${formatPrice(order.startPrice)}</span>
                              </span>
                              <span>
                                Slope:{' '}
                                <span className="font-semibold text-black dark:text-white">
                                  {order.slope > 0 ? `+${formatPrice(order.slope)}` : formatPrice(order.slope)} /s
                                </span>
                              </span>
                            </div>
                            {(order.minPrice > 0 || order.maxPrice > 0) && (
                              <div className="flex items-center gap-4">
                                {order.minPrice > 0 && <span>Min: ${formatPrice(order.minPrice)}</span>}
                                {order.maxPrice > 0 && <span>Max: ${formatPrice(order.maxPrice)}</span>}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 mt-1 font-semibold text-black dark:text-white">
                              Current Price:
                              <span className="text-black dark:text-white font-mono font-bold animate-pulse text-sm">
                                ${formatPrice(order.currentPrice)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={!isConnected}
                            className="rounded-full border border-red-200 dark:border-red-800/80 bg-white dark:bg-neutral-800 px-4 py-2 text-[10px] font-bold text-red-600 dark:text-red-400 hover:border-red-400 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                          >
                            Cancel <X className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleSimulateSweep(order.id)}
                            disabled={!isConnected}
                            className="rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 px-4 py-2 text-[10px] font-bold text-black dark:text-white hover:border-black dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shrink-0 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                          >
                            Simulate Match <Zap className="w-3 h-3 fill-current" />
                          </button>
                        </div>
                      </div>

                      {/* Price curve mini-chart */}
                      <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3">
                        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-semibold uppercase tracking-wider mb-1 block">
                          Price Curve (5min projection)
                        </span>
                        {renderPriceCurve(order)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Settled History */}
            <div className="border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 bg-white dark:bg-neutral-900 shadow-xs w-full">
              <h2 className="text-lg font-bold text-black dark:text-white mb-4">Settled Matches Log</h2>
              <div className="flex flex-col gap-3 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                {settledHistory.length === 0 ? (
                  <p className="text-neutral-400 dark:text-neutral-500 text-xs py-4 text-center font-sans">No settled matches recorded on-chain yet.</p>
                ) : (
                  settledHistory.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-2.5 last:border-none last:pb-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 uppercase font-semibold">
                          Matched
                        </span>
                        <span className="text-black dark:text-white font-bold font-sans">{item.pair}</span>
                        <span>Qty: {item.amount}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-black dark:text-white font-bold">{item.price}</span>
                        <span className="text-neutral-400 dark:text-neutral-500 text-[10px]">{item.age}</span>
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
