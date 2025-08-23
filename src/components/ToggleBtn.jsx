import React, { useState } from 'react'

const ToggleBtn = ({
    icon: Icon,
    className = '',
    label,
    onToggle,
    defaultActive = false,
    ...props
}) => {
    const [active, setActive] = useState(defaultActive);
    const handleClick = () => {
        const newState = !active;
        setActive(newState);
        if (onToggle) onToggle(newState);
    };
  return (
    <button
         onClick={handleClick}
        className={`px-4 py-2 rounded-full border text-sm duration-200 font-normal transition ${className}
        ${active
            ? `bg-blue-600/10 text-blue-500 border-2 border-blue-500`
            : `bg-white text-gray-700 border-gray-300 hover:bg-gray-100`
        }`}
        {...props}
    >
        {Icon && <Icon className="w-4 h-4" />}
        {label.toUpperCase()}
    </button>
  )
}

export default ToggleBtn;