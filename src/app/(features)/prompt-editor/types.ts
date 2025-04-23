// Extracted from page.tsx and components - types related to prompt editing

// Base prompt type from PromptTabs
export type BasePrompt = {
    id: string;
    name: string;
    content: string;
    isJsonOutput: boolean;
};

// Variable type (might be shared later)
export type Variable = { name: string; value: string };

// LLM Option type from LLMSelector/LLMOption
// Use specific group names if known and required by components
type LLMGroup = "Chat" | "Reasoning"; // Add other groups if necessary

export type LLMOption = {
    id: string;
    name: string;
    group?: LLMGroup;
};

// Extended Prompt type used in page.tsx (and likely needed by VariableManager)
export type Prompt = BasePrompt & {
    /**
     * Descripción en bulletpoints para mostrar debajo de PromptActions en el Editor Panel.
     * Puede ser string vacío o undefined si no aplica.
     */
    description?: string;
    variables?: Variable[];
    llmId?: string;
    instructions?: string; // Added instructions field
};
