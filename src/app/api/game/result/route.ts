import { NextRequest, NextResponse } from 'next/server';
import { issueValidatorProof, validateSubmission } from '@/lib/backend/resultValidation';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { walletAddress, roomId, gameType, score, matchDigest } = body ?? {};

        const validation = validateSubmission({
            walletAddress,
            roomId: Number(roomId),
            gameType: Number(gameType),
            score: Number(score),
            matchDigest
        });

        if (!validation.ok) {
            return NextResponse.json({ ok: false, error: validation.reason }, { status: 400 });
        }

        const proof = issueValidatorProof({
            walletAddress,
            roomId: Number(roomId),
            gameType: Number(gameType),
            score: Number(score),
            matchDigest
        });

        return NextResponse.json({ ok: true, ...proof });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message ?? 'Invalid request' }, { status: 500 });
    }
}
