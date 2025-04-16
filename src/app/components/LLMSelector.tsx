"use client";
import React, { useMemo } from "react";
import Select, { GroupBase, SingleValue } from "react-select";

export type LLMOption = {
    id: string;
    name: string;
    group?: "Reasoning" | "Chat" | "Cost Optimized";
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
// const groupBadgeStyles: CSSProperties = {
//     backgroundColor: "#EBECF0",
//     borderRadius: "2em",
//     color: "#172B4D",
//     display: "inline-block",
//     fontSize: 12,
//     fontWeight: "normal",
//     lineHeight: "1",
//     minWidth: 1,
//     padding: "0.16666666666667em 0.5em",
//     textAlign: "center",
// };

const formatGroupLabel = (data: GroupBase<LLMOption>) => (
    <div style={groupStyles}>
        <span>{data.label}</span>
        {/* <span style={groupBadgeStyles}>{data.options.length}</span> */}
    </div>
);

const LLMSelector: React.FC<LLMSelectorProps> = ({ options, selectedId, onSelect }) => {
    const groupedOptions = useMemo(() => groupLLMOptions(options), [options]);
    const selectedOption = options.find(opt => opt.id === selectedId) || null;

    return (
        <div className="mb-2 flex items-center gap-2 min-w-[200px]">
            <label htmlFor="llm-select" className="text-sm font-medium">
                Model:
            </label>
            <div className="flex-1 min-w-[250px]">
                <Select<LLMOption, false, GroupBase<LLMOption>>
                    inputId="llm-select"
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
                    styles={{
                        control: (base) => ({
                            ...base,
                            maxHeight: "20px",
                            fontSize: "0.875rem",
                        }),
                        menu: (base) => ({
                            ...base,
                            zIndex: 100,
                        }),
                        option: (base) => ({
                            ...base,
                            fontSize: "0.875rem",
                            color: "black",
                        }),
                    }}
                />
            </div>
        </div>
    );
};

export default LLMSelector;
