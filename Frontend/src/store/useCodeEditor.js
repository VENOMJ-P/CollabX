import { create } from "zustand";
import toast from "react-hot-toast";
import { WebContainer } from "@webcontainer/api";

export const useCodeEditor = create((set, get) => ({
    files: [],
    openedFiles: [],
    selectedMessage: null,
    isFileLoading: false,
    selectedChat: null,
    showCodeInterface: false,
    webContainer: null, // Store WebContainer instance

    setSelectedChat: (selectedChat) => {
        if (!selectedChat) {
            console.error("Invalid chat selected");
            return;
        }
        set({ selectedChat });
    },
    setSelectedMessage: (selectedMessage) => set({ selectedMessage }),
    setShowCodeInterface: (showCodeInterface) => set({ showCodeInterface }),

    initWebContainer: async () => {
        if (!get().webContainer) {
            try {
                const instance = await WebContainer.boot();
                console.log("Successfully setup webcontainer")
                set({ webContainer: instance });
            } catch (error) {
                toast.error("Failed to initialize WebContainer");
                console.error("WebContainer error:", error);
            }
        }
    },

    addFile: (file) => 
        set((state) => ({
            openedFiles: [...state.openedFiles.filter(f => f.filename !== file.filename), file], // Avoid duplicate tabs
        })),
    closeFile: (filename) => 
        set((state) => ({
            openedFiles: state.openedFiles.filter((file) => file.filename !== filename),
        })),
    removeFiles:()=>{
        set({openedFiles:[]})
    }
}));
