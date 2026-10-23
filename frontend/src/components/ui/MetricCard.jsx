import React from 'react';

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className = '',
}) => {
  return (
    <div className={`bg-surface p-5 rounded-lg border border-border shadow-card ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{title}</span>
        {Icon && (
          <div className="p-2 rounded-md bg-brand-50 text-brand-600">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-text-primary">{value}</span>
        {trend && (
          <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-slate-500'}`}>
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-text-muted">{subtitle}</p>}
    </div>
  );
};

export default MetricCard;
