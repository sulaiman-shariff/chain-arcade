# chain arcade

Aptos-native competitive gaming platform with trustless room escrow, deterministic prize payouts, and on-chain player statistics.

## Overview

chain arcade is designed for skill-based mini-games where each match uses an on-chain room lifecycle:

1. Players convert token value into in-game points.
2. A room creator opens a public, private, or tournament room with an entry fee.
3. Participants join and lock points into room escrow.
4. Game outcomes are validated off-chain, submitted on-chain with replay protection, and finalized on-chain.
5. Winner payout and platform commission settlement execute deterministically in Move.

## Architecture

### Move package

Location: aptos/

Modules:

- chain_arcade_token.move
  - Aptos fungible asset for the platform token.
  - Capability-based mint/burn controls.

- chain_arcade_points.move
  - Integer-safe points ledger.
  - Token <-> points conversion primitives.

- chain_arcade_rooms.move
  - Room creation/join/finalize/claim.
  - Supports public, private, and tournament room types.
  - Entry fee collection, prize pool accounting, and commission deduction.
  - Replay protection through used nonce tracking.
  - Single-claim enforcement per player per room.
  - Event emission for room creation and finalization.

- chain_arcade_stats.move
  - On-chain wins, losses, games played, and earnings.
  - Event-driven updates for leaderboard indexing.

### Frontend (Next.js)

Key changes:

- Aptos wallet support through wallet adapter:
  - Petra
  - Martian
- Aptos transaction and view integration via @aptos-labs/ts-sdk.
- New hooks for points, rooms, and stats using Move entry functions and view functions.
- Updated pages for:
  - Room creation/join/play/claim
  - Points conversion dashboard
  - On-chain leaderboard display

### Backend (validation service)

Location: src/app/api/game/result/route.ts

Responsibilities:

- Validate score submissions before on-chain execution.
- Reject replay attempts using matchDigest deduplication.
- Generate nonce + validator proof used by score submission flow.

This keeps core payout logic fully on-chain while preserving anti-cheat controls in the game-result pipeline.

## Security model

- Prize distribution is finalized on-chain.
- No off-chain actor can directly transfer prize funds.
- Replay resistance:
  - Match digest deduplication in backend validation.
  - Nonce tracking in Move room state.
- Fake-result resistance:
  - Score submission path requires validator proof payload.
- Double-claim protection:
  - Per-player claim marker in room participants.
- Integer-safe accounting:
  - All balances and fee calculations use integer arithmetic.

## Environment variables

Set these in .env.local:

- NEXT_PUBLIC_APTOS_NETWORK=testnet
- NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
- NEXT_PUBLIC_CHAIN_ARCADE_PACKAGE_ADDRESS=0xabc
- GAME_RESULT_VALIDATOR_SECRET=replace-with-strong-secret

## Development

Install dependencies:

```bash
npm install
```

Run app:

```bash
npm run dev
```

Optional Move workflow (Aptos CLI required):

```bash
cd aptos
aptos move compile
aptos move test
```

## Extending with new games

To add a game type:

1. Add a new game type constant in src/constants/contracts.ts.
2. Extend room/game validation logic in backend validator.
3. Add game-specific UI and score generation.
4. Keep payout and escrow logic unchanged in chain_arcade_rooms.

This preserves a modular architecture while scaling the game portfolio safely.
