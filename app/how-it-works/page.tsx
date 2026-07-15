import HowItWorksSection from '@/components/landing/HowItWorksSection';
import WalletModal from '@/components/wallet/WalletModal';

export default function HowItWorksPage() {
  return (
    <main className="w-full min-h-screen bg-white text-black pt-24">
      {/* Wallet connection modal */}
      <WalletModal />
      
      <div className="py-12">
        <HowItWorksSection />
      </div>
    </main>
  );
}
