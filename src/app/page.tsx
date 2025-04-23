"use client";
import React from "react";
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

// Dynamically import LLMSelector
const LLMSelector = dynamic(() => import("./(features)/prompt-editor/components/LLMSelector"), { ssr: false });

// --- Header Component ---
function Header() {
  return (
    <header className="py-4 border-b border-neutral-700 bg-neutral-900 text-center w-full shadow-lg">
      <h1 className="text-3xl font-bold tracking-tight text-white">Prompt Training System</h1>
    </header>
  );
}

// --- Main Content Component (Consumes Context) ---
function MainContent() {
  const {
    prompts,
    setPrompts,
    activePromptId,
    activePrompt,
    handleSelectPrompt,
    handleAddPrompt,
    handleRenamePrompt,
    handleDeletePrompt,
    handleCopyPrompt,
    handleToggleJson,
    handlePromptContentChange,
    handlePromptInstructionsChange,
    llmOptions,
    selectedLLM,
    setSelectedLLM,
    output,
    isLoading,
    error,
    handleRunPrompt,
    history,
    selectedHistory,
    sidePanelOpen,
    historyError,
    clearPromptHistory,
    viewHistoryDetails,
    closeHistoryDetails,
  } = useAppContext();

  // Handler to copy output
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
      <main className="flex flex-1 overflow-hidden bg-neutral-900 w-full">
        
        {/* Sidebar */}
        <aside className="w-72 min-w-[240px] max-w-[320px] bg-neutral-800 flex-shrink-0 flex flex-col shadow-xl z-10 overflow-y-auto">
          <div className="p-4 bg-neutral-900 text-white font-medium">
            <h2 className="text-lg">Prompt Library</h2>
          </div>
          <SidebarPromptList
            prompts={prompts}
            activePromptId={activePromptId || ""}
            onSelect={handleSelectPrompt}
            onAdd={handleAddPrompt}
            onRename={handleRenamePrompt}
            onDelete={handleDeletePrompt}
          />
        </aside>

        {/* Main Area */}
        <section className="flex-1 flex flex-col h-full overflow-hidden px-6 py-6 w-full">
          <div className="flex flex-1 min-h-0 gap-6 w-full">

            {/* Editor Panel */}
            <div className="flex flex-col border border-neutral-700 rounded-lg shadow-xl min-h-0 bg-neutral-800 w-full md:w-1/2 flex-1 min-w-0 overflow-hidden">
              {/* Editor Header */}
              <div className="bg-neutral-900 p-4 border-b border-neutral-700">
                <div className="flex items-center justify-between gap-4 min-w-0 flex-1">
                  <h2 className="text-xl font-medium text-white">Prompt Editor</h2>
                  {activePrompt && (
                    <PromptActions
                      prompt={activePrompt}
                      onRename={(newName) => handleRenamePrompt(activePrompt.id, newName)}
                      onCopy={() => handleCopyPrompt(activePrompt.id)}
                    />
                  )}
                </div>
              </div>
              
              {/* Editor Content */}
              <div className="p-4 flex flex-col flex-1 overflow-hidden">
                {/* Prompt Description */}
                {activePrompt?.description && (
                  <div className="mb-4 mt-0 text-neutral-300 whitespace-pre-line p-3 bg-neutral-700 bg-opacity-30 rounded-md">
                    <h3 className="text-sm font-medium text-neutral-200 mb-1">Description:</h3>
                    <p>{activePrompt.description}</p>
                  </div>
                )}
                
                {/* LLM Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Model Selection</label>
                  <LLMSelector
                    options={llmOptions}
                    selectedId={selectedLLM || ""}
                    onSelect={setSelectedLLM}
                  />
                </div>
                
                {/* Variable Manager */}
                <div className="mb-4">
                  <VariableManager activePrompt={activePrompt} setPrompts={setPrompts} />
                </div>
                
                {/* Instructions Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-300 mb-2" htmlFor="instructions-input">
                    Instructions
                  </label>
                  <textarea
                    id="instructions-input"
                    className="w-full min-h-[60px] max-h-[120px] resize-y border border-neutral-600 rounded-md font-mono text-sm bg-neutral-700 focus:outline-neutral-400 focus:ring-1 focus:ring-neutral-400 p-2 text-white"
                    placeholder="Add extra instructions for the LLM (optional)..."
                    value={activePrompt?.instructions || ''}
                    onChange={e => handlePromptInstructionsChange(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                {/* Prompt Editor */}
                <div className="flex-1 min-h-0 mb-4 border border-neutral-700 rounded-md overflow-hidden">
                  <div className="h-full">
                    <PromptEditor
                      value={activePrompt?.content || ""}
                      onChange={handlePromptContentChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Editor Actions */}
                <div className="flex flex-row items-center justify-between gap-4 pt-2 border-t border-neutral-700">
                  <div className="flex items-center gap-3">
                    <button
                      className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md transition-colors"
                      title="Delete prompt"
                      disabled={!activePrompt}
                      onClick={() => activePrompt && handleDeletePrompt(activePrompt.id)}>
                      Delete
                    </button>
                    
                    {activePrompt && (
                      <label className="flex items-center gap-2 text-neutral-300">
                        <input
                          type="checkbox"
                          checked={activePrompt.isJsonOutput}
                          onChange={() => handleToggleJson(activePrompt.id)}
                          className="form-checkbox h-4 w-4 text-neutral-500 transition duration-150 ease-in-out"
                        />
                        JSON Output
                      </label>
                    )}
                  </div>
                  
                  <PromptRunButton
                    onClick={handleRunPrompt}
                    disabled={isLoading || !activePrompt}
                    loading={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Output Panel */}
            <div className="flex flex-col border border-neutral-700 rounded-lg shadow-xl min-h-0 bg-neutral-800 w-full md:w-1/2 flex-1 min-w-0 overflow-hidden">
              {/* Output Header */}
              <div className="bg-neutral-900 p-4 border-b border-neutral-700">
                <h2 className="text-xl font-medium text-white">Output Results</h2>
              </div>
              
              {/* Output Content */}
              <div className="p-4 flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 mb-4 min-h-0 border border-neutral-700 rounded-md overflow-hidden">
                  <OutputPanel
                    output={output}
                    isLoading={isLoading}
                    isJsonExpected={!!activePrompt?.isJsonOutput}
                    onCopy={handleCopyOutput}
                    error={error}
                  />
                </div>

                {/* History Panel */}
                <div className="border border-neutral-700 rounded-md bg-neutral-700 bg-opacity-30 overflow-hidden">
                  <div className="p-3 bg-neutral-900 flex items-center justify-between">
                    <h3 className="text-white font-medium">Execution History</h3>
                    <div className="flex items-center gap-2">
                      {historyError && <span className="text-neutral-300 text-xs">{historyError}</span>}
                      <button
                        className="px-2 py-1 bg-neutral-600 hover:bg-neutral-500 text-white text-xs rounded transition-colors"
                        title="Clear history"
                        onClick={clearPromptHistory}
                        disabled={history.length === 0}
                        type="button"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-52 overflow-auto">
                    <table className="min-w-full bg-neutral-800 text-neutral-300 text-sm">
                      <thead>
                        <tr className="bg-neutral-700">
                          <th className="px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Prompt</th>
                          <th className="px-3 py-2 text-left">Result</th>
                          <th className="px-3 py-2 text-left">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.length === 0 ? (
                          <tr>
                            <td className="px-3 py-2 text-center text-neutral-400" colSpan={4}>No history yet.</td>
                          </tr>
                        ) : (
                          history.map((h, i) => (
                            <tr
                              key={h.id ?? i}
                              className="cursor-pointer hover:bg-neutral-700 border-t border-neutral-700"
                              onClick={() => viewHistoryDetails(h)}
                            >
                              <td className="px-3 py-2">{i + 1}</td>
                              <td className="px-3 py-2 max-w-xs truncate">{h.prompt}</td>
                              <td className="px-3 py-2 max-w-xs truncate">{h.result}</td>
                              <td className="px-3 py-2">{new Date(h.timestamp).toISOString().replace('T', ' ').substring(0, 19)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
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
  return (
    <AppProvider>
      <div className="min-h-screen bg-neutral-900 flex flex-col w-full">
        <MainContent />
      </div>
    </AppProvider>
  );
}