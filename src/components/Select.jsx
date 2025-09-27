import React, { useId, useMemo } from 'react'
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

function Select({
    options,
    label,
    className,
    placeholder= 'Please select an option',
    required=false,
    error,
    disabled = false,
    ...props
}, ref) {
    const id = useId()


      const selectClasses = twMerge(
        clsx(
            'h-10 px-3 py-2 mt-1 border rounded-md text-slate-900',
            'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent',
            'duration-200 w-full appearance-none',
            {
                'border-red-500 focus:ring-red-500 bg-red-50': error,
                'border-slate-200': !error,
                'bg-gray-100 cursor-not-allowed opacity-70': disabled,
                'bg-white cursor-pointer': !disabled,
                'pl-10': props.icon
            }
        ),
        className
    );
    
  return (
    <div className='flex flex-col'>
        {label && (
                <label className='pl-1 text-sm font-medium text-gray-700' htmlFor={id}>
                    {label}
                    {required && <span className='text-red-500'> *</span>}
                </label>
            )}
        <div className="relative">
            {props.icon && (
                    <div className="absolute left-0 pl-3 inset-y-0 flex items-center pointer-events-none">
                        <props.icon className="w-5 h-5 text-slate-400" />
                    </div>
                )}
            <select 
            name=""
            {...props} 
            id={id} 
            ref={ref} 
            required 
            className={selectClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : undefined}
            >
            <option key={placeholder} value={placeholder} disabled>{placeholder || 'Please select an option'}</option>
            {options?.map((option)=>{
                const value = typeof option === 'object' ? option.value : option.trim().toLowerCase().replace(/\s+/g, '_')
                return(
                <option key = {value} value={value} option={option.name || option}>
                    {option.name || option }
                </option>)
            })}
        </select>
        {/* Custom dropdown arrow */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
        </div>
        {error && (
                <p id={`${id}-error`} className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
    </div>
  )
}

export default React.forwardRef(Select)