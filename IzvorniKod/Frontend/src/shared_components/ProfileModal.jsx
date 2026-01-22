import React, { useEffect, useState } from "react";
import { searchApi } from "../utils/searchApi";
import verifiedBadge from "../assets/verification.png";

export default function ProfileModal({ open, onClose, profile }) {
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (open && profile?.walkerId) {
      fetchAppointments();
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, profile?.walkerId]);

  async function fetchAppointments() {
    setLoadingAppointments(true);
    try {
      const data = await searchApi.searchTermini({
        onlyAvailable: true,
      });
      // Filter by walkerId
      const filtered = data.filter(slot => slot.WalkerId === profile.walkerId);
      setAppointments(filtered.slice(0, 5)); // Show max 5
    } catch (e) {
      console.error(e);
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  }

  async function fetchReviews() {
    setLoadingReviews(true);
    try {
      const data = await searchApi.getWalkerReviews(profile.walkerId, 3);
      setReviews(data || []);
    } catch (e) {
      console.error(e);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }

  if (!open || !profile) return null;
  
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="text-xl font-semibold text-gray-800">Profile</div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          {profile.profilePicture ? (
            <img 
              src={profile.profilePicture} 
              alt={profile.name} 
              className="w-32 h-32 rounded-full object-cover border-4 border-teal-100" 
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-4xl font-bold border-4 border-teal-200">
              {profile.name?.charAt(0) || "?"}
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="space-y-3 text-sm text-gray-700 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="text-2xl font-bold text-gray-900">{profile.name}</div>
              {profile.isVerified === true && (
                <img
                  src={verifiedBadge}
                  alt="Verified"
                  className="w-6 h-6 inline-block align-middle"
                />
              )}
            </div>
          </div>
          
          {profile.email && (
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[80px]">Email:</span>
              <span>{profile.email}</span>
            </div>
          )}
          {profile.phone && (
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[80px]">Phone:</span>
              <span>{profile.phone}</span>
            </div>
          )}
          {profile.location && (
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[80px]">Location:</span>
              <span>{profile.location}</span>
            </div>
          )}
          {(profile.rating !== undefined || profile.ratingCount !== undefined) && (
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[80px]">Rating:</span>
              <span>⭐ {profile.rating?.toFixed(1) || "0.0"} ({profile.ratingCount || 0} reviews)</span>
            </div>
          )}
        </div>

        {/* About Section */}
        {profile.bio && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
              {profile.bio}
            </div>
          </div>
        )}

        {/* Available Appointments */}
        {profile.walkerId && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Appointments</h3>
            {loadingAppointments ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : appointments.length > 0 ? (
              <div className="space-y-2">
                {appointments.map((apt) => (
                  <div 
                    key={apt.TerminId} 
                    className="flex justify-between items-center p-3 bg-teal-50 rounded-lg border border-teal-100"
                  >
                    <div>
                      <div className="font-medium text-gray-800">
                        {new Date(apt.Start).toLocaleDateString()} at {new Date(apt.Start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-xs text-gray-600">
                        {apt.Type} • {apt.Location}
                      </div>
                    </div>
                    <div className="text-teal-700 font-bold">{apt.Price} €</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No available appointments at the moment</div>
            )}
          </div>
        )}

        {/* Recent Reviews */}
        {profile.walkerId && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Reviews</h3>
            {loadingReviews ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-gray-100 bg-gray-50"
                  >
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span className="font-semibold">{rev.ReviewerName}</span>
                      <span className="text-xs text-gray-500">
                        {rev.Date ? new Date(rev.Date).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <div className="text-amber-500 text-sm mt-1">{"★".repeat(rev.Rating)}</div>
                    {rev.Comment && (
                      <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{rev.Comment}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No reviews yet</div>
            )}
          </div>
        )}

        {/* Old extra fields for backward compatibility */}
        {profile.extra && profile.extra.length > 0 && (
          <div className="mt-4 space-y-2">
            {profile.extra.map((line, idx) => (
              <div key={idx} className="text-sm text-gray-700">{line}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
