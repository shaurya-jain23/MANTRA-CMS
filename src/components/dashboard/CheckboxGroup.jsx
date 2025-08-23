// src/components/dashboard/CheckboxGroup.jsx
import React from 'react';

function CheckboxGroup({ title, options, selectedOptions, onChange }) {
  const handleCheckboxChange = (option) => {
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];
    onChange(newSelection);
  };

  return (
    <div>
      <h4 className="font-semibold text-gray-700 mb-2">{title}</h4>
      <div className="space-y-1 max-h-40 overflow-y-auto p-1 border rounded-md">
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              checked={selectedOptions.includes(option)}
              onChange={() => handleCheckboxChange(option)}
            />
            <span className="text-sm text-gray-600">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default CheckboxGroup;
