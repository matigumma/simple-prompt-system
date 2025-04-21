import React from "react";
import { Prompt, Variable } from "@/app/(features)/prompt-editor/types";

type VariableManagerProps = {
    activePrompt: Prompt | undefined;
    setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>;
};

export default function VariableManager({ activePrompt, setPrompts }: VariableManagerProps) {
    if (!activePrompt) return null;

    return (
        <div className="mb-6 p-4 rounded-lg bg-neutral-950 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs text-neutral-300">Variables</span>
                <button
                    className="btn btn-xs btn-outline"
                    onClick={() => {
                        setPrompts(prev =>
                            prev.map(p =>
                                p.id === activePrompt.id
                                    ? { ...p, variables: [...(p.variables || []), { name: "", value: "" }] }
                                    : p
                            )
                        );
                    }}
                    title="Add variable"
                    type="button"
                >+</button>
            </div>
            <div className="flex flex-col gap-1">
                {(activePrompt?.variables?.length ?? 0) === 0 && (
                    <span className="text-xs text-neutral-500">No variables defined.</span>
                )}
                {(activePrompt?.variables || []).map((v: Variable, i: number, arr: Variable[]) => {
                    const name = v.name.trim();
                    const isDuplicate = name && arr.filter((x: Variable) => x.name.trim() === name).length > 1;
                    const isEmpty = !name;
                    const usageCount = (activePrompt?.content.match(new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}`, "g")) || []).length;
                    const isUnused = name && usageCount === 0;
                    return (
                        <div key={i} className="flex gap-1 items-center">
                            <input
                                className={`input input-xs w-24 ${isDuplicate ? "border-red-500" : ""} ${isEmpty ? "border-yellow-500" : ""}`}
                                placeholder="name"
                                value={v.name}
                                onChange={e => {
                                    const newVars = [...(activePrompt.variables || [])];
                                    newVars[i] = { ...newVars[i], name: e.target.value.replace(/[^a-zA-Z0-9_-]/g, "") };
                                    setPrompts(prev =>
                                        prev.map(p =>
                                            p.id === activePrompt.id
                                                ? { ...p, variables: newVars }
                                                : p
                                        )
                                    );
                                }}
                                title="Variable name (must be unique and non-empty)"
                            />
                            <span className="text-neutral-400 text-xs px-1" title="Equals">=</span>
                            <input
                                className="input input-xs w-32"
                                placeholder="value"
                                value={v.value}
                                onChange={e => {
                                    const newVars = [...(activePrompt.variables || [])];
                                    newVars[i] = { ...newVars[i], value: e.target.value };
                                    setPrompts(prev =>
                                        prev.map(p =>
                                            p.id === activePrompt.id
                                                ? { ...p, variables: newVars }
                                                : p
                                        )
                                    );
                                }}
                                title="Variable value"
                            />
                            <span
                                className={`text-xs ml-1 ${isUnused ? "text-yellow-500" : "text-green-500"}`}
                                title={isUnused ? "This variable is not used in the prompt" : "Usage count"}
                            >
                                {name && (isUnused ? "unused" : `used ${usageCount}x`)}
                            </span>
                            {isDuplicate && (
                                <span className="text-xs text-red-500 ml-1" title="Duplicate variable name">duplicate</span>
                            )}
                            {isEmpty && (
                                <span className="text-xs text-yellow-500 ml-1" title="Variable name required">required</span>
                            )}
                            <button
                                className="btn btn-xs btn-error"
                                title="Remove"
                                onClick={() => {
                                    setPrompts(prev =>
                                        prev.map(p =>
                                            p.id === activePrompt.id
                                                ? { ...p, variables: (activePrompt.variables || []).filter((_: Variable, idx: number) => idx !== i) }
                                                : p
                                        )
                                    );
                                }}
                                type="button"
                            >×</button>
                        </div>
                    );
                })}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
                Use <span className="font-mono bg-neutral-800 px-1 rounded" title="Insert variable">{'{{variable_name}}'}</span> in your prompt.
                <span className="ml-2" title="Variable name rules">Names must be unique and non-empty.</span>
            </div>
        </div>
    );
}
