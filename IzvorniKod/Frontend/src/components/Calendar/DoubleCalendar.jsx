import React, { useState, useEffect } from "react";
import { Calendar } from "../../pages/CalendarPage";

export default function DoubleCalendar() {
  const [isConnected, setIsConnected] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [googleEvents, setGoogleEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    summary: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    const savedToken = localStorage.getItem("google_calendar_token");
    if (savedToken) {
      setAccessToken(savedToken);
      setIsConnected(true);
      fetchGoogleEvents(savedToken);
    }
  }, []);

  // Google OAuth login za Calendar
  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = window.location.origin;
    const scope = "https://www.googleapis.com/auth/calendar";
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    
    // Otvori popup
    const popup = window.open(authUrl, "google-auth", "width=500,height=600");
    
    // Slušaj za token
    const checkPopup = setInterval(() => {
      try {
        if (popup.location.hash) {
          const hash = popup.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const token = params.get("access_token");
          
          if (token) {
            localStorage.setItem("google_calendar_token", token);
            setAccessToken(token);
            setIsConnected(true);
            fetchGoogleEvents(token);
            popup.close();
            clearInterval(checkPopup);
          }
        }
      } catch (e) {
        // Cross-origin error - popup još nije redirectan
      }
      
      if (popup.closed) {
        clearInterval(checkPopup);
      }
    }, 500);
  };

  const handleDisconnect = () => {
    localStorage.removeItem("google_calendar_token");
    setAccessToken(null);
    setIsConnected(false);
    setGoogleEvents([]);
  };

  const fetchGoogleEvents = async (token) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=20&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 401) {
        handleDisconnect();
        return;
      }
      const data = await response.json();
      setGoogleEvents(data.items || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const createGoogleEvent = async (e) => {
    e.preventDefault();
    if (!accessToken) return;

    const event = {
      summary: newEvent.summary,
      start: {
        dateTime: `${newEvent.date}T${newEvent.startTime}:00`,
        timeZone: "Europe/Zagreb",
      },
      end: {
        dateTime: `${newEvent.date}T${newEvent.endTime}:00`,
        timeZone: "Europe/Zagreb",
      },
    };

    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );
      if (response.ok) {
        setShowNewEvent(false);
        setNewEvent({ summary: "", date: "", startTime: "", endTime: "" });
        fetchGoogleEvents(accessToken);
        alert("Appointment booked!");
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const cancelGoogleEvent = async (eventId, eventStart) => {
    const hoursUntil = (new Date(eventStart) - new Date()) / (1000 * 60 * 60);
    if (hoursUntil < 24) {
      alert("Cannot cancel less than 24 hours before.");
      return;
    }
    if (!confirm("Cancel this appointment?")) return;

    try {
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }
      );
      fetchGoogleEvents(accessToken);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // ========== NIJE SPOJEN ==========
  if (!isConnected) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">🔗 Connect Google Calendar</h4>
              <p className="text-sm text-teal-100">Sync appointments across devices</p>
            </div>
            <button
              onClick={handleGoogleLogin}
              className="px-4 py-2 bg-white text-teal-600 rounded-lg font-medium hover:bg-gray-100"
            >
              Connect
            </button>
          </div>
        </div>
        <Calendar compact={false} />
      </div>
    );
  }

  // ========== SPOJEN ==========
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">📅 Google Calendar</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
            ✓ Connected
          </span>
          <button
            onClick={() => setShowNewEvent(true)}
            className="px-3 py-1 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600"
          >
            + Book
          </button>
        </div>
      </div>

      {showNewEvent && (
        <form onSubmit={createGoogleEvent} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Title (e.g., Walk with Max)"
              value={newEvent.summary}
              onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={newEvent.startTime}
                onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="time"
                value={newEvent.endTime}
                onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowNewEvent(false)} className="flex-1 py-2 border rounded-lg">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2 bg-teal-500 text-white rounded-lg">
                Book
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500 text-center py-4">Loading...</p>
      ) : googleEvents.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-auto">
          {googleEvents.map((event) => {
            const canCancel = (new Date(event.start?.dateTime) - new Date()) / (1000 * 60 * 60) >= 24;
            return (
              <div key={event.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-teal-500">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-gray-800">{event.summary || "No title"}</div>
                  {canCancel ? (
                    <button
                      onClick={() => cancelGoogleEvent(event.id, event.start?.dateTime)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Cancel
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">Cannot cancel</span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(event.start?.dateTime || event.start?.date).toLocaleString("en-US", {
                    weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={handleDisconnect} className="mt-4 text-sm text-gray-500 hover:text-gray-700">
        Disconnect
      </button>
    </div>
  );
}