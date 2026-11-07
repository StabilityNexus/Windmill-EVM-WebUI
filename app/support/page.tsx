'use client';

import React from 'react';
import WalletModal from '@/components/wallet/WalletModal';
import FAQContent from '@/components/support/FAQContent';
import SupportForm from '@/components/support/SupportForm';

export default function SupportPage() {
  return (
    <main className="w-full min-h-screen bg-background text-foreground pt-24 transition-colors duration-300">
      {/* Wallet connection modal */}
      <WalletModal />

      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-8">
        <div>
          <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Customer Support Desk</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white mt-2">
            Help & Support
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* FAQ Column */}
          <FAQContent />

          {/* Support Ticket Column */}
          <SupportForm />
        </div>
      </div>
    </main>
  );
}
