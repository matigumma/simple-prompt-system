/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Prompt } from "../types"; // Import Prompt type

type PromptActionsProps = {
    prompt: Prompt; // Use imported Prompt type
    onRename: (newName: string) => void;
    onCopy?: () => void;
};

const PromptActions: React.FC<PromptActionsProps> = ({
    prompt,
    onRename,
}) => {
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(prompt.name);

    // Update editValue if promptName changes (e.g., tab switch)
    React.useEffect(() => {
        setEditValue(prompt.name);
    }, [prompt.name]);

    const handleRenameSubmit = () => {
        onRename(editValue.trim() || "Untitled Prompt");
        setEditing(false);
    };

    return (
        <div className="flex flex-row items-center gap-2">
            {/* <div className="mb-2 flex items-center gap-2 min-w-[200px]"> */}
            
            {editing ? (
                <input
                    className="input input-ghost w-56"
                    value={editValue}
                    autoFocus
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSubmit();
                        if (e.key === "Escape") setEditing(false);
                    }}
                />
            ) : (
                <>
                    <span className="font-medium text-sm">{prompt.name}</span>
                    <button
                        className="text-xs text-gray-500 hover:text-blue-600"
                        title="Rename"
                        onClick={() => setEditing(true)}
                    >
                        
                    </button>
                </>
            )}
        </div>
    );
};

export default PromptActions;
