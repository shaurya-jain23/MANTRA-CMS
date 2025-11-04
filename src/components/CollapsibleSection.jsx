import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CollapsibleSection = ({
  title,
  isOpen,
  onToggle,
  children,
  isComplete = false,
  className = '',
  headerClassName = '',
  titleClassName = '',
  contentClassName = '',
  icon: Icon = ChevronDown,
  badge,
  disabled = false,
}) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen, children]);

  const handleClick = () => {
    if (!disabled && onToggle) {
      onToggle();
    }
  };

  const getStatusStyles = () => {
    if (isComplete === null) return '';
    if (isComplete) return 'bg-green-50 hover:bg-green-100';
    return 'bg-gray-100 hover:bg-gray-200';
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}
    >
      <div
        className={`
          flex justify-between items-center p-4 rounded-t-lg
          transition-all duration-200 
          ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${getStatusStyles()}
          ${headerClassName}
        `}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        keydown={(e) => e.key === 'Enter' && handleClick()}
        aria-expanded={isOpen}
      >
        <h2 className={`text-lg font-semibold text-slate-900 flex items-center gap-2 ${titleClassName}`}>
          {badge && badge}
          <span>{title}</span>
          {isComplete && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Complete
            </span>
          )}
        </h2>
        <span className="text-slate-600">
          <Icon
            size={20}
            className={`transform duration-300 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </span>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out`}
        style={{ height: `${height}px` }}
      >
        <div ref={contentRef} className={contentClassName}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
