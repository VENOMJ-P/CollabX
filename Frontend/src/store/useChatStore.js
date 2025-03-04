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
    // const selectedProject = useProjectStore.getState().selectedProject;
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedProject}`,messageData);
      set({messages:[...messages,res.data.data]});
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const selectedProject = useProjectStore.getState().selectedProject;
    if (!selectedProject) return;
    const socket = useAuthStore.getState().socket;
  
    const handleMessage = (message) => {
      if (message.projectId !== selectedProject) return;
      console.log("New message received:", message);
      set((state) => ({ messages: [...state.messages, message] }));
    };
  
    socket.on("newMessage", handleMessage);
  
    return () => {
      socket?.off("newMessage", handleMessage);
    };
  },
  
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  }
  
}));