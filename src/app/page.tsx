/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import PromptTabs, { Prompt } from "./components/PromptTabs";
import LLMSelector, { LLMOption } from "./components/LLMSelector";
import PromptEditor from "./components/PromptEditor";
import OutputPanel from "./components/OutputPanel";
import PromptRunButton from "./components/PromptRunButton";
import PromptActions from "./components/PromptActions";

const DEFAULT_LLM_OPTIONS: LLMOption[] = [
  { id: "gpt-4.1-mini", name: "GPT-4.1", group: "Chat" },
  { id: "o3-mini", name: "o3", group: "Reasoning" },
];

const DEFAULT_PROMPTS: Prompt[] = [
  {
    id: "ad-hoc",
    name: "Ad-hoc",
    content: `Summarize the content with 3 hot takes biased toward the author and 3 hot takes biased against the author

...paste content here...`,
    isJsonOutput: false,
  },
  {
    id: "null",
    name: "",
    content: "",
    isJsonOutput: false,
  },
  {
    id: "e1-model",
    name: "E1: Model",
    content: "## MODEL\nSelect the LLM model to use for this prompt.",
    isJsonOutput: false,
  },
  {
    id: "e2-purpose",
    name: "E2: Purpose",
    content: "## PURPOSE\nDescribe the main goal of this prompt.",
    isJsonOutput: false,
  },
  {
    id: "e3-variables",
    name: "E3: Variables",
    content: "## VARIABLES\nList and describe dynamic variables (e.g., {{topic}}).",
    isJsonOutput: false,
  },
  {
    id: "e4-examples",
    name: "E4: Examples",
    content: "## EXAMPLES\n### Example 1\nInput: ...\nOutput: ...",
    isJsonOutput: false,
  },
  {
    id: "e5-output",
    name: "E5: Output",
    content: "## OUTPUT\nSpecify the expected output format (e.g., plain text, JSON).",
    isJsonOutput: false,
  },
];

const LOCAL_STORAGE_KEY = "prompt-training-system.prompts";
const LOCAL_STORAGE_ACTIVE_KEY = "prompt-training-system.activePromptId";
const LOCAL_STORAGE_LLM_KEY = "prompt-training-system.selectedLLM";

function loadPrompts(): Prompt[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { }
  return DEFAULT_PROMPTS;
}

function savePrompts(prompts: Prompt[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prompts));
}

function loadActivePromptId(): string | null {
  try {
    return localStorage.getItem(LOCAL_STORAGE_ACTIVE_KEY);
  } catch { }
  return null;
}

function saveActivePromptId(id: string) {
  localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, id);
}

function loadSelectedLLM(): string | null {
  try {
    return localStorage.getItem(LOCAL_STORAGE_LLM_KEY);
  } catch { }
  return null;
}

function saveSelectedLLM(id: string) {
  localStorage.setItem(LOCAL_STORAGE_LLM_KEY, id);
}

function generateId() {
  return "prompt-" + Math.random().toString(36).slice(2, 10);
}

export default function Home() {
  // Prompts state
  const [prompts, setPrompts] = useState<Prompt[]>(DEFAULT_PROMPTS);
  const [activePromptId, setActivePromptId] = useState<string>(DEFAULT_PROMPTS[0].id);
  // LLM state
  const [llmOptions] = useState<LLMOption[]>(DEFAULT_LLM_OPTIONS);
  const [selectedLLM, setSelectedLLM] = useState<string>(DEFAULT_LLM_OPTIONS[0].id);
  // Output state
  const [output, setOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Load from localStorage on mount
  useEffect(() => {
    const loadedPrompts = loadPrompts();
    setPrompts(loadedPrompts);
    const loadedActive = loadActivePromptId();
    if (loadedActive && loadedPrompts.find(p => p.id === loadedActive)) {
      setActivePromptId(loadedActive);
    } else {
      setActivePromptId(loadedPrompts[0]?.id || "");
    }
    const loadedLLM = loadSelectedLLM();
    if (loadedLLM && llmOptions.find(l => l.id === loadedLLM)) {
      setSelectedLLM(loadedLLM);
    }
  }, [llmOptions]);

  // Persist prompts and activePromptId
  useEffect(() => {
    savePrompts(prompts);
  }, [prompts]);
  useEffect(() => {
    saveActivePromptId(activePromptId);
  }, [activePromptId]);
  useEffect(() => {
    saveSelectedLLM(selectedLLM);
  }, [selectedLLM]);

  // Prompt CRUD handlers
  const handleSelectPrompt = (id: string) => {
    setActivePromptId(id);
    setError(undefined);
    setOutput("");
  };

  const handleAddPrompt = () => {
    const newPrompt: Prompt = {
      id: generateId(),
      name: "Untitled Prompt",
      content: "",
      isJsonOutput: false,
    };
    setPrompts((prev) => [...prev, newPrompt]);
    setActivePromptId(newPrompt.id);
  };

  const handleRenamePrompt = (id: string, newName: string) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName } : p))
    );
  };

  const handleDeletePrompt = (id: string) => {
    setPrompts((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const newPrompts = prev.filter((p) => p.id !== id);
      // Select next or previous prompt
      if (id === activePromptId) {
        const next = newPrompts[idx] || newPrompts[idx - 1] || newPrompts[0];
        setActivePromptId(next?.id || "");
      }
      return newPrompts;
    });
  };

  const handleCopyPrompt = (id: string) => {
    const prompt = prompts.find((p) => p.id === id);
    if (prompt) {
      navigator.clipboard.writeText(prompt.content);
    }
  };

  const handleToggleJson = (id: string) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isJsonOutput: !p.isJsonOutput } : p
      )
    );
  };

  // Prompt editor handlers
  const activePrompt = prompts.find((p) => p.id === activePromptId);

  const handlePromptContentChange = (value: string) => {
    if (!activePrompt) return;
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === activePromptId ? { ...p, content: value } : p
      )
    );
  };

  // LLM selection
  const handleSelectLLM = (id: string) => {
    setSelectedLLM(id);
  };

  // Output copy
  const handleCopyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  // Prompt execution (calls server action via API)
  const handleRunPrompt = useCallback(async () => {
    if (!activePrompt) return;
    setIsLoading(true);
    setError(undefined);
    setOutput("");
    if (activePrompt.content.trim() === "") {
      setError("Prompt is empty.");
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/runPrompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activePrompt: activePrompt,
          model: selectedLLM,
          // Optionally pass instructions if you want to support it
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setOutput("");
      } else if (data.output) {
        setOutput(data.output);
        setError(undefined);
      } else {
        setError("No output received from API.");
        setOutput("");
      }
    } catch (err: any) {
      setError(err?.message || "Unknown error");
      setOutput("");
    }
    setIsLoading(false);
  }, [activePrompt, selectedLLM]);

  return (
    <div className="lg:w-[90%] m-auto">
      <header className="py-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Prompt Training System</h1>
      </header>
      <div className="w-auto flex m-auto p-2">
        <PromptTabs
          prompts={prompts}
          activePromptId={activePromptId}
          onSelect={handleSelectPrompt}
          onAdd={handleAddPrompt}
          onRename={handleRenamePrompt}
          onDelete={handleDeletePrompt}
          onCopy={handleCopyPrompt}

        />
      </div>
      <div className="w-full flex flex-col h-auto rounded-2xl overflow-clip">
        <div className="flex flex-1 min-h-0">
          {/* Left Panel */}
          <div className="w-full md:w-1/2 bg-neutral-900 flex flex-col p-4 min-h-0">
            <div className="flex items-center justify-between mb-2 gap-6">
              {activePrompt && (
                <PromptActions
                  prompt={activePrompt}
                  onRename={(newName) => handleRenamePrompt(activePrompt.id, newName)}
                  onCopy={() => handleCopyPrompt(activePrompt.id)}
                  onToggleJson={() => handleToggleJson(activePrompt.id)}
                />
              )}
              <LLMSelector
                options={llmOptions}
                selectedId={selectedLLM}
                onSelect={handleSelectLLM}
              />
            </div>
            <PromptEditor
              value={activePrompt?.content || ""}
              onChange={handlePromptContentChange}
              disabled={isLoading}
            />
            <div className="flex flex-row items-center gap-2 mt-4">
              <button
                className="btn btn-error btn-outline"
                title="Delete prompt"
                disabled={!activePrompt}
                onClick={() => activePrompt && handleDeletePrompt(activePrompt.id)}>
                Eliminar
              </button>
              <PromptRunButton
                onClick={handleRunPrompt}
                disabled={isLoading || !activePrompt}
                loading={isLoading}
              />
            </div>
          </div>
          {/* Right Panel */}
          <div className="w-full md:w-1/2 bg-neutral-50 dark:bg-neutral-950 flex flex-col p-4 min-h-0">
            <OutputPanel
              output={output}
              isLoading={isLoading}
              isJsonExpected={!!activePrompt?.isJsonOutput}
              onCopy={handleCopyOutput}
              error={error}
            />
          </div>
        </div>
      </div>
    </div >
  );
}
