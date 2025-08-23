// src/components/dashboard/ColorBar.jsx
import React from 'react';

// A mapping from color names to Tailwind CSS background color classes
const colorMap = {
  RED: 'bg-red-500',
  BLUE: 'bg-blue-500',
  GREEN: 'bg-green-500',
  BLACK: 'bg-black',
  GREY: 'bg-gray-500',
  WHITE: 'bg-gray-100 border border-gray-300', // White needs a border to be visible
};

function ColorBar({ colorString }) {
  if (!colorString || typeof colorString !== 'string') {
    return null; // Don't render if the data is missing or invalid
  }

  // Parse the string "RED-35, BLUE-15..." into an array of objects
  const colors = colorString.split(',').map(part => {
    const [name, value] = part.trim().split('-');
    return {
      name: name.trim().toUpperCase(),
      value: parseInt(value, 10),
    };
  }).filter(color => !isNaN(color.value) && color.value > 0);

  const total = colors.reduce((sum, color) => sum + color.value, 0);
  if (total === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-500 capitalize mb-1">Color Distribution</h4>
      <div className="flex w-full h-6 rounded-md overflow-hidden border">
        {colors.map((color, index) => (
          <div
            key={index}
            className={`flex items-center justify-center text-xs font-semibold text-white ${colorMap[color.name] || 'bg-gray-300'}`}
            style={{ width: `${(color.value / total) * 100}%` }}
            title={`${color.name}: ${color.value}`}
          >
            {/* Optionally show text if the segment is wide enough */}
            {(color.value / total) * 100 > 15 && <span className="truncate">{color.name.slice(0,3)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ColorBar;
