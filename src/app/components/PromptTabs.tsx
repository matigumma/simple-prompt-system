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
        <div className=" inline-flex m-auto ">
            <div className="tabs tabs-box tabs-xs w-auto flex flex-nowrap">
                {prompts.map((prompt) => (
                    <input
                        key={prompt.id}
                        type="radio"
                        name="prompt_tabs"
                        className="tab"
                        aria-label={prompt.name}
                        checked={prompt.id === activePromptId}
                        onChange={() => onSelect(prompt.id)}
                        title={prompt.name}
                        style={{ maxWidth: 120 }}
                    />
                ))}
                <button
                    className="btn btn-primary btn-xs"
                    title="Add new prompt"
                    onClick={onAdd}
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default PromptTabs;
