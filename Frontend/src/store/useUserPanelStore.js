import { create } from "zustand";

export const useUserPanelStore = create((set, get) => ({
  showUserPanel:false,
  setShowUserPanel:(showUserPanel)=>set({showUserPanel})
}));