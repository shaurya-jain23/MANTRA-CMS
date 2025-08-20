// src/components/Button.jsx
import React from 'react';

function Button({
  children,
  type = 'button',
  bgColor = 'bg-indigo-600',
  textColor = 'text-white',
  className = '',
  ...props
}) {
  return (
    <button
      className={`w-full px-4 py-2 font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${bgColor} ${textColor} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;