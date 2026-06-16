import React from 'react';

interface SkeletonLoaderProps {
  type: 'kpis' | 'table' | 'grid' | 'charts' | 'form';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 6 }) => {
  const shimmerClass = "animate-pulse bg-slate-200 dark:bg-slate-700/50 rounded-xl";

  if (type === 'kpis') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#1f2937]/25 border border-slate-200/60 dark:border-[#374151]/30 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-3"
          >
            <div className={`h-4 w-2/3 ${shimmerClass}`} />
            <div className={`h-8 w-1/2 ${shimmerClass}`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white dark:bg-[#1f2937]/25 border border-slate-200/60 dark:border-[#374151]/30 rounded-3xl overflow-hidden shadow-sm dark:shadow-none p-6 space-y-4">
        {/* Table Header Placeholder */}
        <div className="flex gap-4 border-b border-slate-100 dark:border-[#374151]/35 pb-4">
          <div className={`h-4 w-1/4 ${shimmerClass}`} />
          <div className={`h-4 w-1/4 ${shimmerClass}`} />
          <div className={`h-4 w-1/6 ${shimmerClass}`} />
          <div className={`h-4 w-1/6 ${shimmerClass}`} />
          <div className={`h-4 w-1/6 ${shimmerClass}`} />
        </div>
        {/* Table Rows Placeholders */}
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="flex gap-4 items-center py-3 border-b border-slate-50 dark:border-[#374151]/20 last:border-none">
            <div className="flex-1 space-y-2">
              <div className={`h-4 w-3/4 ${shimmerClass}`} />
              <div className={`h-3 w-1/2 ${shimmerClass}`} />
            </div>
            <div className="flex-1 space-y-2">
              <div className={`h-4 w-2/3 ${shimmerClass}`} />
              <div className={`h-3 w-1/3 ${shimmerClass}`} />
            </div>
            <div className={`h-6 w-1/6 ${shimmerClass}`} />
            <div className={`h-4 w-1/6 ${shimmerClass}`} />
            <div className="flex gap-2 w-1/6 justify-end">
              <div className={`h-8 w-8 ${shimmerClass}`} />
              <div className={`h-8 w-16 ${shimmerClass}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#1f2937]/25 border border-slate-200/60 dark:border-[#374151]/30 rounded-3xl p-6 shadow-sm dark:shadow-none space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className={`h-6 w-1/2 ${shimmerClass}`} />
                <div className={`h-4 w-1/6 ${shimmerClass}`} />
              </div>
              <div className={`h-8 w-1/3 ${shimmerClass} mt-2`} />
              <div className={`h-4 w-2/3 ${shimmerClass} mt-1`} />
            </div>
            <div className="border-t border-slate-100 dark:border-[#374151]/20 pt-4 flex justify-between items-center mt-4">
              <div className={`h-4 w-1/2 ${shimmerClass}`} />
              <div className="flex gap-2">
                <div className={`h-8 w-8 ${shimmerClass}`} />
                <div className={`h-8 w-8 ${shimmerClass}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'charts') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#1f2937]/20 border border-slate-200/60 dark:border-[#374151]/30 rounded-3xl p-6 shadow-sm dark:shadow-none space-y-6"
          >
            <div className={`h-4 w-1/3 ${shimmerClass}`} />
            <div className={`h-[240px] w-full ${shimmerClass}`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="max-w-2xl bg-white dark:bg-[#1f2937]/20 border border-slate-200/60 dark:border-[#374151]/30 rounded-3xl p-6 space-y-6 shadow-sm dark:shadow-none">
        <div className={`h-4 w-1/4 ${shimmerClass}`} />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className={`h-3 w-1/6 ${shimmerClass}`} />
            <div className={`h-12 w-full ${shimmerClass}`} />
          </div>
          <div className="space-y-2">
            <div className={`h-3 w-1/6 ${shimmerClass}`} />
            <div className={`h-12 w-full ${shimmerClass}`} />
          </div>
          <div className={`h-16 w-full ${shimmerClass} mt-4`} />
        </div>
      </div>
    );
  }

  return null;
};
