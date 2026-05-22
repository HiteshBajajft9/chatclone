import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,

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

  login: async (email, password) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", { email, password });
      set({ authUser: res.data.user });

      toast.success("Login successful! Welcome back.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
      console.error("Error during login:", error);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });

      toast.success("Logout successful! See you next time.");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.error("Error during logout:", error);
    } finally {
      set({ isLoggingOut: false });
    }
  },
}));
