import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data /*isCheckingAuth: false */ });
    } catch (error) {
      console.error("Error checking auth:", error);
      set({ authUser: null /*isCheckingAuth: false */ });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (username, email, password) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", { username, email, password });
      set({ authUser: res.data.user });

      toast.success("Signup successful! Welcome to the chat app.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed. Please try again.");
      console.error("Error during signup:", error);
    } finally {
      set({ isSigningUp: false });
    }
  },
}));
