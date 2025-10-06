import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CollapsibleSection = ({ 
  title, 
  isOpen, 
  onToggle, 
  children, 
  isComplete = false,
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 shadow-gray-100  ${className}`}>
      <div 
        className={`flex justify-between items-center p-4 rounded-t-lg cursor-pointer ${
          isComplete === null ? '' : isComplete ? 'bg-green-50' : 'bg-slate-50'
        }`}
        onClick={onToggle}
      >
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          {title}
          {isComplete && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Complete</span>
          )}
        </h2>
        <span className="text-slate-600">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </div>
      <div className={`max-h-fit ${isOpen ? 'open' : ''}`}>
        {isOpen && children}
      </div>
    </div>
  );
};

export default CollapsibleSection;