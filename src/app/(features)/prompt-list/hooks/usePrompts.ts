import { useState, useEffect, useCallback } from 'react';
import { Prompt } from '@/app/(features)/prompt-editor/types'; // Import from editor types

// --- Constants and Local Storage Logic ---
const DEFAULT_PROMPTS: Prompt[] = [
    {
        id: "ad-hoc",
        name: "Ad-hoc (Quick Prompt)",
        content: `Summarize the content with 3 hot takes biased toward the author and 3 hot takes biased against the author

...paste content here...`,
        isJsonOutput: false,
        variables: [],
        llmId: "gpt-4.1-mini",
        instructions: ""
    },
    {
        id: "structured",
        name: "Structured Prompt (Purpose + Instructions)",
        content: `<purpose>
Summarize the given content based on the instructions and example-output
</purpose>

<instructions>
  <instruction>Output in markdown format</instruction>
  <instruction>Summarize into 4 sections: High level summary, Main Points, Sentiment, and 3 hot takes biased toward the author and 3 hot takes biased against the author</instruction>
  <instruction>Write the summary in the same format as the example-output</instruction>
</instructions>

<content>
  ...paste content here...
</content>`,
        isJsonOutput: false,
        variables: [],
        llmId: "gpt-4.1-mini",
        instructions: ""
    },
    {
        id: "few-shot",
        name: "Few-Shot (Structured + Example Output)",
        content: `<purpose>
Summarize the given content based on the instructions and example-output
</purpose>

<instructions>
  <instruction>Output in markdown format</instruction>
  <instruction>Summarize into 4 sections: High level summary, Main Points, Sentiment, and 3 hot takes biased toward the author and 3 hot takes biased against the author</instruction>
  <instruction>Write the summary in the same format as the example-output</instruction>
</instructions>

<example-output>
# Title

## High Level Summary
...

## Main Points
...

## Sentiment
...

## Hot Takes (biased toward the author)
...

## Hot Takes (biased against the author)
...
</example-output>

<content>
  ...paste content here...
</content>`,
        isJsonOutput: false,
        variables: [],
        llmId: "gpt-4.1-mini",
        instructions: ""
    },
    {
        id: "dynamic-vars",
        name: "Dynamic Variables (Production-ready)",
        content: `<purpose>
Summarize the given content based on the instructions and example-output
</purpose>

<instructions>
  <instruction>Output in markdown format</instruction>
  <instruction>Summarize into 4 sections: High level summary, Main Points, Sentiment, and 3 hot takes biased toward the author and 3 hot takes biased against the author</instruction>
  <instruction>Write the summary in the same format as the example-output</instruction>
</instructions>

<example-output>
# Title

## High Level Summary
...

## Main Points
...

## Sentiment
...

## Hot Takes (biased toward the author)
...

## Hot Takes (biased against the author)
...
</example-output>

<content>
  {{content}}
</content>`,
        isJsonOutput: false,
        variables: [{ name: "content", value: "" }],
        llmId: "gpt-4.1-mini",
        instructions: ""
    },
    {
        id: "openai-best-practice",
        name: "OpenAI Best Practice (Identity/Instructions/Examples/Context)",
        content: `# Identity
You are a helpful assistant that labels short product reviews as Positive, Negative, or Neutral.

# Instructions
* Only output a single word in your response with no additional formatting or commentary.
* Your response should only be one of the words "Positive", "Negative", or "Neutral" depending on the sentiment of the product review you are given.

# Examples

<product_review id="example-1">
I absolutely love these headphones — sound quality is amazing!
</product_review>
<assistant_response id="example-1">
Positive
</assistant_response>

<product_review id="example-2">
Battery life is okay, but the ear pads feel cheap.
</product_review>
<assistant_response id="example-2">
Neutral
</assistant_response>

<product_review id="example-3">
Terrible customer service, I'll never buy from them again.
</product_review>
<assistant_response id="example-3">
Negative
</assistant_response>

# Context
<product_review>
{{review}}
</product_review>`,
        isJsonOutput: false,
        variables: [{ name: "review", value: "" }],
        llmId: "gpt-4.1-mini",
        instructions: ""
    },
    {
        id: "chain-of-thought",
        name: "Chain-of-Thought Reasoning",
        content: `You are an expert problem solver. Think step by step to break down the problem and explain your reasoning.

Question: {{question}}

First, think carefully step by step about what documents or information are needed to answer the query. Then, print out the TITLE and ID of each document. Then, format the IDs into a list.

Answer:`,
        isJsonOutput: false,
        variables: [{ name: "question", value: "" }],
        llmId: "o3-mini",
        instructions: ""
    },
    {
        id: "json-output",
        name: "Structured Output (JSON)",
        content: `Summarize the following content and output the result as a JSON object with the following fields:
- "summary": a concise summary of the content
- "main_points": an array of the main points
- "sentiment": "positive", "neutral", or "negative"
- "hot_takes_for": array of 3 hot takes biased toward the author
- "hot_takes_against": array of 3 hot takes biased against the author

Content:
{{content}}

Respond ONLY with valid JSON.`,
        isJsonOutput: true,
        variables: [{ name: "content", value: "" }],
        llmId: "gpt-4.1-mini",
        instructions: ""
    },
    {
        id: "agentic-system",
        name: "Agentic Workflow (System Prompt)",
        content: `## PERSISTENCE
You are an agent - keep going until the user's query is completely resolved, before ending your turn and yielding back to the user. Only terminate your turn when you are sure that the problem is solved.

## TOOL CALLING
If you are not sure about file content or codebase structure pertaining to the user's request, use your tools to read files and gather the relevant information: do NOT guess or make up an answer.

## PLANNING
You MUST plan extensively before each function call, and reflect extensively on the outcomes of the previous function calls. DO NOT do this entire process by making function calls only, as this can impair your ability to solve the problem and think insightfully.

## USER QUERY
{{query}}`,
        isJsonOutput: false,
        variables: [{ name: "query", value: "" }],
        llmId: "o3-mini",
        instructions: ""
    },
    {
        id: "blank",
        name: "Blank",
        content: "",
        isJsonOutput: false,
        variables: [],
        llmId: "gpt-4.1-mini",
        instructions: ""
    }
];

const LOCAL_STORAGE_KEY = "prompt-training-system.prompts";
const LOCAL_STORAGE_ACTIVE_KEY = "prompt-training-system.activePromptId";

function loadPrompts(): Prompt[] {
    if (typeof window === 'undefined') return DEFAULT_PROMPTS; // Avoid localStorage on server
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to load prompts from localStorage", e);
    }
    return DEFAULT_PROMPTS;
}

function savePrompts(prompts: Prompt[]) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prompts));
    } catch (e) {
        console.error("Failed to save prompts to localStorage", e);
    }
}

function loadActivePromptId(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem(LOCAL_STORAGE_ACTIVE_KEY);
    } catch (e) {
        console.error("Failed to load active prompt ID from localStorage", e);
    }
    return null;
}

function saveActivePromptId(id: string) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, id);
    } catch (e) {
        console.error("Failed to save active prompt ID to localStorage", e);
    }
}

function generateId(): string {
    return "prompt-" + Math.random().toString(36).slice(2, 10);
}

// --- Hook ---
export function usePrompts(
    // Dependencies that will likely come from context later
    setSelectedLLM: (id: string) => void,
    setOutput: (output: string) => void, // Added setOutput dependency
    setError: (error: string | undefined) => void, // Added setError dependency
    // Optional initial state (useful if context provides it)
    initialPrompts?: Prompt[],
    initialActivePromptId?: string | null
) {
    const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts || DEFAULT_PROMPTS);
    const [activePromptId, setActivePromptId] = useState<string>(initialActivePromptId || DEFAULT_PROMPTS[0]?.id || "");

    // Load initial state from localStorage on mount (client-side only)
    useEffect(() => {
        const loadedPrompts = loadPrompts();
        setPrompts(loadedPrompts);
        const loadedActive = loadActivePromptId();
        if (loadedActive && loadedPrompts.find(p => p.id === loadedActive)) {
            setActivePromptId(loadedActive);
        } else if (loadedPrompts.length > 0) {
            setActivePromptId(loadedPrompts[0].id);
        } else {
            setActivePromptId(""); // Handle case with no prompts
        }
    }, []);

    // Save prompts to localStorage whenever they change
    useEffect(() => {
        savePrompts(prompts);
    }, [prompts]);

    // Save active prompt ID to localStorage whenever it changes
    useEffect(() => {
        if (activePromptId) { // Only save if there's an active ID
            saveActivePromptId(activePromptId);
        }
    }, [activePromptId]);

    const activePrompt = prompts.find(p => p.id === activePromptId);

    const handleSelectPrompt = useCallback((id: string) => {
        setActivePromptId(id);
        setOutput(""); // Clear output
        setError(undefined); // Clear error
        const prompt = prompts.find(p => p.id === id);
        if (prompt?.llmId) {
            setSelectedLLM(prompt.llmId); // Update shared LLM state
        } else {
            // If the selected prompt doesn't have an llmId, maybe default?
            // Or rely on the existing selectedLLM state? For now, do nothing extra.
        }
    }, [prompts, setSelectedLLM, setOutput, setError]); // Added dependencies

    const handleAddPrompt = useCallback(() => {
        const newPrompt: Prompt = {
            id: generateId(),
            name: "Untitled Prompt",
            content: "",
            isJsonOutput: false,
            variables: []
        };
        setPrompts(prev => [...prev, newPrompt]);
        setActivePromptId(newPrompt.id);
    }, []);

    const handleRenamePrompt = useCallback((id: string, newName: string) => {
        setPrompts(prev => prev.map(p => (p.id === id ? { ...p, name: newName } : p)));
    }, []);

    const handleDeletePrompt = useCallback((id: string) => {
        setPrompts(prev => {
            const idx = prev.findIndex(p => p.id === id);
            if (idx === -1) return prev; // Should not happen if called from UI
            const newPrompts = prev.filter(p => p.id !== id);
            // If the deleted prompt was active, select the next/previous/first one
            if (id === activePromptId) {
                const nextPrompt = newPrompts[idx] || newPrompts[idx - 1] || newPrompts[0];
                setActivePromptId(nextPrompt?.id || ""); // Fallback to empty string if no prompts left
            }
            return newPrompts;
        });
    }, [activePromptId]); // Added activePromptId dependency

    const handleCopyPrompt = useCallback((id: string) => {
        const prompt = prompts.find(p => p.id === id);
        if (prompt && typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(prompt.content).catch(err => {
                console.error("Failed to copy prompt content:", err);
            });
        }
    }, [prompts]); // Added prompts dependency

    const handleToggleJson = useCallback((id: string) => {
        setPrompts(prev =>
            prev.map(p => (p.id === id ? { ...p, isJsonOutput: !p.isJsonOutput } : p))
        );
    }, []);

    const handlePromptContentChange = useCallback((value: string) => {
        if (!activePromptId) return;
        setPrompts(prev =>
            prev.map(p => (p.id === activePromptId ? { ...p, content: value } : p))
        );
    }, [activePromptId]); // Added activePromptId dependency

    const handlePromptInstructionsChange = useCallback((value: string) => {
        if (!activePromptId) return;
        setPrompts(prev =>
            prev.map(p => (p.id === activePromptId ? { ...p, instructions: value } : p))
        );
    }, [activePromptId]);

    // Note: handleSelectLLM is handled externally via setSelectedLLM prop
    // Note: setPrompts is returned for VariableManager, but will be replaced by context update fn

    return {
        prompts,
        setPrompts, // Expose setPrompts for VariableManager (temporary)
        activePromptId,
        activePrompt,
        handleSelectPrompt,
        handleAddPrompt,
        handleRenamePrompt,
        handleDeletePrompt,
        handleCopyPrompt,
        handleToggleJson,
        handlePromptContentChange,
        handlePromptInstructionsChange, // Added new handler
    };
}
