"use client";
import React from "react";

type PromptEditorProps = {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
};

const PromptEditor: React.FC<PromptEditorProps> = ({ value, onChange, disabled }) => {
    return (
        <div className="flex flex-col h-full">
            <textarea
                className="w-full h-64 min-h-[200px] max-h-[400px] resize-y border rounded p-2 font-mono text-sm bg-white dark:bg-neutral-900 focus:outline-blue-400"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder={`Write your prompt here. Use {{variable}} for dynamic variables, ## Section for static sections, and ### Example for examples.`}
                spellCheck={false}
            />
        </div>
    );
};

export default PromptEditor;
