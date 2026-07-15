'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useWallet } from '@/context/WalletContext';
import WalletModal from '@/components/wallet/WalletModal';

interface Order {
  id: number;
  type: 'Buy' | 'Sell';
  tokenIn: string;
  tokenOut: string;
  amount: number;
  startPrice: number;
  currentPrice: number;
  slope: number;
  createdAt: number;
  active: boolean;
}

export default function DashboardPage() {
  const { isConnected, setWalletModalOpen } = useWallet();
  const [orderType, setOrderType] = useState<'Buy' | 'Sell'>('Buy');
  const nextIdRef = useRef(3000);
  const [tokenIn, setTokenIn] = useState('WETH');
  const [tokenOut, setTokenOut] = useState('USDC');
  const [amount, setAmount] = useState<number>(1);
  const [startPrice, setStartPrice] = useState<number>(3000);
  const [slope, setSlope] = useState<number>(-0.2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial mock orders
  const [orders, setOrders] = useState<Order[]>([]);
  const activeOrders = useMemo(() => orders.filter((o) => o.active), [orders]);

  const [settledHistory, setSettledHistory] = useState([
    { id: 182, pair: 'WETH/USDC', amount: '0.80', price: '$3,150.00', age: '15 mins ago' },
    { id: 175, pair: 'WBTC/USDC', amount: '0.04', price: '$94,500.00', age: '1 hour ago' },
  ]);

  // Dynamic price calculation loop representing actual curve formulas:
  // price(t) = startPrice + slope * deltaT
  useEffect(() => {
    // Set initial mock orders on client mount asynchronously to keep rendering pure and avoid cascading renders
    const initTimeout = setTimeout(() => {
      setOrders([
        {
          id: 2884,
          type: 'Buy',
          tokenIn: 'WETH',
          tokenOut: 'USDC',
          amount: 1.5,
          startPrice: 3200,
          currentPrice: 3200,
          slope: -0.15,
          createdAt: Date.now() - 30000,
          active: true,
        },
        {
          id: 1940,
          type: 'Sell',
          tokenIn: 'USDC',
          tokenOut: 'WETH',
          amount: 4500,
          startPrice: 3000,
          currentPrice: 3000,
          slope: 0.1,
          createdAt: Date.now() - 60000,
          active: true,
        },
      ]);
    }, 0);

    const timer = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((ord) => {
          if (!ord.active) return ord;
          const deltaT = (Date.now() - ord.createdAt) / 1000;
          const calculated = ord.startPrice + ord.slope * deltaT;
          // Clamping minimum price to 0.1 for logic safety
          const currentPrice = Math.max(0.1, Number(calculated.toFixed(2)));
          return { ...ord, currentPrice };
        })
      );
    }, 1000);

    return () => {
      clearTimeout(initTimeout);
      clearInterval(timer);
    };
  }, []);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setWalletModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newOrder: Order = {
        id: nextIdRef.current++,
        type: orderType,
        tokenIn,
        tokenOut,
        amount,
        startPrice,
        currentPrice: startPrice,
        slope,
        createdAt: Date.now(),
        active: true,
      };

      setOrders((prev) => [newOrder, ...prev]);
      setIsSubmitting(false);
      // Reset defaults
      setAmount(1);
    }, 1200);
  };

  const handleSimulateSweep = (orderId: number) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return { ...ord, active: false };
        }
        return ord;
      })
    );

    const matched = orders.find((o) => o.id === orderId);
    if (matched) {
      setSettledHistory((prev) => [
        {
          id: matched.id,
          pair: `${matched.tokenIn}/${matched.tokenOut}`,
          amount: matched.amount.toString(),
          price: `$${matched.currentPrice.toLocaleString()}`,
          age: 'Just now',
        },
        ...prev,
      ]);
    }
  };

  return (
    <main className="w-full min-h-screen bg-white text-black pt-24">
      <WalletModal />

      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
        {/* Page Header */}
        <div>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">EVM Order Matcher</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-black mt-1">Exchange Dashboard</h1>
        </div>

        {!isConnected && (
          /* Glass Alert to connect wallet */
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 p-6 text-center flex flex-col items-center gap-3">
            <span className="text-2xl">🔌</span>
            <h2 className="text-base font-bold text-black">Wallet Connection Required</h2>
            <p className="text-xs text-neutral-500 max-w-sm">
              Please connect your wallet using the button on the top right to start deploying dynamic order curves.
            </p>
            <button
              onClick={() => setWalletModalOpen(true)}
              className="mt-2 rounded-full bg-black px-6 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Connect Wallet
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Create Order Form */}
          <div className={`lg:col-span-1 border border-neutral-100 rounded-3xl p-6 bg-white shadow-sm transition-opacity duration-300 ${!isConnected ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-lg font-bold text-black mb-4">Deploy Curve Order</h2>
            <form onSubmit={handleCreateOrder} className="flex flex-col gap-4 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              {/* Buy/Sell Selector */}
              <div className="flex gap-2 bg-neutral-50 p-1 rounded-full border border-neutral-100">
                <button
                  type="button"
                  onClick={() => setOrderType('Buy')}
                  className={`flex-1 py-2 text-center rounded-full text-[10px] font-bold transition-all ${orderType === 'Buy' ? 'bg-black text-white' : 'text-neutral-500'}`}
                >
                  Buy Order
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('Sell')}
                  className={`flex-1 py-2 text-center rounded-full text-[10px] font-bold transition-all ${orderType === 'Sell' ? 'bg-black text-white' : 'text-neutral-500'}`}
                >
                  Sell Order
                </button>
              </div>

              {/* Tokens In/Out */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="token-in-select" className="text-[9px] text-neutral-400">Token In</label>
                  <select
                    id="token-in-select"
                    value={tokenIn}
                    onChange={(e) => setTokenIn(e.target.value)}
                    className="border border-neutral-200 bg-white p-2.5 rounded-xl text-black font-normal"
                  >
                    <option value="WETH">WETH</option>
                    <option value="USDC">USDC</option>
                    <option value="DAI">DAI</option>
                    <option value="WBTC">WBTC</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="token-out-select" className="text-[9px] text-neutral-400">Token Out</label>
                  <select
                    id="token-out-select"
                    value={tokenOut}
                    onChange={(e) => setTokenOut(e.target.value)}
                    className="border border-neutral-200 bg-white p-2.5 rounded-xl text-black font-normal"
                  >
                    <option value="USDC">USDC</option>
                    <option value="WETH">WETH</option>
                    <option value="DAI">DAI</option>
                    <option value="WBTC">WBTC</option>
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1">
                <label htmlFor="amount-input" className="text-[9px] text-neutral-400">Amount</label>
                <input
                  id="amount-input"
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="border border-neutral-200 bg-white p-2.5 rounded-xl text-black font-normal"
                  placeholder="1.0"
                />
              </div>

              {/* Starting Price */}
              <div className="flex flex-col gap-1">
                <label htmlFor="start-price-input" className="text-[9px] text-neutral-400">Start Price ($)</label>
                <input
                  id="start-price-input"
                  type="number"
                  step="0.1"
                  required
                  value={startPrice}
                  onChange={(e) => setStartPrice(Number(e.target.value))}
                  className="border border-neutral-200 bg-white p-2.5 rounded-xl text-black font-normal"
                  placeholder="3000"
                />
              </div>

              {/* Price Slope */}
              <div className="flex flex-col gap-1">
                <label htmlFor="slope-input" className="text-[9px] text-neutral-400">Slope ($/sec)</label>
                <input
                  id="slope-input"
                  type="number"
                  step="0.001"
                  required
                  value={slope}
                  onChange={(e) => setSlope(Number(e.target.value))}
                  className="border border-neutral-200 bg-white p-2.5 rounded-xl text-black font-normal"
                  placeholder="-0.2"
                />
                <span className="text-[9px] text-neutral-400 font-normal normal-case mt-0.5">
                  Negative for Buys, positive for Sells. Price updates dynamically.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-full bg-black py-3 text-center text-xs font-bold text-white uppercase hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Deploying...' : 'Deploy Order'}
              </button>
            </form>
          </div>

          {/* Right Column: Active Orders & History */}
          <div className="lg:col-span-2 flex flex-col gap-8 w-full">
            {/* Active Orders Section */}
            <div className="border border-neutral-100 rounded-3xl p-6 bg-white shadow-sm w-full">
              <h2 className="text-lg font-bold text-black mb-4">Your Dynamic Orders</h2>
              <div className="flex flex-col gap-4">
                {activeOrders.length === 0 ? (
                  <p className="text-neutral-400 text-xs py-6 text-center">No active dynamic orders deployed.</p>
                ) : (
                  activeOrders
                    .map((order) => (
                      <div
                        key={order.id}
                        className="border border-neutral-100 bg-neutral-50/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-neutral-400">#{order.id}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${order.type === 'Buy' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {order.type}
                            </span>
                            <span className="text-xs font-bold text-neutral-800">
                              {order.amount} {order.tokenIn} ➔ {order.tokenOut}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5 text-xs text-neutral-500 mt-1">
                            <div>
                              Start: <span className="font-semibold text-black">${order.startPrice}</span>
                            </div>
                            <div>
                              Slope: <span className="font-semibold text-black">{order.slope > 0 ? `+${order.slope}` : order.slope} /s</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 font-semibold text-black">
                              Current Price:
                              <span className="text-black font-mono font-bold animate-pulse text-sm">${order.currentPrice}</span>
                            </div>
                          </div>
                        </div>

                        {/* Simulation trigger */}
                        <button
                          onClick={() => handleSimulateSweep(order.id)}
                          disabled={!isConnected}
                          className="rounded-full border border-black/10 bg-white px-4 py-2 text-[10px] font-bold text-black hover:border-black transition-colors shrink-0 disabled:opacity-40"
                        >
                          Simulate Sweep Match ⚡
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Settled History */}
            <div className="border border-neutral-100 rounded-3xl p-6 bg-white shadow-sm w-full">
              <h2 className="text-lg font-bold text-black mb-4">Settled Matches Log</h2>
              <div className="flex flex-col gap-3 font-mono text-[11px] text-neutral-500">
                {settledHistory.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b border-neutral-100 pb-2.5 last:border-none last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800 uppercase font-semibold">Matched</span>
                      <span className="text-black font-bold font-sans">{item.pair}</span>
                      <span>Qty: {item.amount}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-black font-bold">{item.price}</span>
                      <span className="text-neutral-400 text-[10px]">{item.age}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
