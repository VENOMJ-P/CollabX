import { create } from "zustand";
import toast from "react-hot-toast"
import { axiosInstance } from "../lib/axios.js";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/users/check");
      set({ authUser: res.data});
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
  }

}));
