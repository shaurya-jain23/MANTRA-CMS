import React from 'react';
import { ChevronDown } from "lucide-react";

function ShowMoreButton({ onClick }) {
  return (
    <div className="relative -mt-10 h-20 pointer-events-none w-full">
      <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent backdrop-blur-sm"></div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <button
          onClick={onClick}
          className="flex flex-col items-center text-blue-500 hover:text-blue-800 transition-colors duration-200"
          aria-label="Show more containers"
        >
          <span className="text-base font-semibold">Show More</span>
          <ChevronDown className="h-8 w-8 animate-bounce"/>
        </button>
      </div>
    </div>
  );
}

export default ShowMoreButton;