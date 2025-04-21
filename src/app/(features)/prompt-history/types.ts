// Extracted from page.tsx - types related to history

// Re-export Variable type if it's shared or define it here if specific
export type Variable = { name: string; value: string };

export type HistoryEntry = {
    id?: number;
    promptId: string;
    prompt: string;
    result: string;
    timestamp: number;
    variables?: Variable[];
    response?: object | null; // Changed from unknown to object | null for better type safety
    model?: string; // Added model
    instructions?: string; // Added instructions
    isJsonOutput?: boolean; // Added isJsonOutput
};
