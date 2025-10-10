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
      set({ messages: res.data.data, isMessagesLoading: false });
    } catch (error) {
      toast.error(error.response.data.message);
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData, selectedProject) => {
    const { messages } = get();
    try {
      set({ isChatLoading: true });
      const res = await axiosInstance.post(
        `/messages/send/${selectedProject}`,
        messageData
      );
      set({
        messages: [...messages, res.data.data],
        // chatData: res.data.data
      });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isChatLoading: false });
    }
  },
  subscribeToMessages: (selectedProject) => {
    if (!selectedProject) {
      console.error("No project selected for subscription");
      return;
    }

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.error("Socket is not initialized");
      return;
    }

    const handleConnect = () => {
      console.log("Socket connected, joining project:", selectedProject);
      socket.emit("joinProject", selectedProject);

      const handleMessage = (message) => {
        console.log(
          "New message received for project:",
          selectedProject,
          message
        );
        set((state) => ({
          messages: [...state.messages, message],
          isMessageLoading: false,
        }));
      };

      socket.on("newMessage", handleMessage);

      socket.on("disconnect", () => {
        console.log("Socket disconnected, cleaning up listeners");
        socket.off("newMessage", handleMessage);
      });

      // Cleanup for unmount or project change
      return () => {
        console.log("Cleaning up subscription for project:", selectedProject);
        socket.off("newMessage", handleMessage);
        socket.emit("leaveProject", selectedProject);
      };
    };

    if (socket.connected) {
      console.log("Socket already connected, subscribing immediately");
      return handleConnect();
    } else {
      console.log(
        "Waiting for socket to connect for project:",
        selectedProject
      );
      socket.connect(); // Force connection attempt
      socket.on("connect", handleConnect);
      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      return () => {
        console.log(
          "Cleaning up connect listener for project:",
          selectedProject
        );
        socket.off("connect", handleConnect);
        socket.off("newMessage");
        socket.emit("leaveProject", selectedProject);
        socket.disconnect();
      };
    }
  },

  unsubscribeFromMessages: (projectId) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      if (projectId) socket.emit("leaveProject", projectId);
      socket.off("newMessage");
    }
  },
  jsonFormatter: (message) => {
    let cleanedText = message?.text || "";

    cleanedText = cleanedText
      .replace(/^```json\n/, "")
      .replace(/\n```\n$/, "")
      .trim();

    let jsonObject = {};
    try {
      jsonObject = JSON.parse(cleanedText);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
    return jsonObject;
  },
}));
