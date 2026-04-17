'use client';

import Link from 'next/link';
import { useWallet } from '@/app/contexts/WalletContext';

export default function Home() {
  const { walletConnected, connectWallet } = useWallet();

  return (
    <div className="min-h-screen arcade-bg pt-24 pb-14">
      <section className="container mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="font-arcade text-xs text-cyan-300 mb-4">APTOS-NATIVE SKILL GAMING</p>
          <h1 className="font-arcade text-4xl md:text-6xl leading-tight text-white mb-5">
            chain arcade
          </h1>
          <p className="text-slate-300 max-w-2xl mb-7">
            Competitive mini-games with trustless room escrow, deterministic prize distribution,
            and on-chain player stats powered by Move modules.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/games" className="arcade-button-glow-blue">ENTER ROOMS</Link>
            <Link href="/dashboard" className="arcade-button-glow-pink">PLAYER DASHBOARD</Link>
            {!walletConnected && (
              <button onClick={connectWallet} className="arcade-button-green">CONNECT PETRA / MARTIAN</button>
            )}
          </div>
        </div>

        <div className="p-6 bg-black/50 border border-cyan-500/40">
          <h2 className="font-arcade text-lg text-cyan-300 mb-4">System Guarantees</h2>
          <ul className="text-slate-200 space-y-3 text-sm">
            <li>On-chain room escrow with entry-fee accounting in integer points.</li>
            <li>Replay-resistant score submission via nonce + validator signature checks.</li>
            <li>Single-claim enforcement and deterministic commission deduction.</li>
            <li>Event emissions for leaderboard indexing and analytics pipelines.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
