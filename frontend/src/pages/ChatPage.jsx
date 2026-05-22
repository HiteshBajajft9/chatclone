import { useAuthStore } from "../store/useAuthStore";

function ChatPage() {
  const { logout } = useAuthStore();
  return (
    <div>
      ChatPage
      <button onClick={logout} className="bg-blue-500 text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>
  );
}

export default ChatPage;
