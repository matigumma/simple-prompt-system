"use client";
import React from "react";

export type Prompt = {
    id: string;
    name: string;
    content: string;
    isJsonOutput: boolean;
};

type PromptTabsProps = {
    prompts: Prompt[];
    activePromptId: string;
    onSelect: (id: string) => void;
    onAdd: () => void;
    onRename: (id: string, newName: string) => void;
    onDelete: (id: string) => void;
    onCopy: (id: string) => void;
};

const PromptTabs: React.FC<PromptTabsProps> = ({
    prompts,
    activePromptId,
    onSelect,
    onAdd,
}) => {
    return (
        <div className="inline-flex items-center m-auto gap-2">
            <select
                className="select select-bordered select-xs w-auto max-w-xs"
                value={activePromptId}
                onChange={e => onSelect(e.target.value)}
                title="Select prompt"
            >
                {prompts.map((prompt) => (
                    <option key={prompt.id} value={prompt.id}>
                        {prompt.name || "Untitled"}
                    </option>
                ))}
            </select>
            <button
                className="btn btn-primary btn-xs"
                title="Add new prompt"
                onClick={onAdd}
            >
                +
            </button>
        </div>
    );
};

export default PromptTabs;
