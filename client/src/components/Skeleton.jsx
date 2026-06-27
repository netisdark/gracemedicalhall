import React from 'react';

export const SkeletonPulse = ({ className = '', style }) => (
  <div 
    className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded ${className}`} 
    style={style}
  />
);

export const SkeletonCard = () => (
  <div className="glass-card p-5 flex flex-col gap-4">
    <div className="flex justify-between items-center">
      <SkeletonPulse className="h-4 w-20" />
      <SkeletonPulse className="h-8 w-8 rounded-lg" />
    </div>
    <SkeletonPulse className="h-8 w-28" />
    <SkeletonPulse className="h-3.5 w-36" />
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div className="w-full overflow-hidden glass-card">
    <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonPulse key={i} className="h-5 flex-1" />
      ))}
    </div>
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="p-4 flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonPulse key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonChart = () => (
  <div className="glass-card p-6 flex flex-col gap-4 h-[320px]">
    <div className="flex flex-col gap-2">
      <SkeletonPulse className="h-5 w-44" />
      <SkeletonPulse className="h-3 w-56" />
    </div>
    <div className="flex-1 flex items-end gap-3 mt-6">
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonPulse 
          key={i} 
          className="w-full rounded-t-lg" 
          style={{ height: `${20 + Math.random() * 60}%` }} 
        />
      ))}
    </div>
  </div>
);
