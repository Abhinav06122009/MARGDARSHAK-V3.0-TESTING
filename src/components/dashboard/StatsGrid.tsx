import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Zap, Target, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  productivityScore: number;
  totalCourses: number;
  totalStudySessions: number;
  study_streak?: number;
  minutes_today?: number;
}

interface StatsGridProps {
  stats: DashboardStats | null;
}

// Animated ring for productivity score
const RingProgress = ({ value, size = 60, stroke = 6, color }: { value: number; size?: number; stroke?: number; color: string }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * Math.min(value, 100)) / 100;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
      />
    </svg>
  );
};

const CARD_CONFIGS = [
  {
    key: 'tasks',
    title: 'Tasks Done',
    gradient: 'from-emerald-500/20 via-emerald-600/10 to-transparent',
    border: 'border-emerald-500/20 hover:border-emerald-400/40',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    glow: 'bg-emerald-500',
    ring: '#10b981',
    Icon: CheckCircle2,
    badge: 'Completion',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    key: 'hours',
    title: 'Study Time',
    gradient: 'from-amber-500/20 via-amber-600/10 to-transparent',
    border: 'border-amber-500/20 hover:border-amber-400/40',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    glow: 'bg-amber-500',
    ring: '#f59e0b',
    Icon: Clock,
    badge: 'Today',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    key: 'streak',
    title: 'Day Streak',
    gradient: 'from-rose-500/20 via-rose-600/10 to-transparent',
    border: 'border-rose-500/20 hover:border-rose-400/40',
    iconBg: 'bg-rose-500/15',
    iconColor: 'text-rose-400',
    glow: 'bg-rose-500',
    ring: '#f43f5e',
    Icon: Zap,
    badge: '🔥 On Fire',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  {
    key: 'score',
    title: 'Productivity',
    gradient: 'from-indigo-500/20 via-indigo-600/10 to-transparent',
    border: 'border-indigo-500/20 hover:border-indigo-400/40',
    iconBg: 'bg-indigo-500/15',
    iconColor: 'text-indigo-400',
    glow: 'bg-indigo-500',
    ring: '#6366f1',
    Icon: Target,
    badge: 'Daily Goal',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
];

const StatsGrid: React.FC<StatsGridProps> = React.memo(({ stats }) => {
  if (!stats) return null;

  const hoursStudied = stats.minutes_today ? Math.round(stats.minutes_today / 60 * 10) / 10 : 0;
  const taskRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const score = Math.round(stats.productivityScore || 0);

  const values = [
    { value: `${stats.completedTasks}/${stats.totalTasks}`, sub: `${taskRate}%`, ringVal: taskRate },
    { value: `${hoursStudied}h`, sub: `${stats.minutes_today || 0}m`, ringVal: Math.min((hoursStudied / 8) * 100, 100) },
    { value: `${stats.study_streak || 0}`, sub: 'days', ringVal: Math.min((stats.study_streak || 0) / 30 * 100, 100) },
    { value: `${score}%`, sub: score >= 80 ? 'Excellent!' : score >= 50 ? 'Good' : 'Keep going', ringVal: score },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARD_CONFIGS.map((cfg, i) => {
        const { value, sub, ringVal } = values[i];
        const Icon = cfg.Icon;
        return (
          <motion.div
            key={cfg.key}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.08, type: 'spring', stiffness: 120 }}
            whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${cfg.gradient} backdrop-blur-xl border ${cfg.border} p-5 group cursor-default transition-all duration-300 shadow-lg`}
          >
            {/* Corner glow */}
            <motion.div
              className={`absolute -right-6 -top-6 w-28 h-28 rounded-full blur-2xl ${cfg.glow} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
            />
            {/* Shimmer */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)' }}
            />

            <div className="relative z-10">
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.15 }}
                  className={`p-2.5 rounded-xl ${cfg.iconBg} ${cfg.iconColor} border border-white/5`}
                >
                  <Icon size={20} />
                </motion.div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${cfg.badgeColor}`}>
                  {cfg.badge}
                </span>
              </div>

              {/* Value + ring */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">{cfg.title}</p>
                  <motion.p
                    className="text-2xl font-black text-white tracking-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    {value}
                  </motion.p>
                  <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>
                </div>
                <div className="relative">
                  <RingProgress value={ringVal} size={52} stroke={5} color={cfg.ring} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TrendingUp className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatsGrid;