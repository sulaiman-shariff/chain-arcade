module chain_arcade::chain_arcade_rooms {
    use std::signer;
    use std::vector;
    use std::table;
    use aptos_framework::event;
    use chain_arcade::chain_arcade_points;
    use chain_arcade::chain_arcade_stats;

    const E_ROOM_NOT_FOUND: u64 = 100;
    const E_NOT_PLAYER: u64 = 101;
    const E_ALREADY_SUBMITTED: u64 = 102;
    const E_NOT_FINALIZABLE: u64 = 103;
    const E_ALREADY_CLAIMED: u64 = 104;

    const STATUS_FILLING: u8 = 0;
    const STATUS_ACTIVE: u8 = 1;
    const STATUS_COMPLETED: u8 = 2;
    const STATUS_EXPIRED: u8 = 3;
    const STATUS_CANCELED: u8 = 4;

    const COMMISSION_BPS_DENOM: u64 = 10_000;

    struct PlayerSeat has copy, drop, store {
        player: address,
        score: u64,
        submitted: bool,
        claimed: bool
    }

    struct Room has copy, drop, store {
        room_id: u64,
        creator: address,
        game_type: u8,
        room_type: u8,
        entry_fee_points: u64,
        max_players: u64,
        current_players: u64,
        prize_pool_points: u64,
        status: u8,
        winner: address,
        invite_hash: vector<u8>,
        expiration_seconds: u64,
        players: vector<PlayerSeat>
    }

    #[event]
    struct RoomCreatedEvent has drop, store {
        room_id: u64,
        creator: address,
        game_type: u8,
        room_type: u8,
        entry_fee_points: u64,
        max_players: u64
    }

    #[event]
    struct RoomFinalizedEvent has drop, store {
        room_id: u64,
        winner: address,
        gross_prize_points: u64,
        commission_points: u64,
        net_prize_points: u64
    }

    struct RoomStore has key {
        rooms: table::Table<u64, Room>,
        user_rooms: table::Table<address, vector<u64>>,
        used_nonces: table::Table<vector<u8>, bool>,
        next_room_id: u64,
        commission_bps: u64,
        created_events: event::EventHandle<RoomCreatedEvent>,
        finalized_events: event::EventHandle<RoomFinalizedEvent>
    }

    public entry fun initialize(admin: &signer, commission_bps: u64) {
        move_to(admin, RoomStore {
            rooms: table::new<u64, Room>(),
            user_rooms: table::new<address, vector<u64>>(),
            used_nonces: table::new<vector<u8>, bool>(),
            next_room_id: 1,
            commission_bps,
            created_events: account::new_event_handle<RoomCreatedEvent>(admin),
            finalized_events: account::new_event_handle<RoomFinalizedEvent>(admin)
        });
    }

    public entry fun create_room(
        creator: &signer,
        game_type: u8,
        room_type: u8,
        entry_fee_points: u64,
        max_players: u64,
        invite_hash: vector<u8>,
        expiration_seconds: u64
    ) acquires RoomStore {
        let store = borrow_global_mut<RoomStore>(@chain_arcade);
        let room_id = store.next_room_id;
        store.next_room_id = room_id + 1;

        chain_arcade_points::debit_points(signer::address_of(creator), entry_fee_points);

        let players = vector[PlayerSeat {
            player: signer::address_of(creator),
            score: 0,
            submitted: false,
            claimed: false
        }];

        let room = Room {
            room_id,
            creator: signer::address_of(creator),
            game_type,
            room_type,
            entry_fee_points,
            max_players,
            current_players: 1,
            prize_pool_points: entry_fee_points,
            status: STATUS_FILLING,
            winner: @0x0,
            invite_hash,
            expiration_seconds,
            players
        };

        table::add(&mut store.rooms, room_id, room);
        push_user_room(&mut store.user_rooms, signer::address_of(creator), room_id);

        event::emit_event(&mut store.created_events, RoomCreatedEvent {
            room_id,
            creator: signer::address_of(creator),
            game_type,
            room_type,
            entry_fee_points,
            max_players
        });
    }

    public entry fun join_room(player: &signer, room_id: u64, _invite_code: vector<u8>) acquires RoomStore {
        let store = borrow_global_mut<RoomStore>(@chain_arcade);
        assert!(table::contains(&store.rooms, room_id), E_ROOM_NOT_FOUND);
        let room = table::borrow_mut(&mut store.rooms, room_id);

        chain_arcade_points::debit_points(signer::address_of(player), room.entry_fee_points);
        room.prize_pool_points = room.prize_pool_points + room.entry_fee_points;
        room.current_players = room.current_players + 1;
        vector::push_back(&mut room.players, PlayerSeat {
            player: signer::address_of(player),
            score: 0,
            submitted: false,
            claimed: false
        });

        if (room.current_players == room.max_players) {
            room.status = STATUS_ACTIVE;
        };

        push_user_room(&mut store.user_rooms, signer::address_of(player), room_id);
    }

    public entry fun submit_score(
        player: &signer,
        room_id: u64,
        score: u64,
        nonce: vector<u8>,
        validator_sig: vector<u8>
    ) acquires RoomStore {
        let store = borrow_global_mut<RoomStore>(@chain_arcade);
        assert!(table::contains(&store.rooms, room_id), E_ROOM_NOT_FOUND);
        assert!(!table::contains(&store.used_nonces, nonce), E_ALREADY_SUBMITTED);
        assert!(vector::length(&validator_sig) > 0, E_NOT_PLAYER);

        let room = table::borrow_mut(&mut store.rooms, room_id);
        let i = find_player_index(&room.players, signer::address_of(player));
        assert!(i < vector::length(&room.players), E_NOT_PLAYER);

        let seat = vector::borrow_mut(&mut room.players, i);
        assert!(!seat.submitted, E_ALREADY_SUBMITTED);
        seat.score = score;
        seat.submitted = true;

        table::add(&mut store.used_nonces, nonce, true);
    }

    public entry fun finalize_room(_caller: &signer, room_id: u64) acquires RoomStore {
        let store = borrow_global_mut<RoomStore>(@chain_arcade);
        assert!(table::contains(&store.rooms, room_id), E_ROOM_NOT_FOUND);

        let room = table::borrow_mut(&mut store.rooms, room_id);
        assert!(room.status == STATUS_ACTIVE, E_NOT_FINALIZABLE);
        assert!(all_submitted(&room.players), E_NOT_FINALIZABLE);

        let winner_idx = find_winner(&room.players);
        let winner = vector::borrow(&room.players, winner_idx).player;
        let commission = room.prize_pool_points * store.commission_bps / COMMISSION_BPS_DENOM;
        let net_prize = room.prize_pool_points - commission;

        room.winner = winner;
        room.status = STATUS_COMPLETED;

        chain_arcade_points::credit_points(winner, net_prize);
        chain_arcade_stats::record_game_result(winner, true, net_prize);
        record_losers(&room.players, winner);

        event::emit_event(&mut store.finalized_events, RoomFinalizedEvent {
            room_id,
            winner,
            gross_prize_points: room.prize_pool_points,
            commission_points: commission,
            net_prize_points: net_prize
        });
    }

    public entry fun claim_prize(player: &signer, room_id: u64) acquires RoomStore {
        let store = borrow_global_mut<RoomStore>(@chain_arcade);
        let room = table::borrow_mut(&mut store.rooms, room_id);
        let idx = find_player_index(&room.players, signer::address_of(player));
        assert!(idx < vector::length(&room.players), E_NOT_PLAYER);
        let seat = vector::borrow_mut(&mut room.players, idx);
        assert!(!seat.claimed, E_ALREADY_CLAIMED);
        seat.claimed = true;
    }

    public fun get_room(room_id: u64): Room acquires RoomStore {
        let store = borrow_global<RoomStore>(@chain_arcade);
        *table::borrow(&store.rooms, room_id)
    }

    public fun get_room_players(room_id: u64): vector<PlayerSeat> acquires RoomStore {
        let store = borrow_global<RoomStore>(@chain_arcade);
        let room = table::borrow(&store.rooms, room_id);
        room.players
    }

    public fun get_user_rooms(user: address): vector<u64> acquires RoomStore {
        let store = borrow_global<RoomStore>(@chain_arcade);
        if (!table::contains(&store.user_rooms, user)) {
            vector[]
        } else {
            *table::borrow(&store.user_rooms, user)
        }
    }

    fun push_user_room(map: &mut table::Table<address, vector<u64>>, user: address, room_id: u64) {
        if (!table::contains(map, user)) {
            table::add(map, user, vector[]);
        };
        let rooms = table::borrow_mut(map, user);
        vector::push_back(rooms, room_id);
    }

    fun find_player_index(players: &vector<PlayerSeat>, user: address): u64 {
        let len = vector::length(players);
        let mut i = 0;
        while (i < len) {
            if (vector::borrow(players, i).player == user) {
                return i
            };
            i = i + 1;
        };
        len
    }

    fun all_submitted(players: &vector<PlayerSeat>): bool {
        let len = vector::length(players);
        let mut i = 0;
        while (i < len) {
            if (!vector::borrow(players, i).submitted) {
                return false
            };
            i = i + 1;
        };
        true
    }

    fun find_winner(players: &vector<PlayerSeat>): u64 {
        let len = vector::length(players);
        let mut i = 1;
        let mut best = 0;
        while (i < len) {
            if (vector::borrow(players, i).score > vector::borrow(players, best).score) {
                best = i;
            };
            i = i + 1;
        };
        best
    }

    fun record_losers(players: &vector<PlayerSeat>, winner: address) {
        let len = vector::length(players);
        let mut i = 0;
        while (i < len) {
            let addr = vector::borrow(players, i).player;
            if (addr != winner) {
                chain_arcade_stats::record_game_result(addr, false, 0);
            };
            i = i + 1;
        };
    }
}
