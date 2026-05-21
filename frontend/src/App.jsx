import React from "react";
import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import PageLoader from "./components/PageLoader.jsx";
import { Toaster } from "react-hot-toast";

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log("Auth User:", authUser, "Is Checking Auth:", isCheckingAuth);

  if (isCheckingAuth) {
    return <PageLoader />;
  }

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
        <Routes>
          <Route path="/" element={authUser ? <ChatPage /> : <Navigate to={"/login"} />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
          <Route path="/register" element={!authUser ? <SignupPage /> : <Navigate to={"/"} />} />
        </Routes>
        <Toaster />
      </div>
    </div>
  );
}

export default App;
