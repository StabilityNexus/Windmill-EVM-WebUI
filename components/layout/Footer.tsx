import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-400 py-16 border-t border-neutral-800">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/windmill-logo.svg" alt="Windmill" width={32} height={32} className="shrink-0" />
              <span className="font-sans text-lg font-bold tracking-tight text-white">
                WINDMILL
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-neutral-400">
              Next-generation EVM matchmaking protocol. Seamless dynamic pricing, autonomous matching, and instant on-chain settlements.
            </p>
          </div>

          {/* Protocol Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Protocol</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <a href="#features" className="text-sm hover:text-white transition-colors">Features</a>
              </li>
              <li>
                <a href="#how-it-works" className="text-sm hover:text-white transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#stats" className="text-sm hover:text-white transition-colors">Statistics</a>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Developers</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href="https://github.com/StabilityNexus/Windmill-EVM-Contracts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/StabilityNexus/Windmill-EVM-Contracts/tree/main/src"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  Smart Contracts
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/StabilityNexus/Windmill-EVM-Keeper"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  Keeper Network
                </a>
              </li>
            </ul>
          </div>

          {/* Social / Community */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Community</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <a href="https://t.me/StabilityNexus" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">Telegram</a>
              </li>
              <li>
                <a href="https://x.com/StabilityNexus" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">Twitter / X</a>
              </li>
              <li>
                <a href="https://discord.gg/YzDKeEfWtS" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">Discord</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/stability.svg" alt="Stability Nexus" width={24} height={24} className="shrink-0" />
            <p className="text-xs text-neutral-500" suppressHydrationWarning>
              &copy; {new Date().getFullYear()} Stability Nexus. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
