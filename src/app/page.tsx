/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import PromptTabs, { Prompt as BasePrompt } from "./components/PromptTabs";
import LLMSelector, { LLMOption } from "./components/LLMSelector";
import PromptEditor from "./components/PromptEditor";
import OutputPanel from "./components/OutputPanel";
import PromptRunButton from "./components/PromptRunButton";
import PromptActions from "./components/PromptActions";

// Minimal IndexedDB utility for prompt history
const DB_NAME = "PromptHistoryDB";
const DB_STORE = "history";
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(DB_STORE, { keyPath: "id", autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function addHistory(entry: { promptId: string; prompt: string; result: string; timestamp: number }) {
  const db = await openDB();
  const tx = db.transaction(DB_STORE, "readwrite");
  tx.objectStore(DB_STORE).add(entry);
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function getAllHistory(): Promise<{ id: number; promptId: string; prompt: string; result: string; timestamp: number }[]> {
  const db = await openDB();
  const tx = db.transaction(DB_STORE, "readonly");
  const store = tx.objectStore(DB_STORE);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const DEFAULT_LLM_OPTIONS: LLMOption[] = [
  { id: "gpt-4.1-mini", name: "GPT-4.1", group: "Chat" },
  { id: "o3-mini", name: "o3", group: "Reasoning" },
];

/**
 * DEFAULT_PROMPTS: Expanded with best-practice templates inspired by OpenAI docs and prompt engineering research.
 * Each preset includes a name, description, and content following best practices.
 * You can further extend these with more advanced/educational templates.
 */
type Variable = { name: string; value: string };
type Prompt = BasePrompt & { variables?: Variable[]; llmId?: string };

const DEFAULT_PROMPTS: Prompt[] = [
  // Level 1: Ad-hoc (quick, natural language)
  {
    id: "ad-hoc",
    name: "Ad-hoc (Quick Prompt)",
    content: `Summarize the content with 3 hot takes biased toward the author and 3 hot takes biased against the author

...paste content here...`,
    isJsonOutput: false,
    variables: [],
    llmId: "gpt-4.1-mini",
  },
  // Level 2: Structured prompt (with clear purpose/instructions)
  {
    id: "structured",
    name: "Structured Prompt (Purpose + Instructions)",
    content: `<purpose>
Summarize the given content based on the instructions and example-output
</purpose>

<instructions>
  <instruction>Output in markdown format</instruction>
  <instruction>Summarize into 4 sections: High level summary, Main Points, Sentiment, and 3 hot takes biased toward the author and 3 hot takes biased against the author</instruction>
  <instruction>Write the summary in the same format as the example-output</instruction>
</instructions>

<content>
  ...paste content here...
</content>`,
    isJsonOutput: false,
    variables: [],
    llmId: "gpt-4.1-mini",
  },
  // Level 3: Structured prompt with example output (few-shot)
  {
    id: "few-shot",
    name: "Few-Shot (Structured + Example Output)",
    content: `<purpose>
Summarize the given content based on the instructions and example-output
</purpose>

<instructions>
  <instruction>Output in markdown format</instruction>
  <instruction>Summarize into 4 sections: High level summary, Main Points, Sentiment, and 3 hot takes biased toward the author and 3 hot takes biased against the author</instruction>
  <instruction>Write the summary in the same format as the example-output</instruction>
</instructions>

<example-output>
# Title

## High Level Summary
...

## Main Points
...

## Sentiment
...

## Hot Takes (biased toward the author)
...

## Hot Takes (biased against the author)
...
</example-output>

<content>
  ...paste content here...
</content>`,
    isJsonOutput: false,
    variables: [],
    llmId: "gpt-4.1-mini",
  },
  // Level 4: Dynamic variables (production-ready)
  {
    id: "dynamic-vars",
    name: "Dynamic Variables (Production-ready)",
    content: `<purpose>
Summarize the given content based on the instructions and example-output
</purpose>

<instructions>
  <instruction>Output in markdown format</instruction>
  <instruction>Summarize into 4 sections: High level summary, Main Points, Sentiment, and 3 hot takes biased toward the author and 3 hot takes biased against the author</instruction>
  <instruction>Write the summary in the same format as the example-output</instruction>
</instructions>

<example-output>
# Title

## High Level Summary
...

## Main Points
...

## Sentiment
...

## Hot Takes (biased toward the author)
...

## Hot Takes (biased against the author)
...
</example-output>

<content>
  {{content}}
</content>`,
    isJsonOutput: false,
    variables: [
      { name: "content", value: "" }
    ],
    llmId: "gpt-4.1-mini",
  },
  // OpenAI-style: Identity, Instructions, Examples, Context
  {
    id: "openai-best-practice",
    name: "OpenAI Best Practice (Identity/Instructions/Examples/Context)",
    content: `# Identity
You are a helpful assistant that labels short product reviews as Positive, Negative, or Neutral.

# Instructions
* Only output a single word in your response with no additional formatting or commentary.
* Your response should only be one of the words "Positive", "Negative", or "Neutral" depending on the sentiment of the product review you are given.

# Examples

<product_review id="example-1">
I absolutely love these headphones — sound quality is amazing!
</product_review>
<assistant_response id="example-1">
Positive
</assistant_response>

<product_review id="example-2">
Battery life is okay, but the ear pads feel cheap.
</product_review>
<assistant_response id="example-2">
Neutral
</assistant_response>

<product_review id="example-3">
Terrible customer service, I'll never buy from them again.
</product_review>
<assistant_response id="example-3">
Negative
</assistant_response>

# Context
<product_review>
{{review}}
</product_review>`,
    isJsonOutput: false,
    variables: [
      { name: "review", value: "" }
    ],
    llmId: "gpt-4.1-mini",
  },
  // Chain-of-thought prompt
  {
    id: "chain-of-thought",
    name: "Chain-of-Thought Reasoning",
    content: `You are an expert problem solver. Think step by step to break down the problem and explain your reasoning.

Question: {{question}}

First, think carefully step by step about what documents or information are needed to answer the query. Then, print out the TITLE and ID of each document. Then, format the IDs into a list.

Answer:`,
    isJsonOutput: false,
    variables: [
      { name: "question", value: "" }
    ],
    llmId: "o3-mini",
  },
  // JSON output prompt
  {
    id: "json-output",
    name: "Structured Output (JSON)",
    content: `Summarize the following content and output the result as a JSON object with the following fields:
- "summary": a concise summary of the content
- "main_points": an array of the main points
- "sentiment": "positive", "neutral", or "negative"
- "hot_takes_for": array of 3 hot takes biased toward the author
- "hot_takes_against": array of 3 hot takes biased against the author

Content:
{{content}}

Respond ONLY with valid JSON.`,
    isJsonOutput: true,
    variables: [
      { name: "content", value: "" }
    ],
    llmId: "gpt-4.1-mini",
  },
  // Agentic workflow/system prompt
  {
    id: "agentic-system",
    name: "Agentic Workflow (System Prompt)",
    content: `## PERSISTENCE
You are an agent - keep going until the user's query is completely resolved, before ending your turn and yielding back to the user. Only terminate your turn when you are sure that the problem is solved.

## TOOL CALLING
If you are not sure about file content or codebase structure pertaining to the user's request, use your tools to read files and gather the relevant information: do NOT guess or make up an answer.

## PLANNING
You MUST plan extensively before each function call, and reflect extensively on the outcomes of the previous function calls. DO NOT do this entire process by making function calls only, as this can impair your ability to solve the problem and think insightfully.

## USER QUERY
{{query}}`,
    isJsonOutput: false,
    variables: [
      { name: "query", value: "" }
    ],
    llmId: "o3-mini",
  },
  // Blank template for user customization
  {
    id: "blank",
    name: "Blank",
    content: "",
    isJsonOutput: false,
    variables: [],
    llmId: "gpt-4.1-mini",
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

  // REMOVE: Variables state for interpolation
  // const [variables, setVariables] = useState<{ name: string; value: string }[]>([]);

  // History state
  const [history, setHistory] = useState<{ id: number; promptId: string; prompt: string; result: string; timestamp: number }[]>([]);

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
    // Load history from IndexedDB
    getAllHistory().then(setHistory).catch(() => setHistory([]));
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
    // Set LLM to the prompt's llmId if present
    const prompt = prompts.find((p) => p.id === id);
    if (prompt?.llmId) {
      setSelectedLLM(prompt.llmId);
    }
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
    // Update the active prompt's llmId
    if (activePrompt) {
      setPrompts((prev) =>
        prev.map((p) =>
          p.id === activePrompt.id ? { ...p, llmId: id } : p
        )
      );
    }
  };

  // Output copy
  const handleCopyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  // Helper: interpolate variables in prompt content
  function interpolatePrompt(content: string, vars: { name: string; value: string }[] = []) {
    return content.replace(/{{\s*([\w-]+)\s*}}/g, (_, varName) => {
      const found = vars.find(v => v.name === varName);
      return found ? found.value : `{{${varName}}}`;
    });
  }

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
    // Interpolate variables before sending
    const interpolatedContent = interpolatePrompt(activePrompt.content, activePrompt.variables || []);
    try {
      const res = await fetch("/api/runPrompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activePrompt: { ...activePrompt, content: interpolatedContent },
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
        // Save to IndexedDB history
        try {
          await addHistory({
            promptId: activePrompt.id,
            prompt: interpolatedContent,
            result: data.output,
            timestamp: Date.now(),
          });
          // Reload history after adding
          const all = await getAllHistory();
          setHistory(all);
        } catch { /* ignore history errors */ }
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
            {/* Variable Manager */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-neutral-300">Variables</span>
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() => {
                    if (!activePrompt) return;
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
                {(activePrompt?.variables || []).map((v, i) => (
                  <div key={i} className="flex gap-1 items-center">
                    <input
                      className="input input-xs w-24"
                      placeholder="name"
                      value={v.name}
                      onChange={e => {
                        if (!activePrompt) return;
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
                      title="Variable name"
                    />
                    <span className="text-neutral-400 text-xs px-1">{'='}</span>
                    <input
                      className="input input-xs w-32"
                      placeholder="value"
                      value={v.value}
                      onChange={e => {
                        if (!activePrompt) return;
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
                    <button
                      className="btn btn-xs btn-error"
                      title="Remove"
                      onClick={() => {
                        if (!activePrompt) return;
                        setPrompts(prev =>
                          prev.map(p =>
                            p.id === activePrompt.id
                              ? { ...p, variables: (activePrompt.variables || []).filter((_, idx) => idx !== i) }
                              : p
                          )
                        );
                      }}
                      type="button"
                    >×</button>
                  </div>
                ))}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Use <span className="font-mono bg-neutral-800 px-1 rounded">{'{{variable_name}}'}</span> in your prompt.
              </div>
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
      {/* History Table */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Prompt History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-neutral-200 dark:bg-neutral-800">
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Prompt</th>
                <th className="border px-2 py-1">Result</th>
                <th className="border px-2 py-1">Time</th>
              </tr>
            </thead>
            <tbody>
              {history.filter(h => h.promptId === activePromptId).length === 0 ? (
                <tr>
                  <td className="border px-2 py-1 text-center" colSpan={4}>No history yet.</td>
                </tr>
              ) : (
                history
                  .filter(h => h.promptId === activePromptId)
                  .slice()
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((h, i) => (
                    <tr key={h.id}>
                      <td className="border px-2 py-1">{i + 1}</td>
                      <td className="border px-2 py-1 max-w-xs break-words truncate">{h.prompt}</td>
                      <td className="border px-2 py-1 max-w-xs break-words truncate">{h.result}</td>
                      <td className="border px-2 py-1">{new Date(h.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
}
