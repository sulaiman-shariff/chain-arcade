import { CHAIN_ARCADE_MODULES } from "@/constants/contracts";
import { aptosClient } from "@/lib/aptos/client";
import { PlayerStats, RoomView } from "@/lib/aptos/types";

function safeNumber(value: unknown): number {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value);
    if (typeof value === "bigint") return Number(value);
    return 0;
}

export async function viewPointsBalance(address: string): Promise<number> {
    const result = await aptosClient.view({
        payload: {
            function: `${CHAIN_ARCADE_MODULES.points}::get_points_balance`,
            functionArguments: [address]
        }
    });

    return safeNumber(result[0]);
}

export async function viewRoom(roomId: number): Promise<RoomView | null> {
    const result = await aptosClient.view({
        payload: {
            function: `${CHAIN_ARCADE_MODULES.rooms}::get_room`,
            functionArguments: [roomId]
        }
    });

    if (!Array.isArray(result) || !result[0] || typeof result[0] !== "object") {
        return null;
    }

    const room = result[0] as Record<string, unknown>;
    return {
        roomId,
        creator: String(room.creator ?? ""),
        gameType: safeNumber(room.game_type),
        roomType: safeNumber(room.room_type),
        entryFee: safeNumber(room.entry_fee_points),
        maxPlayers: safeNumber(room.max_players),
        currentPlayers: safeNumber(room.current_players),
        prizePool: safeNumber(room.prize_pool_points),
        status: safeNumber(room.status),
        winner: String(room.winner ?? ""),
        inviteHash: String(room.invite_hash ?? "")
    };
}

export async function viewPlayerStats(address: string): Promise<PlayerStats> {
    const result = await aptosClient.view({
        payload: {
            function: `${CHAIN_ARCADE_MODULES.stats}::get_player_stats`,
            functionArguments: [address]
        }
    });

    const stats = (result?.[0] as Record<string, unknown>) ?? {};
    return {
        gamesPlayed: safeNumber(stats.games_played),
        wins: safeNumber(stats.wins),
        losses: safeNumber(stats.losses),
        totalEarnings: safeNumber(stats.total_earnings_points)
    };
}
