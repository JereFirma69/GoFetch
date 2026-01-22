import React from "react";

export default function ProfileModal({ open, onClose, profile }) {
  if (!open || !profile) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-3">
          <div className="text-lg font-semibold">Profile</div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="space-y-2 text-sm text-gray-800">
          {profile.profilePicture && (
            <img src={profile.profilePicture} alt="profile" className="w-24 h-24 rounded-full object-cover" />
          )}
          <div><span className="font-semibold">Name: </span>{profile.name}</div>
          <div><span className="font-semibold">Email: </span>{profile.email}</div>
          {profile.location && <div><span className="font-semibold">Location: </span>{profile.location}</div>}
          {profile.phone && <div><span className="font-semibold">Phone: </span>{profile.phone}</div>}
          {profile.role && <div><span className="font-semibold">Role: </span>{profile.role}</div>}
          {profile.extra && profile.extra.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
