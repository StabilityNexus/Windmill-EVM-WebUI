'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

export default function Navbar() {
  const { isConnected, address, network, setWalletModalOpen, disconnectWallet, switchNetwork } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);

  const networks = ['Ethereum', 'Sepolia', 'Base', 'Polygon', 'BSC', 'ETC'];

  const navItems = [
    { name: 'Home', link: '/' },
    { name: 'Dashboard', link: '/dashboard' },
    { name: 'How It Works', link: '/how-it-works' },
    { name: 'Stats', link: '/stats' },
    { name: 'Keepers', link: '/keepers' },
    { name: 'Support', link: '/support' },
    { name: 'Docs', link: '/docs' },
  ];

  return (
<div className="fixed top-6 left-0 right-0 z-50 flex justify-center w-full pointer-events-none">
      <BaseNavbar className="w-full max-w-4xl pointer-events-auto">
        {/* Desktop Navigation using resizable NavBody */}
        <NavBody className="glass-pill border border-neutral-100 bg-white/75 shadow-lg min-w-[768px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer mr-6 shrink-0">
            <img src="/windmill-logo.svg" alt="Windmill" width={32} height={32} className="shrink-0" />
            <span className="font-sans text-sm font-bold tracking-tight text-black">
              WINDMILL
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <NavItems items={navItems} />

          {/* Wallet Actions / RainbowKit simulation */}
          <div className="flex items-center gap-3 shrink-0 ml-6">
            {isConnected ? (
              <div className="flex items-center gap-2">
                {/* Network select indicator */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
                    className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[10px] font-bold hover:bg-neutral-100 transition-colors uppercase tracking-wider text-black cursor-pointer"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {network} ▾
                  </button>
                  {networkDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-32 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-2xl z-50">
                      {networks.map((net) => (
                        <button
                          key={net}
                          type="button"
                          onClick={() => {
                            switchNetwork(net);
                            setNetworkDropdownOpen(false);
                          }}
                          className="w-full text-left rounded-xl px-3 py-1.5 text-[10px] font-semibold hover:bg-neutral-50 text-black transition-colors"
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
                  className="rounded-full !px-4 !py-1.5 text-[10px] font-bold text-white bg-black hover:bg-neutral-800 transition-colors border-none"
                >
                  {address}
                </NavbarButton>
              </div>
            ) : (
              <NavbarButton
                onClick={() => setWalletModalOpen(true)}
                variant="dark"
                className="rounded-full !px-4 !py-1.5 text-[10px] font-bold text-white bg-black hover:bg-neutral-800 transition-all duration-300 border-none shadow-sm"
              >
                Connect Wallet
              </NavbarButton>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav className="glass-pill border border-neutral-100 bg-white/75 shadow-lg w-full max-w-[calc(100vw-2rem)]">
          <MobileNavHeader className="px-4 py-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img src="/windmill-logo.svg" alt="Windmill" width={28} height={28} className="shrink-0" />
              <span className="font-sans text-sm font-bold tracking-tight text-black">
                WINDMILL
              </span>
            </Link>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            className="bg-white/95 border border-neutral-100/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl mt-4"
          >
            <div className="flex flex-col gap-4 w-full">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-neutral-600 hover:text-black font-semibold text-sm transition-colors py-1"
                >
                  {item.name}
                </Link>
              ))}

              <div className="h-[1px] bg-neutral-100 my-2" />

              {/* Wallet Button */}
              {isConnected ? (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs font-bold text-black border border-neutral-100 rounded-xl px-4 py-2.5 bg-neutral-50">
                    <span>Network</span>
                    <span className="text-neutral-500 uppercase tracking-wider">{network}</span>
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
