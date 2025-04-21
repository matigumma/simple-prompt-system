/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { runPromptServerAction } from "../../actions/runPrompt";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("API /api/runPrompt received body:", body);
        const { activePrompt, model, instructions } = body;
        const result = await runPromptServerAction({ prompt: activePrompt, model, instructions });
        return NextResponse.json(result);
    } catch (err: unknown) { // Type as unknown
        const errorMessage = err instanceof Error ? err.message : "Unknown error processing API request";
        console.error("API Error:", err); // Log the actual error
        return NextResponse.json(
            { output: null, error: errorMessage },
            { status: 500 }
        );
    }
}
