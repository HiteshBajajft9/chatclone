import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("soundEnabled")) === "true",

  toggleSound: () => {
    localStorage.setItem("soundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data.contacts });
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to load contacts. Please try again.");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error(error?.response?.data?.message || "Failed to load chats. Please try again.");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/chats/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(error?.response?.data?.message || "Failed to load messages. Please try again.");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState(); //to get different store's state without causing re-render of component that uses this store

    const tempId = `temp-${Date.now()}`; // temporary id for optimistic UI update
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages(optional)
    };
    // immediately add the message to the UI for a snappier feel
    set({ messages: [...messages, optimisticMessage] }); // Optimistically add message to UI

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: messages.concat(res.data.newMessage) });
      return res.data.newMessage;
    } catch (error) {
      set({ messages: messages }); // Revert optimistic update on failure
      console.error("Error sending message:", error);
      toast.error(error?.response?.data?.message || "Failed to send message. Please try again.");
    }
  },
}));
