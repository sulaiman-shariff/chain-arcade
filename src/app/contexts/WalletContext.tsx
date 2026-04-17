'use client';

import { createContext, useContext, ReactNode, useMemo, useState } from 'react';

type AptosProvider = {
  connect: () => Promise<{ address: string }>;
  disconnect: () => Promise<void>;
  account: () => Promise<{ address: string }>;
  signAndSubmitTransaction: (tx: {
    type: 'entry_function_payload';
    function: string;
    type_arguments?: string[];
    arguments: (string | number | boolean)[];
  }) => Promise<{ hash: string }>;
};

type WalletContextType = {
  walletAddress: string | null;
  walletConnected: boolean;
  shortAddress: string | null;
  walletName: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signAndSubmitEntryFunction: (
    func: string,
    args: (string | number | boolean)[]
  ) => Promise<{ hash: string }>;
};

const WalletContext = createContext<WalletContextType | null>(null);

function getProvider(): { name: string; provider: AptosProvider } | null {
  if (typeof window === 'undefined') return null;

  const petra = (window as any).aptos as AptosProvider | undefined;
  if (petra && typeof petra.connect === 'function') {
    return { name: 'Petra', provider: petra };
  }

  const martian = (window as any).martian as AptosProvider | undefined;
  if (martian && typeof martian.connect === 'function') {
    return { name: 'Martian', provider: martian };
  }

  return null;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);

  const connectWallet = async (): Promise<void> => {
    const detected = getProvider();
    if (!detected) {
      throw new Error('Install Petra or Martian Aptos wallet extension.');
    }

    const account = await detected.provider.connect();
    setWalletAddress(account.address);
    setWalletName(detected.name);
  };

  const disconnectWallet = async (): Promise<void> => {
    const detected = getProvider();
    if (!detected) return;
    await detected.provider.disconnect();
    setWalletAddress(null);
    setWalletName(null);
  };

  const signAndSubmitEntryFunction = async (
    func: string,
    args: (string | number | boolean)[]
  ): Promise<{ hash: string }> => {
    const detected = getProvider();
    if (!detected) {
      throw new Error('No Aptos wallet provider found');
    }

    return detected.provider.signAndSubmitTransaction({
      type: 'entry_function_payload',
      function: func,
      arguments: args
    });
  };

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`
    : null;

  const value = useMemo(
    () => ({
      walletAddress,
      walletConnected: Boolean(walletAddress),
      shortAddress,
      walletName,
      connectWallet,
      disconnectWallet,
      signAndSubmitEntryFunction
    }),
    [walletAddress, shortAddress, walletName]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}
