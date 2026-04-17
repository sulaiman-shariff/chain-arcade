module chain_arcade::chain_arcade_token {
    use std::signer;
    use aptos_framework::fungible_asset;

    const ENOT_ADMIN: u64 = 1;

    struct AdminCap has key {}

    struct TokenStore has key {
        metadata: object::Object<fungible_asset::Metadata>,
        mint_ref: fungible_asset::MintRef,
        burn_ref: fungible_asset::BurnRef,
        transfer_ref: fungible_asset::TransferRef,
    }

    public entry fun initialize(admin: &signer) {
        let constructor_ref = &object::create_named_object(admin, b"CHAIN_ARCADE_TOKEN");
        let metadata = fungible_asset::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(),
            b"chain arcade token",
            b"CAT",
            8,
            b"https://chainarcade.local/token"
        );

        move_to(admin, TokenStore {
            metadata,
            mint_ref: fungible_asset::generate_mint_ref(constructor_ref),
            burn_ref: fungible_asset::generate_burn_ref(constructor_ref),
            transfer_ref: fungible_asset::generate_transfer_ref(constructor_ref)
        });

        move_to(admin, AdminCap {});
    }

    public fun metadata_address(admin: address): object::Object<fungible_asset::Metadata> acquires TokenStore {
        borrow_global<TokenStore>(admin).metadata
    }

    public entry fun mint(admin: &signer, to: address, amount: u64) acquires AdminCap, TokenStore {
        assert!(exists<AdminCap>(signer::address_of(admin)), ENOT_ADMIN);
        let store = borrow_global<TokenStore>(signer::address_of(admin));
        let fa = fungible_asset::mint(&store.mint_ref, amount);
        fungible_asset::deposit(to, fa);
    }

    public entry fun burn(admin: &signer, from: address, amount: u64) acquires AdminCap, TokenStore {
        assert!(exists<AdminCap>(signer::address_of(admin)), ENOT_ADMIN);
        let store = borrow_global<TokenStore>(signer::address_of(admin));
        let withdrawn = fungible_asset::withdraw(from, store.metadata, amount);
        fungible_asset::burn(&store.burn_ref, withdrawn);
    }
}
