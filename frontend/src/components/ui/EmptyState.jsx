import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-surface border border-dashed border-border rounded-lg ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {description && <p className="mt-1 text-sm text-text-muted max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
