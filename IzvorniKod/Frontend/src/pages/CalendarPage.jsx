import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  getMyTermini,
  createTermin,
  updateTermin,
  deleteTermin,
  getMyRezervacije,
  updateRezervacijaStatus,
} from "../utils/calendarApi";

// Status colors and labels
const statusConfig = {
  prihvacena: { bg: "bg-emerald-100", border: "border-emerald-400", text: "text-emerald-700", label: "Confirmed" },
  "na cekanju": { bg: "bg-amber-100", border: "border-amber-400", text: "text-amber-700", label: "Pending" },
  otkazana: { bg: "bg-red-100", border: "border-red-400", text: "text-red-700", label: "Cancelled" },
};

// Helper functions
const formatDateString = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const parseDateTime = (isoString) => {
  const date = new Date(isoString);
  return {
    date: formatDateString(date.getFullYear(), date.getMonth(), date.getDate()),
    time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
    dateObj: date,
  };
};

// ==================== Termin Badge Component ====================
function TerminBadge({ termin, compact = false, onClick }) {
  const hasBookings = termin.bookedDogs > 0;
  const isFull = termin.availableSlots <= 0;
  
  let status = "na cekanju";
  if (isFull) {
    status = "prihvacena";
  }

  const config = statusConfig[status];
  const startTime = parseDateTime(termin.datumVrijemePocetka).time;
  const endTime = parseDateTime(termin.datumVrijemeZavrsetka).time;

  if (compact) {
    return (
      <div 
        className={`text-xs px-1 py-0.5 rounded ${config.bg} ${config.text} truncate cursor-pointer hover:opacity-80`}
        onClick={() => onClick?.(termin)}
      >
        {startTime} ({termin.bookedDogs}/{termin.maxDogs})
      </div>
    );
  }

  return (
    <div 
      className={`p-2 rounded-lg border-l-4 ${config.bg} ${config.border} ${config.text} cursor-pointer hover:opacity-80`}
      onClick={() => onClick?.(termin)}
    >
      <div className="flex justify-between items-start">
        <span className="font-medium">{startTime} - {endTime}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">{config.label}</span>
      </div>
      <div className="mt-1 text-sm">
        <div>🐕 {termin.bookedDogs}/{termin.maxDogs} dogs</div>
        <div>📍 {termin.lokacijaTermin}</div>
        <div>💰 {termin.cijena} €</div>
      </div>
    </div>
  );
}

// ==================== Rezervacija Badge Component ====================
function RezervacijaBadge({ rezervacija, onStatusChange, isWalker }) {
  const config = statusConfig[rezervacija.statusRezervacija] || statusConfig["na cekanju"];
  const { time, date } = parseDateTime(rezervacija.datumVrijemePolaska);

  return (
    <div className={`p-3 rounded-lg border-l-4 ${config.bg} ${config.border}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-medium text-gray-800">{date} @ {time}</span>
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        </div>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        {isWalker ? (
          <div>👤 {rezervacija.owner?.ime} {rezervacija.owner?.prezime}</div>
        ) : (
          <div>🚶 {rezervacija.termin?.walker?.imeSetac} {rezervacija.termin?.walker?.prezimeSetac}</div>
        )}
        <div>🐕 {rezervacija.dogs?.map(d => d.imePas).join(", ") || "Pas"}</div>
        <div>📍 {rezervacija.adresaPolaska}</div>
      </div>
      {rezervacija.statusRezervacija === "na cekanju" && isWalker && onStatusChange && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onStatusChange(rezervacija.idRezervacija, "prihvacena")}
            className="flex-1 px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600"
          >
            ✓ Confirm
          </button>
          <button
            onClick={() => onStatusChange(rezervacija.idRezervacija, "otkazana")}
            className="flex-1 px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
          >
            ✗ Reject
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== New Termin Modal ====================
function NewTerminModal({ isOpen, onClose, onSave, selectedDate, editingTermin }) {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [date, setDate] = useState(selectedDate);
  const [maxDogs, setMaxDogs] = useState(1);
  const [cijena, setCijena] = useState(15);
  const [lokacija, setLokacija] = useState("");
  const [vrstaSetnje, setVrstaSetnje] = useState("individualna");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingTermin) {
      const start = parseDateTime(editingTermin.datumVrijemePocetka);
      const end = parseDateTime(editingTermin.datumVrijemeZavrsetka);
      setDate(start.date);
      setStartTime(start.time);
      setEndTime(end.time);
      setMaxDogs(editingTermin.maxDogs);
      setCijena(editingTermin.cijena);
      setLokacija(editingTermin.lokacijaTermin);
      setVrstaSetnje(editingTermin.vrstaSetnjaTermin);
    } else {
      setDate(selectedDate);
      setStartTime("09:00");
      setEndTime("10:00");
      setMaxDogs(1);
      setCijena(15);
      setLokacija("");
      setVrstaSetnje("individualna");
    }
    setError("");
  }, [selectedDate, editingTermin, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);
      const trajanjeMins = Math.round((endDateTime - startDateTime) / (1000 * 60));

      if (trajanjeMins <= 0) {
        throw new Error("End time must be after start time");
      }

      const terminData = {
        vrstaSetnjaTermin: vrstaSetnje,
        cijena: parseFloat(cijena),
        trajanjeMins: trajanjeMins,
        datumVrijemePocetka: startDateTime.toISOString(),
        lokacijaTermin: lokacija,
        maxDogs: parseInt(maxDogs),
      };

      if (editingTermin) {
        await updateTermin(editingTermin.idTermin, terminData);
      } else {
        await createTermin(terminData);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err.message || "Error saving appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTermin || !window.confirm("Are you sure you want to delete this appointment?")) return;
    
    setLoading(true);
    try {
      await deleteTermin(editingTermin.idTermin);
      onSave();
      onClose();
    } catch (err) {
      setError(err.message || "Error deleting appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {editingTermin ? "Edit Appointment" : "New Appointment"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Walk Type</label>
            <select
              value={vrstaSetnje}
              onChange={(e) => setVrstaSetnje(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="individualna">Individual</option>
              <option value="grupna">Group</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={cijena}
                onChange={(e) => setCijena(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Dogs</label>
              <select
                value={maxDogs}
                onChange={(e) => setMaxDogs(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={lokacija}
              onChange={(e) => setLokacija(e.target.value)}
              placeholder="e.g. Maksimir Park, Zagreb"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            {editingTermin && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== Month View ====================
function MonthView({ currentDate, termini, onDayClick, compact }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getTerminiForDate = (day) => {
    const dateStr = formatDateString(year, month, day);
    return termini.filter((t) => parseDateTime(t.datumVrijemePocetka).date === dateStr);
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const renderCalendarDays = () => {
    const days = [];
    const cellHeight = compact ? "h-12" : "h-24";

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className={`${cellHeight} bg-gray-50 border border-gray-100`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isTodayDate = isToday(day);
      const dayTermini = getTerminiForDate(day);
      const dateStr = formatDateString(year, month, day);

      days.push(
        <div
          key={day}
          onClick={() => onDayClick(dateStr)}
          className={`${cellHeight} border border-gray-200 p-1 cursor-pointer transition-all hover:bg-teal-50 ${
            isTodayDate ? "bg-teal-50 border-teal-400" : ""
          }`}
        >
          <div className={`text-sm font-medium ${isTodayDate ? "text-teal-700" : "text-gray-700"}`}>
            {day}
          </div>
          {!compact && (
            <div className="mt-1 space-y-0.5 overflow-hidden">
              {dayTermini.slice(0, 2).map((termin) => (
                <TerminBadge key={termin.idTermin} termin={termin} compact />
              ))}
              {dayTermini.length > 2 && (
                <div className="text-xs text-gray-500">+{dayTermini.length - 2} more</div>
              )}
            </div>
          )}
          {compact && dayTermini.length > 0 && (
            <div className="flex gap-0.5 mt-1">
              {dayTermini.slice(0, 3).map((termin) => (
                <div key={termin.idTermin} className="w-2 h-2 rounded-full bg-teal-500" />
              ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="grid grid-cols-7 gap-0">
      {dayNames.map((dayName) => (
        <div
          key={dayName}
          className="h-10 flex items-center justify-center font-semibold text-gray-600 text-sm border-b border-gray-300 bg-gray-50"
        >
          {dayName}
        </div>
      ))}
      {renderCalendarDays()}
    </div>
  );
}

// ==================== Week View ====================
function WeekView({ currentDate, termini, onTimeSlotClick }) {
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const hours = Array.from({ length: 12 }, (_, i) => i + 7);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="overflow-auto">
      <div className="grid grid-cols-8 min-w-[700px]">
        <div className="sticky top-0 bg-gray-100 p-2 border-b font-medium text-gray-500 text-sm">Hour</div>
        {weekDays.map((d, i) => {
          const today = isToday(d);
          return (
            <div
              key={i}
              className={`sticky top-0 p-2 border-b text-center text-sm ${
                today ? "bg-teal-100 text-teal-700 font-semibold" : "bg-gray-100 text-gray-700"
              }`}
            >
              <div>{dayNames[d.getDay()]}</div>
              <div className="text-lg">{d.getDate()}</div>
            </div>
          );
        })}

        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="p-2 border-r border-b text-sm text-gray-500 text-right bg-gray-50">
              {String(hour).padStart(2, "0")}:00
            </div>
            {weekDays.map((d, dayIndex) => {
              const dateStr = formatDateString(d.getFullYear(), d.getMonth(), d.getDate());
              const hourTermini = termini.filter((t) => {
                const parsed = parseDateTime(t.datumVrijemePocetka);
                return parsed.date === dateStr && parseInt(parsed.time.split(":")[0]) === hour;
              });

              return (
                <div
                  key={dayIndex}
                  onClick={() => onTimeSlotClick(dateStr, `${String(hour).padStart(2, "0")}:00`)}
                  className="border-r border-b p-1 min-h-[50px] hover:bg-teal-50 cursor-pointer transition-colors"
                >
                  {hourTermini.map((termin) => (
                    <TerminBadge key={termin.idTermin} termin={termin} compact />
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ==================== Day View ====================
function DayView({ selectedDate, termini, rezervacije, onNewTermin, onTerminClick, onBack, onStatusChange, isWalker }) {
  const dayTermini = termini.filter((t) => parseDateTime(t.datumVrijemePocetka).date === selectedDate);
  const dayRezervacije = rezervacije.filter((r) => parseDateTime(r.datumVrijemePolaska).date === selectedDate);
  const hours = Array.from({ length: 12 }, (_, i) => i + 7);

  const dateObj = new Date(selectedDate + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Timeline */}
      <div className="lg:col-span-2 bg-white rounded-lg border">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 text-sm font-medium"
          >
            ← Back
          </button>
          <h3 className="font-semibold text-gray-800 capitalize">{formattedDate}</h3>
        </div>
        <div className="divide-y">
          {hours.map((hour) => {
            const hourTermini = dayTermini.filter(
              (t) => parseInt(parseDateTime(t.datumVrijemePocetka).time.split(":")[0]) === hour
            );

            return (
              <div key={hour} className="flex">
                <div className="w-20 p-3 text-sm text-gray-500 bg-gray-50 border-r flex-shrink-0">
                  {String(hour).padStart(2, "0")}:00
                </div>
                <div className="flex-1 p-2 min-h-[60px]">
                  {hourTermini.map((termin) => (
                    <TerminBadge 
                      key={termin.idTermin} 
                      termin={termin}
                      onClick={onTerminClick}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Appointments */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Appointments ({dayTermini.length})</h3>
            <button
              onClick={onNewTermin}
              className="px-3 py-1 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600"
            >
              + New
            </button>
          </div>
          <div className="divide-y max-h-[250px] overflow-auto">
            {dayTermini.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-3xl mb-2">📅</div>
                <p>No appointments for this day</p>
              </div>
            ) : (
              dayTermini.map((termin) => (
                <div key={termin.idTermin} className="p-3">
                  <TerminBadge termin={termin} onClick={onTerminClick} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-800">Bookings ({dayRezervacije.length})</h3>
          </div>
          <div className="divide-y max-h-[300px] overflow-auto">
            {dayRezervacije.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-3xl mb-2">🐕</div>
                <p>No bookings for this day</p>
              </div>
            ) : (
              dayRezervacije.map((rez) => (
                <div key={rez.idRezervacija} className="p-3">
                  <RezervacijaBadge 
                    rezervacija={rez} 
                    onStatusChange={onStatusChange}
                    isWalker={isWalker}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Main Calendar Component ====================
export function Calendar({ compact = false }) {
  const { user } = useContext(AuthContext);
  // Allow calendar management for walkers and admins
  const isWalker = user && (
    user.role === "walker" || 
    user.role === "setac" || 
    user.role === "both" ||
    user.role?.toLowerCase() === "admin" ||
    user.email?.includes("admin")
  );

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [selectedDate, setSelectedDate] = useState(
    formatDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  );
  const [showModal, setShowModal] = useState(false);
  const [editingTermin, setEditingTermin] = useState(null);

  // Data state
  const [termini, setTermini] = useState([]);
  const [rezervacije, setRezervacije] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Fetch termini and rezervacije
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Calculate date range for current view (3 months around current month)
      const from = new Date(year, month - 1, 1).toISOString().split("T")[0];
      const to = new Date(year, month + 2, 0).toISOString().split("T")[0];

      const [terminiData, rezervacijeData] = await Promise.all([
        getMyTermini(from, to),
        getMyRezervacije(),
      ]);

      setTermini(terminiData || []);
      setRezervacije(rezervacijeData || []);
    } catch (err) {
      console.error("Error fetching calendar data:", err);
      setError("Error loading calendar");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (rezervacijaId, newStatus) => {
    try {
      await updateRezervacijaStatus(rezervacijaId, newStatus);
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Error updating reservation status:", err);
      alert("Error updating booking status");
    }
  };

  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(formatDateString(today.getFullYear(), today.getMonth(), today.getDate()));
  };

  const handleDayClick = (dateStr) => {
    setSelectedDate(dateStr);
    setView("day");
  };

  const handleTimeSlotClick = (dateStr, time) => {
    setSelectedDate(dateStr);
    setShowModal(true);
  };

  const handleTerminClick = (termin) => {
    setEditingTermin(termin);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingTermin(null);
  };

  const handleTerminSaved = () => {
    fetchData();
  };

  if (loading && termini.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm ${compact ? "p-4" : "p-6"}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
          <span className="ml-3 text-gray-600">Loading calendar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm ${compact ? "p-4" : "p-6"}`}>
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${compact ? "mb-3" : "mb-6"}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <button
            onClick={goToNextMonth}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            →
          </button>
          <h2 className={`${compact ? "text-lg" : "text-xl"} font-bold text-gray-800 ml-2`}>
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {!compact && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { key: "month", label: "Month" },
                { key: "week", label: "Week" },
                { key: "day", label: "Day" },
              ].map((v) => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    view === v.key ? "bg-white shadow text-teal-600 font-medium" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}

          <button onClick={goToToday} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
            Today
          </button>

          {!compact && (
            <button
              onClick={() => {
                setEditingTermin(null);
                setShowModal(true);
              }}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              + New appointment
            </button>
          )}
        </div>
      </div>

      {/* Calendar content */}
      {view === "month" && (
        <MonthView
          currentDate={currentDate}
          termini={termini}
          onDayClick={handleDayClick}
          compact={compact}
        />
      )}

      {view === "week" && (
        <div className="max-h-[500px] overflow-auto border rounded-lg">
          <WeekView
            currentDate={currentDate}
            termini={termini}
            onTimeSlotClick={handleTimeSlotClick}
          />
        </div>
      )}

      {view === "day" && (
        <DayView
          selectedDate={selectedDate}
          termini={termini}
          rezervacije={rezervacije}
          onNewTermin={() => {
            setEditingTermin(null);
            setShowModal(true);
          }}
          onTerminClick={handleTerminClick}
          onBack={() => setView("month")}
          onStatusChange={handleStatusChange}
          isWalker={isWalker}
        />
      )}

      {/* Legend */}
      {!compact && (
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Cancelled</span>
          </div>
        </div>
      )}

      {/* Modal for new/edit termin (available for all roles) */}
      <NewTerminModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleTerminSaved}
        selectedDate={selectedDate}
        editingTermin={editingTermin}
      />
    </div>
  );
}

export function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🐕 Dog Walking - Calendar</h1>
        <Calendar />
      </div>
    </div>
  );
}

export default CalendarPage;
