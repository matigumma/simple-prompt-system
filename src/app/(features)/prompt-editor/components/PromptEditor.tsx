"use client";
import React from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/themes/prism.css"; // You can swap for a dark theme if desired

type PromptEditorProps = {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
};

// Custom Prism highlighting for prompt variables and sections
function highlightPrompt(code: string) {
    // Highlight {{variable}}
    let html = Prism.highlight(code, Prism.languages.markup, "markup");
    // Highlight {{variable}} with a custom span
    html = html.replace(/(\{\{\s*[\w-]+\s*\}\})/g, '<span class="token variable">$1</span>');
    // Highlight ## Section headers
    html = html.replace(/^(\s*## .*)$/gm, '<span class="token section">$1</span>');
    // Highlight ### Example
    html = html.replace(/^(\s*### Example.*)$/gm, '<span class="token example">$1</span>');
    return html;
}

export default function PromptEditor({ value, onChange, disabled }: PromptEditorProps) {
    return (
        <div className="flex flex-col h-full">
            <Editor
                value={value}
                onValueChange={onChange}
                highlight={highlightPrompt}
                padding={12}
                textareaId="prompt-editor"
                textareaClassName="w-full h-64 min-h-[200px] max-h-[400px] resize-y border rounded font-mono text-sm bg-white dark:bg-neutral-900 focus:outline-blue-400"
                disabled={disabled}
                placeholder={`Write your prompt here. Use {{variable}} for dynamic variables, ## Section for static sections, and ### Example for examples.`}
                style={{
                    fontFamily: "monospace",
                    fontSize: 14,
                    background: "inherit",
                    minHeight: 200,
                    maxHeight: "100%",
                    borderRadius: 8,
                    overflowY: "scroll",
                }}
                spellCheck={false}
            />
            <style jsx global>{`
                .token.variable {
                    color: #b58900;
                    background: #fdf6e3;
                    border-radius: 3px;
                    padding: 0 2px;
                }
                .dark .token.variable {
                    color: #ffe066;
                    background: #333;
                }
                .token.section {
                    color: #268bd2;
                    font-weight: bold;
                }
                .token.example {
                    color: #6c71c4;
                    font-style: italic;
                }
            `}</style>
        </div>
    );
}
