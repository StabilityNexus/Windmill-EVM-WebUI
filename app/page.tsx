import HeroSection from '@/components/landing/HeroSection';
import FeatureCards from '@/components/landing/FeatureCards';
import FloatingProtocolSection from '@/components/landing/FloatingProtocolSection';
import CTASection from '@/components/landing/CTASection';
import WalletModal from '@/components/wallet/WalletModal';

export default function Home() {
  return (
    <main className="w-full flex flex-col bg-background text-foreground min-h-screen transition-colors duration-300">
      {/* Simulated RainbowKit wallet connection modal */}
      <WalletModal />

      <HeroSection />
      <FeatureCards />
      <FloatingProtocolSection />
      <CTASection />
    </main>
  );
}
