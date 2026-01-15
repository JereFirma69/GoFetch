import React from "react";

export default function ProfileSidebar({ user, profileData, onLogout, onEdit }) {
  const walkerStatus = profileData?.walker?.verificationStatus;
  const isWalker = user.role === "walker" || user.role === "both";

  const getStatusBadge = () => {
    if (!isWalker || !walkerStatus) return null;

    const statusConfig = {
      pending: {
        text: "Verification Pending",
        className: "bg-yellow-100 text-yellow-800 border-yellow-300"
      },
      approved: {
        text: "Verified Walker",
        className: "bg-green-100 text-green-800 border-green-300"
      },
      rejected: {
        text: "Verification Declined",
        className: "bg-red-100 text-red-800 border-red-300"
      }
    };

    const config = statusConfig[walkerStatus] || statusConfig.pending;

    return (
      <div className={`w-full px-3 py-2 rounded-lg border text-sm font-medium mb-3 text-center ${config.className}`}>
        {config.text}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col items-center">
        <img
          src={
            profileData?.profilePicture || 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=120&background=14b8a6&color=fff&bold=true`
          }
          alt="Profile"
          className="w-28 h-28 rounded-full mb-4 border-4 border-teal-100 object-cover"
        />
        <h2 className="text-xl font-bold text-gray-800 mb-1">{user.name}</h2>
        <p className="text-gray-500 text-sm mb-4">{user.email}</p>

        {getStatusBadge()}

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
