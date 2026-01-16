import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { api } from "../utils/api";
import ChatWidget from "../components/ChatWidget";

export default function HomePage() {
  const { user, logout } = useContext(AuthContext);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchName() {
      try {
        const data = await api.get("/profile/me");
        setName(data.firstName || "User");
      } catch {
        setName(user?.firstName || "User");
      }
    }
    if (user) fetchName();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Welcome to PawPal </h2>
        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ChatWidget />
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">
          Welcome back, {name}!
        </h2>
        <p className="text-gray-500 mb-8">{user.email}</p>

        <div className="bg-white rounded-xl shadow-sm p-6 w-full max-w-md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Your quick actions</h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate("/profile")}
              className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Go to Profile
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
