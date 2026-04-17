'use client';

import { PointsProvider } from './contexts/PointsContext';
import { WalletProvider } from './contexts/WalletContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <PointsProvider>
        {children}
      </PointsProvider>
    </WalletProvider>
  );
}