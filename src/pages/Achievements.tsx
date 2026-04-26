import React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Star, Shield, Zap, Target, Crown, Flame, ArrowLeft,
  X, Facebook, Twitter, Linkedin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import { StudyHeatmap } from '@/components/dashboard/StudyHeatmap';
import { calculateXP, calculateLevel, fetchRealLeaderboard } from '@/lib/gamification/streakService';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

// Social Icons (Unified)
const linkedinLogo = () => (
  <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const TwitterLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z" />
  </svg>
);

const BADGES = [
  { id: 1, name: 'First Steps', description: 'Completed your first task', icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10', unlocked: true },
  { id: 2, name: 'On Fire', description: 'Maintained a 3-day streak', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', unlocked: true },
  { id: 3, name: 'Scholar', description: 'Studied for 10 hours total', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10', unlocked: true },
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
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-amber-500/30 overflow-x-hidden relative">
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,15,5,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Animated Neural Orbs */}
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
          {/* HEADER */}
          <header className="flex flex-col md:flex-row items-center justify-between p-6 glass-card rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative z-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.05] to-transparent pointer-events-none" />

            <div className="flex items-center gap-6">
              <Link to="/dashboard">
                <motion.div whileHover={{ scale: 1.1, x: -4 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="ghost" size="icon" className="h-12 w-12 text-zinc-400 hover:text-white hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                </motion.div>
              </Link>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-amber-500/20 rounded-2xl border border-amber-500/30 shadow-lg shadow-amber-500/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-amber-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Trophy className="w-8 h-8 text-amber-400 relative z-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic"><span className="text-amber-400">Achievements</span></h1>
                  <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-0.5">Achievements Tracking</p>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex items-center gap-3">
              <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Global Rank</span>
                  <span className="text-xl font-black text-white italic">#1,242</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Tier</span>
                  <span className="text-xl font-black text-amber-400 italic">Vanguard</span>
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
                className="relative overflow-hidden rounded-[3rem] border border-amber-500/20 bg-white/[0.02] backdrop-blur-3xl p-10 shadow-2xl group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                  <div className="flex items-center gap-8">
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/30"
                      />
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center border-4 border-[#050505] shadow-[0_0_40px_rgba(245,158,11,0.4)] relative z-10">
                        <span className="text-5xl font-black text-[#050505] italic">{level}</span>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Level {level} <span className="text-amber-400">Scholar</span></h2>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30 flex items-center gap-2">
                          <Zap size={14} className="text-amber-400 fill-amber-400/30" />
                          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">{xp.toLocaleString()} XP</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Total Score</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Progress Matrix</p>
                        <p className="text-sm font-bold text-white uppercase tracking-wider">{currentTierXP} <span className="text-zinc-600">/ {currentTierXP + xpToNextLevel} XP</span></p>
                      </div>
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">{Math.round(progress)}% Complete</span>
                    </div>
                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 relative shadow-[0_0_15px_rgba(245,158,11,0.5)]"
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
                    <div className="w-1.5 h-6 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Annual Contributions</h3>
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    Active Streaks: <span className="text-orange-400">03 Days</span>
                  </div>
                </div>
                <StudyHeatmap tasks={recentTasks || []} />
              </div>

              {/* Badges Grid */}
              <div className="rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-10 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Cognitive Merits</h3>
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                    {BADGES.filter(b => b.unlocked).length} / {BADGES.length} Unlocked
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {BADGES.map((badge, i) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={badge.unlocked ? { y: -8, scale: 1.02 } : {}}
                      className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden group ${badge.unlocked
                        ? 'bg-white/5 border-white/10 hover:border-amber-500/30'
                        : 'bg-black/40 border-white/5 opacity-50 grayscale'
                        }`}
                    >
                      {badge.unlocked && (
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                      )}
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative z-10 border border-white/5 shadow-inner ${badge.bg}`}>
                        <badge.icon size={28} className={`${badge.color} drop-shadow-[0_0_10px_currentColor]`} />
                      </div>
                      <div className="relative z-10">
                        <h4 className="font-black text-white text-base uppercase italic tracking-tighter">{badge.name}</h4>
                        <p className="text-[10px] font-bold text-zinc-500 mt-2 uppercase tracking-widest leading-relaxed">{badge.description}</p>
                      </div>
                      {badge.unlocked && (
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Star size={14} className="text-amber-500 fill-amber-500" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>

            {/* Leaderboard Column */}
            <div className="space-y-8">
              <div className="rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.03] to-transparent pointer-events-none" />

                <div className="flex items-center justify-between mb-10 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Global League</h3>
                  </div>
                  <Crown size={24} className="text-amber-400 group-hover:rotate-12 transition-transform" />
                </div>

                <div className="flex flex-col gap-4 relative z-10">
                  {leaderboard.map((user, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={user.id}
                      className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all group/item ${user.isCurrentUser
                        ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)] scale-[1.05] z-20'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                        }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-10 h-10 flex items-center justify-center font-black text-xl italic ${index === 0 ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] scale-125' :
                          index === 1 ? 'text-zinc-300' :
                            index === 2 ? 'text-orange-400' : 'text-zinc-600'
                          }`}>
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-black/40 flex items-center justify-center text-3xl shadow-inner border border-white/10 group-hover/item:scale-110 transition-transform">
                            {user.avatar}
                          </div>
                          <div>
                            <p className={`text-base font-black uppercase italic tracking-tighter ${user.isCurrentUser ? 'text-amber-400' : 'text-zinc-200'}`}>
                              {user.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Star size={12} className="text-amber-500 fill-amber-500/30" />
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                {user.xp.toLocaleString()} <span className="opacity-50">XP</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-10 py-5 bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/10 text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] transition-all"
                >
                  View Full Standings
                </motion.button>
              </div>
            </div>

          </div>
        </div>
        {/* ── Footer ── */}
        <footer className="relative mt-32 border-t border-white/5 bg-black/40 backdrop-blur-3xl overflow-hidden rounded-[2.5rem]">
          {/* Footer Glows */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
              className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px]"
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-10 py-20 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {/* Branding Column */}
              <div className="space-y-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-block"
                >
                  <h3 className="text-4xl font-black tracking-tighter text-white flex items-center gap-2">
                    <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-600 bg-clip-text text-transparent uppercase italic">Margdarshak</span>
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2 ml-1">by VSAV GYANTAPA</p>
                </motion.div>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-medium">
                  Empowering students with AI-driven insights and intelligent academic orchestration. Built for the next generation of learners.
                </p>
                <div className="flex items-center gap-4">
                  {[
                    { icon: TwitterLogo, href: "https://x.com/gyantappas", label: "Twitter" },
                    { icon: FacebookLogo, href: "https://www.facebook.com/profile.php?id=61584618795158", label: "Facebook" },
                    { icon: linkedinLogo, href: "https://www.linkedin.com/in/vsav-gyantapa-33893a399/", label: "LinkedIn" }
                  ].map((social, i) => (
                    <motion.a
                      key={i}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, y: -4, backgroundColor: 'rgba(255,255,255,0.1)' }}
                      whileTap={{ scale: 0.9 }}
                      className="p-4 bg-white/5 rounded-2xl border border-white/10 transition-all text-zinc-400 hover:text-white"
                    >
                      <social.icon />
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Links Columns */}
              {[
                {
                  title: "Platform",
                  links: [
                    { name: "Scheduler", href: "/timetable" },
                    { name: "AI Assistant", href: "/ai-assistant" },
                    { name: "Quiz Gen", href: "/quiz" },
                    { name: "Wellness", href: "/wellness" }
                  ]
                },
                {
                  title: "Legal",
                  links: [
                    { name: "Terms of Service", href: "/terms" },
                    { name: "Privacy Policy", href: "/privacy" },
                    { name: "Cookie Policy", href: "/cookies" },
                    { name: "GDPR Compliance", href: "/gdpr" }
                  ]
                },
                {
                  title: "Support",
                  links: [
                    { name: "Help Center", href: "/help" },
                    { name: "Contact Us", href: "mailto:Support@margdarshan.tech" }
                  ]
                }
              ].map((section, i) => (
                <div key={i} className="space-y-8">
                  <h4 className="text-white font-black text-[10px] uppercase tracking-[0.4em]">{section.title}</h4>
                  <ul className="space-y-5">
                    {section.links.map((link, j) => (
                      <li key={j}>
                        <Link
                          to={link.href}
                          className="text-zinc-500 hover:text-white transition-colors text-sm font-bold flex items-center group"
                        >
                          <motion.span
                            whileHover={{ x: 6 }}
                            className="flex items-center gap-3"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] opacity-0 group-hover:opacity-100 transition-all" />
                            {link.name}
                          </motion.span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Bar */}
            <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                © 2026 <span className="text-white">VSAV GYANTAPA</span>.ALL RIGHTS RESERVED
              </p>
              <div className="flex items-center gap-8">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest italic">V3.0</p>
              </div>
            </div>
          </div>
        </footer>
      </ScrollArea>
    </div>
  );
};

export default AchievementsPage;
