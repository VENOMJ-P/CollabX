import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useProjectStore } from "./useProjectStore";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (projectId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${projectId}`);
      set({ messages: res.data.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async(messageData,selectedProject)=>{
    const { messages } = get();
    try {
      set({ isChatLoading: true });
      const res = await axiosInstance.post(`/messages/send/${selectedProject}`,messageData);
      set({
        messages:[...messages,res.data.data],
        // chatData: res.data.data
      });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isChatLoading: false });
    }
  },

  subscribeToMessages: (selectedProject) => {
    if (!selectedProject) return;
    
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.error("Socket is not connected");
      return;
    }

    const handleMessage = (message) => {
      console.log("New message received: ", message);
      set((state) => ({ messages: [...state.messages, message] }));
    };

    socket.emit("joinProject", selectedProject._id);
    socket.on("newMessage", handleMessage);

    return () => {
      socket.off("newMessage", handleMessage);
    };
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("leaveProject");
      socket.off("newMessage");
    }
  },
  jsonFormatter: (message)=> {
    let cleanedText = message?.text || "";

    cleanedText = cleanedText
        .replace(/^```json\n/, '')
        .replace(/\n```\n$/, '')
        .trim();

    let jsonObject = {};
    try {
        jsonObject = JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error parsing JSON:", error);
    }
    return jsonObject;
}
  
}));