import { create } from "zustand";
import toast from "react-hot-toast"
import {io} from "socket.io-client"
import { axiosInstance } from "../lib/axios.js";
import { useProjectStore } from "./useProjectStore.js";
import { useChatStore } from "./useChatStore.js";

const BASE_URL="http://localhost:3000/"

export const useAuthStore = create((set,get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  socket:null,
  onlineUsers:[],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/users/check");
      set({ authUser: res.data});
      get().connectSocket();
    } catch (error) {
      console.log(error);
      set({authUser:null});
    }finally{
      set({ isCheckingAuth: false });
    }
  },

  signup:async(data) => {
    set({isSigningUp:true});
    try {
      const res=await axiosInstance.post("/users/signup",data);
      set({authUser:res.data});
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message)
    } finally{
      set({isSigningUp:false});
    }
  },

  logout: async()=>{
    try {
      await axiosInstance.post("/users/logout");
      set({authUser:null});
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  login:async(data)=>{
    set({isLoggingIn:true});
    try {
      const res=await axiosInstance.post("/users/login",data);
      set({authUser:res.data});
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message)
    } finally{
      set({isLoggingIn:false});
    }
  },

  updateProfile:async(data)=>{
    set({isUpdatingProfile:true});
    try {
      const res=await axiosInstance.put("/users/update-profile",data);
      set({authUser:res.data});
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }finally{
      set({isUpdatingProfile:false});
    }
  },

  connectSocket:()=>{
    const {authUser}=get()
    const selectedProject=useProjectStore.getState().selectedProject
    if(!authUser || get().socket?.connected|| !selectedProject) return;

    console.log("connectSocket", authUser)

    const socket=io(BASE_URL,{
      withCredentials:true,
      query:{
        userId:authUser.data._id,
        projectId:selectedProject?._id
      }
    });
    socket.connect();
    set({socket:socket});
    
    socket.on("getOnlineUsers",(userIds)=>{
      set({onlineUsers:userIds})
    })
  },
  disconnectSocket:()=>{
    if(get().socket?.connected) get().socket.disconnect();
  }

}));
