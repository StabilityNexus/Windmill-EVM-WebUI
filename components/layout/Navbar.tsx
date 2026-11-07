'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { Modal } from '@/components/ui/modal';
import { Check, ChevronDown, Copy, LogOut, Wallet as WalletIcon } from 'lucide-react';
import { NetworkIcon } from '@/components/ui/network-icon';

export default function Navbar() {
  const { isConnected, address, fullAddress, network, setWalletModalOpen, disconnectWallet, switchNetwork } = useWallet();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [networkModalOpen, setNetworkModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const networks = ['Localhost', 'Sepolia', 'Ethereum', 'Base', 'Polygon', 'BSC', 'ETC'];

  const handleCopyAddress = async () => {
    if (!fullAddress) return;
    try {
      await navigator.clipboard.writeText(fullAddress);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    } catch {
      // Clipboard access denied — silently ignore
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setAccountModalOpen(false);
  };

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
            <Image src="/windmill-logo.svg" alt="Windmill" width={36} height={36} priority className="shrink-0" />
            <span className="font-sans text-base font-bold tracking-tight text-black dark:text-white">
              WINDMILL
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <NavItems items={navItems} className="mx-auto" />

          {/* Wallet Actions & Theme Switcher */}
          <div className="relative z-30 flex items-center gap-2.5 shrink-0 justify-self-end pointer-events-auto">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {isConnected ? (
              <div className="flex items-center gap-2">
                {/* Network select segment (icon-only, compact) */}
                <button
                  type="button"
                  onClick={() => setNetworkModalOpen(true)}
                  aria-label={`Network: ${network}`}
                  className="relative flex h-10 items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 shadow-sm transition-colors duration-200 cursor-pointer hover:bg-neutral-50 focus:outline-hidden focus:ring-2 focus:ring-black/10 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:ring-white/20"
                >
                  <NetworkIcon name={network} className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-800" />
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                </button>

                {/* Account segment */}
                <button
                  type="button"
                  onClick={() => setAccountModalOpen(true)}
                  className="flex h-10 items-center gap-1 rounded-full border border-neutral-200 bg-white px-3.5 text-xs font-bold text-black shadow-sm transition-colors duration-200 cursor-pointer hover:bg-neutral-50 focus:outline-hidden focus:ring-2 focus:ring-black/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 dark:focus:ring-white/20"
                >
                  {address}
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                </button>
              </div>
            ) : (
              <NavbarButton
                onClick={() => setWalletModalOpen(true)}
                variant="dark"
                className="flex h-10 items-center justify-center rounded-full px-4 text-xs font-bold text-white bg-black hover:bg-neutral-800 border-none shadow-sm focus:outline-hidden focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
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
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
              <Image src="/windmill-logo.svg" alt="Windmill" width={32} height={32} className="shrink-0" />
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
                  <button
                    type="button"
                    onClick={() => {
                      setNetworkModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex justify-between items-center text-xs font-bold text-black dark:text-white border border-neutral-100 dark:border-neutral-800 rounded-xl px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
                  >
                    <span>Network</span>
                    <span className="text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{network}</span>
                  </button>
                  <NavbarButton
                    onClick={() => {
                      setAccountModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    variant="dark"
                    className="w-full text-center py-2.5 rounded-xl text-xs"
                  >
                    {address}
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

      {/* Network Switcher Modal */}
      <Modal open={networkModalOpen} onClose={() => setNetworkModalOpen(false)} title="Switch Network">
        <div className="flex flex-col gap-1.5">
          {networks.map((net) => {
            const isActive = net === network;
            return (
              <button
                key={net}
                type="button"
                onClick={() => {
                  switchNetwork(net);
                  setNetworkModalOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors duration-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 ${
                  isActive
                    ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10'
                    : 'border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-800/40 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <NetworkIcon name={net} className="h-9 w-9" />
                <span className="flex-1 font-semibold text-black dark:text-white">{net}</span>
                {isActive && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Connected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Account Modal */}
      <Modal open={accountModalOpen} onClose={() => setAccountModalOpen(false)} title="Account">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            <WalletIcon className="w-7 h-7" />
          </span>
          <p className="text-base font-bold text-black dark:text-white">{address}</p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{network}</p>

          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCopyAddress}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-800/40 px-4 py-3 text-xs font-semibold text-black dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors duration-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
            >
              {addressCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {addressCopied ? 'Copied!' : 'Copy Address'}
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-800/40 px-4 py-3 text-xs font-semibold text-black dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors duration-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
