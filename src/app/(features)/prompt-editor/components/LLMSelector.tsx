"use client";
import React, { useMemo } from "react";
import Select, { GroupBase, SingleValue, components } from "react-select";
import { LLMOption } from "../types"; // Updated import

// Simple icon mapping for known models
const modelIcons: Record<string, React.ReactNode> = {
    "gpt-4.1-mini": (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#6366f1" />
            <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">4</text>
        </svg>
    ),
    "o3-mini": (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="4" fill="#10b981" />
            <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">O3</text>
        </svg>
    ),
};

const modelDescriptions: Record<string, string> = {
    "gpt-4.1-mini": "OpenAI GPT-4.1 (Chat, general purpose)",
    "o3-mini": "Ollama O3 (Reasoning, open source)",
};

type LLMSelectorProps = {
    options: LLMOption[];
    selectedId: string;
    onSelect: (id: string) => void;
};

const groupLLMOptions = (options: LLMOption[]) => {
    const groupMap: Record<string, LLMOption[]> = {};
    options.forEach(opt => {
        const group = opt.group || "Other";
        if (!groupMap[group]) groupMap[group] = [];
        groupMap[group].push(opt);
    });
    return Object.entries(groupMap).map(([label, opts]) => ({
        label,
        options: opts,
    }));
};

const groupStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
};

const formatGroupLabel = (data: GroupBase<LLMOption>) => (
    <div style={groupStyles}>
        <span>{data.label}</span>
    </div>
);

// Custom Option with icon and tooltip
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomOption = (props: any) => {
    const { data } = props;
    return (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Ignoring complex props type from react-select
        <components.Option {...props}>
            <span className="flex items-center gap-2" title={modelDescriptions[data.id] || data.name}>
                {modelIcons[data.id] || null}
                <span>{data.name}</span>
            </span>
        </components.Option>
    );
};

// Custom SingleValue with icon
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomSingleValue = (props: any) => {
    const { data } = props;
    return (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Ignoring complex props type from react-select
        <components.SingleValue {...props}>
            <span className="flex items-center gap-2">
                {modelIcons[data.id] || null}
                <span>{data.name}</span>
            </span>
        </components.SingleValue>
    );
};

const LLMSelector: React.FC<LLMSelectorProps> = ({ options, selectedId, onSelect }) => {
    const groupedOptions = useMemo(() => groupLLMOptions(options), [options]);
    const selectedOption = options.find(opt => opt.id === selectedId) || null;

    return (
        <div className="mb-2 flex items-center gap-2 min-w-[200px]">
            <label htmlFor="llm-select" className="text-sm font-bold">
                Model:
            </label>
            <div className="flex-1 min-w-[250px]">
                <Select<LLMOption, false, GroupBase<LLMOption>>
                    inputId="llm-select"
                    instanceId="llm-select"
                    classNamePrefix="llm-select"
                    options={groupedOptions}
                    value={selectedOption}
                    getOptionLabel={opt => opt.name}
                    getOptionValue={opt => opt.id}
                    onChange={(option: SingleValue<LLMOption>) => {
                        if (option) onSelect(option.id);
                    }}
                    formatGroupLabel={formatGroupLabel}
                    isSearchable={false}
                    components={{
                        Option: CustomOption,
                        SingleValue: CustomSingleValue,
                    }}
                    styles={{
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        control: (base: any, state: any) => ({
                            ...base,
                            maxHeight: "32px",
                            fontSize: "0.95rem",
                            background: state.isFocused ? "#f3f4f6" : "inherit",
                            borderColor: state.isFocused ? "#6366f1" : base.borderColor,
                            boxShadow: state.isFocused ? "0 0 0 1px #6366f1" : base.boxShadow,
                        }),
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        menu: (base: any) => ({
                            ...base,
                            zIndex: 100,
                            background: "#fff",
                        }),
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        option: (base: any, state: any) => ({
                            ...base,
                            fontSize: "0.95rem",
                            color: state.isSelected ? "#fff" : "#111",
                            background: state.isSelected ? "#6366f1" : state.isFocused ? "#e0e7ff" : "#fff",
                        }),
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        singleValue: (base: any) => ({
                            ...base,
                            color: "#111",
                        }),
                        // Dark mode overrides
                        ...(typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
                            ? {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                control: (base: any, state: any) => ({
                                    ...base,
                                    background: state.isFocused ? "#22223b" : "#18181b",
                                    borderColor: state.isFocused ? "#6366f1" : base.borderColor,
                                    color: "#fff",
                                }),
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                menu: (base: any) => ({
                                    ...base,
                                    background: "#18181b",
                                }),
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                option: (base: any, state: any) => ({
                                    ...base,
                                    color: state.isSelected ? "#fff" : "#e0e7ef",
                                    background: state.isSelected ? "#6366f1" : state.isFocused ? "#23234a" : "#18181b",
                                }),
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                singleValue: (base: any) => ({
                                    ...base,
                                    color: "#fff",
                                }),
                            }
                            : {}),
                    }}
                />
            </div>
        </div>
    );
};

export default LLMSelector;
