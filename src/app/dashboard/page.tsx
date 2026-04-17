'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/app/contexts/WalletContext';
import { usePoints } from '@/app/contexts/PointsContext';
import { useStatisticsTracker } from '@/hooks/useStatisticsTracker';

export default function DashboardPage() {
  const { walletConnected, connectWallet } = useWallet();
  const { balance, convertToPoints, withdrawPoints, refreshBalance, loading, tokenPrice } = usePoints();
  const { playerStats, getPlayerStats } = useStatisticsTracker();
  const [tokenAmount, setTokenAmount] = useState('1');
  const [pointsAmount, setPointsAmount] = useState('1000');

  useEffect(() => {
    if (!walletConnected) return;
    refreshBalance();
    getPlayerStats();
  }, [walletConnected, refreshBalance, getPlayerStats]);

  if (!walletConnected) {
    return (
      <div className="min-h-screen arcade-bg pt-28 px-6">
        <div className="max-w-xl mx-auto p-6 bg-black/60 border border-cyan-500/50 text-center">
          <h1 className="font-arcade text-2xl text-white mb-4">Wallet Required</h1>
          <p className="text-slate-300 mb-5">Connect Petra or Martian wallet to manage balances and view stats.</p>
          <button onClick={connectWallet} className="arcade-button-green">CONNECT APTOS WALLET</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen arcade-bg pt-28 pb-12 px-6">
      <div className="container mx-auto grid lg:grid-cols-2 gap-8">
        <section className="p-6 bg-black/60 border border-cyan-500/40">
          <h2 className="font-arcade text-lg text-cyan-300 mb-4">Point Treasury</h2>
          <p className="text-3xl font-arcade text-emerald-300 mb-2">{balance.toLocaleString()} PTS</p>
          <p className="text-sm text-slate-400 mb-6">Market reference (APT): ${tokenPrice.toFixed(2)}</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400">Token -> Points</label>
              <div className="flex gap-2 mt-1">
                <input
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  type="number"
                  className="flex-1 bg-black border border-cyan-500/50 p-2 text-slate-200"
                />
                <button disabled={loading} onClick={() => convertToPoints(tokenAmount)} className="arcade-button-green">
                  CONVERT
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400">Points -> Token</label>
              <div className="flex gap-2 mt-1">
                <input
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                  type="number"
                  className="flex-1 bg-black border border-cyan-500/50 p-2 text-slate-200"
                />
                <button disabled={loading} onClick={() => withdrawPoints(pointsAmount)} className="arcade-button-pink">
                  REDEEM
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="p-6 bg-black/60 border border-fuchsia-500/40">
          <h2 className="font-arcade text-lg text-fuchsia-300 mb-4">On-Chain Player Stats</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <StatCard label="Games Played" value={playerStats?.gamesPlayed ?? 0} />
            <StatCard label="Wins" value={playerStats?.wins ?? 0} />
            <StatCard label="Losses" value={playerStats?.losses ?? 0} />
            <StatCard label="Total Earnings" value={playerStats?.pointsWon ?? 0} suffix=" PTS" />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="p-4 bg-black/40 border border-slate-700">
      <p className="text-slate-400 text-xs mb-2">{label}</p>
      <p className="font-arcade text-cyan-300">{value.toLocaleString()}{suffix}</p>
    </div>
  );
}
