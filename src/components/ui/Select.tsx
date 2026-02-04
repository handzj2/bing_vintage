// src/components/ui/Select.tsx - NEW FILE
import React from 'react';
import { cn } from '@/lib/utils/helpers';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      size = 'md',
      leftIcon,
      leftAddon,
      rightIcon,
      rightAddon,
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftAddon && (
            <div className="absolute inset-y-0 left-0 flex items-center">
              {leftAddon}
            </div>
          )}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{leftIcon}</span>
            </div>
          )}
          <select
            ref={ref}
            className={cn(
              'block w-full rounded-lg border appearance-none',
              'text-gray-900 bg-white',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'disabled:bg-gray-100 disabled:text-gray-500',
              error 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300',
              leftIcon && !leftAddon ? 'pl-10' : 'pl-3',
              rightIcon && !rightAddon ? 'pr-10' : 'pr-3',
              leftAddon && 'pl-12',
              rightAddon && 'pr-12',
              sizes[size],
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{rightIcon}</span>
            </div>
          )}
          {rightAddon && (
            <div className="absolute inset-y-0 right-0 flex items-center">
              {rightAddon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;