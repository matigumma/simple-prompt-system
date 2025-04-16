/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import OpenAI from "openai";
import { Prompt } from "../components/PromptTabs";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

type RunPromptArgs = {
    prompt: Prompt;
    model: string;
    instructions?: string;
};

export async function runPromptServerAction({
    prompt,
    model,
    instructions,
}: RunPromptArgs): Promise<{ output: string | null; error: string | null }> {
    console.log(
        "Running prompt with model:",
        model,
        "instructions:",
        instructions ? `\n${instructions}` : "<none>",
        "prompt:",
        prompt ? `\n${prompt}` : "<none>",
    );
    try {
        const response = await openai.responses.create({
            model,
            ...(instructions ? { instructions } : {}),
            input: prompt.content,
            ...(prompt.isJsonOutput
                ? {
                    text: {
                        "format": {
                            "type": "json_object",
                        },
                    },
                }
                : {}),
        });

        // Prefer output_text if available, else aggregate from output array
        let output: string | null = null;
        if (typeof response.output_text === "string" && response.output_text.length > 0) {
            output = response.output_text;
        } else if (Array.isArray(response.output)) {
            // Aggregate all text outputs from the output array
            output = response.output
                .flatMap((item: any) =>
                    Array.isArray(item.content)
                        ? item.content
                            .filter((c: any) => c.type === "output_text" && typeof c.text === "string")
                            .map((c: any) => c.text)
                        : []
                )
                .join("\n")
                .trim();
            if (output.length === 0) output = null;
        }
        return { output, error: null };
    } catch (err: any) {
        console.error(err);
        return { output: null, error: err?.message || "Unknown error" };
    }
}
