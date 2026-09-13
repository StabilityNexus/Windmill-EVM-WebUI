'use client';

import React, { useState, useEffect, useRef } from 'react';
import WalletModal from '@/components/wallet/WalletModal';
import { SUPPORTED_CHAINS } from '@/lib/contractConfig';

const DOCS_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'price-curves', label: 'Price Curves' },
  { id: 'api', label: 'API Reference' },
  { id: 'deployment', label: 'Deployment' },
  { id: 'keeper', label: 'Keeper Guide' },
  { id: 'networks', label: 'Networks' },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const containerRef = useRef<HTMLDivElement>(null);

  // Re-observe [data-reveal] children every time the active section changes.
  // Without this, elements rendered after the initial mount never get the
  // IntersectionObserver attached and stay stuck at opacity-0.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Small timeout lets React finish rendering the new section's DOM nodes
    const timer = setTimeout(() => {
      const children = container.querySelectorAll<HTMLElement>('[data-reveal]');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -40px 0px' },
      );
      children.forEach((child) => observer.observe(child));
      return () => observer.disconnect();
    }, 50);

    return () => clearTimeout(timer);
  }, [activeSection]);

  return (
    <main className="w-full min-h-screen bg-background text-foreground pt-24 transition-colors duration-300">
      <WalletModal />

      <div ref={containerRef} className="max-w-5xl mx-auto px-6 py-16 flex flex-col lg:flex-row gap-10">
        {/* Sidebar Navigation */}
        <nav className="lg:w-48 shrink-0 lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">Documentation</h2>
          <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {DOCS_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeSection === section.id
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-8 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed min-w-0">
          {activeSection === 'overview' && (
            <div data-reveal className="reveal-fade-up flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white mb-4">Windmill Exchange Protocol</h1>
                <p>
                  Windmill Exchange is a fully on-chain order matching engine for EVM-compatible blockchains. It implements
                  configurable dynamic pricing curves with autonomous keeper-based settlement.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 bg-neutral-50/30 dark:bg-neutral-900/50">
                  <h3 className="text-sm font-bold text-black dark:text-white mb-2">Core Contract</h3>
                  <p className="text-xs text-neutral-500">
                    <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-[11px]">WindmillExchange.sol</code> — Handles
                    order creation, cancellation, matching, and settlement with ReentrancyGuard protection.
                  </p>
                </div>
                <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 bg-neutral-50/30 dark:bg-neutral-900/50">
                  <h3 className="text-sm font-bold text-black dark:text-white mb-2">Keeper Network</h3>
                  <p className="text-xs text-neutral-500">
                    Node.js service using ethers.js that continuously scans for matchable order pairs and executes
                    settlement transactions to earn 0.1% fees.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'price-curves' && (
            <div data-reveal className="reveal-fade-up flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold text-black dark:text-white">Price Curve Mechanics</h2>
              <p>
                Each order is characterized by a starting price and a linear slope. Prices are represented in{' '}
                <strong>RAY</strong> (1e27) units for high-precision arithmetic:
              </p>
              <div className="bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-100 dark:border-neutral-800 p-5 rounded-xl font-mono text-sm text-black dark:text-white">
                price(t) = startPrice + slope × (t − createdAt)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-neutral-100 dark:border-neutral-800 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-black dark:text-white mb-1">Buy Orders (Negative Slope)</h4>
                  <p className="text-xs text-neutral-500">
                    Buyer&apos;s willingness to pay <em>decreases</em> over time. The price slides downward along the curve
                    until it meets a compatible sell order or expires.
                  </p>
                </div>
                <div className="border border-neutral-100 dark:border-neutral-800 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-black dark:text-white mb-1">Sell Orders (Positive Slope)</h4>
                  <p className="text-xs text-neutral-500">
                    Seller&apos;s asking price <em>increases</em> over time. This creates natural price convergence where
                    buy and sell curves eventually intersect.
                  </p>
                </div>
              </div>
              <div className="border border-neutral-100 dark:border-neutral-800 rounded-xl p-4">
                <h4 className="text-sm font-bold text-black dark:text-white mb-2">Price Bounds</h4>
                <ul className="text-xs text-neutral-500 flex flex-col gap-1.5">
                  <li>• <code className="bg-neutral-100 px-1 py-0.5 rounded">minPrice</code> — Floor price. The curve never goes below this value (0 = no floor).</li>
                  <li>• <code className="bg-neutral-100 px-1 py-0.5 rounded">maxPrice</code> — Ceiling price. The curve never exceeds this value (0 = no ceiling).</li>
                  <li>• <code className="bg-neutral-100 px-1 py-0.5 rounded">expiry</code> — Unix timestamp after which the order cannot be matched (0 = no expiry).</li>
                </ul>
              </div>
              <div className="border border-neutral-100 dark:border-neutral-800 rounded-xl p-4">
                <h4 className="text-sm font-bold text-black dark:text-white mb-2">Settlement Price</h4>
                <p className="text-xs text-neutral-500">
                  When two orders match, the settlement price is computed as the midpoint of the buy and sell prices at the
                  current timestamp. The executed quantity is determined by the smaller of: (1) what the buyer can afford, and
                  (2) what the seller has remaining.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div data-reveal className="reveal-fade-up flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold text-black dark:text-white">API Reference</h2>
              <p className="text-neutral-500">Complete public interface of the WindmillExchange smart contract.</p>

              {/* createOrder */}
              <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-black dark:text-white font-mono mb-2">createOrder()</h3>
                <div className="bg-neutral-50 dark:bg-neutral-800/80 rounded-xl p-3 font-mono text-[11px] text-black dark:text-white overflow-x-auto mb-3">
                  <pre className="whitespace-pre">{`function createOrder(
  address tokenIn,    // Token deposited by maker
  address tokenOut,   // Token desired by maker
  uint256 amountIn,   // Amount of tokenIn to deposit
  uint256 startPrice, // Initial price in RAY (1e27)
  int256 slope,       // Price change per second in RAY
  uint256 minPrice,   // Floor price (0 = none)
  uint256 maxPrice,   // Ceiling price (0 = none)
  uint256 expiry,     // Unix expiry timestamp (0 = none)
  bool isBuy          // true = buy order, false = sell
) external payable returns (uint256 orderId)`}</pre>
                </div>
                <p className="text-xs text-neutral-500">
                  Creates a new dynamic-priced order. The maker deposits <code>amountIn</code> tokens (or ETH for WETH pairs).
                  Returns the assigned order ID.
                </p>
              </div>

              {/* cancelOrder */}
              <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-black dark:text-white font-mono mb-2">cancelOrder()</h3>
                <div className="bg-neutral-50 dark:bg-neutral-800/80 rounded-xl p-3 font-mono text-[11px] text-black dark:text-white overflow-x-auto mb-3">
                  <pre className="whitespace-pre">{`function cancelOrder(uint256 orderId) external`}</pre>
                </div>
                <p className="text-xs text-neutral-500">
                  Cancels an active order. Only the maker can cancel. Refunds remaining deposited tokens to the maker.
                </p>
              </div>

              {/* matchOrders */}
              <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-black dark:text-white font-mono mb-2">matchOrders()</h3>
                <div className="bg-neutral-50 dark:bg-neutral-800/80 rounded-xl p-3 font-mono text-[11px] text-black dark:text-white overflow-x-auto mb-3">
                  <pre className="whitespace-pre">{`function matchOrders(
  uint256 buyOrderId,
  uint256 sellOrderId,
  uint256 deadline      // Keeper deadline timestamp
) external`}</pre>
                </div>
                <p className="text-xs text-neutral-500">
                  Settles a compatible buy-sell pair. Called by keepers. Awards 0.1% fee to <code>msg.sender</code>.
                  Requires buy price ≥ sell price at the current timestamp.
                </p>
              </div>

              {/* matchOrdersBatch */}
              <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-black dark:text-white font-mono mb-2">matchOrdersBatch()</h3>
                <div className="bg-neutral-50 dark:bg-neutral-800/80 rounded-xl p-3 font-mono text-[11px] text-black dark:text-white overflow-x-auto mb-3">
                  <pre className="whitespace-pre">{`function matchOrdersBatch(
  uint256 orderId,
  uint256[] calldata counterOrderIds,
  uint256 deadline
) external`}</pre>
                </div>
                <p className="text-xs text-neutral-500">
                  Batch matches one order against multiple counter-orders in a single transaction for gas efficiency.
                </p>
              </div>

              {/* View functions */}
              <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-black dark:text-white mb-2">View Functions</h3>
                <div className="flex flex-col gap-3 text-xs font-mono">
                  <div className="flex flex-col gap-1">
                    <code className="text-black dark:text-white">getOrder(uint256 orderId) → Order</code>
                    <span className="text-neutral-400 font-sans">Returns the full order struct for a given ID.</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <code className="text-black dark:text-white">getOrdersByPair(address tokenA, address tokenB, uint256 cursor, uint256 limit) → uint256[]</code>
                    <span className="text-neutral-400 font-sans">Paginated list of order IDs for a token pair (max 500 per page).</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <code className="text-black dark:text-white">currentPrice(uint256 orderId, uint256 timestamp) → uint256</code>
                    <span className="text-neutral-400 font-sans">Computes the order&apos;s price at a given timestamp using the price curve formula.</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <code className="text-black dark:text-white">totalOrders() → uint256</code>
                    <span className="text-neutral-400 font-sans">Total number of orders created (including inactive).</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'deployment' && (
            <div data-reveal className="reveal-fade-up flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold text-black dark:text-white">Deployment Guide</h2>

              <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-black dark:text-white mb-3">Prerequisites</h3>
                <div className="bg-neutral-50 dark:bg-neutral-800/80 rounded-xl p-4 font-mono text-xs text-black dark:text-white overflow-x-auto">
                  <pre className="whitespace-pre">{`# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify
forge --version
cast --version
anvil --version`}</pre>
                </div>
              </div>

              <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-black dark:text-white mb-3">Environment Setup</h3>
                <div className="bg-neutral-50 dark:bg-neutral-800/80 rounded-xl p-4 font-mono text-xs text-black dark:text-white overflow-x-auto">
                  <pre className="whitespace-pre">{`cp .env.example .env

# Edit .env:
PRIVATE_KEY=0x...          # Deployer wallet private key
ETHERSCAN_API_KEY=...      # For contract verification
WETH_ADDRESS=0xC02a...     # Chain-specific WETH address`}</pre>
                </div>
              </div>

              <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-black dark:text-white mb-3">Deploy to Testnet</h3>
                <div className="bg-neutral-50 dark:bg-neutral-800/80 rounded-xl p-4 font-mono text-xs text-black dark:text-white overflow-x-auto">
                  <pre className="whitespace-pre">{`# Deploy to Sepolia
forge script script/DeployWindmill.s.sol \\
  --rpc-url sepolia \\
  --broadcast \\
  --verify \\
  -vvvv

# Deploy to Mordor (ETC testnet)
forge script script/DeployWindmill.s.sol \\
  --rpc-url mordor \\
  --broadcast \\
  -vvvv`}</pre>
                </div>
              </div>

              <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-black dark:text-white mb-3">Deploy to Mainnet</h3>
                <div className="bg-neutral-50 dark:bg-neutral-800/80 rounded-xl p-4 font-mono text-xs text-black dark:text-white overflow-x-auto">
                  <pre className="whitespace-pre">{`# Ethereum Mainnet
forge script script/DeployWindmill.s.sol \\
  --rpc-url ethereum --broadcast --verify -vvvv

# Base
forge script script/DeployWindmill.s.sol \\
  --rpc-url base --broadcast --verify -vvvv

# Polygon
forge script script/DeployWindmill.s.sol \\
  --rpc-url polygon --broadcast --verify -vvvv`}</pre>
                </div>
              </div>

              <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-black dark:text-white mb-3">Post-Deployment</h3>
                <ol className="flex flex-col gap-2 text-xs text-neutral-600 list-decimal pl-5">
                  <li>Record the deployed contract address from console output</li>
                  <li>Set <code className="bg-neutral-100 px-1 py-0.5 rounded">NEXT_PUBLIC_CONTRACT_ADDRESS_*</code> in the WebUI .env</li>
                  <li>Set <code className="bg-neutral-100 px-1 py-0.5 rounded">CONTRACT_ADDRESS</code> in the Keeper .env</li>
                  <li>Optionally configure protocol fee via <code className="bg-neutral-100 px-1 py-0.5 rounded">setProtocolFee()</code></li>
                </ol>
              </div>
            </div>
          )}

          {activeSection === 'keeper' && (
            <div data-reveal className="reveal-fade-up flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold text-black dark:text-white">Keeper Integration Guide</h2>
              <p>
                The keeper service is a headless Node.js application that monitors the WindmillExchange contract for
                matchable orders and executes settlement transactions to earn fees.
              </p>

              <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-black dark:text-white mb-2">Strategy: Windmill</h3>
                <p className="text-xs text-neutral-500 mb-3">
                  The <code className="bg-neutral-100 px-1 py-0.5 rounded">windmill</code> strategy implements:
                </p>
                <ol className="flex flex-col gap-2 text-xs text-neutral-600 list-decimal pl-5">
                  <li>Event-based pair discovery from <code>OrderCreated</code> logs</li>
                  <li>Paginated order fetching via <code>getOrdersByPair()</code></li>
                  <li>On-chain price resolution via <code>currentPrice()</code></li>
                  <li>Two-pointer sweep matching (O(N log N) sort + O(N+M) sweep)</li>
                  <li>Atomic settlement via <code>matchOrders()</code></li>
                </ol>
              </div>

              <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-black dark:text-white mb-2">Configuration Reference</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-neutral-400 uppercase tracking-wider text-[10px] font-bold border-b border-neutral-100">
                        <th className="text-left p-2">Variable</th>
                        <th className="text-left p-2">Default</th>
                        <th className="text-left p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-neutral-600">
                      <tr className="border-b border-neutral-50"><td className="p-2 font-mono">KEEPER_STRATEGY</td><td className="p-2">noop</td><td className="p-2">Strategy name (use &quot;windmill&quot;)</td></tr>
                      <tr className="border-b border-neutral-50"><td className="p-2 font-mono">RPC_URL</td><td className="p-2">localhost:8545</td><td className="p-2">JSON-RPC endpoint</td></tr>
                      <tr className="border-b border-neutral-50"><td className="p-2 font-mono">EXPECTED_CHAIN_ID</td><td className="p-2">—</td><td className="p-2">Safety check for chain ID</td></tr>
                      <tr className="border-b border-neutral-50"><td className="p-2 font-mono">PRIVATE_KEY</td><td className="p-2">—</td><td className="p-2">Keeper wallet private key</td></tr>
                      <tr className="border-b border-neutral-50"><td className="p-2 font-mono">CONTRACT_ADDRESS</td><td className="p-2">—</td><td className="p-2">WindmillExchange address</td></tr>
                      <tr className="border-b border-neutral-50"><td className="p-2 font-mono">KEEPER_INTERVAL_MS</td><td className="p-2">15000</td><td className="p-2">Sweep cycle interval (ms)</td></tr>
                      <tr className="border-b border-neutral-50"><td className="p-2 font-mono">MAX_ACTIONS_PER_CYCLE</td><td className="p-2">25</td><td className="p-2">Max matches per cycle</td></tr>
                      <tr className="border-b border-neutral-50"><td className="p-2 font-mono">DRY_RUN</td><td className="p-2">false</td><td className="p-2">Log-only mode (no txs)</td></tr>
                      <tr><td className="p-2 font-mono">DEPLOY_BLOCK</td><td className="p-2">0</td><td className="p-2">Block to start scanning events from</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'networks' && (
            <div data-reveal className="reveal-fade-up flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold text-black dark:text-white">Supported Networks</h2>
              <p>
                Pre-configured RPC endpoints and deployment targets. Contract addresses are populated after deployment.
              </p>

              <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/80 text-neutral-400 uppercase tracking-wider text-[10px] font-bold">
                      <th className="text-left p-3">Network</th>
                      <th className="text-left p-3">Chain ID</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">RPC</th>
                      <th className="text-left p-3">Contract</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(SUPPORTED_CHAINS).map((chain) => (
                      <tr key={chain.chainId} className="border-t border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50">
                        <td className="p-3 font-semibold text-black dark:text-white">{chain.name}</td>
                        <td className="p-3 font-mono text-neutral-500">{chain.chainId}</td>
                        <td className="p-3 text-neutral-500">{chain.chainId === 11155111 || chain.chainId === 63 ? 'Testnet' : 'Mainnet'}</td>
                        <td className="p-3 text-neutral-400 font-mono text-[10px] max-w-[200px] truncate">{chain.rpcUrl}</td>
                        <td className="p-3">
                          {chain.contractAddress ? (
                            <a
                              href={`${chain.explorerUrl}/address/${chain.contractAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-[10px] text-blue-600 hover:underline"
                            >
                              {chain.contractAddress.slice(0, 8)}...
                            </a>
                          ) : (
                            <span className="text-neutral-400 text-[10px]">Not deployed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
