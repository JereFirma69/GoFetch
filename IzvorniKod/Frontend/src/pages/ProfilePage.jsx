import { useState } from "react";
import ProfileSidebar from "../components/Profile/ProfileSidebar";
import FavoriteDogs from "../components/Profile/FavoriteDogs";
import AddedDogs from "../components/Profile/AddedDogs";
import Reviews from "../components/Profile/Reviews";
import gD1 from "../assets/dogImages/goldenRetriver1.jpg";
import gD2 from "../assets/dogImages/goldenRetriver2.jpg";
import p1 from "../assets/dogImages/pug1.jpg";

export default function ProfilePage() {
  const [user] = useState({
    name: "Guest User",
    email: "guest@pawpal.com",
  });

  const favoriteDogs = [
    { id: 1, name: "Max", image: gD1 },
    { id: 2, name: "Luna", image: gD2},
    { id: 3, name: "Roki", image: p1 },
  ];

  const addedDogs = [
    { id: 1, name: "Rex", breed: "Pug", image: p1 },
    { id: 2, name: "Bela", breed: "Golden Retriever", image: gD1},
  ];

  const reviews = [
    { id: 1, dogName: "Rex", rating: 5, text: "Lorem ipsum dolor sit amet." },
    { id: 2, dogName: "Max", rating: 4, text: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  ];

  const handleLogout = () => alert("Logged out!");

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        <div className="w-80 flex-shrink-0">
          <ProfileSidebar user={user} onLogout={handleLogout} />
          <AddedDogs dogs={addedDogs} />
        </div>
        <div className="flex-1">
          <FavoriteDogs dogs={favoriteDogs} />
          <Reviews reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
