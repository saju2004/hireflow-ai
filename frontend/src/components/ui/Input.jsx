import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`block w-full rounded-md border text-sm text-text-primary placeholder:text-text-muted bg-surface transition-colors
            ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2
            ${error
              ? 'border-status-danger focus:border-status-danger focus:ring-1 focus:ring-status-danger'
              : 'border-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
            }
            disabled:bg-surface-subtle disabled:cursor-not-allowed ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-status-danger">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-text-muted">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
