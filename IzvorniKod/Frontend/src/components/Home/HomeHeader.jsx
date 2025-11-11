import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomeHeader() {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
            P
          </div>
          <span className="text-xl font-bold text-gray-800">PawPal</span>
        </div>

        <nav className="flex gap-3">
          <button
            className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </nav>
      </div>
    </header>
  );
}
