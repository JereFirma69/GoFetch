import React, { useEffect, useState } from "react";
import { createRezervacija } from "../utils/calendarApi";
import { api } from "../utils/api";
import verifiedBadge from "../assets/verification.png";

export default function BookingModal({ open, onClose, appointment, onSuccess }) {
  const [dogs, setDogs] = useState([]);
  const [selectedDogIds, setSelectedDogIds] = useState([]);
  const [pickupAddress, setPickupAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingDogs, setLoadingDogs] = useState(false);

  useEffect(() => {
    if (open) {
      fetchOwnerDogs();
      // Reset form
      setSelectedDogIds([]);
      setPickupAddress("");
      setNotes("");
      setError("");
    }
  }, [open]);

  const fetchOwnerDogs = async () => {
    setLoadingDogs(true);
    try {
      const response = await api.get("/profile/me");
      const ownerDogs = response.data?.owner?.dogs || [];
      setDogs(ownerDogs);
    } catch (err) {
      console.error("Failed to fetch dogs:", err);
      setError("Failed to load your dogs. Please try again.");
      setDogs([]);
    } finally {
      setLoadingDogs(false);
    }
  };

  const handleDogToggle = (dogId) => {
    setSelectedDogIds((prev) =>
      prev.includes(dogId) ? prev.filter((id) => id !== dogId) : [...prev, dogId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (selectedDogIds.length === 0) {
      setError("Please select at least one dog");
      return;
    }

    if (!pickupAddress.trim() || pickupAddress.trim().length < 10) {
      setError("Please enter a valid pickup address (min 10 characters)");
      return;
    }

    // Check available slots
    const availableSlots = appointment.maxDogs - appointment.bookedDogs;
    if (selectedDogIds.length > availableSlots) {
      setError(`This appointment only has ${availableSlots} spot(s) available, you selected ${selectedDogIds.length} dog(s)`);
      return;
    }

    setLoading(true);
    try {
      await createRezervacija({
        idTermin: appointment.terminId,
        dogIds: selectedDogIds,
        adresaPolaska: pickupAddress.trim(),
        napomenaRezervacija: notes.trim() || null,
        nacinPlacanje: "paypal"
      });

      // Success!
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Booking error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to create booking. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !appointment) return null;

  const availableSlots = appointment.maxDogs - appointment.bookedDogs;
  const startDate = new Date(appointment.start);
  const endDate = new Date(startDate.getTime() + appointment.duration * 60000);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-900">Book Walk</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Appointment Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              📅 Appointment Details
            </h3>
            <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3">
                {appointment.walkerProfilePicture ? (
                  <img
                    src={appointment.walkerProfilePicture}
                    alt={appointment.walkerName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-teal-200 flex items-center justify-center text-teal-700 font-bold text-lg">
                    {appointment.walkerName?.charAt(0) || "?"}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{appointment.walkerName}</span>
                  {appointment.isVerified && (
                    <img src={verifiedBadge} alt="Verified" className="w-5 h-5" />
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-700 space-y-1 mt-3">
                <div>📍 {appointment.location}</div>
                <div>📅 {startDate.toLocaleDateString()} • {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({appointment.duration} min)</div>
                <div>👥 {appointment.type === "grupna" || appointment.type === "group" ? "Group Walk" : "Individual Walk"} • <span className="font-semibold">{appointment.price} €</span></div>
              </div>
            </div>
          </div>

          {/* Dog Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              🐕 Select Your Dogs <span className="text-red-500">*</span>
            </label>
            {loadingDogs ? (
              <div className="text-center py-4 text-gray-500">Loading your dogs...</div>
            ) : dogs.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm">
                You don't have any dogs registered. Please add a dog to your profile first.
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-2">
                  {dogs.map((dog) => (
                    <label
                      key={dog.idPas}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedDogIds.includes(dog.idPas)
                          ? "bg-teal-50 border-teal-400"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDogIds.includes(dog.idPas)}
                        onChange={() => handleDogToggle(dog.idPas)}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{dog.imePas}</div>
                        <div className="text-xs text-gray-600">{dog.pasmina}, {dog.starost} years old</div>
                        {dog.zdravstveneNapomene && (
                          <div className="text-xs text-amber-600 mt-1">⚠️ {dog.zdravstveneNapomene}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  ℹ️ {availableSlots} spot(s) available for this appointment
                </div>
              </>
            )}
          </div>

          {/* Pickup Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📍 Pickup Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Enter the address where the walker should pick up your dog(s)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
              minLength={10}
            />
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Special Instructions (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions? (e.g., Max is shy with other dogs)"
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
            />
            <div className="text-xs text-gray-500 text-right mt-1">{notes.length}/500</div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingDogs || dogs.length === 0}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
