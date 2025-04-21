import { useState, useEffect, useCallback } from 'react';
import { HistoryEntry } from '../types';
import { getAllHistory as dbGetAllHistory, clearHistory as dbClearHistory, addHistory as dbAddHistory } from '../lib/historyDB';

export function useHistory(activePromptId: string | undefined) {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [selectedHistory, setSelectedHistory] = useState<HistoryEntry | null>(null);
    const [sidePanelOpen, setSidePanelOpen] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);

    const loadHistory = useCallback(async () => {
        try {
            setHistoryError(null);
            const allHistory = await dbGetAllHistory();
            setHistory(allHistory);
        } catch (error) {
            console.error("Failed to load history:", error);
            setHistoryError("Failed to load history.");
            setHistory([]); // Reset history on error
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]); // Load history on mount

    const addHistoryEntry = useCallback(async (entry: Omit<HistoryEntry, 'id'>) => {
        try {
            setHistoryError(null);
            await dbAddHistory(entry);
            await loadHistory(); // Reload history after adding
        } catch (error) {
            console.error("Failed to add history entry:", error);
            setHistoryError("Failed to save history entry.");
        }
    }, [loadHistory]);

    const clearPromptHistory = useCallback(async () => {
        if (!activePromptId) return;
        try {
            setHistoryError(null);
            await dbClearHistory(activePromptId);
            await loadHistory(); // Reload history after clearing
        } catch (error) {
            console.error("Failed to clear history:", error);
            setHistoryError("Failed to clear history.");
        }
    }, [activePromptId, loadHistory]);

    const viewHistoryDetails = useCallback((entry: HistoryEntry) => {
        setSelectedHistory(entry);
        setSidePanelOpen(true);
    }, []);

    const closeHistoryDetails = useCallback(() => {
        setSidePanelOpen(false);
        setSelectedHistory(null); // Clear selection when closing
    }, []);

    // Filtered history for the active prompt
    const activePromptHistory = history.filter(h => h.promptId === activePromptId)
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp);

    return {
        history: activePromptHistory, // Provide filtered history
        selectedHistory,
        sidePanelOpen,
        historyError,
        loadHistory,
        addHistoryEntry,
        clearPromptHistory,
        viewHistoryDetails,
        closeHistoryDetails,
    };
}
