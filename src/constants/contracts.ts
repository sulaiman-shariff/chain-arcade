export const APTOS_NETWORK = process.env.NEXT_PUBLIC_APTOS_NETWORK ?? "testnet";
export const APTOS_NODE_URL =
  process.env.NEXT_PUBLIC_APTOS_NODE_URL ?? "https://fullnode.testnet.aptoslabs.com/v1";

// Account that publishes the chain arcade Move package.
export const CHAIN_ARCADE_PACKAGE_ADDRESS =
  process.env.NEXT_PUBLIC_CHAIN_ARCADE_PACKAGE_ADDRESS ?? "0xabc";

export const CHAIN_ARCADE_MODULES = {
  token: `${CHAIN_ARCADE_PACKAGE_ADDRESS}::chain_arcade_token`,
  points: `${CHAIN_ARCADE_PACKAGE_ADDRESS}::chain_arcade_points`,
  rooms: `${CHAIN_ARCADE_PACKAGE_ADDRESS}::chain_arcade_rooms`,
  stats: `${CHAIN_ARCADE_PACKAGE_ADDRESS}::chain_arcade_stats`
} as const;

export const GameType = {
  FlappyBird: 0,
  AIChallenge: 1
} as const;

export const RoomType = {
  Public: 0,
  Private: 1,
  Tournament: 2
} as const;

export const RoomStatus = {
  Filling: 0,
  Active: 1,
  Completed: 2,
  Expired: 3,
  Canceled: 4
} as const;

export type GameTypeValue = (typeof GameType)[keyof typeof GameType];
export type RoomTypeValue = (typeof RoomType)[keyof typeof RoomType];
export type RoomStatusValue = (typeof RoomStatus)[keyof typeof RoomStatus];