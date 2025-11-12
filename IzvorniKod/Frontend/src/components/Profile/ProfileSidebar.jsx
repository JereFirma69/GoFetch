import React from "react";

export default function ProfileSidebar({ user, onLogout, onEdit }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col items-center">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=120&background=14b8a6&color=fff&bold=true`}
          alt="Profile"
          className="w-28 h-28 rounded-full mb-4 border-4 border-teal-100"
        />
        <h2 className="text-xl font-bold text-gray-800 mb-1">{user.name}</h2>
        <p className="text-gray-500 text-sm mb-4">{user.email}</p>

        <button
          onClick={onEdit}
          className="w-full py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mb-2 font-medium"
        >
          Edit Profile
        </button>

        <button
          onClick={onLogout}
          className="w-full py-2.5 px-4 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
