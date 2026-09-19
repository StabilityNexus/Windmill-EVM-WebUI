'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { WINDMILL_EXCHANGE_ABI, ERC20_ABI, SUPPORTED_CHAINS, DEFAULT_CHAIN_ID } from '@/lib/contractConfig';

// ── Minimal ethers-free ABI encoding/provider ───────────────────────
// We use the browser's built-in fetch + window.ethereum for calls
// to keep the frontend lightweight without bundling ethers.

interface ContractCallResult {
  data: unknown;
  error: string | null;
}

/**
 * useContract — provides helpers for interacting with WindmillExchange
 * and ERC20 token contracts via the connected wallet or public RPC fallback.
 */
export function useContract() {
  const { fullAddress, chainId, provider, isConnected } = useWallet();

  // If wallet is connected, use wallet's chainId;
  // Otherwise find the first configured chain with a contract address, or fall back to DEFAULT_CHAIN_ID
  const configuredChainId = useMemo(() => {
    if (chainId) return chainId;
    if (SUPPORTED_CHAINS[DEFAULT_CHAIN_ID]?.contractAddress) return DEFAULT_CHAIN_ID;
    const deployed = Object.values(SUPPORTED_CHAINS).find((c) => !!c.contractAddress);
    return deployed ? deployed.chainId : DEFAULT_CHAIN_ID;
  }, [chainId]);

  const contractAddress = useMemo(() => {
    if (!configuredChainId) return null;
    return SUPPORTED_CHAINS[configuredChainId]?.contractAddress || null;
  }, [configuredChainId]);

  const rpcUrl = useMemo(() => {
    if (!configuredChainId) return null;
    return SUPPORTED_CHAINS[configuredChainId]?.rpcUrl || null;
  }, [configuredChainId]);

  // ── Read contract (via RPC or provider) ───────────────────────────
  const readContract = useCallback(
    async (method: string, args: unknown[] = []): Promise<ContractCallResult> => {
      if (!contractAddress) {
        return { data: null, error: 'No contract address configured for this chain' };
      }

      try {
        // Use provider if available, otherwise fallback to RPC fetch
        const target = provider || null;
        if (target) {
          const iface = new (await import('ethers')).Interface(WINDMILL_EXCHANGE_ABI);
          const calldata = iface.encodeFunctionData(method, args as never[]);
          const result = await target.request({
            method: 'eth_call',
            params: [{ to: contractAddress, data: calldata }, 'latest'],
          });
          const decoded = iface.decodeFunctionResult(method, result as string);
          return { data: decoded.length === 1 ? decoded[0] : decoded, error: null };
        }

        // Fallback: direct RPC
        if (rpcUrl) {
          const iface = new (await import('ethers')).Interface(WINDMILL_EXCHANGE_ABI);
          const calldata = iface.encodeFunctionData(method, args as never[]);
          const resp = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{ to: contractAddress, data: calldata }, 'latest'],
              id: 1,
            }),
          });
          const json = await resp.json();
          if (json.error) return { data: null, error: json.error.message };
          const decoded = iface.decodeFunctionResult(method, json.result);
          return { data: decoded.length === 1 ? decoded[0] : decoded, error: null };
        }

        return { data: null, error: 'No provider or RPC URL available' };
      } catch (err) {
        return { data: null, error: (err as Error).message };
      }
    },
    [contractAddress, provider, rpcUrl]
  );

  // ── Write contract (sends transaction via wallet) ─────────────────
  const writeContract = useCallback(
    async (
      method: string,
      args: unknown[] = [],
      value?: string
    ): Promise<{ txHash: string | null; error: string | null }> => {
      if (!provider || !fullAddress || !contractAddress) {
        return { txHash: null, error: 'Wallet not connected or no contract address' };
      }

      try {
        const { Interface } = await import('ethers');
        const iface = new Interface(WINDMILL_EXCHANGE_ABI);
        const calldata = iface.encodeFunctionData(method, args as never[]);

        const txParams: Record<string, string> = {
          from: fullAddress,
          to: contractAddress,
          data: calldata,
        };
        if (value) {
          txParams.value = value;
        }

        const txHash = (await provider.request({
          method: 'eth_sendTransaction',
          params: [txParams],
        })) as string;

        return { txHash, error: null };
      } catch (err) {
        return { txHash: null, error: (err as Error).message };
      }
    },
    [provider, fullAddress, contractAddress]
  );

  // ── Read ERC20 ────────────────────────────────────────────────────
  const readERC20 = useCallback(
    async (tokenAddress: string, method: string, args: unknown[] = []): Promise<ContractCallResult> => {
      try {
        const target = provider || null;
        const { Interface } = await import('ethers');
        const iface = new Interface(ERC20_ABI);
        const calldata = iface.encodeFunctionData(method, args as never[]);

        if (target) {
          const result = await target.request({
            method: 'eth_call',
            params: [{ to: tokenAddress, data: calldata }, 'latest'],
          });
          const decoded = iface.decodeFunctionResult(method, result as string);
          return { data: decoded.length === 1 ? decoded[0] : decoded, error: null };
        }

        if (rpcUrl) {
          const resp = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{ to: tokenAddress, data: calldata }, 'latest'],
              id: 1,
            }),
          });
          const json = await resp.json();
          if (json.error) return { data: null, error: json.error.message };
          const decoded = iface.decodeFunctionResult(method, json.result);
          return { data: decoded.length === 1 ? decoded[0] : decoded, error: null };
        }

        return { data: null, error: 'No provider or RPC URL available' };
      } catch (err) {
        return { data: null, error: (err as Error).message };
      }
    },
    [provider, rpcUrl]
  );

  // ── Approve ERC20 ─────────────────────────────────────────────────
  const approveERC20 = useCallback(
    async (
      tokenAddress: string,
      spender: string,
      amount: string
    ): Promise<{ txHash: string | null; error: string | null }> => {
      if (!provider || !fullAddress) {
        return { txHash: null, error: 'Wallet not connected' };
      }

      try {
        const { Interface } = await import('ethers');
        const iface = new Interface(ERC20_ABI);
        const calldata = iface.encodeFunctionData('approve', [spender, amount]);

        const txHash = (await provider.request({
          method: 'eth_sendTransaction',
          params: [{ from: fullAddress, to: tokenAddress, data: calldata }],
        })) as string;

        return { txHash, error: null };
      } catch (err) {
        return { txHash: null, error: (err as Error).message };
      }
    },
    [provider, fullAddress]
  );

  const fetchEvents = useCallback(
    async (eventName: string, fromBlock: number = 0) => {
      if (!contractAddress || !rpcUrl) {
        return { data: null, error: 'Contract or RPC not configured' };
      }
      try {
        const { JsonRpcProvider, Contract } = await import('ethers');
        const rpcProvider = new JsonRpcProvider(rpcUrl);
        const contract = new Contract(contractAddress, WINDMILL_EXCHANGE_ABI, rpcProvider);
        
        const filter = contract.filters[eventName]();
        const logs = await contract.queryFilter(filter, fromBlock, 'latest');
        return { data: logs, error: null };
      } catch (err) {
        console.error(`Error fetching events for ${eventName}:`, err);
        return { data: null, error: (err as Error).message };
      }
    },
    [contractAddress, rpcUrl]
  );

  return {
    contractAddress,
    isReady: isConnected && !!contractAddress,
    isReadReady: !!contractAddress && (!!provider || !!rpcUrl),
    readContract,
    writeContract,
    readERC20,
    approveERC20,
    fetchEvents,
  };
}

/**
 * useTotalOrders — fetches the total order count from the contract.
 */
export function useTotalOrders() {
  const { readContract, isReadReady } = useContract();
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!isReadReady) return;
    setLoading(true);
    const { data, error } = await readContract('totalOrders');
    if (!error && data !== null) {
      setTotal(Number(data));
    }
    setLoading(false);
  }, [isReadReady, readContract]);

  useEffect(() => {
    if (isReadReady) {
      const timer = setTimeout(() => {
        fetch();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isReadReady, fetch]);

  return { total, loading, refetch: fetch };
}

/**
 * usePaused — checks if the exchange is paused.
 */
export function usePaused() {
  const { readContract, isReadReady } = useContract();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!isReadReady) return;
    let isMounted = true;
    readContract('paused').then(({ data }) => {
      if (isMounted && data !== null) setPaused(Boolean(data));
    });
    return () => {
      isMounted = false;
    };
  }, [isReadReady, readContract]);

  return paused;
}

/**
 * useOrderDetails — fetches details for a given orderId.
 */
export function useOrderDetails(orderId: number | bigint | null) {
  const { readContract, isReady } = useContract();
  const [order, setOrder] = useState<unknown | null>(null);
  const [currentPriceVal, setCurrentPriceVal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!isReady || orderId === null) return;
    setLoading(true);
    setError(null);
    try {
      const orderRes = await readContract('getOrder', [orderId]);
      if (orderRes.error) {
        setError(orderRes.error);
      } else {
        setOrder(orderRes.data);
      }

      const priceRes = await readContract('currentPrice', [orderId, Math.floor(Date.now() / 1000)]);
      if (!priceRes.error && priceRes.data !== null) {
        setCurrentPriceVal(String(priceRes.data));
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [isReady, orderId, readContract]);

  useEffect(() => {
    if (isReady && orderId !== null) {
      const timer = setTimeout(() => {
        fetchDetails();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isReady, orderId, fetchDetails]);

  return { order, currentPrice: currentPriceVal, loading, error, refetch: fetchDetails };
}

/**
 * useOrderActions — provides createOrder and cancelOrder execution functions.
 */
export function useOrderActions() {
  const { writeContract, approveERC20, isReady } = useContract();
  const [submitting, setSubmitting] = useState(false);

  const createOrder = useCallback(
    async (params: {
      tokenIn: string;
      tokenOut: string;
      amountIn: string;
      startPrice: string;
      slope: string;
      minPrice: string;
      maxPrice: string;
      expiry: number;
      isBuy: boolean;
      value?: string;
    }) => {
      setSubmitting(true);
      try {
        const res = await writeContract(
          'createOrder',
          [
            params.tokenIn,
            params.tokenOut,
            params.amountIn,
            params.startPrice,
            params.slope,
            params.minPrice,
            params.maxPrice,
            params.expiry,
            params.isBuy,
          ],
          params.value
        );
        return res;
      } finally {
        setSubmitting(false);
      }
    },
    [writeContract]
  );

  const cancelOrder = useCallback(
    async (orderId: number | bigint) => {
      setSubmitting(true);
      try {
        const res = await writeContract('cancelOrder', [orderId]);
        return res;
      } finally {
        setSubmitting(false);
      }
    },
    [writeContract]
  );

  return { createOrder, cancelOrder, approveERC20, isReady, submitting };
}

