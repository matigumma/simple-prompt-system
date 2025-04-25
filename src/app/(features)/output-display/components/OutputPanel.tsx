"use client";
import React from "react";
import ReactMarkdown from "react-markdown";

type OutputPanelProps = {
    output: string;
    isLoading: boolean;
    isJsonExpected: boolean;
    onCopy: () => void;
    error?: string;
};

function tryFormatJson(output: string): { formatted: string | null, error: string | null } {
    try {
        const obj = JSON.parse(output);
        return { formatted: JSON.stringify(obj, null, 2), error: null };
    } catch (e) {
        return { formatted: null, error: "Invalid JSON" + e };
    }
}

const OutputPanel: React.FC<OutputPanelProps> = ({
    output,
    isLoading,
    isJsonExpected,
    onCopy,
    error,
}) => {
    let content;

    if (isJsonExpected && output) {
        const { formatted, error: jsonErr } = tryFormatJson(output);
        if (formatted) {
            content = (
                <pre className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 text-xs overflow-x-auto text-green-700 dark:text-green-300">
                    {formatted}
                </pre>
            );
        } else {
            content = (
                <div>
                    <pre className="bg-neutral-100 dark:bg-neutral-800 rounded p-4 text-xs overflow-x-auto text-red-700 dark:text-red-300">
                        {output}
                    </pre>
                    <div className="text-xs text-red-600 mt-1">{jsonErr}</div>
                </div>
            );
        }
    } else if (output) {
        content = (
            <div className="h-full p-4 prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{output}</ReactMarkdown>
            </div>
        );
    } else {
        content = (
            <div className="text-neutral-400 text-sm italic p-4">
                No output yet.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2 p-4">
                <span className="font-semibold text-sm">Output</span>
                <button
                    className="btn btn-xs btn-outline"
                    onClick={onCopy}
                    disabled={!output}
                    title="Copy output"
                    type="button"
                >
                    📋 Copy
                </button>
            </div>
            <hr/>
            <div className="flex-1 overflow-auto min-h-[120px] ">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-blue-500">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                        </svg>
                        Loading...
                    </div>
                ) : (
                    content
                )}
                {error && (
                    <div className="text-xs text-red-600 mt-2">{error}</div>
                )}
            </div>
        </div>
    );
};

export default OutputPanel;
