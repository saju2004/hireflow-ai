import React from 'react';

export const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`block w-full rounded-md border text-sm text-text-primary placeholder:text-text-muted bg-surface p-3 transition-colors
          ${error
            ? 'border-status-danger focus:border-status-danger focus:ring-1 focus:ring-status-danger'
            : 'border-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
          }
          disabled:bg-surface-subtle disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-status-danger">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-text-muted">{helperText}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
