module chain_arcade::chain_arcade_points {
    use std::signer;
    use std::table;

    const E_NOT_INITIALIZED: u64 = 10;
    const E_INSUFFICIENT: u64 = 11;

    // 1 token == 1000 points
    const POINTS_PER_TOKEN: u64 = 1000;
    const OCTAS_PER_TOKEN: u64 = 100_000_000;

    struct PointLedger has key {
        points: table::Table<address, u64>
    }

    public entry fun initialize(admin: &signer) {
        move_to(admin, PointLedger { points: table::new<address, u64>() });
    }

    public entry fun convert_token_to_points(player: &signer, amount_octas: u64) acquires PointLedger {
        let amount_tokens = amount_octas / OCTAS_PER_TOKEN;
        let add_points = amount_tokens * POINTS_PER_TOKEN;
        let ledger = borrow_global_mut<PointLedger>(@chain_arcade);
        credit_points_internal(ledger, signer::address_of(player), add_points);
    }

    public entry fun convert_points_to_token(player: &signer, points: u64) acquires PointLedger {
        let ledger = borrow_global_mut<PointLedger>(@chain_arcade);
        let current = get_points_internal(ledger, signer::address_of(player));
        assert!(current >= points, E_INSUFFICIENT);
        table::upsert(&mut ledger.points, signer::address_of(player), current - points);
    }

    public fun credit_points(player: address, points: u64) acquires PointLedger {
        let ledger = borrow_global_mut<PointLedger>(@chain_arcade);
        credit_points_internal(ledger, player, points);
    }

    public fun debit_points(player: address, points: u64) acquires PointLedger {
        let ledger = borrow_global_mut<PointLedger>(@chain_arcade);
        let current = get_points_internal(ledger, player);
        assert!(current >= points, E_INSUFFICIENT);
        table::upsert(&mut ledger.points, player, current - points);
    }

    public fun get_points_balance(player: address): u64 acquires PointLedger {
        if (!exists<PointLedger>(@chain_arcade)) {
            return 0
        };
        let ledger = borrow_global<PointLedger>(@chain_arcade);
        if (!table::contains(&ledger.points, player)) {
            return 0
        };
        *table::borrow(&ledger.points, player)
    }

    fun credit_points_internal(ledger: &mut PointLedger, player: address, points: u64) {
        let current = get_points_internal(ledger, player);
        table::upsert(&mut ledger.points, player, current + points);
    }

    fun get_points_internal(ledger: &PointLedger, player: address): u64 {
        if (!table::contains(&ledger.points, player)) {
            0
        } else {
            *table::borrow(&ledger.points, player)
        }
    }
}
