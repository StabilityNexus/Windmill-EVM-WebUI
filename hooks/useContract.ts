'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {JsonRpcProvider} from 'ethers';
import { useWallet } from '@/context/WalletContext';
import { WINDMILL_EXCHANGE_ABI, ERC20_ABI, SUPPORTED_CHAINS, DEFAULT_CHAIN_ID } from '@/lib/contractConfig';

// ── Minimal ethers-free ABI encoding/provider ───────────────────────
// We use the browser's built-in fetch + window.ethereum for calls
// to keep the frontend lightweight without bundling ethers.

type Log={args:unknown[];transactionHash?:string;blockNumber:number};
type Scan={next:number;logs:Log[]};
type Result={data:Log[]|null;error:string|null;complete:boolean;coveredThrough:number|null};
const providers=new Map<string,Promise<JsonRpcProvider>>();
const jobs=new Map<string,Promise<unknown>>();
let dbPromise:Promise<IDBDatabase>|undefined;
function getDB(){
  return dbPromise??=new Promise<IDBDatabase>((resolve,reject)=>{
    if(typeof indexedDB==='undefined'){
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const r=indexedDB.open('windmill-events',1);
    r.onupgradeneeded=()=>r.result.createObjectStore('scans');
    r.onsuccess=()=>resolve(r.result);
    r.onerror=()=>reject(r.error);
  });
}
async function getProvider(url:string){
  let p=providers.get(url);
  if(!p){
    p=import('ethers').then(({JsonRpcProvider})=>new JsonRpcProvider(url));
    providers.set(url,p);
    p.catch(()=>{if(providers.get(url)===p)providers.delete(url);});
  }
  return p;
}
async function readScan(key:string,start:number):Promise<Scan>{
  try{
    const db=await getDB();
    return await new Promise((resolve,reject)=>{
      const r=db.transaction('scans','readonly').objectStore('scans').get(key);
      r.onsuccess=()=>resolve(r.result??{next:start,logs:[]});
      r.onerror=()=>reject(r.error);
    });
  }catch{
    return{next:start,logs:[]};
  }
}
async function saveScan(key:string,s:Scan){
  try{
    const db=await getDB();
    await new Promise<void>((resolve,reject)=>{
      const tx=db.transaction('scans','readwrite');
      tx.objectStore('scans').put(s,key);
      tx.oncomplete=()=>resolve();
      tx.onerror=()=>reject(tx.error);
      tx.onabort=()=>reject(tx.error);
    });
  }catch{}
}
interface FilterableContract{
  queryFilter(filter:unknown,fromBlock?:number|string,toBlock?:number|string):Promise<Array<{args?:unknown[];transactionHash?:string;blockNumber?:number}>>;
}
async function scanEvents(contract:FilterableContract,filter:unknown,key:string,start:number,head:number):Promise<Result>{
  // serialize per key: a later caller (maybe with a newer head) waits, then resumes from the saved checkpoint
  const prev=jobs.get(key)??Promise.resolve();
  const job=prev.catch(()=>{}).then(async():Promise<Result>=>{
    let s:Scan={next:start,logs:[]};
    try{
      s=await readScan(key,start);
      while(s.next<=head){
        const to=Math.min(s.next+1999,head);
        const chunk=await contract.queryFilter(filter,s.next,to);
        const next:Scan={
          next:to+1,
          logs:[...s.logs,...chunk.map((l):Log=>({
            args:Array.from(l.args??[],(v:unknown)=>typeof v==='bigint'?v.toString():v),
            transactionHash:l.transactionHash,
            blockNumber:l.blockNumber??0
          }))]
        };
        await saveScan(key,next);
        s=next;
      }
      // never return data from beyond the requested head
      const coveredThrough=Math.min(s.next-1,head);
      const data=s.logs.filter(l=>(l.blockNumber??0)<=head);
      return{data,error:null,complete:coveredThrough===head,coveredThrough};
    }catch(e){
      return{data:null,error:String(e),complete:false,coveredThrough:Math.min(s.next-1,head)};
    }
  });
  jobs.set(key,job);
  try{return await job;}
  finally{if(jobs.get(key)===job)jobs.delete(key);}
}

export type EventLog=Log;
export type EventFetchResult=Result;

interface ContractCallResult {
  data: unknown;
  error: string | null;
}

/**
 * useContract — provides helpers for interacting with WindmillExchange
 * and ERC20 token contracts via the connected wallet.
 */
export function useContract() {
  const { fullAddress, chainId, provider, isConnected } = useWallet();

  // Read-only pages (e.g. /stats) need contract data before any wallet is
  // connected, so reads fall back to the default configured chain instead
  // of requiring `chainId` from a connected wallet.
  const readChainId = chainId ?? DEFAULT_CHAIN_ID;

  const contractAddress = useMemo(() => {
    return SUPPORTED_CHAINS[readChainId]?.contractAddress || null;
  }, [readChainId]);

  const rpcUrl = useMemo(() => {
    return SUPPORTED_CHAINS[readChainId]?.rpcUrl || null;
  }, [readChainId]);

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

  const getEventHead=useCallback(async():Promise<number>=>{
    if(!rpcUrl)throw new Error('RPC not configured');
    return(await getProvider(rpcUrl)).getBlockNumber();
  },[rpcUrl]);

  const fetchEvents=useCallback(async(eventName:string,headBlock?:number):Promise<Result>=>{
    const chainConfig=SUPPORTED_CHAINS[readChainId];
    const start=chainConfig?.deployedBlock;
    if(start===undefined)return{data:null,error:'Deployment block unknown',complete:false,coveredThrough:null};
    if(!contractAddress||!rpcUrl)return{data:null,error:'Contract or RPC not configured',complete:false,coveredThrough:null};
    const provider=await getProvider(rpcUrl);
    const {Contract}=await import('ethers');
    const contract=new Contract(contractAddress,WINDMILL_EXCHANGE_ABI,provider);
    // "v2" so checkpoints written by the older shape are never reused
    const key=`v2:${readChainId}:${contractAddress.toLowerCase()}:${eventName}:${start}`;
    return scanEvents(contract,contract.filters[eventName](),key,start,headBlock??await provider.getBlockNumber());
  },[rpcUrl,contractAddress,readChainId]);

  return {
    contractAddress,
    rpcUrl,
    isReady: isConnected && !!contractAddress,
    // True once a contract address resolves for the read chain (connected or
    // default) — view calls work via the public RPC fallback with no wallet.
    canRead: !!contractAddress,
    readContract,
    writeContract,
    readERC20,
    approveERC20,
    fetchEvents,
    getEventHead,
  };
}

/**
 * useTotalOrders — fetches the total order count from the contract.
 */
export function useTotalOrders() {
  const { readContract, isReady } = useContract();
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!isReady) return;
    setLoading(true);
    const { data, error } = await readContract('totalOrders');
    if (!error && data !== null) {
      setTotal(Number(data));
    }
    setLoading(false);
  }, [isReady, readContract]);

  useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => {
        fetch();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isReady, fetch]);

  return { total, loading, refetch: fetch };
}

/**
 * usePaused — checks if the exchange is paused.
 */
export function usePaused() {
  const { readContract, isReady } = useContract();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    let isMounted = true;
    readContract('paused').then(({ data }) => {
      if (isMounted && data !== null) setPaused(Boolean(data));
    });
    return () => {
      isMounted = false;
    };
  }, [isReady, readContract]);

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

  const matchOrders = useCallback(
    async (buyOrderId: number | bigint, sellOrderId: number | bigint, deadline?: number) => {
      setSubmitting(true);
      try {
        const d = deadline ?? Math.floor(Date.now() / 1000) + 3600;
        const res = await writeContract('matchOrders', [buyOrderId, sellOrderId, d]);
        return res;
      } finally {
        setSubmitting(false);
      }
    },
    [writeContract]
  );

  const matchOrdersBatch = useCallback(
    async (orderId: number | bigint, counterOrderIds: (number | bigint)[], deadline?: number) => {
      setSubmitting(true);
      try {
        const d = deadline ?? Math.floor(Date.now() / 1000) + 3600;
        const res = await writeContract('matchOrdersBatch', [orderId, counterOrderIds, d]);
        return res;
      } finally {
        setSubmitting(false);
      }
    },
    [writeContract]
  );

  return { createOrder, cancelOrder, matchOrders, matchOrdersBatch, approveERC20, isReady, submitting };
}

