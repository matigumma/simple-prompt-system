import { HistoryEntry } from "../types";

const DB_NAME = "PromptHistoryDB";
const DB_STORE = "history";

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        // Check if running in browser environment
        if (typeof window === 'undefined' || !window.indexedDB) {
            console.warn("IndexedDB is not available. History will not be persisted.");
            // Return a dummy object or reject the promise based on desired behavior
            // For now, rejecting to make it clear persistence isn't working
            return reject(new Error("IndexedDB not supported"));
        }
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
            try {
                req.result.createObjectStore(DB_STORE, { keyPath: "id", autoIncrement: true });
            } catch (e) {
                console.error("Error creating object store", e);
                reject(e);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
            console.error("Error opening DB", req.error);
            reject(req.error);
        };
    });
}

export async function addHistory(entry: HistoryEntry): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction(DB_STORE, "readwrite");
        const entryWithVars = {
            ...entry,
            variables: entry.variables && entry.variables.length > 0 ? entry.variables : undefined
        };
        tx.objectStore(DB_STORE).add(entryWithVars);
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => {
                console.error("Error adding history", tx.error);
                reject(tx.error);
            };
        });
    } catch (error) {
        console.error("Failed to add history entry:", error);
        // Decide how to handle the error, e.g., re-throw or return a specific value
        return Promise.reject(error); // Re-throwing for now
    }
}

export async function getAllHistory(): Promise<HistoryEntry[]> {
    try {
        const db = await openDB();
        const tx = db.transaction(DB_STORE, "readonly");
        const store = tx.objectStore(DB_STORE);
        return new Promise((resolve, reject) => {
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result as HistoryEntry[]); // Cast result
            req.onerror = () => {
                console.error("Error getting all history", req.error);
                reject(req.error);
            };
        });
    } catch (error) {
        console.error("Failed to get all history:", error);
        return Promise.reject(error); // Re-throwing for now
    }
}

export async function clearHistory(promptId?: string): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction(DB_STORE, "readwrite");
        const store = tx.objectStore(DB_STORE);

        if (promptId) {
            // Borra solo el historial del promptId dado
            const getAllReq = store.getAll();
            // Wrap the clear logic in a promise to handle errors from getAllReq
            return new Promise((resolveClear, rejectClear) => {
                getAllReq.onsuccess = () => {
                    try {
                        const all = getAllReq.result as HistoryEntry[]; // Cast result
                        all.forEach((entry: HistoryEntry) => { // Use HistoryEntry type
                            if (entry.promptId === promptId && entry.id !== undefined) {
                                store.delete(entry.id);
                            }
                        });
                        // Resolve/reject based on the transaction outcome after deletions are queued
                        tx.oncomplete = () => resolveClear();
                        tx.onerror = () => {
                            console.error("Error clearing history transaction", tx.error);
                            rejectClear(tx.error);
                        };
                    } catch (e) {
                        console.error("Error processing history entries for deletion", e);
                        rejectClear(e); // Reject if processing results fails
                    }
                };
                getAllReq.onerror = () => {
                    console.error("Error getting all history for clearing specific prompt", getAllReq.error);
                    rejectClear(getAllReq.error); // Reject if getting entries fails
                };
            });
        } else {
            // Borra todo el historial
            store.clear();
            // Return a promise based on the transaction outcome
            return new Promise((resolve, reject) => {
                tx.oncomplete = () => resolve();
                tx.onerror = () => {
                    console.error("Error clearing all history transaction", tx.error);
                    reject(tx.error);
                };
            });
        }
    } catch (error) {
        console.error("Failed to clear history:", error);
        return Promise.reject(error); // Re-throwing for now
    }
}
