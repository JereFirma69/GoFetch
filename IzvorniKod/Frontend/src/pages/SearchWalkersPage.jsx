import React, { useEffect, useState } from "react";
import SearchFilterTable from "../shared_components/SearchFilterTable";
import ProfileModal from "../shared_components/ProfileModal";
import { searchApi } from "../utils/searchApi";

export default function SearchWalkersPage() {
  const [walkers, setWalkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [profile, setProfile] = useState(null);

  const [filters, setFilters] = useState({
    minRating: 0,
    maxPrice: 1000,
    location: "",
  });

  useEffect(() => {
    loadWalkers();
  }, []);

  const loadWalkers = async (params = {}) => {
    setLoading(true);
    try {
      const data = await searchApi.searchWalkers({
        q: searchQ,
        location: locationFilter,
        minRating: filters.minRating,
        maxPrice: filters.maxPrice,
      });
      setWalkers(data?.walkers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadWalkers();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Could also trigger search on filter change
  };

  const columns = [
    { key: "name", title: "Name", render: (r) => `${r.firstName || ""} ${r.lastName || ""}`.trim() },
    { key: "location", title: "Location" },
    { key: "hourlyRate", title: "Hourly Rate", render: (r) => `${r.hourlyRate} €` },
    { key: "rating", title: "Rating", render: (r) => `${r.rating?.toFixed(1) || "N/A"} ⭐` },
    { key: "bio", title: "Bio", render: (r) => (r.bio ? r.bio.substring(0, 50) + "..." : "—") },
  ];

  const filteredData = walkers
    .filter((w) => {
      if (!searchQ) return true;
      const q = searchQ.toLowerCase();
      return (
        w.firstName?.toLowerCase().includes(q) ||
        w.lastName?.toLowerCase().includes(q) ||
        w.bio?.toLowerCase().includes(q)
      );
    })
    .filter((w) => {
      if (locationFilter) {
        return w.location?.toLowerCase().includes(locationFilter.toLowerCase());
      }
      return true;
    });

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      <div className="text-2xl font-bold text-gray-800">Find Dog Walkers</div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by name or bio..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <div>
            <label className="text-xs text-gray-600">Min Rating</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.5"
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Max Price</label>
            <input
              type="number"
              min="0"
              max="1000"
              step="5"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: parseFloat(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700"
        >
          Search
        </button>
      </div>

      {/* Results Table */}
      <SearchFilterTable
        title={`${filteredData.length} walkers found`}
        filters={[]}
        activeFilter=""
        onFilterChange={() => {}}
        searchValue=""
        onSearchChange={() => {}}
        columns={columns}
        data={filteredData}
        actions={(row) => (
          <button
            onClick={() => setProfile({
              name: `${row.firstName || ""} ${row.lastName || ""}`.trim(),
              email: row.email,
              location: row.location,
              phone: row.phone,
              bio: row.bio,
              profilePicture: row.profilePicture,
              rating: row.rating,
              hourlyRate: row.hourlyRate,
              extra: [`Rating: ${row.rating?.toFixed(1) || "N/A"} ⭐`, `Hourly: ${row.hourlyRate} €`],
            })}
            className="px-3 py-1 text-sm rounded border border-gray-300"
          >
            View
          </button>
        )}
      />

      <ProfileModal open={!!profile} onClose={() => setProfile(null)} profile={profile} />
    </div>
  );
}
