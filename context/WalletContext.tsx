'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  connectingWallet: string | null;
  address: string | null;
  network: string;
  walletModalOpen: boolean;
  setWalletModalOpen: (open: boolean) => void;
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (net: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState('Ethereum');
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const connectWallet = useCallback(async (walletName: string) => {
    setIsConnecting(true);
    setConnectingWallet(walletName);
    // Simulate dynamic connection delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Generate a mock EVM address
    const randomHex = Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    setAddress(`0x${randomHex.substring(0, 4)}...${randomHex.substring(36)}`);
    setIsConnected(true);
    setIsConnecting(false);
    setConnectingWallet(null);
    setWalletModalOpen(false);
  }, []);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setNetwork('Ethereum');
  }, []);

  const switchNetwork = useCallback((newNetwork: string) => {
    setNetwork(newNetwork);
  }, []);

  return (
    <WalletContext.Provider
      value={useMemo(
        () => ({
          isConnected,
          isConnecting,
          connectingWallet,
          address,
          network,
          walletModalOpen,
          setWalletModalOpen,
          connectWallet,
          disconnectWallet,
          switchNetwork,
        }),
        [isConnected, isConnecting, connectingWallet, address, network, walletModalOpen, connectWallet, disconnectWallet, switchNetwork]
      )}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
