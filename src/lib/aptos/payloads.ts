import { CHAIN_ARCADE_MODULES } from "@/constants/contracts";

export const payloads = {
    convertToPoints: (amountOctas: string) => ({
        function: `${CHAIN_ARCADE_MODULES.points}::convert_token_to_points`,
        functionArguments: [amountOctas]
    }),

    convertToToken: (points: number) => ({
        function: `${CHAIN_ARCADE_MODULES.points}::convert_points_to_token`,
        functionArguments: [points]
    }),

    createRoom: (args: {
        gameType: number;
        roomType: number;
        entryFee: number;
        maxPlayers: number;
        inviteHash: string;
        expirationSeconds: number;
    }) => ({
        function: `${CHAIN_ARCADE_MODULES.rooms}::create_room`,
        functionArguments: [
            args.gameType,
            args.roomType,
            args.entryFee,
            args.maxPlayers,
            args.inviteHash,
            args.expirationSeconds
        ]
    }),

    joinRoom: (roomId: number, inviteCode: string) => ({
        function: `${CHAIN_ARCADE_MODULES.rooms}::join_room`,
        functionArguments: [roomId, inviteCode]
    }),

    submitScore: (roomId: number, score: number, nonce: string, validatorSig: string) => ({
        function: `${CHAIN_ARCADE_MODULES.rooms}::submit_score`,
        functionArguments: [roomId, score, nonce, validatorSig]
    }),

    finalizeRoom: (roomId: number) => ({
        function: `${CHAIN_ARCADE_MODULES.rooms}::finalize_room`,
        functionArguments: [roomId]
    }),

    claimPrize: (roomId: number) => ({
        function: `${CHAIN_ARCADE_MODULES.rooms}::claim_prize`,
        functionArguments: [roomId]
    })
};
