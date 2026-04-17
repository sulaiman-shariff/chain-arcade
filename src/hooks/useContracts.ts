import { useWallet } from '@/app/contexts/WalletContext';
import { aptosClient } from '@/lib/aptos/client';

type EntryPayload = {
  function: string;
  functionArguments: (string | number | boolean)[];
};

export function useContracts() {
  const { walletAddress, walletConnected, signAndSubmitEntryFunction } = useWallet();

  const execute = async (payload: EntryPayload): Promise<string> => {
    if (!walletConnected || !walletAddress) {
      throw new Error('Connect an Aptos wallet first.');
    }

    const tx = await signAndSubmitEntryFunction(payload.function, payload.functionArguments);

    const hash = tx.hash;
    await aptosClient.waitForTransaction({ transactionHash: hash });
    return hash;
  };

  return {
    aptosClient,
    connected: walletConnected,
    accountAddress: walletAddress,
    execute
  };
}