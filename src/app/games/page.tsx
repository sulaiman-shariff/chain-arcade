'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/app/contexts/WalletContext';
import { useGameRoom, GameType, RoomType, RoomStatus } from '@/hooks/useGameRoom';

export default function GamesPage() {
  const { walletConnected, connectWallet } = useWallet();
  const {
    createRoom,
    joinRoom,
    submitScore,
    claimPrize,
    getRoomDetails,
    loading,
    error
  } = useGameRoom();

  const [entryFee, setEntryFee] = useState('100');
  const [maxPlayers, setMaxPlayers] = useState('2');
  const [roomId, setRoomId] = useState('1');
  const [inviteCode, setInviteCode] = useState('');
  const [score, setScore] = useState('0');
  const [activeRoom, setActiveRoom] = useState<any>(null);

  useEffect(() => {
    if (!roomId) return;
    getRoomDetails(Number(roomId)).then(setActiveRoom);
  }, [roomId, getRoomDetails]);

  if (!walletConnected) {
    return (
      <div className="min-h-screen arcade-bg pt-28 px-6">
        <div className="max-w-xl mx-auto p-6 bg-black/60 border border-cyan-500/50 text-center">
          <h1 className="font-arcade text-2xl text-white mb-4">Connect To Play</h1>
          <button onClick={connectWallet} className="arcade-button-green">CONNECT APTOS WALLET</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen arcade-bg pt-28 pb-12 px-6">
      <div className="container mx-auto grid lg:grid-cols-2 gap-8">
        <section className="p-6 bg-black/60 border border-cyan-500/40">
          <h2 className="font-arcade text-lg text-cyan-300 mb-4">Create Room</h2>
          <div className="space-y-3">
            <Input label="Entry Fee (points)" value={entryFee} onChange={setEntryFee} />
            <Input label="Max Players" value={maxPlayers} onChange={setMaxPlayers} />
            <button
              disabled={loading}
              className="arcade-button-glow-blue"
              onClick={async () => {
                const created = await createRoom(
                  entryFee,
                  Number(maxPlayers),
                  GameType.FlappyBird,
                  RoomType.Public,
                  '',
                  3600
                );
                if (created) setRoomId(String(created));
              }}
            >
              CREATE PUBLIC ROOM
            </button>
          </div>
        </section>

        <section className="p-6 bg-black/60 border border-fuchsia-500/40">
          <h2 className="font-arcade text-lg text-fuchsia-300 mb-4">Join / Play / Claim</h2>
          <div className="space-y-3">
            <Input label="Room ID" value={roomId} onChange={setRoomId} />
            <Input label="Invite Code (private rooms)" value={inviteCode} onChange={setInviteCode} />
            <div className="flex gap-2">
              <button
                disabled={loading}
                onClick={() => joinRoom(Number(roomId), inviteCode)}
                className="arcade-button-green"
              >
                JOIN ROOM
              </button>
              <button
                disabled={loading}
                onClick={() => claimPrize(Number(roomId))}
                className="arcade-button-pink"
              >
                CLAIM PRIZE
              </button>
            </div>

            <Input label="Score" value={score} onChange={setScore} />
            <button
              disabled={loading}
              onClick={() => submitScore(Number(roomId), Number(score))}
              className="arcade-button-glow-blue"
            >
              SUBMIT SCORE
            </button>
          </div>

          {error && <p className="text-sm text-rose-400 mt-4">{error}</p>}
        </section>
      </div>

      {activeRoom && (
        <div className="container mx-auto mt-8 p-6 bg-black/60 border border-emerald-500/30">
          <h3 className="font-arcade text-emerald-300 mb-3">Room State</h3>
          <p className="text-sm text-slate-300">Creator: {activeRoom.creator}</p>
          <p className="text-sm text-slate-300">Players: {activeRoom.currentPlayers}/{activeRoom.maxPlayers}</p>
          <p className="text-sm text-slate-300">Prize Pool: {activeRoom.prizePool} PTS</p>
          <p className="text-sm text-slate-300">Status: {statusLabel(activeRoom.status)}</p>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-slate-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-black border border-cyan-500/50 p-2 text-slate-200"
      />
    </div>
  );
}

function statusLabel(value: number) {
  const entries = Object.entries(RoomStatus);
  const found = entries.find(([, v]) => v === value);
  return found?.[0] ?? String(value);
}
