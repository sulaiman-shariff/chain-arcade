import { useCallback, useState } from 'react';
import { useContracts } from './useContracts';
import { payloads } from '@/lib/aptos/payloads';
import { viewRoom } from '@/lib/aptos/views';
import { RoomView } from '@/lib/aptos/types';
import { GameType, RoomType, RoomStatus } from '@/constants/contracts';

export { GameType, RoomType, RoomStatus };

type PlayerEntry = {
    playerAddress: string;
    hasSubmittedScore: boolean;
    score: number;
};

export function useGameRoom() {
    const { execute, aptosClient, accountAddress } = useContracts();

    const [userRooms, setUserRooms] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createRoom = async (
        entryFee: string | number,
        maxPlayers: number,
        gameType: number,
        roomType: number,
        inviteCode = '',
        expirationTime = 3600
    ) => {
        setLoading(true);
        setError(null);

        try {
            const hash = await execute(
                payloads.createRoom({
                    gameType,
                    roomType,
                    entryFee: Math.floor(Number(entryFee)),
                    maxPlayers,
                    inviteHash: inviteCode,
                    expirationSeconds: expirationTime
                })
            );

            const tx = await aptosClient.getTransactionByHash({ transactionHash: hash });
            const roomId = Number(
                (tx as any)?.events?.find((e: any) => String(e.type).includes('RoomCreatedEvent'))?.data?.room_id ?? 0
            );

            if (roomId > 0) {
                setUserRooms((prev) => Array.from(new Set([...prev, roomId])));
            }

            return roomId || null;
        } catch (err: any) {
            setError(err.message || 'Failed to create room');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const joinRoom = async (roomId: number, inviteCode = '') => {
        setLoading(true);
        setError(null);

        try {
            const hash = await execute(payloads.joinRoom(roomId, inviteCode));
            setUserRooms((prev) => Array.from(new Set([...prev, roomId])));
            return { success: true, hash };
        } catch (err: any) {
            const message = err.message || 'Failed to join room';
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const submitScore = async (roomId: number, score: number) => {
        setLoading(true);
        setError(null);

        try {
            const matchDigest = `${accountAddress ?? 'unknown'}:${roomId}:${score}`;
            const proofResponse = await fetch('/api/game/result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: accountAddress,
                    roomId,
                    gameType: 0,
                    score,
                    matchDigest
                })
            });

            if (!proofResponse.ok) {
                throw new Error('Result validation failed before on-chain submission');
            }

            const { nonce, validatorSignature } = await proofResponse.json();
            const hash = await execute(payloads.submitScore(roomId, score, nonce, validatorSignature));
            return { success: true, hash };
        } catch (err: any) {
            const message = err.message || 'Failed to submit score';
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const claimPrize = async (roomId: number) => {
        setLoading(true);
        setError(null);

        try {
            const hash = await execute(payloads.claimPrize(roomId));
            return { success: true, hash };
        } catch (err: any) {
            const message = err.message || 'Failed to claim prize';
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const getRoomDetails = useCallback(async (roomId: number): Promise<RoomView | null> => {
        try {
            return await viewRoom(roomId);
        } catch {
            return null;
        }
    }, []);

    const getPlayersInRoom = useCallback(async (roomId: number): Promise<PlayerEntry[]> => {
        try {
            const result = await aptosClient.view({
                payload: {
                    function: `${process.env.NEXT_PUBLIC_CHAIN_ARCADE_PACKAGE_ADDRESS ?? '0xabc'}::chain_arcade_rooms::get_room_players`,
                    functionArguments: [roomId]
                }
            });

            const players = (result?.[0] as any[]) ?? [];
            return players.map((p: any) => ({
                playerAddress: String(p.player ?? ''),
                hasSubmittedScore: Boolean(p.submitted),
                score: Number(p.score ?? 0)
            }));
        } catch {
            return [];
        }
    }, [aptosClient]);

    const getUserRooms = useCallback(async (address?: string) => {
        const user = address ?? accountAddress;
        if (!user) return [];

        try {
            const result = await aptosClient.view({
                payload: {
                    function: `${process.env.NEXT_PUBLIC_CHAIN_ARCADE_PACKAGE_ADDRESS ?? '0xabc'}::chain_arcade_rooms::get_user_rooms`,
                    functionArguments: [user]
                }
            });

            const rooms = ((result?.[0] as (string | number)[]) ?? []).map((x) => Number(x));
            setUserRooms(rooms);
            return rooms;
        } catch {
            return [];
        }
    }, [accountAddress, aptosClient]);

    return {
        userRooms,
        loading,
        error,
        createRoom,
        joinRoom,
        submitScore,
        claimPrize,
        getRoomDetails,
        getPlayersInRoom,
        getUserRooms
    };
}
