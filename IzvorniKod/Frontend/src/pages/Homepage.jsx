import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { api } from "../utils/api";
import ChatWidget from "../components/ChatWidget";
import FavoriteDogs from "../components/Profile/FavoriteDogs";
import AddedDogs from "../components/Profile/AddedDogs";
import gD1 from "../assets/dogImages/goldenRetriver1.jpg";
import gD2 from "../assets/dogImages/goldenRetriver2.jpg";
import p1 from "../assets/dogImages/pug1.jpg";

import DoubleCalendar from "../components/Calendar/DoubleCalendar";


export default function HomePage() {
  const { user, logout } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [profileData, setProfileData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchName() {
      try {
        const data = await api.get("/profile/me");
        setName(data.firstName || "User");
        setProfileData(data);
      } catch {
        setName(user?.firstName || "User");
      }
    }
    if (user) fetchName();
  }, [user]);

  const favoriteDogs = [
    { id: 1, name: "Max", image: gD1 },
    { id: 2, name: "Luna", image: gD2 },
    { id: 3, name: "Roki", image: p1 },
  ];

  const addedDogs = profileData?.owner?.dogs?.map(dog => ({
    id: dog.idPas,
    name: dog.imePas,
    breed: dog.pasmina,
    image: dog.profilnaPas,
    ...dog
  })) || [];



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
    <div className="min-h-screen bg-gray-50">
      <ChatWidget />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome header */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-800">
            Welcome back, {name}! 🐕
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Calendar */}
          <div className="lg:col-span-2">
            <DoubleCalendar />
          </div>

          {/* Right column - Dogs & Quick Actions */}
          <div className="space-y-6">
            {/* Added Dogs */}
            <AddedDogs 
              dogs={addedDogs}
              onAddClick={() => navigate("/profile?view=add-dog")}
              onDogClick={(dog) => navigate(`/profile?view=edit-dog&dogId=${dog.id}`)}
            />
            
            {/* Favorite Dogs */}
            <FavoriteDogs dogs={favoriteDogs} />

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ⚙️ Profile Settings
                </button>
                <button
                  onClick={() => navigate("/profile?view=add-dog")}
                  className="w-full py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  🐕 Add New Dog
                </button>
                <button
                  onClick={() => navigate("/search-walkers")}
                  className="w-full py-3 border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
                >
                  🔍 Find Dog Walkers
                </button>
                <button
                  onClick={() => navigate("/search-termini")}
                  className="w-full py-3 border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
                >
                  📅 Find Walking Slots
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}