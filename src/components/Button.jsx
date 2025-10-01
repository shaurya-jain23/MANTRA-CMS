import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

function Button({
  children,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  bgColor = '',
  textColor = '',
  className = '',
  ...props
}) {

  const baseClasses = `inline-flex items-center justify-center font-medium rounded-md cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`;

  const variantClasses = {
    primary: 'w-full bg-gradient-to-br from-blue-800 to-blue-600 hover:to-blue-900 text-white focus:ring-blue-500',
    secondary: 'w-fit bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 focus:ring-slate-200',
    ghost: 'w-fit bg-transparent hover:bg-slate-200 text-slate-700 focus:ring-slate-200',
  };

  const sizeClasses = {
    small: 'p-2 h-8 text-xs rounded-full', 
    medium: 'px-4 py-2 h-10 text-sm',
    large: 'px-6 py-3 h-12 text-base'
  }

  const allClasses = twMerge(
    clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      bgColor && `${bgColor}`,
      textColor && `${textColor}`,
      className,
    ),
  );

  return (
    <button
      className={allClasses} type={type} {...props}
    >
      {children}
    </button>
  );
}

export default Button;