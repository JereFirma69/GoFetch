import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchFilterTable from "../shared_components/SearchFilterTable";
import ProfileModal from "../shared_components/ProfileModal";
import { searchApi } from "../utils/searchApi";
import verifiedBadge from "../assets/verification.png";

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

export default function SearchPage() {
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

  useEffect(() => {
    setSearchParams({ tab });
  }, [tab, setSearchParams]);

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
        render: (r) => (
          <div className="flex items-center justify-center">
            {r.ProfilePicture ? (
              <img 
                src={r.ProfilePicture} 
                alt={r.FullName} 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold">
                {r.FullName?.charAt(0) || "?"}
              </div>
            )}
          </div>
        ),
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
      { key: "WalkerName", title: "Walker" },
      { key: "Location", title: "Location" },
      { key: "Type", title: "Type" },
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
        render: (r) => (r.IsAvailable ? "Available" : "Booked"),
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

  const renderWalkers = () => (
    <div style={cardStyle}>
      <div className="flex" style={{ gap: "12px", flexWrap: "wrap", marginBottom: 12 }}>
        <input
          style={{ flex: 1, minWidth: 220, padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
          placeholder="Search by name or bio..."
          value={walkerSearch}
          onChange={(e) => setWalkerSearch(e.target.value)}
        />
        <input
          style={{ flex: 1, minWidth: 200, padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
          placeholder="Location"
          value={walkerLocation}
          onChange={(e) => setWalkerLocation(e.target.value)}
        />
        <button
          onClick={fetchWalkers}
          style={{ padding: "10px 16px", background: "#0f766e", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600 }}
        >
          {walkerLoading ? "Loading..." : "Search"}
        </button>
      </div>

      <SearchFilterTable
        title={`${walkerData.length} walkers found`}
        searchValue=""
        onSearchChange={() => {}}
        columns={walkerColumns}
        data={walkerData}
        actions={(row) => (
          <button
            onClick={() => setProfile({
              name: row.FullName,
              email: row.Email,
              phone: row.Phone,
              location: row.Location,
              profilePicture: row.ProfilePicture,
              bio: row.Bio,
              rating: row.Rating,
              ratingCount: row.RatingCount,
              isVerified: row.IsVerified === true,
              walkerId: row.WalkerId,
            })}
            className="px-3 py-1 text-sm rounded border border-gray-300"
          >
            View
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
          placeholder="Search by walker or location..."
          value={slotSearch}
          onChange={(e) => setSlotSearch(e.target.value)}
        />
        <input
          type="date"
          style={{ width: 170, padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
          value={slotDate}
          onChange={(e) => setSlotDate(e.target.value)}
        />
        <input
          style={{ flex: 1, minWidth: 200, padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
          placeholder="Location"
          value={slotLocation}
          onChange={(e) => setSlotLocation(e.target.value)}
        />
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
      </div>

      <SearchFilterTable
        title={`${slotData.length} appointments found`}
        searchValue=""
        onSearchChange={() => {}}
        columns={slotColumns}
        data={slotData}
        actions={(row) => (
          <button
            onClick={() => setProfile({
              name: row.WalkerName,
              location: row.Location,
              profilePicture: row.WalkerProfilePicture,
              walkerId: row.WalkerId,
            })}
            className="px-3 py-1 text-sm rounded border border-gray-300"
          >
            View
          </button>
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

      <ProfileModal open={!!profile} onClose={() => setProfile(null)} profile={profile} />
    </div>
  );
}
