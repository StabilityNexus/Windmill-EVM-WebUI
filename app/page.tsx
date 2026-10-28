import HeroSection from '@/components/landing/HeroSection';
import InteractiveCurveSimulator from '@/components/landing/InteractiveCurveSimulator';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import StatsSection from '@/components/landing/StatsSection';
import CTASection from '@/components/landing/CTASection';
import WalletModal from '@/components/wallet/WalletModal';

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

      {/* Key Protocol Statistics */}
      <StatsSection />

      {/* Platform & Keeper CTAs */}
      <CTASection />
    </main>
  );
}
