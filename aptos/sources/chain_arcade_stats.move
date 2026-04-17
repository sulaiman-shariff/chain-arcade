module chain_arcade::chain_arcade_stats {
    use std::table;
    use aptos_framework::event;

    struct PlayerStat has copy, drop, store {
        games_played: u64,
        wins: u64,
        losses: u64,
        total_earnings_points: u64
    }

    #[event]
    struct StatsUpdatedEvent has drop, store {
        player: address,
        games_played: u64,
        wins: u64,
        losses: u64,
        total_earnings_points: u64
    }

    struct StatsStore has key {
        stats: table::Table<address, PlayerStat>,
        events: event::EventHandle<StatsUpdatedEvent>
    }

    public entry fun initialize(admin: &signer) {
        move_to(admin, StatsStore {
            stats: table::new<address, PlayerStat>(),
            events: account::new_event_handle<StatsUpdatedEvent>(admin)
        });
    }

    public fun record_game_result(player: address, won: bool, earning_points: u64) acquires StatsStore {
        let store = borrow_global_mut<StatsStore>(@chain_arcade);
        let next = if (table::contains(&store.stats, player)) {
            let s = *table::borrow(&store.stats, player);
            PlayerStat {
                games_played: s.games_played + 1,
                wins: if (won) s.wins + 1 else s.wins,
                losses: if (won) s.losses else s.losses + 1,
                total_earnings_points: s.total_earnings_points + earning_points
            }
        } else {
            PlayerStat {
                games_played: 1,
                wins: if (won) 1 else 0,
                losses: if (won) 0 else 1,
                total_earnings_points: earning_points
            }
        };

        table::upsert(&mut store.stats, player, next);
        event::emit_event(&mut store.events, StatsUpdatedEvent {
            player,
            games_played: next.games_played,
            wins: next.wins,
            losses: next.losses,
            total_earnings_points: next.total_earnings_points
        });
    }

    public fun get_player_stats(player: address): PlayerStat acquires StatsStore {
        let store = borrow_global<StatsStore>(@chain_arcade);
        if (!table::contains(&store.stats, player)) {
            PlayerStat { games_played: 0, wins: 0, losses: 0, total_earnings_points: 0 }
        } else {
            *table::borrow(&store.stats, player)
        }
    }

    // Placeholders for off-chain indexer powered views.
    public fun top_earners(_count: u64): vector<address> {
        vector[]
    }

    public fun most_active(_count: u64): vector<address> {
        vector[]
    }
}
