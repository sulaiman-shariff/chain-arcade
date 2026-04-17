import crypto from 'crypto';

type ScoreSubmission = {
    walletAddress: string;
    roomId: number;
    gameType: number;
    score: number;
    matchDigest: string;
};

const usedDigests = new Set<string>();

function getSecret() {
    return process.env.GAME_RESULT_VALIDATOR_SECRET ?? 'change-me-in-production';
}

export function validateSubmission(input: ScoreSubmission) {
    if (!input.walletAddress || !input.matchDigest) {
        return { ok: false, reason: 'Missing walletAddress or matchDigest' };
    }

    if (input.score < 0 || input.score > 10_000_000) {
        return { ok: false, reason: 'Score out of accepted range' };
    }

    if (usedDigests.has(input.matchDigest)) {
        return { ok: false, reason: 'Replay detected for this matchDigest' };
    }

    usedDigests.add(input.matchDigest);
    return { ok: true };
}

export function issueValidatorProof(input: ScoreSubmission) {
    const nonce = `${Date.now()}-${crypto.randomUUID()}`;
    const payload = `${input.walletAddress}:${input.roomId}:${input.gameType}:${input.score}:${input.matchDigest}:${nonce}`;
    const signature = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');

    return {
        nonce,
        validatorSignature: `0x${signature}`,
        payload
    };
}
