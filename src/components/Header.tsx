'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useWallet } from '@/app/contexts/WalletContext';
import { usePoints } from '@/app/contexts/PointsContext';

export default function Header() {
  const { walletConnected, shortAddress, connectWallet, disconnectWallet } = useWallet();
  const { balance } = usePoints();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full bg-black/70 backdrop-blur-md border-b border-cyan-500/30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-arcade text-cyan-300 tracking-wide">
          chain arcade
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-arcade">
          <Link href="/games" className="text-slate-200 hover:text-cyan-300">GAMES</Link>
          <Link href="/dashboard" className="text-slate-200 hover:text-cyan-300">DASHBOARD</Link>
          <Link href="/leaderboard" className="text-slate-200 hover:text-cyan-300">LEADERBOARD</Link>
          <Link href="/about" className="text-slate-200 hover:text-cyan-300">ARCHITECTURE</Link>
        </nav>

        <div className="flex items-center gap-3">
          {walletConnected ? (
            <>
              <span className="hidden sm:inline text-xs font-arcade text-emerald-300">{balance.toLocaleString()} PTS</span>
              <button
                onClick={disconnectWallet}
                className="px-3 py-2 text-xs font-arcade bg-slate-900 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/40"
              >
                {shortAddress}
              </button>
            </>
          ) : (
            <button
              onClick={connectWallet}
              className="px-3 py-2 text-xs font-arcade bg-cyan-600 text-black hover:bg-cyan-500"
            >
              CONNECT APTOS
            </button>
          )}

          <button onClick={() => setMenuOpen((s) => !s)} className="md:hidden text-slate-100">☰</button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-cyan-500/30 bg-black/95 px-4 py-3 flex flex-col gap-3 text-sm font-arcade">
          <Link href="/games" onClick={() => setMenuOpen(false)} className="text-slate-200">GAMES</Link>
          <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-slate-200">DASHBOARD</Link>
          <Link href="/leaderboard" onClick={() => setMenuOpen(false)} className="text-slate-200">LEADERBOARD</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} className="text-slate-200">ARCHITECTURE</Link>
        </div>
      )}
    </header>
  );
}
