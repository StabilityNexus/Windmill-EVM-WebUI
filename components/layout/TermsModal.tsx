'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, ExternalLink } from 'lucide-react';

const STORAGE_KEY = 'windmill_terms_accepted_v1';

export default function TermsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(STORAGE_KEY);
      if (!accepted) {
        setTimeout(() => setIsOpen(true), 0);
      }
    } catch {
      // LocalStorage access might fail in private/incognito mode or restricted iframe
      // fallback to default false
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore storage write error
    }
    // fallback to default false
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900/95 p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Terms of Use Notice</h2>
            <p className="text-xs text-neutral-400">Please review our terms before proceeding</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-neutral-300 leading-relaxed max-h-60 overflow-y-auto pr-1 border-y border-neutral-800/80 py-3 my-4">
          <p>
            By accessing or using the Windmill EVM Exchange, you agree that you have read, understood, and accept all the terms and conditions outlined in our Terms of Use.
          </p>
          <p>
            Windmill Exchange is a decentralized smart contract platform. Users interact directly with autonomous protocols on the EVM blockchain. You are solely responsible for safeguarding your private keys and assessing financial risks.
          </p>
          <div className="pt-1">
            <Link
              href="/terms-of-use"
              target="_blank"
              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-4"
            >
              Read Full Terms of Use <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={handleAccept}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors cursor-pointer"
          >
            I Acknowledge & Accept
          </button>
        </div>
      </div>
    </div>
  );
}
