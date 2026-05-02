import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Zap, Target, TrendingUp, Flame } from 'lucide-react';

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

const DualRing = ({ value, size = 56, color, trailColor }: { value: number; size?: number; color: string; trailColor: string }) => {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * Math.min(value, 100)) / 100;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trailColor} strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
      />
    </svg>
  );
};

const CARDS = [
  {
    key: 'tasks', title: 'Tasks Done',
    border: 'border-emerald-500/20', iconBg: 'bg-emerald-500/10 text-emerald-500',
    ring: '#10b981', trail: 'rgba(16,185,129,0.1)',
    Icon: CheckCircle2,
  },
  {
    key: 'hours', title: 'Study Time',
    border: 'border-amber-500/20', iconBg: 'bg-amber-500/10 text-amber-500',
    ring: '#f59e0b', trail: 'rgba(245,158,11,0.1)',
    Icon: Clock,
  },
  {
    key: 'streak', title: 'Day Streak',
    border: 'border-rose-500/20', iconBg: 'bg-rose-500/10 text-rose-500',
    ring: '#f43f5e', trail: 'rgba(244,63,94,0.1)',
    Icon: Flame,
  },
  {
    key: 'score', title: 'Productivity',
    border: 'border-indigo-500/20', iconBg: 'bg-indigo-500/10 text-indigo-500',
    ring: '#6366f1', trail: 'rgba(99,102,241,0.1)',
    Icon: Target,
  },
];

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  if (!stats) return null;

  const hoursStudied  = stats.minutes_today ? Math.round((stats.minutes_today / 60) * 10) / 10 : 0;
  const taskRate      = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const score         = Math.round(stats.productivityScore || 0);

  const VALUES = [
    { primary: `${stats.completedTasks}/${stats.totalTasks}`, sub: `${taskRate}%`, ring: taskRate },
    { primary: `${hoursStudied}h`,                            sub: `${stats.minutes_today || 0}m`, ring: Math.min((hoursStudied / 8) * 100, 100) },
    { primary: `${stats.study_streak || 0}`,                  sub: 'days', ring: Math.min((stats.study_streak || 0) / 30 * 100, 100) },
    { primary: `${score}%`,                                   sub: score >= 80 ? 'Excellent!' : 'Good', ring: score },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {CARDS.map((cfg, i) => {
        const { primary, sub, ring } = VALUES[i];
        return (
          <motion.div
            key={cfg.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative overflow-hidden rounded-[2rem] bg-zinc-900/40 backdrop-blur-xl border ${cfg.border} p-6 group transition-all hover:bg-zinc-900/60 hover:-translate-y-1 shadow-lg hover:shadow-2xl`}
          >
            {/* Ambient Glow */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${cfg.iconBg.split(' ')[0]}`} />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-xl ${cfg.iconBg}`}>
                  <cfg.Icon size={18} />
                </div>
                <div className="relative">
                  <DualRing value={ring} color={cfg.ring} trailColor={cfg.trail} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 opacity-40" />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">{cfg.title}</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-2xl font-black text-white">{primary}</h4>
                  <span className="text-[10px] font-bold text-zinc-500">{sub}</span>
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