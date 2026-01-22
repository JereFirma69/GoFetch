import React, { useEffect, useState } from "react";
import SearchFilterTable from "../shared_components/SearchFilterTable";
import { searchApi } from "../utils/searchApi";

export default function SearchTerminiPage() {
  const [termini, setTermini] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    minPrice: 0,
    maxPrice: 1000,
    location: "",
    type: "", // "city_walk", "park_walk", "home_walking"
    availability: "", // "available", "booked"
  });

  useEffect(() => {
    loadTermini();
  }, []);

  const loadTermini = async () => {
    setLoading(true);
    try {
      const data = await searchApi.searchTermini({
        q: searchQ,
        startDate: filters.startDate,
        endDate: filters.endDate,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        location: filters.location,
        type: filters.type,
        availability: filters.availability,
      });
      setTermini(data?.termini || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadTermini();
  };

  const columns = [
    { key: "walkerName", title: "Walker", render: (r) => `${r.walkerFirstName || ""} ${r.walkerLastName || ""}`.trim() },
    { key: "location", title: "Location" },
    { key: "type", title: "Type" },
    { key: "startTime", title: "Start Time", render: (r) => new Date(r.startTime).toLocaleString() },
    { key: "endTime", title: "End Time", render: (r) => new Date(r.endTime).toLocaleString() },
    { key: "price", title: "Price", render: (r) => `${r.price} €` },
    { 
      key: "availability", 
      title: "Status", 
      render: (r) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          r.availability === "available" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        }`}>
          {r.availability === "available" ? "Available" : "Booked"}
        </span>
      )
    },
  ];

  const filteredData = termini
    .filter((t) => {
      if (!searchQ) return true;
      const q = searchQ.toLowerCase();
      return (
        t.walkerFirstName?.toLowerCase().includes(q) ||
        t.walkerLastName?.toLowerCase().includes(q) ||
        t.location?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      <div className="text-2xl font-bold text-gray-800">Find Walking Slots</div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search by walker or location..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Types</option>
            <option value="city_walk">City Walk</option>
            <option value="park_walk">Park Walk</option>
            <option value="home_walking">Home Walking</option>
          </select>
          <select
            value={filters.availability}
            onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600">Min Price</label>
            <input
              type="number"
              min="0"
              max="1000"
              step="5"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: parseFloat(e.target.value) })}
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
        title={`${filteredData.length} slots found`}
        filters={[]}
        activeFilter=""
        onFilterChange={() => {}}
        searchValue=""
        onSearchChange={() => {}}
        columns={columns}
        data={filteredData}
        actions={(row) => (
          <button
            onClick={() => alert("Book slot: " + row.terminId)}
            className="px-3 py-1 text-sm rounded bg-teal-600 text-white hover:bg-teal-700"
          >
            Book
          </button>
        )}
      />
    </div>
  );
}
