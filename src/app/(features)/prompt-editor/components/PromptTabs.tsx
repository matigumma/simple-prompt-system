"use client";
import React from "react";
import { Prompt as AppPrompt } from "../types"; // Import the main Prompt type

// Removed unused TabPrompt type

type PromptTabsProps = {
    prompts: AppPrompt[]; // Use the imported Prompt type for the list
    activePromptId: string;
    onSelect: (id: string) => void;
    onAdd: () => void;
    // onRename: (id: string, newName: string) => void; // Removed unused prop
    onDelete: (id: string) => void;
    // onCopy: (id: string) => void; // Removed unused prop
};

const PromptTabs: React.FC<PromptTabsProps> = ({
    prompts,
    activePromptId,
    onSelect,
    onAdd,
    // onRename, // Removed from destructuring
    onDelete,
    // onCopy, // Removed from destructuring
}) => {
    return (
        <div className="flex items-center gap-2 w-full overflow-x-auto">
            <nav className="flex flex-row gap-1" aria-label="Prompt Tabs">
                {prompts.map((prompt: AppPrompt) => ( // Use AppPrompt type here
                    <div
                        key={prompt.id}
                        className={`group flex items-center px-3 py-1 rounded-t-lg border-b-2 cursor-pointer transition-colors
                            ${prompt.id === activePromptId
                                ? "bg-white dark:bg-neutral-900 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold"
                                : "bg-neutral-100 dark:bg-neutral-800 border-transparent text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            }`}
                        tabIndex={0}
                        role="tab"
                        aria-selected={prompt.id === activePromptId}
                        onClick={() => onSelect(prompt.id)}
                        onKeyDown={e => {
                            if (e.key === "Enter" || e.key === " ") onSelect(prompt.id);
                        }}
                        title={prompt.name || "Untitled"}
                    >
                        <span className="truncate max-w-[120px]">{prompt.name || "Untitled"}</span>
                        <button
                            className="ml-2 text-xs text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete prompt"
                            onClick={e => {
                                e.stopPropagation();
                                onDelete(prompt.id);
                            }}
                            tabIndex={-1}
                            aria-label="Delete prompt"
                            type="button"
                        >
                            ×
                        </button>
                    </div>
                ))}
                <button
                    className="ml-2 px-2 py-1 rounded-t-lg bg-neutral-100 dark:bg-neutral-800 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 border-b-2 border-transparent transition-colors"
                    title="Add new prompt"
                    onClick={onAdd}
                    type="button"
                    aria-label="Add new prompt"
                >
                    +
                </button>
            </nav>
        </div>
    );
};

export default PromptTabs;
