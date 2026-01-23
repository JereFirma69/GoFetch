import { useState, useEffect } from "react";
import { getMyRezervacije } from "../../utils/calendarApi";

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, confirmed, cancelled, pending

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const data = await getMyRezervacije();
        // Sort by date descending (newest first)
        const sorted = (data || []).sort(
          (a, b) => new Date(b.datumVrijemePolaska) - new Date(a.datumVrijemePolaska)
        );
        setBookings(sorted);
      } catch (err) {
        console.error("Failed to fetch booking history:", err);
        setError("Failed to load booking history");
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    return b.statusRezervacija === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "prihvacena":
        return "bg-emerald-50 border-emerald-200 text-emerald-900";
      case "otkazana":
        return "bg-red-50 border-red-200 text-red-900";
      case "na cekanju":
        return "bg-amber-50 border-amber-200 text-amber-900";
      default:
        return "bg-gray-50 border-gray-200 text-gray-900";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "prihvacena":
        return "✓ Confirmed";
      case "otkazana":
        return "✕ Cancelled";
      case "na cekanju":
        return "⏳ Pending";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all", label: "All" },
          { value: "prihvacena", label: "Confirmed" },
          { value: "na cekanju", label: "Pending" },
          { value: "otkazana", label: "Cancelled" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-teal-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => {
            const bookingDate = new Date(booking.datumVrijemePolaska);
            const isOwner = booking.owner;

            return (
              <div
                key={booking.idRezervacija}
                className={`p-4 rounded-lg border border-gray-200 ${getStatusColor(
                  booking.statusRezervacija
                )}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Date and Time */}
                    <div className="font-semibold text-sm mb-2">
                      📅 {bookingDate.toLocaleDateString()} at{" "}
                      {bookingDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    {/* Other Party */}
                    <div className="text-sm mb-2">
                      {isOwner ? (
                        <>
                          <span className="text-gray-700">
                            Walker:{" "}
                            <strong>
                              {booking.termin?.walker?.imeSetac}{" "}
                              {booking.termin?.walker?.prezimeSetac}
                            </strong>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-700">
                            Owner:{" "}
                            <strong>
                              {booking.owner?.ime} {booking.owner?.prezime}
                            </strong>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Dogs */}
                    <div className="text-sm mb-2">
                      🐕 {booking.dogs?.map((d) => d.imePas).join(", ") || "Dog"}
                    </div>

                    {/* Duration and Price */}
                    <div className="text-sm">
                      ⏱️ {booking.termin?.trajanjeMins || 60} min • 💰{" "}
                      {booking.termin?.cizia || "N/A"} €
                    </div>

                    {/* Notes if present */}
                    {booking.napomenaRezervacija && (
                      <div className="text-xs mt-2 p-2 bg-gray-100/50 rounded italic text-gray-600">
                        📝 {booking.napomenaRezervacija}
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-800">
                      {getStatusLabel(booking.statusRezervacija)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
