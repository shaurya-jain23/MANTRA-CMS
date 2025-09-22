import React, { useId, useState } from 'react';
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
    ...props
}, ref) {
    const id = useId(); 
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const isPasswordInput = type === 'password';
    const inputType = isPasswordInput && isPasswordVisible ? 'text' : type;

    const inputClasses = twMerge(clsx(
        'w-full px-3 py-2 mt-1 border border-slate-200 bg-white text-slate-900',
        'placeholder-slate-400 rounded-md focus:outline-none focus:ring-1',
        'duration-200 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100',
        Icon && 'pl-10', 
        isPasswordInput && 'pr-10',
        className,
    ));

    return (
        <div className='flex flex-col w-full'>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-gray-700">
                    {label}{required && <span className='text-red-500'> *</span>}
                </label>
            )}

            <div className="relative flex items-center">
                {Icon && (
                    <div className="absolute left-0 pl-3 inset-y-0 flex items-center pointer-events-none">
                        <Icon className="w-5 h-5 text-slate-400"/>
                    </div>
                )}

                {as === 'textarea' ? (
                    <textarea
                        id={id}
                        placeholder={placeholder}
                        required={required}
                        className={`min-h-[100px] resize-vertical ${inputClasses}`}
                        ref={ref}
                        {...props}
                    />
                ) : (
                    <input
                        id={id}
                        placeholder={placeholder}
                        type={inputType}
                        required={required}
                        className={`h-10 ${inputClasses}`}
                        ref={ref}
                        {...props}
                    />
                )}

                {isPasswordInput && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                    >
                        {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default React.forwardRef(Input);
