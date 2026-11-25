'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SUPPORTED_CHAINS, DEFAULT_CHAIN_ID } from '@/lib/contractConfig';

// ─── EIP-1193 Provider interface ────────────────────────────────────
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// ─── Context Type ───────────────────────────────────────────────────
interface WalletContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectingWallet: string | null;
  address: string | null;
  fullAddress: string | null;
  chainId: number | null;
  network: string;
  walletModalOpen: boolean;
  hasWallet: boolean;
  walletError: string | null;

  // Actions
  setWalletModalOpen: (open: boolean) => void;
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: () => void;
  clearWalletError: () => void;
  switchNetwork: (networkName: string) => void;
  switchChain: (chainId: number) => Promise<void>;

  // Web3 provider
  provider: EthereumProvider | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// ── Helpers ─────────────────────────────────────────────────────────
function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function chainIdToNetworkName(chainId: number): string {
  const chain = SUPPORTED_CHAINS[chainId];
  return chain?.shortName || `Chain ${chainId}`;
}

function networkNameToChainId(name: string): number {
  const entry = Object.values(SUPPORTED_CHAINS).find(
    (c) => c.shortName.toLowerCase() === name.toLowerCase() || c.name.toLowerCase() === name.toLowerCase()
  );
  return entry?.chainId ?? DEFAULT_CHAIN_ID;
}

function getWalletErrorMessage(err: unknown): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? (err as { code?: number }).code
      : undefined;

  if (code === -32002) {
    return 'A connection request is already pending. Check your wallet extension and approve or dismiss the existing prompt.';
  }
  if (code === 4001) {
    return 'Connection rejected. Approve the request in your wallet to connect.';
  }
  return 'Connection failed. Please try again.';
}

// ─── Provider Component ─────────────────────────────────────────────
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [fullAddress, setFullAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const address = fullAddress ? shortenAddress(fullAddress) : null;
  const network = chainId ? chainIdToNetworkName(chainId) : 'Ethereum';

  // ── Check for injected wallet on mount ────────────────────────────
  useEffect(() => {
    const checkWallet = async () => {
      const eth = window.ethereum;
      if (!eth) {
        setHasWallet(false);
        return;
      }
      setHasWallet(true);

      // Check if already connected (persisted session)
      try {
        const accounts = (await eth.request({ method: 'eth_accounts' })) as string[];
        if (accounts.length > 0) {
          setFullAddress(accounts[0]);
          setIsConnected(true);

          const chainHex = (await eth.request({ method: 'eth_chainId' })) as string;
          setChainId(parseInt(chainHex, 16));
        }
      } catch {
        // Silently fail — user hasn't connected yet
      }
    };

    // Delay slightly to let window.ethereum inject
    const timeout = setTimeout(checkWallet, 100);
    return () => clearTimeout(timeout);
  }, []);

  // ── Listen for account/chain changes ──────────────────────────────
  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accts = accounts as string[];
      if (accts.length === 0) {
        setIsConnected(false);
        setFullAddress(null);
        setChainId(null);
      } else {
        setFullAddress(accts[0]);
        setIsConnected(true);
      }
    };

    const handleChainChanged = (newChainId: unknown) => {
      const id = parseInt(newChainId as string, 16);
      setChainId(id);
    };

    eth.on('accountsChanged', handleAccountsChanged);
    eth.on('chainChanged', handleChainChanged);

    return () => {
      eth.removeListener('accountsChanged', handleAccountsChanged);
      eth.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  // ── Connect Wallet ────────────────────────────────────────────────
  const connectWallet = useCallback(async (walletName: string) => {
    const eth = typeof window !== 'undefined' ? window.ethereum : undefined;

    setWalletError(null);

    if (!eth) {
      setWalletError(
        'No Web3 provider found. Please install a Web3 wallet extension (such as MetaMask, Rabby, or Coinbase Wallet) to connect.'
      );
      setIsConnecting(false);
      setConnectingWallet(null);
      return;
    }

    setIsConnecting(true);
    setConnectingWallet(walletName);

    try {
      const accounts = (await eth.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (accounts.length > 0) {
        setFullAddress(accounts[0]);
        setIsConnected(true);

        const chainHex = (await eth.request({ method: 'eth_chainId' })) as string;
        setChainId(parseInt(chainHex, 16));
      }

      setWalletModalOpen(false);
    } catch (err) {
      setWalletError(getWalletErrorMessage(err));
    } finally {
      setIsConnecting(false);
      setConnectingWallet(null);
    }
  }, []);

  const clearWalletError = useCallback(() => {
    setWalletError(null);
  }, []);

  // ── Disconnect ────────────────────────────────────────────────────
  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setFullAddress(null);
    setChainId(null);
  }, []);

  // ── Switch Network (by name — for navbar dropdown) ────────────────
  const switchNetwork = useCallback(
    (newNetwork: string) => {
      const targetChainId = networkNameToChainId(newNetwork);
      switchChainInternal(targetChainId);
    },
    []
  );

  // ── Switch Chain (by chainId) ─────────────────────────────────────
  const switchChainInternal = async (targetChainId: number) => {
    const eth = window.ethereum;
    if (!eth) {
      setChainId(targetChainId);
      return;
    }

    const hexChainId = `0x${targetChainId.toString(16)}`;

    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
      setChainId(targetChainId);
    } catch (switchError: unknown) {
      const err = switchError as { code?: number };
      // Chain not added — try adding it
      if (err.code === 4902) {
        const chain = SUPPORTED_CHAINS[targetChainId];
        if (chain) {
          try {
            await eth.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: hexChainId,
                  chainName: chain.name,
                  rpcUrls: [chain.rpcUrl],
                  blockExplorerUrls: [chain.explorerUrl],
                  nativeCurrency: chain.nativeCurrency,
                },
              ],
            });
            setChainId(targetChainId);
          } catch (addError) {
            console.error('Failed to add chain:', addError);
          }
        }
      } else {
        console.error('Failed to switch chain:', switchError);
      }
    }
  };

  const switchChain = useCallback(async (targetChainId: number) => {
    await switchChainInternal(targetChainId);
  }, []);

  // ── Context Value ─────────────────────────────────────────────────
  return (
    <WalletContext.Provider
      value={useMemo(
        () => ({
          isConnected,
          isConnecting,
          connectingWallet,
          address,
          fullAddress,
          chainId,
          network,
          walletModalOpen,
          hasWallet,
          walletError,
          setWalletModalOpen,
          connectWallet,
          disconnectWallet,
          clearWalletError,
          switchNetwork,
          switchChain,
          provider: typeof window !== 'undefined' ? window.ethereum ?? null : null,
        }),
        [
          isConnected,
          isConnecting,
          connectingWallet,
          address,
          fullAddress,
          chainId,
          network,
          walletModalOpen,
          hasWallet,
          walletError,
          connectWallet,
          disconnectWallet,
          clearWalletError,
          switchNetwork,
          switchChain,
        ]
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
