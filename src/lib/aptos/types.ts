export type PlayerStats = {
    gamesPlayed: number;
    wins: number;
    losses: number;
    totalEarnings: number;
};

export type RoomView = {
    roomId: number;
    creator: string;
    gameType: number;
    roomType: number;
    entryFee: number;
    maxPlayers: number;
    currentPlayers: number;
    prizePool: number;
    status: number;
    winner: string;
    inviteHash: string;
};

export type JoinRoomResult = {
    success: boolean;
    hash?: string;
    error?: string;
};
