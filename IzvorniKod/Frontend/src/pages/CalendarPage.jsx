import React, { useState } from "react";

// Mock podaci za termine
const mockAppointments = [
  { id: 1, date: "2025-01-20", time: "09:00", duration: 60, client: "Ana Horvat", dog: "Max", status: "confirmed" },
  { id: 2, date: "2025-01-20", time: "14:00", duration: 30, client: "Marko Babić", dog: "Luna", status: "pending" },
  { id: 3, date: "2025-01-22", time: "10:30", duration: 45, client: "Ivana Knežević", dog: "Rocky", status: "confirmed" },
  { id: 4, date: "2025-01-23", time: "16:00", duration: 60, client: "Petra Jurić", dog: "Bella", status: "cancelled" },
  { id: 5, date: "2025-01-25", time: "11:00", duration: 30, client: "Tomislav Novak", dog: "Charlie", status: "pending" },
  { id: 6, date: "2025-01-27", time: "08:00", duration: 45, client: "Maja Šarić", dog: "Buddy", status: "confirmed" },
  { id: 7, date: "2025-01-27", time: "15:30", duration: 60, client: "Ivan Perić", dog: "Milo", status: "confirmed" },
];

// Status boje i labele
const statusConfig = {
  confirmed: { bg: "bg-emerald-100", border: "border-emerald-400", text: "text-emerald-700", label: "Confirmed" },
  pending: { bg: "bg-amber-100", border: "border-amber-400", text: "text-amber-700", label: "Pending" },
  cancelled: { bg: "bg-red-100", border: "border-red-400", text: "text-red-700", label: "Cancelled" },
};

// Helper za formatiranje datuma
const formatDateString = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

// Komponenta za prikaz jednog termina
function AppointmentBadge({ appointment, compact = false }) {
  const config = statusConfig[appointment.status];
  
  if (compact) {
    return (
      <div className={`text-xs px-1 py-0.5 rounded ${config.bg} ${config.text} truncate`}>
        {appointment.time} {appointment.dog}
      </div>
    );
  }
  
  return (
    <div className={`p-2 rounded-lg border-l-4 ${config.bg} ${config.border} ${config.text}`}>
      <div className="flex justify-between items-start">
        <span className="font-medium">{appointment.time}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">{config.label}</span>
      </div>
      <div className="mt-1 text-sm">
        <div>🐕 {appointment.dog}</div>
        <div>👤 {appointment.client}</div>
        <div>⏱️ {appointment.duration} min</div>
      </div>
    </div>
  );
}

// Modal za novi termin
function NewAppointmentModal({ isOpen, onClose, selectedDate }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implementirati spremanje
    alert("Appointment saved! (demo)");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">New Appointment</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              defaultValue={selectedDate}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                defaultValue="09:00"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500">
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <input
              type="text"
              placeholder="Full name"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dog</label>
            <input
              type="text"
              placeholder="Dog's name"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500">
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={2}
              placeholder="Additional notes..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// MJESEČNI PRIKAZ
function MonthView({ currentDate, appointments, onDayClick, compact }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getAppointmentsForDate = (day) => {
    const dateStr = formatDateString(year, month, day);
    return appointments.filter((apt) => apt.date === dateStr);
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
      const dayAppointments = getAppointmentsForDate(day);
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
              {dayAppointments.slice(0, 2).map((apt) => (
                <AppointmentBadge key={apt.id} appointment={apt} compact />
              ))}
              {dayAppointments.length > 2 && (
                <div className="text-xs text-gray-500">+{dayAppointments.length - 2} više</div>
              )}
            </div>
          )}
          {compact && dayAppointments.length > 0 && (
            <div className="flex gap-0.5 mt-1">
              {dayAppointments.slice(0, 3).map((apt) => (
                <div
                  key={apt.id}
                  className={`w-2 h-2 rounded-full ${statusConfig[apt.status].bg.replace("100", "500")}`}
                />
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

// TJEDNI PRIKAZ
function WeekView({ currentDate, appointments, onTimeSlotClick }) {
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
  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 07:00 - 18:00
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="overflow-auto">
      <div className="grid grid-cols-8 min-w-[700px]">
        {/* Header */}
        <div className="sticky top-0 bg-gray-100 p-2 border-b font-medium text-gray-500 text-sm">Sat</div>
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

        {/* Time slots */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="p-2 border-r border-b text-sm text-gray-500 text-right bg-gray-50">
              {String(hour).padStart(2, "0")}:00
            </div>
            {weekDays.map((d, dayIndex) => {
              const dateStr = formatDateString(d.getFullYear(), d.getMonth(), d.getDate());
              const hourAppointments = appointments.filter(
                (apt) => apt.date === dateStr && parseInt(apt.time.split(":")[0]) === hour
              );

              return (
                <div
                  key={dayIndex}
                  onClick={() => onTimeSlotClick(dateStr, `${String(hour).padStart(2, "0")}:00`)}
                  className="border-r border-b p-1 min-h-[50px] hover:bg-teal-50 cursor-pointer transition-colors"
                >
                  {hourAppointments.map((apt) => (
                    <AppointmentBadge key={apt.id} appointment={apt} compact />
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

// DNEVNI PRIKAZ
function DayView({ selectedDate, appointments, onNewAppointment, onBack }) {
  const dayAppointments = appointments.filter((apt) => apt.date === selectedDate);
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
            const hourAppointments = dayAppointments.filter(
              (apt) => parseInt(apt.time.split(":")[0]) === hour
            );

            return (
              <div key={hour} className="flex">
                <div className="w-20 p-3 text-sm text-gray-500 bg-gray-50 border-r flex-shrink-0">
                  {String(hour).padStart(2, "0")}:00
                </div>
                <div className="flex-1 p-2 min-h-[60px]">
                  {hourAppointments.map((apt) => (
                    <AppointmentBadge key={apt.id} appointment={apt} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar - lista termina */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Appointments ({dayAppointments.length})</h3>
          <button
            onClick={onNewAppointment}
            className="px-3 py-1 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600"
          >
            + New
          </button>
        </div>
        <div className="divide-y max-h-[500px] overflow-auto">
          {dayAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🐕</div>
              <p>No appointments for this day</p>
            </div>
          ) : (
            dayAppointments.map((apt) => (
              <div key={apt.id} className="p-3">
                <AppointmentBadge appointment={apt} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// GLAVNA CALENDAR KOMPONENTA
export function Calendar({ compact = false }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // "month" | "week" | "day"
  const [selectedDate, setSelectedDate] = useState(formatDateString(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  ));
  const [showModal, setShowModal] = useState(false);
  const [appointments] = useState(mockAppointments);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

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

  return (
    <div className={`bg-white rounded-xl shadow-sm ${compact ? "p-4" : "p-6"}`}>
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
          {/* View switcher */}
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

          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
          >
            Today
          </button>

          {!compact && (
            <button
              onClick={() => setShowModal(true)}
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
          appointments={appointments}
          onDayClick={handleDayClick}
          compact={compact}
        />
      )}

      {view === "week" && (
        <div className="max-h-[500px] overflow-auto border rounded-lg">
          <WeekView
            currentDate={currentDate}
            appointments={appointments}
            onTimeSlotClick={handleTimeSlotClick}
          />
        </div>
      )}

      {view === "day" && (
        <DayView
          selectedDate={selectedDate}
          appointments={appointments}
          onNewAppointment={() => setShowModal(true)}
          onBack={() => setView("month")}
        />
      )}

      {/* Legend */}
      {!compact && (
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Cancelled</span>
          </div>
        </div>
      )}

      {/* Modal */}
      <NewAppointmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedDate={selectedDate}
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