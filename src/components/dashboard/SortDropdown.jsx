// src/components/dashboard/SortDropdown.jsx
import React from 'react';

const sortOptions = [
    { key: 'eta_asc', label: 'ETA: Soonest First' },
    { key: 'eta_desc', label: 'ETA: Latest First' },
  { key: 'model_asc', label: 'Model (A-Z)' },
  { key: 'model_desc', label: 'Model (Z-A)' },
  { key: 'company_asc', label: 'Company (A-Z)' },
  { key: 'company_desc', label: 'Company (Z-A)' },
  { key: 'color_bright', label: 'More Bright Colors' },
  { key: 'color_dark', label: 'More Dark Colors' },
];

function SortDropdown({ sortKey, setSortKey }) {
  return (
    <div className="flex items-center">
      <label htmlFor="sort" className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
      <select
        id="sort"
        value={sortKey}
        onChange={(e) => setSortKey(e.target.value)}
        className="block w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      >
        {sortOptions.map(option => (
          <option key={option.key} value={option.key}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

export default SortDropdown;
