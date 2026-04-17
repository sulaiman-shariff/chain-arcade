import { useState } from 'react';
import { useContracts } from './useContracts';
import { payloads } from '@/lib/aptos/payloads';
import { viewPointsBalance } from '@/lib/aptos/views';

/**
 * Custom hook for interacting with chain arcade points on Aptos
 * Provides functions for converting tokens, checking balances, etc.
 */
export function usePointsManager() {
  const { accountAddress, execute } = useContracts();
  const [balance, setBalance] = useState<number>(0);
  const [conversionRate] = useState<number>(1000);
  const [platformFee] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get user's point balance
   * @param address User account (optional, uses connected wallet if not provided)
   */
  const getBalance = async (address?: string) => {
    const userAddress = address || accountAddress;
    if (!userAddress) return 0;

    setLoading(true);
    setError(null);

    try {
      const nextBalance = await viewPointsBalance(userAddress);
      setBalance(nextBalance);
      return nextBalance;
    } catch (err: any) {
      console.error("Error getting balance:", err);
      setError(err.message || "Failed to get balance");
      return 0;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get platform conversion rate
   */
  const getConversionRate = async () => {
    return conversionRate;
  };

  /**
   * Get platform fee percentage
   */
  const getPlatformFee = async () => {
    return platformFee;
  };

  /**
   * Convert chain arcade token to points
   * @param amount Amount in whole token units
   */
  const convertToPoints = async (amount: string | number) => {
    setLoading(true);
    setError(null);

    try {
      const amountOctas = BigInt(Math.floor(Number(amount) * 100_000_000)).toString();
      await execute(payloads.convertToPoints(amountOctas));
      await getBalance();
      return true;
    } catch (err: any) {
      console.error("Error converting to points:", err);
      setError(err.message || "Failed to convert token to points");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Convert points back to chain arcade token
   * @param amount Amount of points to withdraw
   */
  const withdrawPoints = async (amount: string | number) => {
    setLoading(true);
    setError(null);

    try {
      await execute(payloads.convertToToken(Math.floor(Number(amount))));
      await getBalance();
      return true;
    } catch (err: any) {
      console.error("Error withdrawing points:", err);
      setError(err.message || "Failed to withdraw points");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    balance,
    conversionRate,
    platformFee,
    loading,
    error,
    getBalance,
    getConversionRate,
    getPlatformFee,
    convertToPoints,
    withdrawPoints
  };
}