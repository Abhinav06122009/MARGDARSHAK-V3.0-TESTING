import React from 'react';

// Animated shimmer bar
const ShimmerBar = ({ w = 'w-full', h = 'h-4', rounded = 'rounded-lg' }: { w?: string; h?: string; rounded?: string }) => (
  <div className={`${w} ${h} ${rounded} relative overflow-hidden bg-white/[0.04]`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
  </div>
);

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-zinc-950 text-zinc-400 overflow-hidden">
    {/* Ambient orbs */}
    <div className="fixed -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
    <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

    <style>{`
      @keyframes shimmer { from { transform: translateX(-100%); } to { transform: translateX(200%); } }
    `}</style>

    <div className="relative z-10 max-w-[1600px] 2xl:max-w-[2000px] 4xl:max-w-[3200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

      {/* Header Skeleton */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-zinc-900/50 border border-white/[0.06] backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/[0.04] relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            </div>
            <div className="space-y-2">
              <ShimmerBar w="w-32" h="h-4" />
              <ShimmerBar w="w-20" h="h-3" />
            </div>
            <div className="h-7 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/20" />
          </div>
          <div className="flex items-center gap-3">
            <ShimmerBar w="w-24" h="h-9" rounded="rounded-xl" />
            <ShimmerBar w="w-9" h="h-9" rounded="rounded-xl" />
            <ShimmerBar w="w-44" h="h-12" rounded="rounded-2xl" />
          </div>
        </div>
        
        {/* Welcome Hero Skeleton */}
        <div className="relative rounded-[2.5rem] border border-white/[0.06] bg-zinc-900/50 p-8 md:p-12 overflow-hidden">
          <div className="absolute -top-32 -left-20 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.06]" />
              <ShimmerBar w="w-36" h="h-4" />
            </div>
            <ShimmerBar w="w-3/4" h="h-16" rounded="rounded-2xl" />
            <ShimmerBar w="w-1/2" h="h-10" rounded="rounded-2xl" />
            <div className="flex gap-3 pt-2">
              {[1,2,3].map(i => <ShimmerBar key={i} w="w-28" h="h-12" rounded="rounded-2xl" />)}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          'from-emerald-500/10', 'from-amber-500/10', 'from-rose-500/10', 'from-indigo-500/10'
        ].map((grad, i) => (
          <div key={i} className={`relative rounded-[1.75rem] bg-gradient-to-br ${grad} to-transparent border border-white/[0.06] p-5 overflow-hidden`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_0.2s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
            <div className="flex justify-between items-start mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
              <div className="w-16 h-5 rounded-full bg-white/[0.04]" />
            </div>
            <div className="space-y-2">
              <div className="w-14 h-3 rounded bg-white/[0.04]" />
              <div className="w-24 h-8 rounded-lg bg-white/[0.06]" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        {/* Main column */}
        <div className="xl:col-span-8 space-y-5">
          {/* Briefing */}
          <div className="rounded-[2rem] bg-zinc-900/50 border border-white/[0.06] p-8 h-52 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_0.1s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
                <ShimmerBar w="w-40" h="h-5" />
              </div>
              <ShimmerBar w="w-full" h="h-4" />
              <ShimmerBar w="w-4/5" h="h-4" />
              <ShimmerBar w="w-3/5" h="h-4" />
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-[2rem] bg-zinc-900/50 border border-white/[0.06] p-6 h-80 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_0.3s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
            <ShimmerBar w="w-48" h="h-6" rounded="rounded-lg" />
            <div className="flex items-end gap-3 mt-6 h-40">
              {[40,65,30,80,55,70,45].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-lg bg-indigo-500/10 border border-indigo-500/10" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Aside */}
      <div className="xl:col-span-4 space-y-8">
          {/* Quick Actions */}
          <div className="rounded-[2rem] bg-zinc-900/50 border border-white/[0.06] p-4 space-y-2 relative overflow-hidden">
            <ShimmerBar w="w-28" h="h-4" rounded="rounded" />
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <ShimmerBar w="w-28" h="h-3.5" />
                  <ShimmerBar w="w-20" h="h-2.5" />
                </div>
              </div>
            ))}
          </div>

          {/* Tasks panel */}
          <div className="rounded-[2rem] bg-zinc-900/50 border border-white/[0.06] p-5 space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <ShimmerBar w="w-24" h="h-5" />
              <ShimmerBar w="w-20" h="h-8" rounded="rounded-xl" />
            </div>
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.02]">
                <div className="w-5 h-5 rounded-full bg-white/[0.06] flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <ShimmerBar w="w-40" h="h-3.5" />
                  <ShimmerBar w="w-24" h="h-2.5" />
                </div>
                <div className="w-14 h-5 rounded-full bg-white/[0.06] flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Loading indicator */}
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-5 py-2.5 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-xl">
      <div className="flex gap-1">
        {[0,1,2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400"
            style={{ animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out` }}
          />
        ))}
      </div>
      <span className="text-xs text-zinc-400 font-semibold">Loading your dashboard...</span>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.7);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
    </div>
  </div>
);

export default DashboardSkeleton;