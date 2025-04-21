"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Prompt, LLMOption } from '@/app/(features)/prompt-editor/types';
import { HistoryEntry } from '@/app/(features)/prompt-history/types';
import { usePrompts } from '@/app/(features)/prompt-list/hooks/usePrompts';
import { useHistory } from '@/app/(features)/prompt-history/hooks/useHistory';
import { runPromptServerAction } from '@/app/(features)/prompt-editor/actions/runPrompt'; // Import the server action

// --- Constants ---
const DEFAULT_LLM_OPTIONS: LLMOption[] = [
    { id: "gpt-4.1-mini", name: "GPT-4.1", group: "Chat" },
    { id: "o3-mini", name: "o3", group: "Reasoning" }
];
const LOCAL_STORAGE_LLM_KEY = "prompt-training-system.selectedLLM";

// --- Helper Functions ---
function loadSelectedLLM(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem(LOCAL_STORAGE_LLM_KEY);
    } catch (e) {
        console.error("Failed to load selected LLM from localStorage", e);
    }
    return null;
}

function saveSelectedLLM(id: string) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(LOCAL_STORAGE_LLM_KEY, id);
    } catch (e) {
        console.error("Failed to save selected LLM to localStorage", e);
    }
}

function interpolatePrompt(content: string, vars: { name: string; value: string }[] = []): string {
    return content.replace(/{{\s*([\w-]+)\s*}}/g, (_, varName) => {
        const found = vars.find(v => v.name === varName);
        return found ? found.value : `{{${varName}}}`;
    });
}


// --- Context Definition ---
interface AppContextProps {
    prompts: Prompt[];
    setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>;
    activePromptId: string | undefined;
    activePrompt: Prompt | undefined;
    handleSelectPrompt: (id: string) => void;
    handleAddPrompt: () => void;
    handleRenamePrompt: (id: string, newName: string) => void;
    handleDeletePrompt: (id: string) => void;
    handleCopyPrompt: (id: string) => void;
    handleToggleJson: (id: string) => void;
    handlePromptContentChange: (value: string) => void;
    handlePromptInstructionsChange: (value: string) => void; // Added handler

    llmOptions: LLMOption[];
    selectedLLM: string | undefined;
    setSelectedLLM: (id: string) => void;

    output: string;
    setOutput: React.Dispatch<React.SetStateAction<string>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    error: string | undefined;
    setError: React.Dispatch<React.SetStateAction<string | undefined>>;
    // instructions: string; // Removed local state
    // setInstructions: React.Dispatch<React.SetStateAction<string>>; // Removed local state setter
    handleRunPrompt: () => Promise<void>;

    history: HistoryEntry[];
    selectedHistory: HistoryEntry | null;
    sidePanelOpen: boolean;
    historyError: string | null;
    addHistoryEntry: (entry: Omit<HistoryEntry, 'id'>) => Promise<void>;
    clearPromptHistory: () => Promise<void>;
    viewHistoryDetails: (entry: HistoryEntry) => void;
    closeHistoryDetails: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// --- Provider Component ---
export const AppProvider = ({ children }: { children: ReactNode }) => {
    // LLM State
    const [llmOptions] = useState<LLMOption[]>(DEFAULT_LLM_OPTIONS);
    const [selectedLLM, setSelectedLLMInternal] = useState<string | undefined>(() => {
        const loaded = loadSelectedLLM();
        return loaded && DEFAULT_LLM_OPTIONS.find(l => l.id === loaded) ? loaded : DEFAULT_LLM_OPTIONS[0]?.id;
    });
    useEffect(() => {
        if (selectedLLM) saveSelectedLLM(selectedLLM);
    }, [selectedLLM]);

    // Execution State
    const [output, setOutput] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    // const [instructions, setInstructions] = useState<string>(""); // Removed local state

    // Instantiate Feature Hooks
    // Pass setSelectedLLMInternal, setOutput, and setError to usePrompts
    const promptsHook = usePrompts(setSelectedLLMInternal, setOutput, setError);
    // Pass activePromptId from promptsHook to useHistory
    const historyHook = useHistory(promptsHook.activePromptId);

    // Handler for LLM selection (updates local state and prompt data via hook)
    const handleSelectLLM = (id: string) => {
        setSelectedLLMInternal(id);
        if (promptsHook.activePrompt) {
            // Update the llmId directly on the prompt object via setPrompts from the hook
            promptsHook.setPrompts(prev =>
                prev.map(p => (p.id === promptsHook.activePrompt?.id ? { ...p, llmId: id } : p))
            );
        }
    };

    // Run Prompt Handler
    const handleRunPrompt = async () => {
        if (!promptsHook.activePrompt) return;
        setIsLoading(true);
        setError(undefined);
        setOutput("");
        if (promptsHook.activePrompt.content.trim() === "" && !promptsHook.activePrompt.instructions?.trim()) { // Check instructions too
            setError("Prompt and Instructions are empty.");
            setIsLoading(false);
            return;
        }
        const interpolatedContent = interpolatePrompt(promptsHook.activePrompt.content, promptsHook.activePrompt.variables || []);
        const currentInstructions = promptsHook.activePrompt.instructions || ""; // Get instructions from active prompt
        try {
            console.log("AppProvider handleRunPrompt sending instructions:", currentInstructions);

            // --- Use Server Action ---
            const result = await runPromptServerAction({
                prompt: { ...promptsHook.activePrompt, content: interpolatedContent }, // Pass the prompt object
                model: selectedLLM || DEFAULT_LLM_OPTIONS[0]?.id || "", // Provide fallback
                instructions: currentInstructions // Use instructions from active prompt
            });
            if (result.error) {
                setError(result.error);
                setOutput("");
            } else if (result.output) {
                setOutput(result.output);
                setError(undefined);
                // Save history on the client side after successful action
                await historyHook.addHistoryEntry({
                    promptId: promptsHook.activePrompt.id, // Keep only one promptId
                    prompt: interpolatedContent, // Use interpolated content for history
                    result: result.output,
                    timestamp: Date.now(),
                    variables: promptsHook.activePrompt.variables ? JSON.parse(JSON.stringify(promptsHook.activePrompt.variables)) : undefined,
                    response: result.fullResponse, // Pass the full response
                    model: selectedLLM || DEFAULT_LLM_OPTIONS[0]?.id, // Add model
                    instructions: currentInstructions, // Add instructions used
                    isJsonOutput: promptsHook.activePrompt.isJsonOutput // Add JSON output flag
                });
                // loadHistory is called internally by addHistoryEntry in the hook
            } else {
                setError("No output received from action.");
                setOutput("");
            }

            // --- Commented out API Route Fetch (Keep commented) ---
            /*
            const res = await fetch("/api/runPrompt", {
                method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({
            //         activePrompt: { ...promptsHook.activePrompt, content: interpolatedContent },
            //         model: selectedLLM || DEFAULT_LLM_OPTIONS[0]?.id || "", // Provide fallback
            //         instructions: instructions
            //     })
            // });
            // const data = await res.json();
            // if (!res.ok) {
            //     throw new Error(data.error || `API request failed with status ${res.status}`);
            // }
            // if (data.error) {
            //     setError(data.error);
            //     setOutput("");
            // } else if (data.output) {
            //     setOutput(data.output);
            //     setError(undefined);
            //     await historyHook.addHistoryEntry({
            //         promptId: promptsHook.activePrompt.id,
            //         prompt: interpolatedContent,
            //         result: data.output,
            //         timestamp: Date.now(),
            //         variables: promptsHook.activePrompt.variables ? JSON.parse(JSON.stringify(promptsHook.activePrompt.variables)) : undefined,
            //         response: data.fullResponse
            //     });
            // } else {
            //     setError("No output received from API.");
            //     setOutput("");
            // }
            */
        } catch (err: unknown) { // Type as unknown
            console.error("Error running prompt:", err);
            const errorMessage = err instanceof Error ? err.message : "Unknown error running prompt";
            setError(errorMessage);
            setOutput("");
        }
        setIsLoading(false);
    };

    // Combine state and handlers for the context value
    const contextValue: AppContextProps = {
        ...promptsHook,
        ...historyHook,
        llmOptions,
        selectedLLM,
        setSelectedLLM: handleSelectLLM, // Use the combined handler
        output,
        setOutput,
        isLoading,
        setIsLoading,
        error,
        setError,
        // instructions, // Removed local state
        // setInstructions, // Removed local state setter
        handleRunPrompt,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook to use the context
export const useAppContext = (): AppContextProps => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
