import { create } from "zustand";

// --- Store State ---
interface AppState {
    // Server config
    serverUrl: string;
    setServerUrl: (url: string) => void;

    // Current repo
    selectedRepoPath: string | null;
    setSelectedRepoPath: (path: string | null) => void;

    // Toast / notification
    toast: { message: string; type: "success" | "error" | "info" } | null;
    showToast: (message: string, type?: "success" | "error" | "info") => void;
    clearToast: () => void;

    // UI state
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    serverUrl: "http://localhost:55061",
    setServerUrl: (url) => set({ serverUrl: url }),

    selectedRepoPath: null,
    setSelectedRepoPath: (path) => set({ selectedRepoPath: path }),

    toast: null,
    showToast: (message, type = "info") => {
        set({ toast: { message, type } });
        setTimeout(() => set({ toast: null }), 3500);
    },
    clearToast: () => set({ toast: null }),

    isSidebarCollapsed: false,
    setIsSidebarCollapsed: (v) => set({ isSidebarCollapsed: v }),
}));