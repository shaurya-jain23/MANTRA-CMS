// src/components/dashboard/ColorBar.jsx
import React from 'react';

// A mapping from color names to Tailwind CSS background color classes
const colorMap = {
  RED: 'bg-red-300',
  BLUE: 'bg-sky-300',
  GREEN: 'bg-lime-200',
  BLACK: 'bg-neutral-800',
  GREY: 'bg-gray-500',
  WHITE: 'bg-gray-50 border border-gray-300 rounded-l-lg', // White needs a border to be visible
};
const textMap = {
  RED: 'text-red-800',
  BLUE: 'text-cyan-800',
  GREEN: 'text-green-700',
  BLACK: 'text-stone-300',
  GREY: 'text-gray-800',
  WHITE: 'text-gray-400', // White needs a border to be visible
};

const colorOrder = {
  RED: 3,
  BLUE: 5,
  GREEN: 6,
  BLACK: 3,
  GRAY: 2,
  WHITE: 1, 
}

function ColorBar({ colorString }) {
  if (!colorString || typeof colorString !== 'string') {
    return null; // Don't render if the data is missing or invalid
  }

  // Parse the string "RED-35, BLUE-15..." into an array of objects
  const colors = colorString.replace(/\s/g, '').split(/[，, ; \s]/).map(part => {
    const [name, value] = part.trim().split(/[- :]/);
    return {
      name: name.trim().toUpperCase(),
      value: parseInt(value, 10),
    };
  }).filter(color => !isNaN(color.value) && color.value > 0).sort((a, b) => colorOrder[a.name] - colorOrder[b.name]);

  console.log(colors);
  

  const total = colors.reduce((sum, color) => sum + color.value, 0);
  if (total === 0) return null;

  return (
    <div className='inline-block w-xl'>
         <div className="flex w-full h-6 overflow-hidden border-0 rounded-md">
        {colors.map((color, index) => (
          <div
            key={index}
            className={`flex items-center justify-center text-xs font-semibold ${textMap[color.name]} ${colorMap[color.name] || 'bg-gray-300'}`}
            style={{ width: `${(color.value / total) * 100}%` }}
            title={`${color.name}: ${color.value}`}
          >
            {/* Optionally show text if the segment is wide enough */}
            {(color.value / total) * 100 > 10 && <span className="truncate">{color.name.slice(0,3)}</span>}
          </div>
        ))}
      </div>
    </div>
     
  );
}

export default ColorBar;
