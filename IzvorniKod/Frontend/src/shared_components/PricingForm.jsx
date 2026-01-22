import React, { useState, useEffect } from "react";

export default function PricingForm({ initial, onSave, loading }) {
  const [monthly, setMonthly] = useState(initial?.monthlyPrice ?? "");
  const [yearly, setYearly] = useState(initial?.yearlyPrice ?? "");
  const [currency, setCurrency] = useState(initial?.currency ?? "EUR");

  useEffect(() => {
    setMonthly(initial?.monthlyPrice ?? "");
    setYearly(initial?.yearlyPrice ?? "");
    setCurrency(initial?.currency ?? "EUR");
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({ monthlyPrice: parseFloat(monthly || 0), yearlyPrice: parseFloat(yearly || 0), currency });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white shadow rounded-lg p-4">
      <div className="text-lg font-semibold text-gray-800">Membership Pricing</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-gray-700">Monthly price</span>
          <input
            type="number"
            step="0.01"
            value={monthly}
            onChange={(e) => setMonthly(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-700">Yearly price</span>
          <input
            type="number"
            step="0.01"
            value={yearly}
            onChange={(e) => setYearly(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-700">Currency</span>
          <input
            type="text"
            maxLength={5}
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            className="border rounded px-3 py-2"
            required
          />
        </label>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
