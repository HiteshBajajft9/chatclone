import { useEffect, useLayoutEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

const LOAD_MORE_THRESHOLD_PX = 80; // start loading when this close to the top

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    loadOlderMessages,
    hasMoreMessages,
    isLoadingOlder,
  } = useChatStore();
  const { authUser } = useAuthStore();

  const containerRef = useRef(null); // the scrollable chat area
  const prevScrollHeightRef = useRef(null); // height before older messages were added
  const prevScrollTopRef = useRef(0); // scroll position before older messages were added
  const lastMessageIdRef = useRef(null); // id of the newest message we've scrolled to
  const stickToBottomRef = useRef(true); // true while the user is at (or near) the bottom

  // Scroll ONLY the chat area. (scrollIntoView also scrolls the page and every
  // other scrollable parent, which pushed the whole layout up and left it stuck.)
  const scrollToBottom = (behavior = "auto") => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  useEffect(() => {
    lastMessageIdRef.current = null; // new chat: jump straight to the bottom once loaded
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    // clean up
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  // Runs after messages change, before the browser paints (so there's no visible jump)
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Case 1: older messages were added at the top -> keep the user's view in place
    if (prevScrollHeightRef.current !== null) {
      container.scrollTop =
        container.scrollHeight - prevScrollHeightRef.current + prevScrollTopRef.current;
      prevScrollHeightRef.current = null;
      return;
    }

    // Case 2: a new message arrived at the bottom (or the chat just opened) -> scroll down
    const lastId = messages[messages.length - 1]?._id;
    if (lastId && lastId !== lastMessageIdRef.current) {
      const isFirstLoad = lastMessageIdRef.current === null;
      scrollToBottom(isFirstLoad ? "auto" : "smooth");
      stickToBottomRef.current = true;
      lastMessageIdRef.current = lastId;
    }
  }, [messages]);

  // Load older messages when the user scrolls near the top
  const handleScroll = async () => {
    const container = containerRef.current;
    if (!container) return;

    // remember whether the user is reading the latest messages
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 100;

    if (container.scrollTop > LOAD_MORE_THRESHOLD_PX) return;
    if (!hasMoreMessages || isLoadingOlder || isMessagesLoading) return;

    // remember the current position so it can be restored after loading
    prevScrollHeightRef.current = container.scrollHeight;
    prevScrollTopRef.current = container.scrollTop;

    const added = await loadOlderMessages();
    if (!added) prevScrollHeightRef.current = null; // nothing added: nothing to restore
  };

  return (
    <>
      <ChatHeader />
      <div ref={containerRef} onScroll={handleScroll} className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* top of chat: loading indicator, or start-of-conversation marker */}
            {isLoadingOlder && (
              <p className="text-center text-xs text-slate-400">Loading older messages...</p>
            )}
            {!hasMoreMessages && (
              <p className="text-center text-xs text-slate-500">Start of conversation</p>
            )}

            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble relative ${
                    msg.senderId === authUser._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {/* images finish loading after the scroll, which left the chat short of the
                      bottom: re-scroll on load if the user was at the bottom */}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Shared"
                      className="rounded-lg h-48 object-cover"
                      onLoad={() => stickToBottomRef.current && scrollToBottom()}
                    />
                  )}
                  {msg.text && <p className="mt-2">{msg.text}</p>}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.username} />
        )}
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;
