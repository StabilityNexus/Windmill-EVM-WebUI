'use client';

import { FEATURES } from '@/utils/constants';
import { useScrollRevealChildren } from '@/hooks/useScrollReveal';

function renderIcon(type: string) {
  switch (type) {
    case 'curve':
      return (
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 15s1-8 4-8 5 12 8 12 4-6 4-6" />
        </svg>
      );
    case 'network':
      return (
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4a3 3 0 100 6 3 3 0 000-6zM4 15a3 3 0 100 6 3 3 0 000-6zM20 15a3 3 0 100 6 3 3 0 000-6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.5 8.5l4 4.5M15.5 8.5l-4 4.5M7 18h10" />
        </svg>
      );
    case 'chain':
      return (
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    case 'fee':
      return (
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function FeaturesSection() {
  const containerRef = useScrollRevealChildren<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section
      id="features"
      ref={containerRef}
      className="bg-white section-padding border-t border-black/5"
    >
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Protocol Features</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight leading-tight">
            Designed for Decentralized Liquidity and Matchmaking
          </p>
        </div>

        {/* Feature Cards Grid with Staggered 3D Reveals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature, idx) => (
            <div
              key={feature.title}
              data-reveal
              style={{ transitionDelay: `${idx * 150}ms` }}
              className="reveal-3d feature-card-white flex flex-col sm:flex-row gap-6 items-start"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-50 border border-neutral-200 shadow-sm transition-transform duration-300 hover:rotate-6">
                {renderIcon(feature.icon)}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <h3 className="text-base font-bold text-black">{feature.title}</h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
