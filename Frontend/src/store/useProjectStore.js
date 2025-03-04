import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useUserPanelStore } from "./useUserPanelStore.js";

export const useProjectStore = create((set, get) => ({
  projects: [],
  users:[],
  selectedProject:null,
  isCreatingProject: false,
  isProjectLoading:false,
  isUserLoading:false,
  isAddingCollaborators: false,

  fetchProjectsUser:async(projectId)=>{
    set({isUserLoading:true});
    try {
      const res = await axiosInstance.get(`/projects/${projectId}`);
      console.log("project User",res.data)
      set({ users: res.data });
    } catch (error) {
      toast.error("Failed to fetch projects");
    }finally{
        set({isUserLoading:false})
    }
  },

  fetchProjects: async () => {
    set({isProjectLoading:true});
    try {
      const res = await axiosInstance.get("/projects/all");
      console.log(res.data.data)
      set({ projects: res.data.data });
    } catch (error) {
      toast.error("Failed to fetch projects");
    }finally{
        set({isProjectLoading:false})
    }
  },

  createProject: async (projectData) => {
    set({ isCreatingProject: true });
    try {
      const res = await axiosInstance.post("/projects/create", projectData);
      await get().fetchProjects();
      set((state) => ({ projects: [...state.projects, res.data] }));
      toast.success("Project created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
    } finally {
      set({ isCreatingProject: false });
    }
  },

  setSelectedProject:(selectedProject)=>set({selectedProject}),

  addCollaborators: async (projectId, emails) => {
    set({ isAddingCollaborators: true });
    try {
      const response = await axiosInstance.put(`/projects/add-users`, {
        projectId: projectId,
        emails: emails
      });
      // await get().fetchProjectsUser(projectId);
      await useUserPanelStore.getState().fetchUserDetails(projectId)
      toast.success("Collaborators added successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add collaborators");
      throw error;
    } finally {
      set({ isAddingCollaborators: false });
    }
  }
}));
