import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div 
        className="flex items-center gap-1"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        <HelpCircle size={16} className="text-slate-400 cursor-help" />
      </div>
      {isVisible && (
        <div className="absolute z-10 w-48 p-2 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded shadow-lg bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 mb-2">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;