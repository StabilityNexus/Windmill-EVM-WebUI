'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TermsModal from '@/components/layout/TermsModal';

/**
 * Universal layout that renders the global Navbar, Footer, and TermsModal across all pages.
 */
export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <TermsModal />
      {children}
      <Footer />
    </>
  );
}
