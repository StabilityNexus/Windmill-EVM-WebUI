'use client';

import { STEPS } from '@/utils/constants';
import { useScrollRevealChildren } from '@/hooks/useScrollReveal';

export default function HowItWorksSection() {
  const containerRef = useScrollRevealChildren<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="bg-white section-padding border-t border-black/5"
    >
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 flex flex-col items-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Matching Lifecycle</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight leading-tight">
            How The Protocol Operates
          </p>
        </div>

        {/* Steps Timeline Grid with 3D Flip Reveals */}
        <div className="relative border-l border-black/5 pl-6 md:pl-10 ml-4 md:ml-8 max-w-2xl mx-auto flex flex-col gap-12">
          {/* Vertical timeline line gradient decorator */}
          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-black via-black/10 to-transparent -translate-x-[0.5px]" />

          {STEPS.map((step, idx) => (
            <div
              key={step.number}
              data-reveal
              style={{ transitionDelay: `${idx * 150}ms` }}
              className="reveal-3d-flip relative group flex flex-col gap-2"
            >
              {/* Bullet Node */}
              <div className="absolute -left-[29px] md:-left-[47px] top-1 flex h-4 w-4 md:h-6 md:w-6 items-center justify-center rounded-full bg-white border border-black/15 transition-all duration-300 group-hover:border-black group-hover:scale-110">
                <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-neutral-200 group-hover:bg-black transition-colors" />
              </div>

              {/* Step Info */}
              <span className="text-xs font-mono font-bold text-neutral-400 tracking-wider">
                STEP 0{step.number}
              </span>
              <h3 className="text-lg font-bold text-black group-hover:translate-x-1 transition-transform duration-300">
                {step.title}
              </h3>
              <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed max-w-lg">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
