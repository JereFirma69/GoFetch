import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { calendarApi } from "../utils/calendarApi";
import { api } from "../utils/api";
import verifiedBadge from "../assets/verification.png";

const STATUS_CONFIG = {
  "na cekanju": { bg: "bg-amber-100", border: "border-amber-400", text: "text-amber-700", label: "Pending", icon: "⏳" },
  "prihvacena": { bg: "bg-emerald-100", border: "border-emerald-400", text: "text-emerald-700", label: "Confirmed", icon: "✓" },
  "otkazana": { bg: "bg-red-100", border: "border-red-400", text: "text-red-700", label: "Cancelled", icon: "✕" },
};

function BookingCard({ booking, isOwner, onStatusChange, loading }) {
  const [localError, setLocalError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const statusConfig = STATUS_CONFIG[booking.statusRezervacija] || STATUS_CONFIG["na cekanju"];
  const bookingDate = new Date(booking.datumVrijemePolaska);
  const hoursUntilStart = (bookingDate - new Date()) / (1000 * 60 * 60);
  const canCancel = isOwner && booking.statusRezervacija === "prihvacena" && hoursUntilStart >= 24;
  const canConfirm = !isOwner && booking.statusRezervacija === "na cekanju";
  const canReject = !isOwner && booking.statusRezervacija === "na cekanju";

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    setLocalError("");
    try {
      await calendarApi.updateRezervacijaStatus(booking.idRezervacija, newStatus);
      onStatusChange?.();
    } catch (err) {
      setLocalError(err.response?.data?.error || "Failed to update booking status");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${statusConfig.bg} ${statusConfig.border}`}>
      {localError && (
        <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {localError}
        </div>
      )}

      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isOwner ? (
            <>
              {booking.termin?.walker?.profilnaSetac ? (
                <img
                  src={booking.termin.walker.profilnaSetac}
                  alt={booking.termin.walker.imeSetac}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-teal-200 flex items-center justify-center text-teal-700 font-bold">
                  {booking.termin?.walker?.imeSetac?.charAt(0) || "?"}
                </div>
              )}
            </>
          ) : (
            <>
              {booking.vlasnik?.profilnaKorisnik ? (
                <img
                  src={booking.vlasnik.profilnaKorisnik}
                  alt={booking.vlasnik.ime}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-teal-200 flex items-center justify-center text-teal-700 font-bold">
                  {booking.vlasnik?.ime?.charAt(0) || "?"}
                </div>
              )}
            </>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isOwner ? (
              <div className="font-semibold text-gray-900">
                {booking.termin?.walker?.imeSetac} {booking.termin?.walker?.prezimeSetac}
              </div>
            ) : (
              <div className="font-semibold text-gray-900">
                {booking.vlasnik?.ime} {booking.vlasnik?.prezime}
              </div>
            )}
          </div>

          <div className="space-y-1 text-sm text-gray-700 mb-3">
            <div>
              📅 {bookingDate.toLocaleDateString()} at {bookingDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div>
              🐕 {booking.dogs?.map((d) => d.imePas).join(", ") || "Dog"}
            </div>
            <div>
              📍 {booking.adresaPolaska}
            </div>
            <div>
              ⏱️ {booking.termin?.trajanjeMins || 60} minutes • 💰 {booking.termin?.cijena} €
            </div>
            {booking.napomenaRezervacija && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-gray-600 italic">
                📝 {booking.napomenaRezervacija}
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className={`inline-block px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text} text-sm font-medium mb-3`}>
            {statusConfig.icon} {statusConfig.label}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isOwner && canCancel && (
              <button
                onClick={() => handleStatusChange("otkazana")}
                disabled={actionLoading || loading}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {actionLoading ? "Cancelling..." : "Cancel Booking"}
              </button>
            )}

            {isOwner && !canCancel && booking.statusRezervacija === "prihvacena" && (
              <div className="text-xs text-red-600 font-medium">
                ✕ Cannot cancel less than 24 hours before
              </div>
            )}

            {!isOwner && canConfirm && (
              <>
                <button
                  onClick={() => handleStatusChange("prihvacena")}
                  disabled={actionLoading || loading}
                  className="px-3 py-1 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {actionLoading ? "Confirming..." : "✓ Confirm"}
                </button>
                <button
                  onClick={() => handleStatusChange("otkazana")}
                  disabled={actionLoading || loading}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {actionLoading ? "Rejecting..." : "✕ Reject"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const { user } = useContext(AuthContext);
  const [isOwner, setIsOwner] = useState(false);
  const [isWalker, setIsWalker] = useState(false);
  const [activeTab, setActiveTab] = useState("owner"); // or "walker"
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const checkRoles = async () => {
      try {
        const response = await api.get("/profile/me");
        const hasOwner = !!response.data?.owner;
        const hasWalker = !!response.data?.walker;

        setIsOwner(hasOwner);
        setIsWalker(hasWalker);

        // Set initial tab based on roles
        if (hasOwner && !hasWalker) {
          setActiveTab("owner");
        } else if (hasWalker && !hasOwner) {
          setActiveTab("walker");
        } else if (hasOwner) {
          setActiveTab("owner");
        }
      } catch (err) {
        console.error("Failed to check roles:", err);
      }
    };

    checkRoles();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await calendarApi.getMyRezervacije();
      setBookings(response.data || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load bookings. Please try again.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter === "all") return true;
    return booking.statusRezervacija === statusFilter;
  });

  const emptyMessage = {
    owner: "No bookings yet. Start by searching for walkers!",
    walker: "No incoming bookings yet. Make sure your calendar is set up!",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your walk bookings and requests</p>
        </div>

        {/* Tabs */}
        {(isOwner || isWalker) && (
          <div className="flex gap-2 mb-6 bg-white rounded-lg p-2 shadow-sm">
            {isOwner && (
              <button
                onClick={() => {
                  setActiveTab("owner");
                  setStatusFilter("all");
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "owner"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                My Bookings
              </button>
            )}
            {isWalker && (
              <button
                onClick={() => {
                  setActiveTab("walker");
                  setStatusFilter("all");
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "walker"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Incoming Bookings
              </button>
            )}
          </div>
        )}

        {/* Status Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "na cekanju", "prihvacena", "otkazana"].map((status) => {
            const statusLabels = {
              all: "All",
              "na cekanju": "Pending",
              "prihvacena": "Confirmed",
              "otkazana": "Cancelled",
            };
            const statusBg = {
              all: "bg-gray-200 text-gray-900",
              "na cekanju": "bg-amber-200 text-amber-900",
              "prihvacena": "bg-emerald-200 text-emerald-900",
              "otkazana": "bg-red-200 text-red-900",
            };

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === status ? statusBg[status] : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {statusLabels[status]}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-4xl mb-4">{activeTab === "owner" ? "📅" : "🔔"}</div>
            <p className="text-gray-600 text-lg">{emptyMessage[activeTab]}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.idRezervacija}
                booking={booking}
                isOwner={activeTab === "owner"}
                onStatusChange={fetchBookings}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
