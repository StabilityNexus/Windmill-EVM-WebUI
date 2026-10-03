import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Windmill Exchange',
  description: 'Privacy Policy detailing zero PII collection, decentralized RPC interactions, and local storage usage on Windmill Exchange.',
};

export default function PrivacyPage() {
  return (
    <main className="w-full min-h-screen bg-background text-foreground pt-28 pb-20 px-6 md:px-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Data Privacy &amp; Decentralization
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg">
            Windmill Exchange is built on principles of privacy, permissionless access, and zero telemetry tracking.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4 text-neutral-600 dark:text-neutral-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-black dark:text-white">1. Zero Personally Identifiable Information (PII)</h2>
          <p>
            Windmill Exchange does not collect, store, or process any Personally Identifiable Information (PII), such as names, email addresses, physical addresses, IP tracking databases, or phone numbers.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4 text-neutral-600 dark:text-neutral-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-black dark:text-white">2. Blockchain Public Ledger Data</h2>
          <p>
            When you connect your wallet and place or cancel orders, your transaction data (including wallet public address, token amounts, curve slope, and timestamps) is broadcast publicly to the blockchain network.
          </p>
          <p className="text-neutral-500 dark:text-neutral-400">
            Public blockchain transactions are immutable and publicly accessible across all EVM block explorers.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-4 text-neutral-600 dark:text-neutral-300 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-black dark:text-white">3. Local Storage &amp; RPC Endpoints</h2>
          <p>
            The Interface uses browser <code className="text-cyan-600 dark:text-cyan-400 font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">localStorage</code> solely to remember UI preferences, such as selected target network and recent transaction history filter states.
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-500 dark:text-neutral-400 pl-2">
            <li>No tracking cookies or cross-site analytics scripts are used.</li>
            <li>RPC network queries are sent directly from your browser to public RPC provider endpoints.</li>
          </ul>
        </section>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-sm">
          <Link href="/terms" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors">
            &larr; Terms of Service
          </Link>
          <Link href="/terms-of-use" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors">
            Terms of Use &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
