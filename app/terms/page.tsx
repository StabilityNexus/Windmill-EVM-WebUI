import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Windmill Exchange',
  description: 'Terms of Service governing the use of the Windmill Exchange interface and non-custodial decentralized matching protocol.',
};

export default function TermsPage() {
  return (
    <main className="w-full min-h-screen bg-background text-foreground pt-28 pb-20 px-6 md:px-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-700/50 text-purple-700 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider">
            Legal &amp; Compliance
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black dark:text-white">
            Terms of Service
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg">
            Last Updated: August 2026
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4 text-neutral-600 dark:text-neutral-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-black dark:text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Windmill Exchange web interface (the &quot;Interface&quot;) or interacting with the Windmill Exchange protocol smart contracts, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, do not connect your wallet or interact with the protocol.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4 text-neutral-600 dark:text-neutral-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-black dark:text-white">2. Protocol Architecture &amp; Non-Custodial Nature</h2>
          <p>
            Windmill Exchange is a set of open-source, non-custodial smart contracts deployed on EVM-compatible blockchains. The Interface is a web-based user interface designed to interact with these immutable smart contracts.
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-500 dark:text-neutral-400 pl-2">
            <li>Neither Stability Nexus, AOSSIE, nor any contributor controls or holds user funds.</li>
            <li>Users interact directly with smart contracts via their self-hosted Web3 wallets (e.g. MetaMask, Rabby, Coinbase Wallet).</li>
            <li>You are solely responsible for protecting your private keys and seed phrases.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4 text-neutral-600 dark:text-neutral-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-black dark:text-white">3. No Investment Advice or Fiduciary Duty</h2>
          <p>
            All information provided on the Interface, including orderbook views, curve charts, historical prices, and protocol statistics, is for informational purposes only and does not constitute financial, investment, legal, or tax advice.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-4 text-neutral-600 dark:text-neutral-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-black dark:text-white">4. Assumption of Risk &amp; Disclaimer of Liability</h2>
          <p>
            Trading cryptographic assets involves high risks, including market volatility, dynamic curve price changes, smart contract risk, network congestion, and MEV (Maximal Extractable Value) execution.
          </p>
          <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl text-neutral-700 dark:text-neutral-400 text-xs uppercase font-mono">
            IN NO EVENT SHALL STABILITY NEXUS, AOSSIE, OR PROTOCOL DEVELOPERS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF YOUR USE OF THE PROTOCOL OR INTERFACE.
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-4 text-neutral-600 dark:text-neutral-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-black dark:text-white">5. Prohibited Activities &amp; Sanctions Compliance</h2>
          <p>
            You agree not to use the Interface for illegal activities, market manipulation, money laundering, or accessing the service from jurisdictions subject to comprehensive international sanctions.
          </p>
        </section>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-sm">
          <Link href="/terms-of-use" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors">
            &larr; Terms of Use
          </Link>
          <Link href="/privacy" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors">
            Privacy Policy &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
