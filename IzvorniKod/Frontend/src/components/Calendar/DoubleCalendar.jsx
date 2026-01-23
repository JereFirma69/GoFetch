import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Calendar } from "../../pages/CalendarPage";
import { 
  getMyRezervacije,
  getGoogleAuthUrl,
  getGoogleConnectionStatus,
  disconnectGoogleCalendar
} from "../../utils/calendarApi";

export default function DoubleCalendar() {
  const { user } = useContext(AuthContext);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
    checkGoogleConnection();
    
    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("calendar") === "connected") {
      // Refresh connection status after successful OAuth
      setTimeout(() => {
        checkGoogleConnection();
      }, 500);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkGoogleConnection = async () => {
    setGoogleLoading(true);
    try {
      const status = await getGoogleConnectionStatus();
      setGoogleConnected(status.isConnected);
    } catch (error) {
      console.error("Error checking Google connection:", error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const response = await getGoogleAuthUrl();
      const url = response?.authorizationUrl;
      if (url && typeof url === "string") {
        window.location.href = url;
      } else {
        console.error("Missing authorizationUrl in response:", response);
        alert("Could not start Google authorization. Please try again later.");
      }
    } catch (error) {
      console.error("Error getting Google auth URL:", error);
      alert("Error starting Google authorization");
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!confirm("Are you sure you want to disconnect Google Calendar?")) return;
    try {
      await disconnectGoogleCalendar();
      setGoogleConnected(false);
    } catch (error) {
      console.error("Error disconnecting Google Calendar:", error);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const rezervacije = await getMyRezervacije();
      // Filter only upcoming non-cancelled bookings
      const now = new Date();
      const futureBookings = [...(rezervacije || [])]
        .filter((r) => r.statusRezervacija !== "otkazana" && new Date(r.datumVrijemePolaska) > now);
      
      // Group bookings by termin ID to combine multiple dogs booked separately
      const groupedByTermin = {};
      for (const rez of futureBookings) {
        const terminId = rez.termin?.idTermin;
        if (!terminId) continue;
        
        if (!groupedByTermin[terminId]) {
          groupedByTermin[terminId] = { ...rez, dogs: [...(rez.dogs || [])] };
        } else {
          // Merge dogs from this booking into the existing one
          const existingDogs = groupedByTermin[terminId].dogs || [];
          const newDogs = rez.dogs || [];
          const allDogIds = new Set(existingDogs.map(d => d.idPas));
          for (const dog of newDogs) {
            if (!allDogIds.has(dog.idPas)) {
              existingDogs.push(dog);
              allDogIds.add(dog.idPas);
            }
          }
          groupedByTermin[terminId].dogs = existingDogs;
        }
      }
      
      const upcoming = Object.values(groupedByTermin)
        .sort((a, b) => new Date(a.datumVrijemePolaska) - new Date(b.datumVrijemePolaska))
        .slice(0, 20); // Show max 20
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Google Calendar Connection - Teal gradient box */}
      {!googleConnected ? (
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 text-white">
          {googleLoading ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              <span>Checking connection...</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">🔗 Connect Google Calendar</h4>
                <p className="text-sm text-teal-100">Sync appointments across devices</p>
              </div>
              <button
                onClick={handleConnectGoogle}
                className="px-4 py-2 bg-white text-teal-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Connect
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#10b981" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z"/>
              </svg>
              <div>
                <h4 className="font-semibold text-gray-800">✓ Connected</h4>
                <p className="text-sm text-gray-600">Your appointments sync automatically</p>
              </div>
            </div>
            <button
              onClick={handleDisconnectGoogle}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Kalendar prikaz */}
      <Calendar compact={false} />

      {/* Upcoming Appointments lista */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Upcoming Appointments</h3>
        
        {loading ? (
          <p className="text-gray-500 text-center py-4">Loading...</p>
        ) : upcomingAppointments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-auto">
            {upcomingAppointments.map((rezervacija) => (
              <div key={rezervacija.idRezervacija} className="p-3 bg-gray-50 rounded-lg border-l-4 border-teal-500">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-gray-800">
                    {rezervacija.termin?.walker ? 
                      `${rezervacija.termin.walker.imeSetac} ${rezervacija.termin.walker.prezimeSetac}` : 
                      "Walk"}
                  </div>
                  <button
                    onClick={() => {/* TODO: Cancel reservation */}}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Cancel
                  </button>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(rezervacija.datumVrijemePolaska).toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  📍 {rezervacija.adresaPolaska} • 🐕 {rezervacija.dogs?.map(d => d.imePas).join(", ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}