import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CTASection from '@/components/landing/CTASection';
import WalletModal from '@/components/wallet/WalletModal';

export default function Home() {
  return (
    <main className="w-full flex flex-col bg-background text-foreground min-h-screen">
      {/* Simulated RainbowKit wallet connection modal */}
      <WalletModal />

      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </main>
  );
}
