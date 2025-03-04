import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useUserPanelStore = create((set, get) => ({
  isShowUserPanel: false,
  userDetails: null,
  isUserLoading: false,

  setIsShowUserPanel: (isShowUserPanel) => set({ isShowUserPanel }),

  fetchUserDetails: async (projectId) => {
    set({ isUserLoading: true });
    try {
      const response = await axiosInstance.get(`/projects/${projectId}`);
      set({ userDetails: response.data.data, isUserLoading: false });
    } catch (error) {
      console.error('Error fetching user details:', error);
      set({ isUserLoading: false });
    }
  },

  closeUserPanel: () => set({ isShowUserPanel: false, userDetails: null })
}));
