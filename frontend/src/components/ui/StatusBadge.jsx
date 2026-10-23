import React from 'react';

export const StatusBadge = ({ status, size = 'sm' }) => {
  if (!status) return null;

  const statusConfig = {
    // Application Stages
    APPLIED: { label: 'Applied', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    SCREENING: { label: 'Screening', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    SHORTLISTED: { label: 'Shortlisted', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    INTERVIEW: { label: 'Interview', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    OFFER: { label: 'Offer', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    HIRED: { label: 'Hired', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    REJECTED: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    WITHDRAWN: { label: 'Withdrawn', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },

    // Job Statuses
    DRAFT: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    PUBLISHED: { label: 'Published', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    PAUSED: { label: 'Paused', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    CLOSED: { label: 'Closed', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },

    // Account Statuses
    ACTIVE: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    SUSPENDED: { label: 'Suspended', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    SCHEDULED: { label: 'Scheduled', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    COMPLETED: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
  };

  const config = statusConfig[status] || {
    label: status,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.text.replace('text-', 'bg-')}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
