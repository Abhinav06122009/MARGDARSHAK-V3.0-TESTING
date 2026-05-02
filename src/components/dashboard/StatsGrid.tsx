import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Zap, Target, TrendingUp, ArrowUp, Flame } from 'lucide-react';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  productivityScore: number;
  totalCourses: number;
  totalStudySessions: number;
  study_streak?: number;
  minutes_today?: number;
}

interface StatsGridProps { stats: DashboardStats | null; }

// ── Animated SVG Ring (double-layer) ─────────────────────────────────────────
const DualRing = ({ value, size = 64, color, trailColor }: { value: number; size?: number; color: string; trailColor: string }) => {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * Math.min(value, 100)) / 100;
  return (
    <svg width={size} height={size} className="-rotate-90">
      {/* Trail */}
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trailColor} strokeWidth={stroke} />
      {/* Glow blur duplicate */}
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke + 3} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.5 }}
        opacity={0.2}
        style={{ filter: `blur(4px)` }}
      />
      {/* Sharp ring */}
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.5 }}
      />
    </svg>
  );
};

// ── Animated counter ──────────────────────────────────────────────────────────
const CountUp = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 30);
    const id = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(id); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(id);
  }, [value]);
  return <>{display}</>;
};

// ── Card definitions ──────────────────────────────────────────────────────────
const CARDS = [
  {
    key: 'tasks', title: 'Tasks Done',
    gradient: 'from-emerald-500/[0.12] via-emerald-600/[0.06] to-transparent',
    hoverGradient: 'from-emerald-500/20 via-emerald-600/10 to-transparent',
    border: 'border-emerald-500/15', hoverBorder: 'border-emerald-400/50',
    iconBg: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.4)', ring: '#10b981', trail: 'rgba(16,185,129,0.08)',
    Icon: CheckCircle2, badge: '✓ Completion', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    key: 'hours', title: 'Study Time',
    gradient: 'from-amber-500/[0.12] via-amber-600/[0.06] to-transparent',
    hoverGradient: 'from-amber-500/20 via-amber-600/10 to-transparent',
    border: 'border-amber-500/15', hoverBorder: 'border-amber-400/50',
    iconBg: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.4)', ring: '#f59e0b', trail: 'rgba(245,158,11,0.08)',
    Icon: Clock, badge: '⏱ Today', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    key: 'streak', title: 'Day Streak',
    gradient: 'from-rose-500/[0.12] via-rose-600/[0.06] to-transparent',
    hoverGradient: 'from-rose-500/20 via-rose-600/10 to-transparent',
    border: 'border-rose-500/15', hoverBorder: 'border-rose-400/50',
    iconBg: 'from-rose-500 to-pink-600',
    glow: 'rgba(244,63,94,0.4)', ring: '#f43f5e', trail: 'rgba(244,63,94,0.08)',
    Icon: Flame, badge: '🔥 On Fire', badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  {
    key: 'score', title: 'Productivity',
    gradient: 'from-indigo-500/[0.12] via-indigo-600/[0.06] to-transparent',
    hoverGradient: 'from-indigo-500/20 via-indigo-600/10 to-transparent',
    border: 'border-indigo-500/15', hoverBorder: 'border-indigo-400/50',
    iconBg: 'from-indigo-500 to-violet-600',
    glow: 'rgba(99,102,241,0.4)', ring: '#6366f1', trail: 'rgba(99,102,241,0.08)',
    Icon: Target, badge: '⚡ Daily Goal', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
];

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  if (!stats) return null;

  const hoursStudied  = stats.minutes_today ? Math.round((stats.minutes_today / 60) * 10) / 10 : 0;
  const taskRate      = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const score         = Math.round(stats.productivityScore || 0);

  const VALUES = [
    { primary: `${stats.completedTasks}/${stats.totalTasks}`, sub: `${taskRate}%`, ring: taskRate, numericMain: stats.completedTasks },
    { primary: `${hoursStudied}h`,                            sub: `${stats.minutes_today || 0}m`, ring: Math.min((hoursStudied / 8) * 100, 100), numericMain: hoursStudied },
    { primary: `${stats.study_streak || 0}`,                  sub: 'days', ring: Math.min((stats.study_streak || 0) / 30 * 100, 100), numericMain: stats.study_streak || 0 },
    { primary: `${score}%`,                                   sub: score >= 80 ? 'Excellent!' : score >= 50 ? 'Good' : 'Keep going', ring: score, numericMain: score },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {CARDS.map((cfg, i) => {
        const { primary, sub, ring } = VALUES[i];
        const Icon = cfg.Icon;
        return (
          <motion.div
            key={cfg.key}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: i * 0.1, type: 'spring', stiffness: 100, damping: 20 }}
            whileHover={{ y: -10, scale: 1.05, rotateZ: 1 }}
            className={`glare-card relative overflow-hidden rounded-[2rem] bg-zinc-900/60 backdrop-blur-3xl border ${cfg.border} hover:${cfg.hoverBorder} p-6 group cursor-default transition-all duration-500 shadow-2xl`}
            style={{ boxShadow: '0 25px 60px -15px rgba(0,0,0,0.4)' }}
          >
            {/* Magnetic Glow Effect */}
            <motion.div
              className="absolute w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
              style={{ 
                backgroundColor: cfg.ring,
                top: '0%', 
                right: '0%',
                transform: 'translate(30%, -30%)'
              }}
            />

            {/* Gradient hover intensify */}
            <div className={`absolute inset-0 bg-gradient-to-br ${cfg.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-[1.75rem]`} />

            {/* Animated border line at top */}
            <div
              className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(90deg, transparent, ${cfg.ring}, transparent)` }}
            />

            <div className="relative z-10">
              {/* Top row: icon + badge */}
              <div className="flex items-start justify-between mb-5">
                <motion.div
                  whileHover={{ rotate: 18, scale: 1.2 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className={`relative p-2.5 rounded-xl bg-gradient-to-br ${cfg.iconBg} shadow-lg`}
                  style={{ boxShadow: `0 8px 24px ${cfg.glow}` }}
                >
                  <Icon size={20} className="text-white relative z-10" />
                  {/* Icon shimmer */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.25) 0%,transparent 60%)' }} />
                </motion.div>

                <motion.span
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  className={`text-[9px] font-black px-2 py-1 rounded-full border ${cfg.badgeColor} backdrop-blur-sm`}
                >
                  {cfg.badge}
                </motion.span>
              </div>

              {/* Value + ring */}
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1.5">{cfg.title}</p>
                  <motion.p
                    className="text-2xl font-black text-white tracking-tight leading-none"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.08, type: 'spring' }}
                  >
                    {primary}
                  </motion.p>
                  <p className="text-[11px] text-zinc-500 mt-1 font-medium">{sub}</p>
                </div>

                {/* Dual animated ring with center icon */}
                <div className="relative flex-shrink-0">
                  <DualRing value={ring} size={56} color={cfg.ring} trailColor={cfg.trail} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: cfg.ring }} />
                  </div>
                </div>
              </div>

              {/* Micro progress bar */}
              <div className="mt-4 h-[2px] bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${cfg.ring}, ${cfg.glow})` }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min(ring, 100)}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 + i * 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatsGrid;