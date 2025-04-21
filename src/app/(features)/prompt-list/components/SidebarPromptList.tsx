"use client";
import React, { useState } from "react";
import { Prompt } from "@/app/(features)/prompt-editor/types"; // Updated import

type SidebarPromptListProps = {
    prompts: Prompt[];
    activePromptId: string;
    onSelect: (id: string) => void;
    onAdd: () => void;
    onRename: (id: string, newName: string) => void;
    onDelete: (id: string) => void;
    // onCopy: (id: string) => void; // Removed unused prop
};

const SidebarPromptList: React.FC<SidebarPromptListProps> = ({
    prompts,
    activePromptId,
    onSelect,
    onAdd,
    onRename,
    onDelete,
    // onCopy, // Removed from destructuring
}) => {
    return (
        <nav
            className="flex flex-col gap-1 w-72 min-w-[240px] max-w-[320px] h-full bg-neutral-900 border-r border-neutral-800 py-4 px-2"
            aria-label="Prompt List Sidebar"
        >
            <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Prompts</span>
                <button
                    className="btn btn-xs btn-success"
                    title="Add new prompt"
                    onClick={onAdd}
                    type="button"
                    aria-label="Add new prompt"
                >
                    +
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {prompts.length === 0 && (
                    <div className="text-xs text-neutral-500 px-2 py-4">No prompts yet.</div>
                )}
                <ul className="flex flex-col gap-1" role="listbox" aria-label="Prompt List">
                    {prompts.map((prompt) => (
                        <EditablePromptListItem
                            key={prompt.id}
                            prompt={prompt}
                            isActive={prompt.id === activePromptId}
                            onSelect={onSelect}
                            onRename={onRename}
                            onDelete={onDelete}
                        />
                    ))}
                </ul>
            </div>
        </nav>
    );
};

type EditablePromptListItemProps = {
    prompt: Prompt;
    isActive: boolean;
    onSelect: (id: string) => void;
    onRename: (id: string, newName: string) => void;
    onDelete: (id: string) => void;
};

const EditablePromptListItem: React.FC<EditablePromptListItemProps> = ({
    prompt,
    isActive,
    onSelect,
    onRename,
    onDelete,
}) => {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(prompt.name || "Untitled");

    // If prompt.name changes externally, update local state
    React.useEffect(() => {
        setName(prompt.name || "Untitled");
    }, [prompt.name]);

    function handleEditStart(e: React.MouseEvent | React.KeyboardEvent) {
        e.stopPropagation();
        setEditing(true);
    }

    function handleEditEnd() {
        setEditing(false);
        if (name.trim() !== prompt.name) {
            onRename(prompt.id, name.trim() || "Untitled");
        }
    }

    function handleEditKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            handleEditEnd();
        } else if (e.key === "Escape") {
            setEditing(false);
            setName(prompt.name || "Untitled");
        }
    }

    // Removed unused handleDelete function definition
    // The onDelete prop is used directly in the button below

    return (
        <li role="option" aria-selected={isActive}>
            <div className="flex items-center group w-full max-w-full">
                <button
                    className={`flex-1 flex items-center w-full px-2 py-1 rounded text-left transition-colors max-w-full min-w-0
                        ${isActive
                            ? "bg-neutral-800 text-blue-400 font-semibold"
                            : "bg-transparent text-neutral-200 hover:bg-neutral-800"
                        }`}
                    onClick={() => onSelect(prompt.id)}
                    tabIndex={0}
                    title={prompt.name || "Untitled"}
                    aria-label={prompt.name || "Untitled"}
                    type="button"
                >
                    {editing ? (
                        <input
                            className="input input-xs w-full bg-neutral-800 text-blue-400 font-semibold px-1 py-0.5 rounded min-w-0"
                            value={name}
                            autoFocus
                            onChange={e => setName(e.target.value)}
                            onBlur={handleEditEnd}
                            onKeyDown={handleEditKeyDown}
                            onClick={e => e.stopPropagation()}
                            onFocus={e => e.currentTarget.select()}
                            maxLength={64}
                        />
                    ) : (
                        <span
                            className="truncate flex-1 cursor-pointer min-w-0"
                            onDoubleClick={handleEditStart}
                            tabIndex={0}
                            onKeyDown={e => {
                                if (e.key === "Enter" || e.key === "F2") handleEditStart(e);
                            }}
                        >
                            {prompt.name || "Untitled"}
                        </span>
                    )}
                </button>
            </div>
        </li>
    );
};

export default SidebarPromptList;
