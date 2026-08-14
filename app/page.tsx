import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CTASection from '@/components/landing/CTASection';
import HorizontalWords from '@/components/landing/HorizontalWords';
import WalletModal from '@/components/wallet/WalletModal';

export default function Home() {
  return (
    <main className="w-full flex flex-col bg-white text-black min-h-screen">
      <WalletModal />

      <HeroSection />
      <HorizontalWords />
      <FeaturesSection />
      <CTASection />
    </main>
  );
}
