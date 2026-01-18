import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Calendar } from "../../pages/CalendarPage";
import { getMyRezervacije } from "../../utils/calendarApi";

export default function DoubleCalendar() {
  const { user } = useContext(AuthContext);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const rezervacije = await getMyRezervacije();
      // Filter only upcoming confirmed bookings
      const now = new Date();
      const upcoming = (rezervacije || [])
        .filter(r => r.statusRezervacija === "prihvacena" && new Date(r.datumVrijemePolaska) > now)
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