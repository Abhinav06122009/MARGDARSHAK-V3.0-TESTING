import React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Star, Shield, Zap, Target, Crown, Flame, ArrowLeft,
  X, Facebook, Twitter, Linkedin,
  Sparkles,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import { StudyHeatmap } from '@/components/dashboard/StudyHeatmap';
import { calculateXP, calculateLevel, fetchRealLeaderboard } from '@/lib/gamification/streakService';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

const BADGES = [
  { id: 1, name: 'First Steps', description: 'Completed your first task', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10', unlocked: true },
  { id: 2, name: 'On Fire', description: 'Maintained a 3-day streak', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', unlocked: true },
  { id: 3, name: 'Scholar', description: 'Studied for 10 hours total', icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/10', unlocked: true },
  { id: 4, name: 'Elite Focus', description: 'Completed 50 tasks', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', unlocked: false },
  { id: 5, name: 'Mastermind', description: 'Reached Level 10', icon: Crown, color: 'text-rose-400', bg: 'bg-rose-500/10', unlocked: false },
  { id: 6, name: 'Defender', description: 'Secured account fully', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10', unlocked: true },
];

const AchievementsPage = () => {
  const { currentUser, stats, recentTasks, loading } = useDashboardData();
  const [leaderboard, setLeaderboard] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (currentUser) {
      const loadLeaderboard = async () => {
        const completedTasks = recentTasks?.filter(t => t.status === 'completed').length || 0;
        const minutes = stats?.minutes_today || 0;
        const xp = calculateXP(completedTasks, minutes) + (stats?.xp || 0);

        const data = await fetchRealLeaderboard(currentUser.id, xp);
        setLeaderboard(data);
      };
      loadLeaderboard();
    }
  }, [currentUser, stats, recentTasks]);

  if (loading) return <DashboardSkeleton />;

  const completedTasks = recentTasks?.filter(t => t.status === 'completed').length || 0;
  const minutes = stats?.minutes_today || 0;
  const xp = calculateXP(completedTasks, minutes) + (stats?.xp || 0);
  const { level, currentTierXP, xpToNextLevel, progress } = calculateLevel(xp);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,20,15,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        {/* Animated Neural Orbs */}
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
          {/* HEADER */}
          <header className="flex flex-col md:flex-row items-center justify-between p-6 rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative z-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.05] to-transparent pointer-events-none" />

            <div className="flex items-center gap-6">
              <Link to="/dashboard">
                <motion.div whileHover={{ scale: 1.1, x: -4 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="ghost" size="icon" className="h-12 w-12 text-zinc-400 hover:text-white hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                </motion.div>
              </Link>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Trophy className="w-8 h-8 text-emerald-400 relative z-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic"><span className="text-emerald-500">Achievements</span></h1>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-0.5 opacity-60">Gamification Core v3.0</p>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex items-center gap-3">
              <div className="px-6 py-3 bg-white/[0.02] rounded-2xl border border-white/10 flex items-center gap-4 shadow-xl">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Global Rank</span>
                  <span className="text-xl font-black text-white italic">#1,242</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Tier</span>
                  <span className="text-xl font-black text-emerald-400 italic">Vanguard</span>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main XP & Heatmap Column */}
            <div className="lg:col-span-2 space-y-8">

              {/* Level Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[3rem] border border-emerald-500/20 bg-white/[0.02] backdrop-blur-3xl p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.05] to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                  <div className="flex items-center gap-8">
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/30"
                      />
                      <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-emerald-400 to-blue-600 flex items-center justify-center border-4 border-[#050505] shadow-[0_0_40px_rgba(16,185,129,0.4)] relative z-10">
                        <span className="text-5xl font-black text-[#050505] italic tracking-tighter">{level}</span>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Level {level}</h2>
                      <p className="text-emerald-500 text-xs font-black tracking-[0.3em] uppercase mt-2">Elite Vanguard</p>
                      <div className="flex items-center gap-3 mt-4">
                        <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center gap-2">
                          <Zap size={12} className="text-emerald-400 fill-emerald-400/30" />
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{xp.toLocaleString()} XP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 space-y-5">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Neural Progression</p>
                        <p className="text-sm font-bold text-white uppercase tracking-wider">{currentTierXP} <span className="text-zinc-600">/ {currentTierXP + xpToNextLevel} XP</span></p>
                      </div>
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-4 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5 p-1 relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-400 relative shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      >
                        <motion.div
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2"
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Heatmap Card */}
              <div className="rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-10 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Cognitive Heatmap</h3>
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    Active Streaks: <span className="text-emerald-400">03 Days</span>
                  </div>
                </div>
                <div className="opacity-80 hover:opacity-100 transition-opacity">
                   <StudyHeatmap tasks={recentTasks || []} />
                </div>
              </div>

              {/* Badges Grid */}
              <div className="rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-10 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Digital Merits</h3>
                  </div>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                    {BADGES.filter(b => b.unlocked).length} / {BADGES.length} Unlocked
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {BADGES.map((badge, i) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={badge.unlocked ? { y: -8, scale: 1.02 } : {}}
                      className={`p-6 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group ${badge.unlocked
                        ? 'bg-white/[0.02] border-white/10 hover:border-emerald-500/30'
                        : 'bg-black/40 border-white/5 opacity-50 grayscale'
                        }`}
                    >
                      {badge.unlocked && (
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative z-10 border border-white/5 shadow-inner ${badge.unlocked ? 'bg-emerald-500/10' : 'bg-zinc-900'}`}>
                        <badge.icon size={28} className={`${badge.unlocked ? 'text-emerald-400' : 'text-zinc-600'} drop-shadow-[0_0_10px_currentColor]`} />
                      </div>
                      <div className="relative z-10">
                        <h4 className="font-black text-white text-base uppercase italic tracking-tighter">{badge.name}</h4>
                        <p className="text-[9px] font-bold text-zinc-500 mt-2 uppercase tracking-widest leading-relaxed opacity-60">{badge.description}</p>
                      </div>
                      {badge.unlocked && (
                        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all">
                          <Sparkles size={14} className="text-emerald-500" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>

            {/* Leaderboard Column */}
            <div className="space-y-8">
              <div className="rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-10 shadow-2xl relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] to-transparent pointer-events-none" />

                <div className="flex items-center justify-between mb-10 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Global League</h3>
                  </div>
                  <Crown size={20} className="text-emerald-400" />
                </div>

                <div className="flex flex-col gap-4 relative z-10">
                  {leaderboard.map((user, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      key={user.id}
                      className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all duration-500 group/item ${user.isCurrentUser
                        ? 'bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] scale-[1.02] z-20'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                        }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-8 h-8 flex items-center justify-center font-black text-base italic ${index === 0 ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]' :
                          index === 1 ? 'text-zinc-400' :
                            index === 2 ? 'text-blue-400' : 'text-zinc-600'
                          }`}>
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center text-2xl shadow-inner border border-white/5 group-hover/item:scale-110 transition-transform">
                            {user.avatar}
                          </div>
                          <div>
                            <p className={`text-sm font-black uppercase italic tracking-tighter ${user.isCurrentUser ? 'text-emerald-400' : 'text-zinc-200'}`}>
                              {user.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Star size={10} className="text-emerald-500 fill-emerald-500/30" />
                              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                {user.xp.toLocaleString()} <span className="opacity-30">XP</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-10 py-5 bg-white/[0.02] hover:bg-white/[0.05] rounded-[2rem] border border-white/5 text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] transition-all"
                >
                  View Standings
                </motion.button>
              </div>
            </div>

          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AchievementsPage;
