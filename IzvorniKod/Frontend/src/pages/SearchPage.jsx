import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchFilterTable from "../shared_components/SearchFilterTable";
import ProfileModal from "../shared_components/ProfileModal";
import BookingModal from "../shared_components/BookingModal";
import { searchApi } from "../utils/searchApi";
import verifiedBadge from "../assets/verification.png";
import { AuthContext } from "../context/AuthContext";

const shellStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "24px 24px 48px",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
  border: "1px solid #e5e7eb",
  padding: "18px",
};

// Helper to create a fallback avatar SVG with a specific letter
const createFallbackAvatar = (letter) => {
  const char = letter || "?";
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%2399f6e4' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='32' fill='%230d9488'%3E${encodeURIComponent(char)}%3C/text%3E%3C/svg%3E`;
};

export default function SearchPage() {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "slots" ? "slots" : "walkers";
  const [tab, setTab] = useState(initialTab);

  // Walkers
  const [walkers, setWalkers] = useState([]);
  const [walkerLoading, setWalkerLoading] = useState(false);
  const [walkerSearch, setWalkerSearch] = useState("");
  const [walkerLocation, setWalkerLocation] = useState("");

  // 
  const [slots, setSlots] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotSearch, setSlotSearch] = useState("");
  const [slotLocation, setSlotLocation] = useState("");
  const [slotDate, setSlotDate] = useState("");
  const [slotType, setSlotType] = useState("");
  const [slotMaxPrice, setSlotMaxPrice] = useState("");
  const [slotMinPrice, setSlotMinPrice] = useState("");
  const [slotOnlyAvailable, setSlotOnlyAvailable] = useState(false);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [bookingAppointment, setBookingAppointment] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setSearchParams({ tab });
  }, [tab, setSearchParams]);

  // Helper to fetch full walker profile and open modal
  const openWalkerProfile = async (walkerId) => {
    setProfileLoading(true);
    try {
      const walker = await searchApi.getWalkerById(walkerId);
      if (walker) {
        setProfile({
          name: walker.FullName ?? walker.fullName,
          email: walker.Email ?? walker.email,
          phone: walker.Phone ?? walker.phone,
          location: walker.Location ?? walker.location,
          profilePicture: walker.ProfilePicture ?? walker.profilePicture,
          bio: walker.Bio ?? walker.bio,
          rating: walker.Rating ?? walker.rating,
          ratingCount: walker.RatingCount ?? walker.ratingCount,
          isVerified: walker.IsVerified === true || walker.isVerified === true,
          walkerId: walker.WalkerId ?? walker.walkerId,
        });
      }
    } catch (e) {
      console.error("Failed to load walker profile:", e);
      setToast("Failed to load walker profile");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "walkers") {
      fetchWalkers();
    } else {
      fetchSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const fetchWalkers = async () => {
    setWalkerLoading(true);
    try {
      const data = await searchApi.searchWalkers({
        q: walkerSearch || undefined,
        location: walkerLocation || undefined,
      });
      const normalized = (data || []).map((w) => ({
        ...w,
        FullName: w.FullName ?? w.fullName,
        Location: w.Location ?? w.location,
        ProfilePicture: w.ProfilePicture ?? w.profilePicture,
        Rating: w.Rating ?? w.rating ?? 0,
        RatingCount: w.RatingCount ?? w.ratingCount ?? 0,
        IsVerified: w.IsVerified === true || w.isVerified === true,
        Email: w.Email ?? w.email,
        Phone: w.Phone ?? w.phone,
        Bio: w.Bio ?? w.bio,
        WalkerId: w.WalkerId ?? w.walkerId,
      }));
      setWalkers(normalized);
    } catch (e) {
      console.error(e);
      setWalkers([]);
    } finally {
      setWalkerLoading(false);
    }
  };

  const fetchSlots = async () => {
    setSlotLoading(true);
    try {
      const from = slotDate ? new Date(slotDate).toISOString() : undefined;
      const data = await searchApi.searchTermini({
        from,
        location: slotLocation || undefined,
        minPrice: slotMinPrice ? Number(slotMinPrice) : undefined,
        maxPrice: slotMaxPrice ? Number(slotMaxPrice) : undefined,
        type: slotType || undefined,
        onlyAvailable: slotOnlyAvailable ? true : undefined,
      });
      const normalized = (data || []).map((s) => ({
        ...s,
        TerminId: s.TerminId ?? s.terminId,
        Start: s.Start ?? s.start,
        Duration: s.Duration ?? s.duration,
        Location: s.Location ?? s.location,
        Price: s.Price ?? s.price,
        Type: s.Type ?? s.type,
        IsAvailable: s.IsAvailable ?? s.isAvailable,
        WalkerId: s.WalkerId ?? s.walkerId,
        WalkerName: s.WalkerName ?? s.walkerName,
        WalkerProfilePicture: s.WalkerProfilePicture ?? s.walkerProfilePicture,
        MaxDogs: s.MaxDogs ?? s.maxDogs ?? s.maxdogs,
        BookedDogs: s.BookedDogs ?? s.bookedDogs ?? s.bookeddogs ?? 0,
      }));
      setSlots(normalized);
    } catch (e) {
      console.error(e);
      setSlots([]);
    } finally {
      setSlotLoading(false);
    }
  };

  const walkerColumns = useMemo(
    () => [
      {
        key: "ProfilePicture",
        title: "",
        render: (r) => {
          const pic = r.ProfilePicture;
          const hasValidPic = pic && pic !== "null" && pic.trim() !== "";
          const initial = r.FullName?.charAt(0) || "?";
          return (
            <div className="flex items-center justify-center">
              {hasValidPic ? (
                <img 
                  src={pic} 
                  alt={r.FullName} 
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = createFallbackAvatar(initial);
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold">
                  {initial}
                </div>
              )}
            </div>
          );
        },
      },
      { key: "FullName", title: "Name" },
      { key: "Location", title: "Location" },
      {
        key: "Rating",
        title: "Rating",
        render: (r) => `${r.Rating?.toFixed?.(1) || "0.0"} (${r.RatingCount || 0})`,
      },
      {
        key: "IsVerified",
        title: "Verified",
        render: (r) =>
          r.IsVerified === true ? (
            <div className="flex items-center justify-center">
              <img src={verifiedBadge} alt="Verified" className="w-5 h-5" />
            </div>
          ) : (
            ""
          ),
      },
    ],
    []
  );

  const walkerData = useMemo(() => {
    const q = walkerSearch.toLowerCase();
    return (walkers || []).filter((w) => {
      if (!q) return true;
      return (
        w.FullName?.toLowerCase().includes(q) ||
        w.Location?.toLowerCase().includes(q)
      );
    });
  }, [walkers, walkerSearch]);

  const slotColumns = useMemo(
    () => [
      {
        key: "WalkerProfilePicture",
        title: "",
        render: (r) => {
          const pic = r.WalkerProfilePicture;
          const hasValidPic = pic && pic !== "null" && pic.trim() !== "";
          const initial = r.WalkerName?.charAt(0) || "?";
          return (
            <div className="flex items-center justify-center">
              {hasValidPic ? (
                <img
                  src={pic}
                  alt={r.WalkerName}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = createFallbackAvatar(initial);
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold">
                  {initial}
                </div>
              )}
            </div>
          );
        },
      },
      { key: "WalkerName", title: "Walker" },
      { key: "Location", title: "Location" },
      {
        key: "Type",
        title: "Type",
        render: (r) => {
          const type = r.Type?.toLowerCase();
          if (type === "grupna" || type === "group") return "Group";
          if (type === "individualna" || type === "individual") return "Individual";
          return r.Type;
        },
      },
      {
        key: "Start",
        title: "Start Time",
        render: (r) => new Date(r.Start).toLocaleString(),
      },
      {
        key: "Price",
        title: "Price",
        render: (r) => `${r.Price} €`,
      },
      {
        key: "IsAvailable",
        title: "Status",
        render: (r) => {
          const maxDogs = r.MaxDogs ?? 1;
          const booked = r.BookedDogs ?? 0;
          const spotsLeft = Math.max(maxDogs - booked, 0);
          return spotsLeft > 0 ? `Available (${spotsLeft} spots left)` : "Fully booked";
        },
      },
    ],
    []
  );

  const slotData = useMemo(() => {
    const q = slotSearch.toLowerCase();
    return (slots || []).filter((s) => {
      if (!q) return true;
      return (
        s.WalkerName?.toLowerCase().includes(q) ||
        s.Location?.toLowerCase().includes(q)
      );
    });
  }, [slots, slotSearch]);

  const resetWalkerFilters = () => {
    setWalkerSearch("");
    setWalkerLocation("");
  };

  const resetSlotFilters = () => {
    setSlotSearch("");
    setSlotLocation("");
    setSlotDate("");
    setSlotType("");
    setSlotMaxPrice("");
    setSlotMinPrice("");
    setSlotOnlyAvailable(false);
  };

  const renderWalkers = () => (
    <div style={cardStyle}>
      <div className="flex" style={{ gap: "12px", flexWrap: "wrap", marginBottom: 12 }}>
        <input
          style={{ flex: 1, minWidth: 220, padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
          placeholder="Search by name"
          value={walkerSearch}
          onChange={(e) => setWalkerSearch(e.target.value)}
        />
        <select
          style={{ flex: 1, minWidth: 200, padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff" }}
          placeholder="Location"
          value={walkerLocation}
          onChange={(e) => setWalkerLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          <option value="zagreb">Zagreb</option>
          <option value="rijeka">Rijeka</option>
          <option value="split">Split</option>
        </select>
        <button
          onClick={fetchWalkers}
          style={{ padding: "10px 16px", background: "#0f766e", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600 }}
        >
          {walkerLoading ? "Loading..." : "Search"}
        </button>
        <button
          onClick={resetWalkerFilters}
          style={{ padding: "10px 16px", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: 8, fontWeight: 500 }}
        >
          Reset
        </button>
      </div>

      <SearchFilterTable
        title={`${walkerData.length} walkers found`}
        columns={walkerColumns}
        data={walkerData}
        actions={(row) => (
          <button
            onClick={() => openWalkerProfile(row.WalkerId)}
            disabled={profileLoading}
            className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            {profileLoading ? "Loading..." : "View"}
          </button>
        )}
      />
    </div>
  );

  const renderSlots = () => (
    <div style={cardStyle}>
      <div className="flex" style={{ gap: "12px", flexWrap: "wrap", marginBottom: 12 }}>
        <input
          style={{ flex: 1, minWidth: 220, padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
          placeholder="Search by walker"
          value={slotSearch}
          onChange={(e) => setSlotSearch(e.target.value)}
        />
        <input
          type="date"
          style={{ width: 170, padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
          value={slotDate}
          onChange={(e) => setSlotDate(e.target.value)}
        />
        <select
          style={{ flex: 1, minWidth: 200, padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff" }}
          value={slotLocation}
          onChange={(e) => setSlotLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          <option value="zagreb">Zagreb</option>
          <option value="rijeka">Rijeka</option>
          <option value="split">Split</option>
        </select>
        <select
          style={{ width: 170, padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff" }}
          value={slotType}
          onChange={(e) => setSlotType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="group">Group</option>
          <option value="individual">Individual</option>
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={slotOnlyAvailable}
            onChange={(e) => setSlotOnlyAvailable(e.target.checked)}
          />
          Only available
        </label>
      </div>
      <div className="flex" style={{ gap: "12px", flexWrap: "wrap", marginBottom: 12 }}>
        <input
          type="number"
          min={0}
          step={5}
          style={{ width: 130, padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
          placeholder="Min price"
          value={slotMinPrice}
          onChange={(e) => setSlotMinPrice(e.target.value)}
        />
        <input
          type="number"
          min={10}
          step={5}
          style={{ width: 130, padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
          placeholder="Max price (≥10)"
          value={slotMaxPrice}
          onChange={(e) => setSlotMaxPrice(e.target.value)}
        />
        <button
          onClick={fetchSlots}
          style={{ padding: "10px 16px", background: "#0f766e", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600 }}
        >
          {slotLoading ? "Loading..." : "Search"}
        </button>
        <button
          onClick={resetSlotFilters}
          style={{ padding: "10px 16px", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: 8, fontWeight: 500 }}
        >
          Reset
        </button>
      </div>

      <SearchFilterTable
        title={`${slotData.length} appointments found`}
        columns={slotColumns}
        data={slotData}
        actions={(row) => (
          <div className="flex gap-2">
            {(() => {
              const maxDogs = row.MaxDogs ?? 1;
              const booked = row.BookedDogs ?? 0;
              const spotsLeft = Math.max(maxDogs - booked, 0);
              const isMySlot = row.WalkerId && user?.userId && row.WalkerId === user.userId;
              const canBook = spotsLeft > 0 && !isMySlot;

              return (
                <>
                  <button
                    onClick={() => openWalkerProfile(row.WalkerId)}
                    disabled={profileLoading}
                    className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {profileLoading ? "..." : "View"}
                  </button>
                  <button
                    onClick={() => {
                      if (!canBook) return;
                      setBookingAppointment({
                        terminId: row.TerminId,
                        walkerId: row.WalkerId,
                        walkerName: row.WalkerName,
                        walkerProfilePicture: row.WalkerProfilePicture,
                        location: row.Location,
                        start: row.Start,
                        duration: row.Duration,
                        type: row.Type,
                        price: row.Price,
                        maxDogs: maxDogs || 5,
                        bookedDogs: booked || 0,
                        isVerified: false
                      });
                    }}
                    disabled={!canBook}
                    className={`px-3 py-1 text-sm rounded font-medium ${
                      canBook
                        ? "bg-teal-600 text-white hover:bg-teal-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    title={isMySlot ? "You can't book your own walk" : spotsLeft <= 0 ? "No spots left" : "Book"}
                  >
                    {isMySlot ? "Your slot" : spotsLeft > 0 ? "Book" : "Full"}
                  </button>
                </>
              );
            })()}
          </div>
        )}
      />
    </div>
  );

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div style={shellStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>Search</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ key: "walkers", label: "Walkers" }, { key: "slots", label: "Appointments" }].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1px solid",
                  borderColor: tab === t.key ? "#0f766e" : "#e5e7eb",
                  background: tab === t.key ? "#0f766e" : "#fff",
                  color: tab === t.key ? "#fff" : "#0f172a",
                  fontWeight: 600,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "walkers" ? renderWalkers() : renderSlots()}
      </div>

      {/* Modals */}
      <ProfileModal open={!!profile} onClose={() => setProfile(null)} profile={profile} />
      <BookingModal
        open={!!bookingAppointment}
        onClose={() => setBookingAppointment(null)}
        appointment={bookingAppointment}
        onSuccess={() => {
          setToast("✅ Booking request sent! Waiting for walker confirmation.");
          setTimeout(() => setToast(null), 5000);
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-slide-up">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-white hover:text-gray-200 font-bold">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
