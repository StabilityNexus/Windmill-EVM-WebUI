'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function CTASection() {
  const containerRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section
      id="cta"
      ref={containerRef}
      className="bg-background text-foreground section-padding border-t border-border relative overflow-hidden"
    >
      {/* Background Decorators */}
      <div className="absolute inset-0 hero-grid-pattern opacity-[0.2] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6 md:px-8 relative z-10">
        <div className="reveal-scale relative rounded-3xl border border-black/10 dark:border-white/10 bg-black dark:bg-neutral-900 px-8 py-14 md:py-20 text-center flex flex-col items-center justify-center overflow-hidden shadow-2xl">
          {/* Radial ambient background light */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,197,23,0.15),transparent_75%)] pointer-events-none" />

          {/* Heading */}
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 max-w-xl leading-tight text-white">
            Ready to experience decentralized matchmaking?
          </h2>

          {/* Subheading */}
          <p className="text-neutral-400 text-xs sm:text-sm max-w-md mb-8 leading-relaxed">
            Deploy dynamic price curves, configure slopes, and let keepers settle your orders at optimal rates on any supported EVM chain.
          </p>

          {/* Interactive CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
            <a
              href="https://github.com/StabilityNexus/Windmill-EVM-Contracts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-full sm:w-auto items-center justify-center rounded-full bg-white dark:bg-[#ffc517] px-8 text-sm font-semibold text-black transition-all duration-300 hover:bg-[#ffc517] dark:hover:bg-white hover:text-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ffc517]/20 active:translate-y-0"
            >
              Launch Platform
            </a>
            <a
              href="https://github.com/StabilityNexus/Windmill-EVM-Contracts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-full sm:w-auto items-center justify-center rounded-full border border-neutral-800 bg-transparent px-8 text-sm font-semibold text-white transition-all duration-300 hover:border-neutral-600 hover:bg-neutral-900 hover:-translate-y-0.5"
            >
              Read Documentation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
