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
        setIsOpen(true);
      }
    } catch {
      // LocalStorage access might fail in private/incognito mode or restricted iframe
      setIsOpen(false);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore storage write error
    }
    setIsOpen(false);
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
            <h3 className="text-lg font-semibold text-white">Terms of Use & Disclaimer</h3>
            <p className="text-xs text-neutral-400">Please read and agree before continuing</p>
          </div>
        </div>

        <div className="text-xs text-neutral-300 space-y-3 leading-relaxed max-h-60 overflow-y-auto pr-2 border-y border-neutral-800/80 py-3 my-4">
          <p>
            Welcome to <strong>Windmill Exchange</strong>. Windmill is a decentralized, non-custodial
            on-chain order matching protocol. Interacting with smart contracts and digital assets
            carries inherent financial and technological risks.
          </p>
          <p>
            By accessing or using this web interface and connecting your Web3 wallet, you confirm that:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-neutral-400">
            <li>You have read, understood, and agree to be bound by the{' '}
              <Link href="/terms" target="_blank" className="text-cyan-400 hover:underline inline-flex items-center gap-0.5">
                Terms of Service <ExternalLink className="h-3 w-3 inline" />
              </Link>{' '}
              and{' '}
              <Link href="/privacy" target="_blank" className="text-cyan-400 hover:underline inline-flex items-center gap-0.5">
                Privacy Policy <ExternalLink className="h-3 w-3 inline" />
              </Link>.
            </li>
            <li>You acknowledge that Windmill Exchange is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind.</li>
            <li>The developers and Stability Nexus disclaim all liability for any loss of funds or damages resulting from smart contract bugs, market volatility, or keeper execution timing.</li>
            <li>You are not a resident of or located in any sanctioned or restricted jurisdiction.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={handleAccept}
            className="w-full flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
          >
            I Agree & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

