import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-500 shadow-sm',
    secondary: 'bg-surface hover:bg-surface-subtle text-text-primary border border-border focus:ring-brand-500 shadow-sm',
    outline: 'border border-border-strong hover:bg-surface-subtle text-text-secondary focus:ring-brand-500',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle focus:ring-brand-500',
    danger: 'bg-status-danger hover:bg-red-600 text-white focus:ring-red-500 shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
