import WalletModal from '@/components/wallet/WalletModal';

export default function DocsPage() {
  return (
    <main className="w-full min-h-screen bg-white text-black pt-24">
      {/* Wallet connection modal */}
      <WalletModal />

      <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-8">
        <div>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Developer Reference</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-black mt-2">
            Documentation
          </h1>
        </div>

        <div className="flex flex-col gap-6 text-sm text-neutral-500 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-black mb-2">Price Curve Mechanics</h2>
            <p>
              Each order is characterized by a starting price <code>startPrice</code> and a <code>slope</code> representing the change in price per second. Prices are represented in <strong>RAY</strong> (1e27) units for high precision arithmetic:
            </p>
            <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-xl font-mono text-xs text-black my-3">
              price(t) = startPrice + slope * (t - createdAt)
            </div>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 mt-2">
              <li><strong>Buy Orders</strong>: Slope is typically negative (willingness to pay decreases).</li>
              <li><strong>Sell Orders</strong>: Slope is typically positive (asking price increases).</li>
            </ul>
          </section>

          <hr className="border-neutral-100" />

          <section>
            <h2 className="text-lg font-bold text-black mb-2">Settlement & Solver Reward</h2>
            <p>
              When a match is settled, a flat <strong>0.1% keeper fee</strong> is calculated based on the executed quantity. This fee is automatically transferred to the solver address (<code>msg.sender</code>) to cover gas overheads and incentivize block sweeps.
            </p>
          </section>

          <hr className="border-neutral-100" />

          <section>
            <h2 className="text-lg font-bold text-black mb-2">Supported Chain Deployment</h2>
            <p>
              Deploy and interact with the protocol contracts using Foundry script utilities:
            </p>
            <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-xl font-mono text-xs text-black my-3 overflow-x-auto whitespace-pre">
{`# Deploy to Sepolia
forge script script/Deploy.s.sol \\
  --rpc-url sepolia \\
  --broadcast \\
  --verify \\
  -vvvv`}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
