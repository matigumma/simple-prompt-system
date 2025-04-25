"use client";
import React, { useState } from "react";
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
    <header className="py-3 border-b border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-800 text-center w-full shadow-lg">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          <span className="text-blue-400">Prompt</span> Training System
        </h1>
      </div>
    </header>
  );
}

// --- Main Content Component (Consumes Context) ---
function MainContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
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
      <main className="flex flex-1 overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 w-full h-full">
        
        {/* Sidebar Toggle */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="fixed top-16 left-4 z-20 md:hidden bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {sidebarCollapsed 
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /> 
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            }
          </svg>
        </button>
        
        {/* Sidebar - Prompt Library */}
        <aside className={`${sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'} transition-transform duration-300 absolute md:relative md:translate-x-0 z-10 h-full w-72 min-w-[200px] max-w-[280px] bg-neutral-800 flex-shrink-0 flex flex-col shadow-xl overflow-y-auto overflow-x-hidden`}>
          <div className="p-3 bg-gradient-to-r from-blue-900 to-neutral-800 text-white font-medium">
            <h2 className="text-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Prompt Library
            </h2>
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

        {/* Main Area - 3 Column Layout */}
        <section className="flex-1 flex h-full overflow-hidden">
          {/* Column 1 - Prompt Editor */}
          <div className="flex flex-col w-1/3 min-w-0 border-r border-neutral-700 p-3">
            <div className="bg-neutral-800 p-3 border-b border-neutral-700 rounded-t-md mb-3">
              <div className="flex items-center justify-between gap-2 min-w-0 flex-1">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Prompt Editor
                </h2>
                {activePrompt && (
                  <PromptActions
                    prompt={activePrompt}
                    onRename={(newName) => handleRenamePrompt(activePrompt.id, newName)}
                    onCopy={() => handleCopyPrompt(activePrompt.id)}
                  />
                )}
              </div>
            </div>
            
            {/* LLM Selector */}
            <div className="mb-3">
              <label className=" text-sm font-medium text-neutral-300 mb-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Model Selection
              </label>
              <LLMSelector
                options={llmOptions}
                selectedId={selectedLLM || ""}
                onSelect={setSelectedLLM}
              />
            </div>
            
            {/* Editor Box */}
            <div className="flex-1 min-h-0 border border-neutral-700 rounded-md overflow-hidden shadow-inner bg-neutral-850 mb-3">
              <div className="h-full overflow-auto">
                <PromptEditor
                  value={activePrompt?.content || ""}
                  onChange={handlePromptContentChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            
          </div>
          
          {/* Column 2 - Instructions & Controls */}
          <div className="flex flex-col w-1/3 min-w-0  p-3">
            <div className="bg-neutral-800 p-3 border-b border-neutral-700 rounded-t-md mb-3">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Prompt Settings
              </h2>
            </div>
            {/* Prompt Description */}
            {activePrompt?.description && (
              <div className="mb-3 text-neutral-300 whitespace-pre-line p-2 bg-neutral-700 bg-opacity-30 rounded-md border border-neutral-600 shadow-inner">
                <h3 className="text-sm font-medium text-neutral-200 mb-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Description:
                </h3>
                <p className="text-sm">{activePrompt.description}</p>
              </div>
            )}
            
            {/* Variable Manager */}
            <div className="mb-3">
              <h3 className="block text-sm font-medium text-neutral-300 mb-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                Variables
              </h3>
              <div className="border border-neutral-700 rounded-md p-2 bg-neutral-800 shadow-inner mb-3">
                <VariableManager activePrompt={activePrompt} setPrompts={setPrompts} />
              </div>
            </div>
            
            {/* Instructions Input */}
            <div className="mb-3 flex-1 overflow-hidden flex flex-col">
              <label className="block text-sm font-medium text-neutral-300 mb-1 flex items-center gap-1" htmlFor="instructions-input">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Instructions
              </label>
              <div className="flex-1 flex flex-col min-h-0">
                <textarea
                  id="instructions-input"
                  className="w-full flex-1 resize-none border border-neutral-600 rounded-md font-mono text-sm bg-neutral-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 p-2 text-white transition-colors overflow-auto"
                  placeholder="Add extra instructions for the LLM (optional)..."
                  value={activePrompt?.instructions || ''}
                  onChange={e => handlePromptInstructionsChange(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="pt-3 mt-auto border-t border-neutral-700">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 bg-red-900 hover:bg-red-800 text-white rounded-md transition-colors shadow-md flex items-center gap-1 text-sm"
                    title="Delete prompt"
                    disabled={!activePrompt}
                    onClick={() => activePrompt && handleDeletePrompt(activePrompt.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                  
                  {activePrompt && (
                    <label className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={activePrompt.isJsonOutput}
                        onChange={() => handleToggleJson(activePrompt.id)}
                        className="form-checkbox h-4 w-4 text-green-500 rounded transition duration-150 ease-in-out focus:ring-green-500 border-neutral-600"
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
          
          {/* Column 3 - Output Results */}
          <div className="flex flex-col w-1/3 min-w-0 p-3">
            <div className="bg-neutral-800 p-3 border-b border-neutral-700 rounded-t-md mb-3">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Output Results
              </h2>
            </div>
            
            {/* Output Display */}
            <div className="flex-1 min-h-0 border border-neutral-700 rounded-md overflow-hidden shadow-inner mb-3">
              <OutputPanel
                output={output}
                isLoading={isLoading}
                isJsonExpected={!!activePrompt?.isJsonOutput}
                onCopy={handleCopyOutput}
                error={error}
              />
            </div>

            {/* History Panel */}
            <div className="border border-neutral-700 rounded-md bg-neutral-700 bg-opacity-30 overflow-hidden shadow">
              <div className="p-2 bg-gradient-to-r from-neutral-800 to-neutral-900 flex items-center justify-between">
                <h3 className="text-sm font-medium text-white flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Execution History
                </h3>
                <div className="flex items-center gap-2">
                  {historyError && <span className="text-red-400 text-xs">{historyError}</span>}
                  <button
                    className="px-2 py-1 bg-red-900 hover:bg-red-800 text-white text-xs rounded transition-colors shadow flex items-center gap-1"
                    title="Clear history"
                    onClick={clearPromptHistory}
                    disabled={history.length === 0}
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear
                  </button>
                </div>
              </div>
              
              <div className="max-h-52 overflow-auto">
                <table className="min-w-full bg-neutral-800 text-neutral-300 text-sm">
                  <thead>
                    <tr className="bg-neutral-700 sticky top-0">
                      <th className="px-2 py-1 text-left">#</th>
                      <th className="px-2 py-1 text-left">Prompt</th>
                      <th className="px-2 py-1 text-left">Result</th>
                      <th className="px-2 py-1 text-left">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td className="px-3 py-6 text-center text-neutral-400" colSpan={4}>
                          <div className="flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>No history yet.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      history.map((h, i) => (
                        <tr
                          key={h.id ?? i}
                          className="cursor-pointer hover:bg-neutral-700 border-t border-neutral-700 transition-colors"
                          onClick={() => viewHistoryDetails(h)}
                        >
                          <td className="px-2 py-1 text-purple-400">{i + 1}</td>
                          <td className="px-2 py-1 max-w-xs truncate">{h.prompt}</td>
                          <td className="px-2 py-1 max-w-xs truncate">{h.result}</td>
                          <td className="px-2 py-1 text-neutral-400 text-xs">{new Date(h.timestamp).toISOString().replace('T', ' ').substring(0, 19)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-950 to-black flex flex-col w-full">
        <MainContent />
      </div>
    </AppProvider>
  );
}