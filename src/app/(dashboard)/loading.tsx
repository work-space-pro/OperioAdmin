import React from 'react'

export default function GlobalDashboardLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-72 bg-slate-100 rounded-md"></div>
        </div>
        <div className="h-9 w-32 bg-slate-200 rounded-xl"></div>
      </div>

      {/* Top Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 p-5 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-200 rounded"></div>
              <div className="w-8 h-8 rounded-xl bg-slate-100"></div>
            </div>
            <div className="h-8 w-16 bg-slate-200 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-xs">
          <div className="h-5 w-40 bg-slate-200 rounded"></div>
          <div className="h-4 w-full bg-slate-100 rounded"></div>
          <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
          <div className="h-4 w-4/6 bg-slate-100 rounded"></div>
          <div className="h-32 w-full bg-slate-50 rounded-xl mt-4"></div>
        </div>
        <div className="h-96 bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-xs">
          <div className="h-5 w-32 bg-slate-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-14 bg-slate-50 rounded-xl p-3 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 bg-slate-200 rounded"></div>
                  <div className="h-2.5 w-16 bg-slate-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
