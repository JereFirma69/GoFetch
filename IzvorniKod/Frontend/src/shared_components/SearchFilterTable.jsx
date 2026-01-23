import React from "react";

// Simple reusable table with search and filter tabs
export default function SearchFilterTable({
  title,
  filters = [],
  activeFilter,
  onFilterChange,
  searchValue,
  onSearchChange,
  columns = [],
  data = [],
  actions, // optional render function per row
  emptyText = "No results",
}) {
  return (
    <div className="bg-white shadow rounded-lg p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="text-lg font-semibold text-gray-800">{title}</div>
        {onSearchChange && searchValue !== undefined && (
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search..."
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-400"
          />
        )}
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange?.(f.value)}
              className={`px-3 py-1 rounded-full text-sm border ${
                activeFilter === f.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              {columns.map((c) => (
                <th key={c.key} className="py-2 pr-4 font-semibold">{c.title}</th>
              ))}
              {actions && <th className="py-2 pr-4" />}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-4 text-center text-gray-500">
                  {emptyText}
                </td>
              </tr>
            )}
            {data.map((row) => (
              <tr key={row.id || row.key || JSON.stringify(row)} className="border-b last:border-b-0">
                {columns.map((c) => (
                  <td key={c.key} className="py-2 pr-4 text-gray-800">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
                {actions && <td className="py-2 pr-4">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
