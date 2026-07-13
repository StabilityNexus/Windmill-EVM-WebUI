'use client';

import { STATS } from '@/utils/constants';
import { useScrollRevealChildren } from '@/hooks/useScrollReveal';

export default function StatsSection() {
  const containerRef = useScrollRevealChildren<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section
      id="stats"
      ref={containerRef}
      className="bg-white section-padding border-t border-black/5"
    >
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.filter((stat) => !stat.illustrative).map((stat, idx) => (
            <div
              key={stat.label}
              data-reveal
              style={{ transitionDelay: `${idx * 100}ms` }}
              className="reveal-fade-up flex flex-col gap-2 p-6 bg-neutral-50/30 border border-black/5 rounded-2xl shadow-sm text-center lg:text-left transition-all duration-300 hover:-translate-y-1 hover:border-black/10"
            >
              <span className="text-2xl sm:text-3xl font-extrabold text-black font-sans tracking-tight">
                {stat.value}
              </span>
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
