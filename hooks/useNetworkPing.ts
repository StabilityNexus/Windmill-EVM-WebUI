'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { SUPPORTED_CHAINS } from '@/lib/contractConfig';

export type PingStatus = 'idle' | 'pinging' | 'online' | 'timeout' | 'error';

interface PingState {
  latencyMs: number | null;
  status: PingStatus;
  lastCheckedAt: number | null;
}

const PING_INTERVAL_MS = 15_000;
const PING_TIMEOUT_MS = 5_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/**
 * useNetworkPing — measures real round-trip latency to the connected
 * chain's RPC endpoint (via the wallet's provider, falling back to a
 * direct RPC call) on a recurring interval, instead of just reporting a
 * static "connected" label.
 */
export function useNetworkPing() {
  const { chainId, provider, isConnected } = useWallet();
  const [state, setState] = useState<PingState>({ latencyMs: null, status: 'idle', lastCheckedAt: null });
  const rpcUrl = chainId ? SUPPORTED_CHAINS[chainId]?.rpcUrl ?? null : null;

  // Avoid a stale ping response from a previous chain overwriting the
  // result of a ping made after the user switched networks.
  const requestIdRef = useRef(0);

  const ping = useCallback(async () => {
    if (!isConnected) return;
    const requestId = ++requestIdRef.current;
    setState((prev) => ({ ...prev, status: 'pinging' }));

    const start = performance.now();
    try {
      if (provider) {
        await withTimeout(provider.request({ method: 'eth_blockNumber' }), PING_TIMEOUT_MS);
      } else if (rpcUrl) {
        const res = await withTimeout(
          fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
          }),
          PING_TIMEOUT_MS,
        );
        const json = await res.json();
        if (json.error) throw new Error(json.error.message);
      } else {
        throw new Error('No provider or RPC URL available');
      }

      if (requestId !== requestIdRef.current) return; // superseded by a newer ping
      setState({ latencyMs: Math.round(performance.now() - start), status: 'online', lastCheckedAt: Date.now() });
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      const timedOut = err instanceof Error && err.message === 'timeout';
      setState({ latencyMs: null, status: timedOut ? 'timeout' : 'error', lastCheckedAt: Date.now() });
    }
  }, [isConnected, provider, rpcUrl]);

  useEffect(() => {
    if (!isConnected) {
      setState({ latencyMs: null, status: 'idle', lastCheckedAt: null });
      return;
    }

    ping();
    const interval = setInterval(ping, PING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isConnected, ping]);

  return state;
}
