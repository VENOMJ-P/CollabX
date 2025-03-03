import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useProjectStore } from "./useProjectStore";

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
      console.log(projectId)
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
      console.log(selectedProject,messages)
      const res = await axiosInstance.post(`/messages/send/${selectedProject}`,messageData);
      console.log("this",res.data.data);
      set({messages:[...messages,res.data.data]});
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }
}));