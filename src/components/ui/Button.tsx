import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    // Base classes
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    // Variant classes
    const variantClasses = {
      primary: "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-600",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 focus-visible:ring-gray-400",
      outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-900 focus-visible:ring-gray-400",
      ghost: "bg-transparent text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 focus-visible:ring-gray-400",
    };
    
    // Size classes
    const sizeClasses = {
      sm: "px-3 py-1 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
    };
    
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
