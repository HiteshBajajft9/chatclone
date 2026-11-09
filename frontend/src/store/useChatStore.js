import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";

const notificationSound = new Audio("/sounds/notification.mp3");
const PAGE_SIZE = 50; // must match the backend's default limit

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  hasMoreMessages: true, // false once we've reached the start of the conversation
  isLoadingOlder: false, // true while older messages are being fetched
  isSoundEnabled: localStorage.getItem("soundEnabled") === "true", // fixed: was always false after reload

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

  // Loads the latest PAGE_SIZE messages when a chat is opened
  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true, hasMoreMessages: true });
    try {
      const res = await axiosInstance.get(`/messages/chats/${userId}`, {
        params: { limit: PAGE_SIZE },
      });
      set({
        messages: res.data,
        // fewer than PAGE_SIZE messages means this is the whole conversation
        hasMoreMessages: res.data.length === PAGE_SIZE,
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(error?.response?.data?.message || "Failed to load messages. Please try again.");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Loads the next PAGE_SIZE older messages when the user scrolls to the top.
  // Returns true if any messages were added.
  loadOlderMessages: async () => {
    const { selectedUser, messages, hasMoreMessages, isLoadingOlder } = get();
    if (!selectedUser || !hasMoreMessages || isLoadingOlder) return false;

    // oldest real (non-optimistic) message currently on screen
    const oldest = messages.find((m) => !m.isOptimistic);
    if (!oldest) return false;

    const chatUserId = selectedUser._id;
    set({ isLoadingOlder: true });
    try {
      const res = await axiosInstance.get(`/messages/chats/${chatUserId}`, {
        params: { before: oldest.createdAt, limit: PAGE_SIZE },
      });

      // user switched to another chat while this was loading: ignore the result
      if (get().selectedUser?._id !== chatUserId) return false;

      const current = get().messages;
      const existingIds = new Set(current.map((m) => m._id));
      const older = res.data.filter((m) => !existingIds.has(m._id)); // avoid duplicates

      set({
        messages: [...older, ...current],
        // a short page means we've reached the start of the conversation
        hasMoreMessages: res.data.length === PAGE_SIZE,
      });
      return older.length > 0;
    } catch (error) {
      console.error("Error loading older messages:", error);
      toast.error("Failed to load older messages.");
      return false;
    } finally {
      set({ isLoadingOlder: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
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
    set({ messages: [...get().messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      // fixed: swap the temporary message for the real one in the CURRENT list,
      // so messages that arrived or loaded meanwhile are not lost
      set({
        messages: get().messages.map((m) => (m._id === tempId ? res.data.newMessage : m)),
      });
      return res.data.newMessage;
    } catch (error) {
      // remove only the failed temporary message
      set({ messages: get().messages.filter((m) => m._id !== tempId) });
      console.error("Error sending message:", error);
      toast.error(error?.response?.data?.message || "Failed to send message. Please try again.");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return; // if no chat is open, no need to subscribe

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("Socket not ready yet");
      return;
    }

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      if (get().isSoundEnabled) {
        notificationSound.currentTime = 0;
        notificationSound.play().catch((error) => {
          console.error("Error playing notification sound:", error);
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },
}));
