import React from "react";
import { HistoryEntry, Variable } from "@/app/(features)/prompt-history/types";

type HistoryDetailsProps = {
    historyEntry: HistoryEntry;
    onClose: () => void;
};

export default function HistoryDetails({ historyEntry, onClose }: HistoryDetailsProps) {
    return (
        <div
            className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white dark:bg-neutral-900 shadow-2xl z-50 border-l border-neutral-200 dark:border-neutral-800 transition-all"
            style={{ maxWidth: "100vw", overflowY: "auto" }}
        >
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
                    <h3 className="text-lg font-semibold">History Details</h3>
                    <button className="btn btn-sm btn-outline" onClick={onClose} title="Close">
                        ×
                    </button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="mb-4">
                        <div className="text-xs text-neutral-500 mb-1">Prompt</div>
                        <pre className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 whitespace-pre-wrap break-words">
                            {historyEntry.prompt}
                        </pre>
                    </div>
                    <div className="mb-4">
                        <div className="text-xs text-neutral-500 mb-1">Result</div>
                        <pre className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 whitespace-pre-wrap break-words">
                            {historyEntry.result}
                        </pre>
                    </div>
                    {historyEntry.variables && historyEntry.variables.length > 0 && (
                        <div className="mb-4">
                            <div className="text-xs text-neutral-500 mb-1">Variables Used</div>
                            <table className="min-w-[180px] text-xs border">
                                <thead>
                                    <tr>
                                        <th className="border px-1 py-0.5">Name</th>
                                        <th className="border px-1 py-0.5">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyEntry.variables.map((v: Variable, i: number) => ( // Keep Variable type for map
                                        <tr key={i}>
                                            <td className="border px-1 py-0.5 font-mono">{v.name}</td>
                                            <td className="border px-1 py-0.5 font-mono">{v.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {/* Added Model Display */}
                    {historyEntry.model && (
                        <div className="mb-4">
                            <div className="text-xs text-neutral-500 mb-1">Model Used</div>
                            <div className="font-mono text-sm">{historyEntry.model}</div>
                        </div>
                    )}
                    {/* Added Instructions Display */}
                    {historyEntry.instructions && (
                        <div className="mb-4">
                            <div className="text-xs text-neutral-500 mb-1">Instructions Used</div>
                            <pre className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 whitespace-pre-wrap break-words text-xs">
                                {historyEntry.instructions}
                            </pre>
                        </div>
                    )}
                    {/* Added JSON Output Display */}
                    {historyEntry.isJsonOutput !== undefined && (
                        <div className="mb-4">
                            <div className="text-xs text-neutral-500 mb-1">JSON Output Mode</div>
                            <div className="font-mono text-sm">{historyEntry.isJsonOutput ? 'Enabled' : 'Disabled'}</div>
                        </div>
                    )}
                    <div className="mb-4">
                        <div className="text-xs text-neutral-500 mb-1">Timestamp</div>
                        <div>{new Date(historyEntry.timestamp).toISOString()}</div>
                    </div>
                    {/* Display Full Response if available */}
                    {historyEntry.response && (
                        <div>
                            <div className="text-xs text-neutral-500 mb-1">Full API Response</div>
                            <pre
                                className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 whitespace-pre-wrap break-words text-xs"
                                style={{ maxHeight: 300, overflowY: "auto" }}
                            >
                                {JSON.stringify(historyEntry.response, null, 2)}
                            </pre>
                        </div>
                    )} {/* Closing tag for historyEntry.response check */}
                </div> {/* Closing tag for p-4 content area */}
            </div>
        </div>
    );
}
