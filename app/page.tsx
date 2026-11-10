import HeroSection from '@/components/landing/HeroSection';
import InteractiveCurveSimulator from '@/components/landing/InteractiveCurveSimulator';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import StatsSection from '@/components/landing/StatsSection';
import CTASection from '@/components/landing/CTASection';
import WalletModal from '@/components/wallet/WalletModal';
import Reveal from '@/components/reveal';

const REVEAL_DEMOS = [
  {
    label: 'Fade Up',
    direction: 'fade-up',
    copy: 'Rises into view with a short upward travel.',
  },
  {
    label: 'Fade Down',
    direction: 'fade-down',
    copy: 'Settles down from above as the section enters.',
  },
  {
    label: 'Fade Left',
    direction: 'fade-left',
    copy: 'Slides in from the left on first view.',
  },
  {
    label: 'Fade Right',
    direction: 'fade-right',
    copy: 'Slides in from the right on first view.',
  },
] as const;

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-background text-foreground transition-colors duration-300">
      <WalletModal />
      {/* Hero Section with Live Curve Preview */}
      <HeroSection />

      {/* Interactive Mathematical Curve Simulator */}
      <InteractiveCurveSimulator />

      {/* Protocol Features Section */}
      <FeaturesSection />

      {/* Order Matching Lifecycle Section */}
      <HowItWorksSection />

      {/* Scroll Reveal Demo */}
      <section
        id="scroll-reveal"
        className="bg-neutral-50 dark:bg-[#0a0a0a] text-foreground section-padding border-t border-black/5 dark:border-white/10 transition-colors duration-300"
      >
        <div className="mx-auto max-w-4xl px-6 md:px-8">
          <Reveal direction="fade-up">
            <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
                Scroll Reveal
              </h2>
              <p className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight leading-tight">
                Motion that follows the scroll
              </p>
              <p className="mt-4 text-sm sm:text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">
                A reusable Reveal component powered by Intersection Observer and Framer Motion. Direction,
                delay, duration, and child stagger are configurable.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {REVEAL_DEMOS.map((demo) => (
              <Reveal key={demo.label} direction={demo.direction}>
                <div className="feature-card-white h-full">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
                    {demo.label}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {demo.copy}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal
            direction="fade-up"
            stagger={0.12}
            className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {['Staggered child one', 'Staggered child two', 'Staggered child three'].map((label) => (
              <div
                key={label}
                className="feature-card-white h-full text-sm font-semibold text-black dark:text-white"
              >
                {label}
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Key Protocol Statistics */}
      <StatsSection />

      {/* Platform & Keeper CTAs */}
      <CTASection />
    </main>
  );
}
