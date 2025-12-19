import { NextResponse } from "next/server";
import { scoreStore, ScoreEntry } from "@/lib/score-store";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');

    const data = user ? scoreStore.getByUser(user) : scoreStore.getAll();
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    try {
        const body = await request.json() as ScoreEntry;

        if (!body.user || !body.metric || body.value === undefined) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        body.timestamp = Date.now();
        scoreStore.add(body);

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (err) {
        return NextResponse.json(
            { error: (err as Error).message },
            { status: 500 }
        );
    }
}
