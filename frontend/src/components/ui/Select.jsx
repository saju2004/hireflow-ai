import React from 'react';

export const Select = React.forwardRef(({
  label,
  error,
  options = [],
  className = '',
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`block w-full rounded-md border text-sm text-text-primary bg-surface px-3 py-2 transition-colors
          ${error
            ? 'border-status-danger focus:border-status-danger focus:ring-1 focus:ring-status-danger'
            : 'border-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
          }
          disabled:bg-surface-subtle disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {children || options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-status-danger">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
