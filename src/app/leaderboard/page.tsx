'use client';

import { useEffect } from 'react';
import { useStatisticsTracker } from '@/hooks/useStatisticsTracker';

export default function LeaderboardPage() {
  const { topEarners, mostActive, getTopEarners, getMostActive, loading } = useStatisticsTracker();

  useEffect(() => {
    getTopEarners(10);
    getMostActive(10);
  }, [getTopEarners, getMostActive]);

  return (
    <div className="min-h-screen arcade-bg pt-28 pb-12 px-6">
      <div className="container mx-auto grid lg:grid-cols-2 gap-8">
        <section className="p-6 bg-black/60 border border-cyan-500/40">
          <h1 className="font-arcade text-xl text-cyan-300 mb-4">Top Earners</h1>
          {loading && <p className="text-slate-400">Loading...</p>}
          <ol className="space-y-2 text-sm text-slate-200">
            {topEarners.map((address, i) => (
              <li key={address} className="flex justify-between border-b border-slate-700 pb-2">
                <span>#{i + 1}</span>
                <span>{address}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="p-6 bg-black/60 border border-fuchsia-500/40">
          <h2 className="font-arcade text-xl text-fuchsia-300 mb-4">Most Active</h2>
          <ol className="space-y-2 text-sm text-slate-200">
            {mostActive.map((address, i) => (
              <li key={address} className="flex justify-between border-b border-slate-700 pb-2">
                <span>#{i + 1}</span>
                <span>{address}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
