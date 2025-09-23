import { create } from "zustand";
import toast from "react-hot-toast";
import { dockerService } from "../lib/dockerService";

export const useCodeEditor = create((set, get) => ({
  files: [],
  openedFiles: [],
  selectedMessage: null,
  isFileLoading: false,
  selectedChat: null,
  showCodeInterface: false,
  isExecuting: false,
  executionOutput: null,
  dockerAvailable: false,

  setSelectedChat: (selectedChat) => {
    if (!selectedChat) {
      console.error("Invalid chat selected");
      return;
    }
    set({ selectedChat });
  },

  setSelectedMessage: (selectedMessage) => set({ selectedMessage }),
  setShowCodeInterface: (showCodeInterface) => set({ showCodeInterface }),

  checkDockerAvailability: async () => {
    const available = await dockerService.checkDockerStatus();
    set({ dockerAvailable: available });
    return available;
  },

  addFile: (file) =>
    set((state) => ({
      openedFiles: [
        ...state.openedFiles.filter((f) => f.filename !== file.filename),
        file,
      ], // Avoid duplicate tabs
    })),

  closeFile: (filename) =>
    set((state) => ({
      openedFiles: state.openedFiles.filter(
        (file) => file.filename !== filename
      ),
    })),

  removeFiles: () => {
    set({ openedFiles: [], executionOutput: null });
  },

  updateFileContent: (filename, newContent) => {
    const { openedFiles, selectedMessage } = get();

    // Update in openedFiles
    set((state) => ({
      openedFiles: openedFiles.map((file) =>
        file.filename === filename ? { ...file, contents: newContent } : file
      ),
      // Also update in the original fileTree if it exists
      selectedMessage:
        selectedMessage &&
        selectedMessage.fileTree &&
        selectedMessage.fileTree[filename]
          ? {
              ...selectedMessage,
              fileTree: {
                ...selectedMessage.fileTree,
                [filename]: {
                  ...selectedMessage.fileTree[filename],
                  file: {
                    ...selectedMessage.fileTree[filename].file,
                    contents: newContent,
                  },
                },
              },
            }
          : selectedMessage,
    }));
  },

  executeCode: async () => {
    const { openedFiles, selectedMessage, dockerAvailable } = get();

    if (!dockerAvailable) {
      const available = await get().checkDockerAvailability();
      if (!available) {
        toast.error("Docker is not available for code execution");
        return;
      }
    }

    if (!openedFiles || openedFiles.length === 0) {
      toast.error("No files to execute");
      return;
    }

    set({ isExecuting: true, executionOutput: null });

    try {
      const result = await dockerService.executeCode(
        openedFiles,
        selectedMessage?.buildCommand,
        selectedMessage?.startCommand
      );

      if (result) {
        set({ executionOutput: result });
        toast.success("Code executed successfully");
      } else {
        toast.error("Code execution failed");
      }
    } catch (error) {
      console.error("Execution error:", error);
      toast.error("Failed to execute code");
    } finally {
      set({ isExecuting: false });
    }
  },

  clearExecutionOutput: () => set({ executionOutput: null }),
}));
