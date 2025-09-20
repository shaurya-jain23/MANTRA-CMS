// src/components/Button.jsx
import React from 'react';

function Button({
  children,
  variant = 'primary',
  type = 'button',
  bgColor,
  textColor = 'text-white',
  className = '',
  ...props
}) {

  const baseClasses = `inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`;

  const variantClasses = {
    primary: 'bg-blue-900 hover: bg-blue-800 text-white',
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200", 
    ghost: 'bg-transparent hover: bg-slate-100 text-slate-700',
  };

  const sizeClasses = {
    small: 'px-3 py-1 h-8 text-sm', 
    medium: 'px-4 py-2 h-10 text-sm',
    large: 'px-6 py-3 h-12 text-base'
  }

  return (
    <button
      className={`w-full px-4 py-2 font-semibold rounded-md shadow-sm focus:outline-none focus:ring-offset-2 ${bgColor ? bgColor : 'bg-gradient-to-br from-blue-800 to-blue-600'}  ${textColor} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;