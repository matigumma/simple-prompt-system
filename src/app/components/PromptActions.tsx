/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";

type PromptActionsProps = {
    prompt: any;
    onRename: (newName: string) => void;
    onCopy: () => void;
    onToggleJson: () => void;
};

const PromptActions: React.FC<PromptActionsProps> = ({
    prompt,
    onRename,
    onCopy,
    onToggleJson,
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
            <label className="fieldset-label">
                JSON
                <input type="checkbox" checked={prompt.isJsonOutput} onChange={onToggleJson} className="toggle" />
            </label>

            {editing ? (
                <input
                    className="w-32 px-1 py-0.5 rounded border text-sm"
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
                    <span className="font-medium text-sm truncate max-w-[120px]">{prompt.name}</span>
                    <button
                        className="text-xs text-gray-500 hover:text-blue-600"
                        title="Rename"
                        onClick={() => setEditing(true)}
                    >
                        ✏️
                    </button>
                </>
            )}

            <button
                className="btn btn-xs btn-soft btn-primary"
                onClick={onCopy}
                title="Copy output"
            >
                📋 Copy
            </button>

        </div>
    );
};

export default PromptActions;
