import { create } from "zustand";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { axiosInstance } from "../lib/axios.js";
import { useProjectStore } from "./useProjectStore.js";
import { useChatStore } from "./useChatStore.js";

const BASE_URL = "http://localhost:3000/";

export const useCodeEditor = create((set, get) => ({
    files: [],
    selectedFile: null,
    selectedMessage: null,
    isFileLoading: false,
    selectedChat: null,
    showCodeInterface: false,

    setSelectedChat: (selectedChat) => {
        console.log(selectedChat)
        if (!selectedChat) {
            console.error("Invalid chat selected");
            return;
        }
        set({ selectedChat });
    },
    setSelectedMessage: (selectedMessage) => set({ selectedMessage }),
    setShowCodeInterface: (showCodeInterface) => set({ showCodeInterface }),
}));
