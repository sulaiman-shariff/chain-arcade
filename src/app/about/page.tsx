'use client';

export default function AboutPage() {
  return (
    <div className="min-h-screen arcade-bg pt-28 pb-16 px-6">
      <div className="container mx-auto max-w-4xl p-6 bg-black/60 border border-cyan-500/40">
        <h1 className="font-arcade text-2xl text-cyan-300 mb-6">chain arcade Architecture</h1>

        <section className="mb-6">
          <h2 className="font-arcade text-sm text-fuchsia-300 mb-3">Move Modules</h2>
          <ul className="text-slate-200 text-sm space-y-2">
            <li>chain_arcade_token: fungible token mint/burn controls via capabilities.</li>
            <li>chain_arcade_points: integer-safe conversion between token units and game points.</li>
            <li>chain_arcade_rooms: room lifecycle, escrow accounting, deterministic payout logic.</li>
            <li>chain_arcade_stats: on-chain wins/losses/earnings with leaderboard events.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="font-arcade text-sm text-fuchsia-300 mb-3">Anti-Abuse Guarantees</h2>
          <ul className="text-slate-200 text-sm space-y-2">
            <li>Nonce-bound score submissions reject replayed outcomes.</li>
            <li>Validator signature requirement blocks forged result injection.</li>
            <li>Single-claim markers prevent duplicate prize withdrawals.</li>
            <li>All prize payouts run on-chain with commission deduction baked into finalize logic.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-arcade text-sm text-fuchsia-300 mb-3">Extensibility</h2>
          <p className="text-slate-200 text-sm">
            New game types are added by appending enum values and validator logic while reusing the same
            room escrow and settlement primitives.
          </p>
        </section>
      </div>
    </div>
  );
}
