/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { runPromptServerAction } from "../../actions/runPrompt";

export async function POST(req: NextRequest) {
    try {
        const { activePrompt, model, instructions } = await req.json();
        const result = await runPromptServerAction({ prompt: activePrompt, model, instructions });
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json(
            { output: null, error: err?.message || "Unknown error" },
            { status: 500 }
        );
    }
}
