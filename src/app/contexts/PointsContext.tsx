'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePointsManager } from '@/hooks/usePointsManager';
import { useWallet } from './WalletContext';

type PointsContextType = {
  balance: number;
  convertToPoints: (amount: string | number) => Promise<boolean>;
  withdrawPoints: (amount: string | number) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  loading: boolean;
  error: string | null;
  tokenPrice: number;
  isLoadingPrice: boolean;
};

const PointsContext = createContext<PointsContextType | null>(null);

export function PointsProvider({ children }: { children: ReactNode }) {
  const { walletConnected } = useWallet();
  const { 
    balance, 
    convertToPoints, 
    withdrawPoints, 
    getBalance,
    loading, 
    error 
  } = usePointsManager();

  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);

  // Fetch APT price as an approximate market proxy.
  useEffect(() => {
    const fetchTokenPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=aptos&vs_currencies=usd');
        const data = await response.json();
        if (data.aptos && data.aptos.usd) {
          setTokenPrice(data.aptos.usd);
        } else {
          console.error('Unexpected Aptos price format:', data);
        }
        setIsLoadingPrice(false);
      } catch (error) {
        console.error('Error fetching Aptos price:', error);
        setIsLoadingPrice(false);
      }
    };

    fetchTokenPrice();
    // Refresh price every 5 minutes
    const interval = setInterval(fetchTokenPrice, 300000);
    return () => clearInterval(interval);
  }, []);

  // Fetch balance whenever authentication state changes
  useEffect(() => {
    if (walletConnected) {
      getBalance();
    }
  }, [walletConnected, getBalance]);

  // Refresh function that can be called from any component
  const refreshBalance = async () => {
    if (walletConnected) {
      await getBalance();
    }
  };

  const value = {
    balance,
    convertToPoints,
    withdrawPoints,
    refreshBalance,
    loading,
    error,
    tokenPrice,
    isLoadingPrice
  };

  return (
    <PointsContext.Provider value={value}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (context === null) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
}