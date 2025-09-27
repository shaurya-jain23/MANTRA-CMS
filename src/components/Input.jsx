import React, { useId, useState, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const Input = function Input({
    label,
    placeholder,
    type = 'text',
    className = '',
    required = false,
    as,
    icon: Icon,
    error,
    disabled = false,
    ...props
}, ref) {
    const id = useId(); 
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const isPasswordInput = type === 'password';
    const inputType = isPasswordInput && isPasswordVisible ? 'text' : type;

    // const inputClasses = twMerge(clsx(
    //     'w-full px-3 py-2 mt-1 border border-slate-200 bg-white text-slate-900',
    //     'placeholder-slate-400 rounded-md focus:outline-none focus:ring-1',
    //     'duration-200 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100',
    //     Icon && 'pl-10', 
    //     isPasswordInput && 'pr-10',
    //     className,
    // ));


    const inputClasses = useMemo(() => twMerge(
        clsx(
            'w-full px-3 py-2 mt-1 border rounded-md text-slate-900',
            'placeholder-slate-400 focus:outline-none focus:ring-1',
            'duration-200 focus:border-transparent',
            {
                // Error state
                'border-red-500 focus:ring-red-500 bg-red-50': error,
                // Normal state
                'border-slate-200 focus:ring-blue-500 focus:border-transparent': !error,
                // Disabled state
                'bg-gray-100 cursor-not-allowed opacity-70': disabled,
                'bg-white': !disabled,
                // Icons padding
                'pl-10': Icon,
                'pr-10': isPasswordInput,
                // Textarea specific
                'min-h-[100px] resize-vertical': as === 'textarea',
                'h-10': as !== 'textarea'
            }
        ),
        className
    ), [error, disabled, Icon, isPasswordInput, as, className]);

    return (
        <div className='flex flex-col w-full'>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-gray-700">
                    {label}{required && <span className='text-red-500'> *</span>}
                </label>
            )}

            <div className="relative flex items-center">
                {Icon && (
                    <div className={clsx(
                        "absolute inset-y-0 flex items-center pointer-events-none z-10",
                        error ? "text-red-500" : "text-slate-400"
                    )}>
                        <Icon className="w-5 h-5 ml-3"/>
                    </div>
                )}

                {as === 'textarea' ? (
                    <textarea
                        id={id}
                        placeholder={placeholder}
                        required={required}
                        disabled={disabled}
                        className={inputClasses}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? `${id}-error` : undefined}
                        ref={ref}
                        {...props}
                    />
                ) : (
                    <input
                        id={id}
                        placeholder={placeholder}
                        type={inputType}
                        required={required}
                        disabled={disabled}
                        className={inputClasses}
                        ref={ref}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? `${id}-error` : undefined}
                        {...props}
                    />
                )}

                {isPasswordInput && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className={clsx(
                            "absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none z-10",
                            "transition-colors duration-200",
                            disabled 
                                ? "text-slate-300 cursor-not-allowed" 
                                : error 
                                ? "text-red-500 hover:text-red-700" 
                                : "text-slate-400 hover:text-slate-600"
                        )}
                        aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                        aria-disabled={disabled}
                    >
                        {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
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
    );
};

export default React.forwardRef(Input);
