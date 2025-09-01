import React, { useId } from 'react';

const Input = function Input({
    label,
    placeholder,
    type = 'text',
    className = '',
    required=false,
    ...props
}, ref) {
  const id = useId();
  return (
    <div>
        {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}{required && <span className='text-red-500'> *</span>}
        </label>}
        <input
            id={id}
            placeholder={placeholder}
            type={type}
            required={required}
            className={`w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm outline-none duration-200 focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
            ref={ref}
            {...props}
        />
    </div>
  );
};

export default React.forwardRef(Input);