import { useCallback, useState } from 'react';
import { useContracts } from './useContracts';
import { viewPlayerStats } from '@/lib/aptos/views';

export function useStatisticsTracker() {
    const { accountAddress, aptosClient } = useContracts();

    const [playerStats, setPlayerStats] = useState<any>(null);
    const [topEarners, setTopEarners] = useState<string[]>([]);
    const [mostActive, setMostActive] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getPlayerStats = useCallback(async (address?: string) => {
        const user = address ?? accountAddress;
        if (!user) return null;

        setLoading(true);
        setError(null);
        try {
            const stats = await viewPlayerStats(user);
            const normalized = {
                gamesPlayed: stats.gamesPlayed,
                gamesWon: stats.wins,
                wins: stats.wins,
                losses: stats.losses,
                totalEarnings: String(stats.totalEarnings),
                pointsWon: stats.totalEarnings,
                winRate: stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0,
                highestScore: 0
            };
            setPlayerStats(normalized);
            return normalized;
        } catch (err: any) {
            setError(err.message || 'Failed to get player stats');
            return null;
        } finally {
            setLoading(false);
        }
    }, [accountAddress]);

    const getTopEarners = useCallback(async (count = 10) => {
        setLoading(true);
        setError(null);
        try {
            const result = await aptosClient.view({
                payload: {
                    function: `${process.env.NEXT_PUBLIC_CHAIN_ARCADE_PACKAGE_ADDRESS ?? '0xabc'}::chain_arcade_stats::top_earners`,
                    functionArguments: [count]
                }
            });
            const addresses = ((result?.[0] as string[]) ?? []).map(String);
            setTopEarners(addresses);
            return addresses;
        } catch (err: any) {
            setError(err.message || 'Failed to get top earners');
            return [];
        } finally {
            setLoading(false);
        }
    }, [aptosClient]);

    const getMostActive = useCallback(async (count = 10) => {
        setLoading(true);
        setError(null);
        try {
            const result = await aptosClient.view({
                payload: {
                    function: `${process.env.NEXT_PUBLIC_CHAIN_ARCADE_PACKAGE_ADDRESS ?? '0xabc'}::chain_arcade_stats::most_active`,
                    functionArguments: [count]
                }
            });
            const addresses = ((result?.[0] as string[]) ?? []).map(String);
            setMostActive(addresses);
            return addresses;
        } catch (err: any) {
            setError(err.message || 'Failed to get most active players');
            return [];
        } finally {
            setLoading(false);
        }
    }, [aptosClient]);

    return {
        playerStats,
        topEarners,
        mostActive,
        loading,
        error,
        getPlayerStats,
        getTopEarners,
        getMostActive
    };
}
