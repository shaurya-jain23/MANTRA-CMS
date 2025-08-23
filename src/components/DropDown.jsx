import React, { useState, useImperativeHandle, forwardRef, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const DropDown = forwardRef(({ label = "Select", options = [], selected, onChange }, ref) => {
  const [open, setOpen] = useState(false);
  const refer = useRef(null);
   // close dropdown on outside click
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (refer.current && !refer.current.contains(e.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

  // expose functions to parent using ref
  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen((prev) => !prev),
    select: (value) => {
      const option = options.find((o) => o.value === value);
      if (option) onChange(option.value);
    },
  }));

  const handleSelect = (option) => {
    onChange(option.key); 
    setOpen(false);
};

  return (
    <div className="relative inline-block text-left w-70" ref={refer}>

      {/* Dropdown Header */}
      <div
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between transition cursor-pointer px-3 py-2 bg-white text-sm border border-gray-300 ${open ? "rounded-t-xs border-b-0" : "rounded-xs delay-300"}`}
      >
        <span>
          {label} :{" "}
            <span className="font-semibold">
                {options.find((o) => o.key === selected)?.label || options[0]?.label}
            </span>
        </span>
        <ChevronDown
          className={`w-6 h-6 ml-2 text-gray-400 duration-300 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>
      {/* Dropdown Menu */}
        <div className= {`absolute left-0 right-0 border border-gray-300 border-t-0 rounded-b-xs bg-white shadow-lg z-50 transition-all duration-300 ease-in-out overflow-hidden ${open ? 'max-h-screen' : 'max-h-0 border-b-0'}`}>
          <ul className="py-1">
            {options.map((opt) => (
              <li
                key={opt.key}
                onClick={() => handleSelect(opt)}
                className={`px-4 py-2 cursor-pointer text-sm ${
                  selected === opt.key
                    ? "bg-gray-100 font-semibold text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
    </div>
  );
});

DropDown.displayName = "DropDown";

export default DropDown;
