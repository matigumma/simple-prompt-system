"use client";
import React from "react"; // Removed useState, useEffect
import dynamic from "next/dynamic";

// Import Context and Provider
import { AppProvider, useAppContext } from './(shared)/context/AppContext';

// Import Feature Components
import SidebarPromptList from './(features)/prompt-list/components/SidebarPromptList';
import PromptActions from './(features)/prompt-editor/components/PromptActions';
import PromptEditor from './(features)/prompt-editor/components/PromptEditor';
import VariableManager from './(features)/prompt-editor/components/VariableManager';
import PromptRunButton from './(features)/prompt-editor/components/PromptRunButton';
import OutputPanel from './(features)/output-display/components/OutputPanel';
import HistoryDetails from './(features)/prompt-history/components/HistoryDetails';
// Removed LLMOption import as it's not directly used here

// Dynamically import LLMSelector
const LLMSelector = dynamic(() => import("./(features)/prompt-editor/components/LLMSelector"), { ssr: false });


// --- Header Component (can be moved to shared/components) ---
function Header() {
  return (
    <header className="py-3 border-b border-neutral-800 bg-neutral-950 text-center w-full">
      <h1 className="text-2xl font-bold tracking-tight text-white">Prompt Training System</h1>
    </header>
  );
}

// --- Main Content Component (Consumes Context) ---
function MainContent() {
  const {
    // Prompts state/handlers
    prompts,
    setPrompts, // Needed for VariableManager
    activePromptId,
    activePrompt,
    handleSelectPrompt,
    handleAddPrompt,
    handleRenamePrompt,
    handleDeletePrompt,
    handleCopyPrompt,
    handleToggleJson,
    handlePromptContentChange,
    handlePromptInstructionsChange, // Get the new handler
    // LLM state/handlers
    llmOptions,
    selectedLLM,
    setSelectedLLM, // Use the handler from context
    // Execution state/handlers
    output,
    isLoading,
    error,
    // instructions, // Remove local state reference
    // setInstructions, // Remove local state reference
    handleRunPrompt,
    // History state/handlers
    history,
    selectedHistory,
    sidePanelOpen,
    historyError,
    clearPromptHistory,
    viewHistoryDetails,
    closeHistoryDetails,
  } = useAppContext();

  // Handler to copy output (kept here as it only uses context state)
  const handleCopyOutput = () => {
    if (output && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(output).catch(err => {
        console.error("Failed to copy output:", err);
      });
    }
  };


  return (
    <>
      <Header />
      <main className="flex flex-1 overflow-hidden bg-neutral-950 w-full">
        {/* Sidebar */}
        <aside className="w-72 min-w-[240px] max-w-[320px] bg-neutral-900 border-r border-neutral-800 flex-shrink-0 flex flex-col shadow-lg z-10">
          <SidebarPromptList
            prompts={prompts}
            activePromptId={activePromptId || ""} // Pass default empty string
            onSelect={handleSelectPrompt}
            onAdd={handleAddPrompt}
            onRename={handleRenamePrompt}
            onDelete={handleDeletePrompt}
          // onCopy={handleCopyPrompt} // Removed prop
          />
        </aside>

        {/* Main Area */}
        <section className="flex-1 flex flex-col h-full overflow-hidden px-8 py-8 w-full">
          <div className="flex flex-1 min-h-0 gap-8 w-full">
            {/* Editor Panel */}
            <div className="flex flex-col p-6 border border-neutral-800 rounded-xl shadow-lg min-h-0 bg-neutral-900 w-full md:w-1/2 flex-1 min-w-0">
              <div className="flex flex-col items-start  mb-6 gap-4 min-w-0">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {activePrompt && (
                    <PromptActions
                      prompt={activePrompt}
                      onRename={(newName) => handleRenamePrompt(activePrompt.id, newName)}
                      onCopy={() => handleCopyPrompt(activePrompt.id)}
                    />
                  )}
                </div>
                <div className="flex-shrink-0">
                  <LLMSelector
                    options={llmOptions}
                    selectedId={selectedLLM || ""} // Pass default empty string
                    onSelect={setSelectedLLM} // Use context setter directly
                  />
                </div>
              </div>
              {/* Pass setPrompts from context to VariableManager */}
              <VariableManager activePrompt={activePrompt} setPrompts={setPrompts} />
              <div className="mb-4">
                <label className="block text-xs font-semibold text-neutral-300 mb-1" htmlFor="instructions-input">
                  Instructions (optional)
                </label>
                <textarea
                  id="instructions-input"
                  className="input input-xs w-full min-h-[40px] max-h-[120px] resize-y border rounded font-mono text-xs bg-white dark:bg-neutral-900 focus:outline-blue-400"
                  placeholder="Add extra instructions for the LLM (optional)..."
                  value={activePrompt?.instructions || ''} // Use instructions from active prompt
                  onChange={e => handlePromptInstructionsChange(e.target.value)} // Use the context handler
                  disabled={isLoading}
                />
              </div>
              <div className="mb-6 flex-1 flex flex-col min-h-0">
                <div className="flex-1 min-h-0">
                  <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <div style={{ flex: 1, minHeight: 0, maxHeight: "100%", overflow: "auto" }}>
                      <PromptEditor
                        value={activePrompt?.content || ""}
                        onChange={handlePromptContentChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center gap-4 mt-4">
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
                {activePrompt && (
                  <label className={`fieldset-label flex items-center gap-1 ${activePrompt.isJsonOutput ? "text-green-500" : ""}`}>
                    <input
                      type="checkbox"
                      checked={activePrompt.isJsonOutput}
                      onChange={() => handleToggleJson(activePrompt.id)}
                      className="toggle"
                    />
                    JSON
                  </label>
                )}
              </div>
            </div>

            {/* Output Panel */}
            <div className="flex flex-col p-6 border border-neutral-800 rounded-xl shadow-lg min-h-0 bg-neutral-950 w-full md:w-1/2 flex-1 min-w-0">
              <OutputPanel
                output={output}
                isLoading={isLoading}
                isJsonExpected={!!activePrompt?.isJsonOutput}
                onCopy={handleCopyOutput}
                error={error}
              />
            </div>
          </div>

          {/* History Panel */}
          <div className="mt-8">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-6 overflow-scroll" style={{ maxHeight: 180 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Prompt History</h2>
                {historyError && <span className="text-red-500 text-xs ml-2">{historyError}</span>}
                <button
                  className="btn btn-xs btn-outline btn-error"
                  title="Limpiar historial"
                  onClick={clearPromptHistory}
                  disabled={history.length === 0}
                  type="button"
                >
                  Limpiar historial
                </button>
              </div>
              <table className="min-w-full border text-sm bg-neutral-950 text-white rounded">
                <thead>
                  <tr className="bg-neutral-800">
                    <th className="border px-2 py-1">#</th>
                    <th className="border px-2 py-1">Prompt</th>
                    <th className="border px-2 py-1">Result</th>
                    <th className="border px-2 py-1">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td className="border px-2 py-1 text-center" colSpan={4}>No history yet.</td>
                    </tr>
                  ) : (
                    history.map((h, i) => (
                      <tr
                        key={h.id ?? i}
                        className="cursor-pointer hover:bg-neutral-800"
                        onClick={() => viewHistoryDetails(h)}
                      >
                        <td className="border px-2 py-1">{i + 1}</td>
                        <td className="border px-2 py-1 max-w-xs break-words truncate">{h.prompt}</td>
                        <td className="border px-2 py-1 max-w-xs break-words truncate">{h.result}</td>
                        <td className="border px-2 py-1">{new Date(h.timestamp).toISOString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* History Details Side Panel */}
      {sidePanelOpen && selectedHistory && (
        <HistoryDetails
          historyEntry={selectedHistory}
          onClose={closeHistoryDetails}
        />
      )}
    </>
  );
}


// --- App Component (Sets up Provider) ---
export default function Home() {
  // Simplified: Just render the Provider wrapping the MainContent
  return (
    <AppProvider>
      <div className="min-h-screen bg-neutral-950 flex flex-col w-full">
        <MainContent />
      </div>
    </AppProvider>
  );
}
