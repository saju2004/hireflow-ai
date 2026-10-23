import React from 'react';

export const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  if (type === 'table') {
    return (
      <div className="w-full animate-pulse space-y-3">
        <div className="h-10 bg-slate-200 rounded w-full"></div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface p-5 rounded-lg border border-border h-28 flex flex-col justify-between">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          <div className="h-3 bg-slate-100 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
