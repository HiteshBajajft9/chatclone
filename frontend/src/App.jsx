import React from "react";
import { Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const { isLoggedIn, login, authUser } = useAuthStore();

  console.log("Auth User:", authUser);
  console.log("Is Logged In:", isLoggedIn);
  // console.log("Login Function:", login);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f0f4f8]">
      <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none">
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-cyan-200/40 blur-[80px] mix-blend-multiply filter" />
        <div className="absolute top-[20%] -right-10 w-[600px] h-[600px] rounded-full bg-emerald-100/50 blur-[100px] mix-blend-multiply filter" />
        <div className="absolute -bottom-20 -left-10 w-[600px] h-[600px] rounded-full bg-purple-200/50 blur-[90px] mix-blend-multiply filter" />
        <div className="absolute -bottom-10 right-20 w-[450px] h-[450px] rounded-full bg-blue-200/30 blur-[80px] mix-blend-multiply filter" />
      </div>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center">
        <button onClick={login} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
          Simulate Login
        </button>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
