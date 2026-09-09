'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import {
  Navbar as BaseNavbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  NavbarButton,
} from '@/components/ui/resizable-navbar';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function Navbar() {
  const { isConnected, address, network, setWalletModalOpen, disconnectWallet, switchNetwork } = useWallet();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);

  // The homepage hero carries its own navigation integrated into the
  // central card composition, so the global navbar is suppressed there.
  if (pathname === '/') return null;

  const networks = ['Localhost', 'Sepolia', 'Ethereum', 'Base', 'Polygon', 'BSC', 'ETC'];

  const navItems = [
    { name: 'Home', link: '/' },
    { name: 'Dashboard', link: '/dashboard' },
    { name: 'How It Works', link: '/how-it-works' },
    { name: 'Stats', link: '/stats' },
    { name: 'Keepers', link: '/keepers' },
    { name: 'Support', link: '/support' },
    { name: 'Docs', link: '/docs' },
  ].map((item) => ({
    ...item,
    active:
      item.link === '/'
        ? pathname === '/'
        : pathname === item.link || pathname?.startsWith(`${item.link}/`),
  }));

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center w-full pointer-events-none">
      <BaseNavbar className="w-full max-w-7xl px-4 pointer-events-auto">
        {/* Desktop Navigation using resizable NavBody */}
        <NavBody>
          {/* Logo */}
          <Link href="/" className="relative z-20 flex items-center gap-2 group cursor-pointer shrink-0 justify-self-start">
            <img src="/windmill-logo.svg" alt="Windmill" width={36} height={36} className="shrink-0" />
            <span className="font-sans text-base font-bold tracking-tight text-black dark:text-white">
              WINDMILL
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <NavItems items={navItems} />

          {/* Wallet Actions & Theme Switcher */}
          <div className="relative z-30 flex items-center gap-2.5 shrink-0 justify-self-end pointer-events-auto">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {isConnected ? (
              <div className="flex items-center gap-2">
                {/* Network select indicator */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
                    className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[10px] font-bold hover:bg-neutral-100 transition-colors uppercase tracking-wider text-black dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {network} ▾
                  </button>
                  {networkDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-32 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-2xl z-50 dark:border-neutral-800 dark:bg-neutral-900">
                      {networks.map((net) => (
                        <button
                          key={net}
                          type="button"
                          onClick={() => {
                            switchNetwork(net);
                            setNetworkDropdownOpen(false);
                          }}
                          className="w-full text-left rounded-xl px-3 py-1.5 text-[10px] font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 text-black dark:text-white transition-colors cursor-pointer"
                        >
                          {net}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Connected Wallet Disconnect CTA */}
                <NavbarButton
                  onClick={disconnectWallet}
                  variant="dark"
                  className="rounded-full !px-5 !py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 transition-colors border-none"
                >
                  {address}
                </NavbarButton>
              </div>
            ) : (
              <NavbarButton
                onClick={() => setWalletModalOpen(true)}
                variant="dark"
                className="rounded-full !px-5 !py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 transition-all duration-300 border-none shadow-sm"
              >
                Connect Wallet
              </NavbarButton>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav className="w-full max-w-[calc(100vw-2rem)]">
          <MobileNavHeader className="px-4 py-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img src="/windmill-logo.svg" alt="Windmill" width={32} height={32} className="shrink-0" />
              <span className="font-sans text-base font-bold tracking-tight text-black dark:text-white">
                WINDMILL
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            className="bg-white/95 border border-neutral-100/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl mt-4 dark:bg-neutral-900/95 dark:border-neutral-800/80"
          >
            <div className="flex flex-col gap-4 w-full">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={item.active ? 'page' : undefined}
                  className={`py-1 text-base font-semibold transition-colors duration-200 ${
                    item.active
                      ? 'text-black dark:text-white font-bold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              <div className="h-[1px] bg-neutral-100 dark:bg-neutral-800 my-2" />

              {/* Theme Switcher in Mobile Menu */}
              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Theme</span>
                <ThemeToggle variant="segmented" />
              </div>

              <div className="h-[1px] bg-neutral-100 dark:bg-neutral-800 my-1" />

              {/* Wallet Button */}
              {isConnected ? (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs font-bold text-black dark:text-white border border-neutral-100 dark:border-neutral-800 rounded-xl px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/60">
                    <span>Network</span>
                    <span className="text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{network}</span>
                  </div>
                  <NavbarButton
                    onClick={() => {
                      disconnectWallet();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="dark"
                    className="w-full text-center py-2.5 rounded-xl text-xs"
                  >
                    Disconnect {address}
                  </NavbarButton>
                </div>
              ) : (
                <NavbarButton
                  onClick={() => {
                    setWalletModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  variant="dark"
                  className="w-full text-center py-2.5 rounded-xl text-xs"
                >
                  Connect Wallet
                </NavbarButton>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </BaseNavbar>
    </div>
  );
}
