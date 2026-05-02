import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Cloud, Sparkles, Star, Zap, Target, BookOpen } from 'lucide-react';
import { quotes } from '@/lib/quotes';

interface WelcomeHeaderProps {
  fullName?: string;
  totalTasks: number;
  totalCourses: number;
  totalStudySessions: number;
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning',  Icon: Sun,   gradient: 'from-amber-400 to-orange-500',  glow: 'rgba(251,146,60,0.3)',  emoji: '☀️' };
  if (h < 18) return { text: 'Good Afternoon', Icon: Cloud, gradient: 'from-sky-400 to-blue-600',      glow: 'rgba(96,165,250,0.3)',  emoji: '⛅' };
  if (h < 21) return { text: 'Good Evening',   Icon: Moon,  gradient: 'from-violet-400 to-purple-600', glow: 'rgba(167,139,250,0.3)', emoji: '🌙' };
  return       { text: 'Good Night',            Icon: Moon,  gradient: 'from-indigo-400 to-purple-700', glow: 'rgba(129,140,248,0.3)', emoji: '🌌' };
};

// ── Particle ──────────────────────────────────────────────────────────────────
const Particle = ({ delay, x, color }: { delay: number; x: number; color: string }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full pointer-events-none"
    style={{ left: `${x}%`, bottom: 0, backgroundColor: color }}
    initial={{ opacity: 0, y: 0, scale: 0 }}
    animate={{ opacity: [0, 0.8, 0], y: [0, -120 - Math.random() * 80], scale: [0, 1.5, 0], x: [0, (Math.random() - 0.5) * 60] }}
    transition={{ duration: 3 + Math.random() * 2, delay, repeat: Infinity, repeatDelay: Math.random() * 4, ease: 'easeOut' }}
  />
);

// ── Live clock ────────────────────────────────────────────────────────────────
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <span className="font-mono text-xs text-zinc-500 tabular-nums">
      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
};

// ── Animated stat pill ────────────────────────────────────────────────────────
const StatPill = ({ icon, label, value, color, delay }: { icon: string; label: string; value: number; color: string; delay: number }) => {
  const [disp, setDisp] = useState(0);
  useEffect(() => {
    let v = 0;
    const step = Math.ceil(value / 24);
    const id = setInterval(() => { v += step; if (v >= value) { setDisp(value); clearInterval(id); } else setDisp(v); }, 40);
    return () => clearInterval(id);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.07, y: -3 }}
      className="relative group flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] hover:border-white/[0.15] cursor-default transition-colors overflow-hidden"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 100%, ${color}20, transparent 70%)` }} />
      <span className="text-lg">{icon}</span>
      <div className="relative z-10">
        <span className="text-xl font-black" style={{ color }}>{disp}</span>
        <span className="text-zinc-500 text-xs font-medium ml-1.5">{label}</span>
      </div>
    </motion.div>
  );
};

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ fullName, totalTasks, totalCourses, totalStudySessions }) => {
  const greeting = getGreeting();
  const GIcon = greeting.Icon;
  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  const particles = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i, delay: i * 0.4,
      x: 5 + (i / 14) * 90,
      color: ['#818cf8', '#a78bfa', '#ec4899', '#10b981', '#f59e0b', '#60a5fa'][i % 6]
    })), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, type: 'spring', stiffness: 80 }}
      className="relative overflow-hidden rounded-[2.5rem]"
    >
      {/* ── Layered Backgrounds ─────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-black/90 backdrop-blur-2xl rounded-[2.5rem]" />

      {/* Aurora animated border */}
      <div className="absolute inset-0 rounded-[2.5rem] p-[1px]"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.6), rgba(139,92,246,0.4), rgba(16,185,129,0.4), rgba(99,102,241,0.2))' }}>
        <div className="w-full h-full rounded-[calc(2.5rem-1px)] bg-zinc-950/60" />
      </div>

      {/* Animated horizontal highlight */}
      <motion.div
        className="absolute inset-x-0 top-0 h-px"
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(16,185,129,0.6), rgba(139,92,246,0.8), transparent)', backgroundSize: '200% 100%' }}
      />

      {/* Floating orbs */}
      <motion.div animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }} transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        className="absolute w-[400px] h-[400px] -top-32 -left-20 rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)' }} />
      <motion.div animate={{ y: [0, 16, 0], opacity: [0.2, 0.35, 0.2] }} transition={{ repeat: Infinity, duration: 9, delay: 1, ease: 'easeInOut' }}
        className="absolute w-[300px] h-[300px] -bottom-20 right-10 rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)' }} />

      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => <Particle key={p.id} delay={p.delay} x={p.x} color={p.color} />)}
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 p-8 md:p-12">

        {/* Top status bar */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
        >
          {/* Greeting icon */}
          <motion.div
            animate={{ rotate: [0, 15, -8, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className={`p-2.5 rounded-2xl bg-gradient-to-br ${greeting.gradient} shadow-lg`}
            style={{ boxShadow: `0 10px 30px ${greeting.glow}` }}
          >
            <GIcon className="w-5 h-5 text-white" />
          </motion.div>

          <span className="text-zinc-400 font-semibold tracking-wide text-sm">{greeting.text}</span>

          <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />

          {/* Live clock */}
          <LiveClock />

          {/* Live badge */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
          >
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Live</span>
          </motion.div>
        </motion.div>

        {/* Hero headline */}
        <motion.div className="mb-5" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-none">
            <span className="bg-gradient-to-br from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Hey, {fullName?.split(' ')[0] || 'Scholar'}
            </span>
            <motion.span
              animate={{ rotate: [0, 20, -5, 15, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 1 }}
              className="inline-block ml-3 select-none"
            >👋</motion.span>
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter mt-2">
            <span className="text-gradient-animated">Ready to achieve?</span>
          </h2>
        </motion.div>

        {/* Quote */}
        <motion.div className="mb-7 flex items-start gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Sparkles className="w-4 h-4 text-indigo-400 mt-1 flex-shrink-0 animate-pulse" />
          <p className="text-zinc-400 text-sm italic leading-relaxed max-w-lg">"{quote}"</p>
        </motion.div>

        {/* Stat pills row */}
        <div className="flex flex-wrap gap-3">
          <StatPill icon="📋" label="Tasks"    value={totalTasks}          color="#818cf8" delay={0.45} />
          <StatPill icon="📚" label="Courses"  value={totalCourses}        color="#a78bfa" delay={0.55} />
          <StatPill icon="⚡" label="Sessions" value={totalStudySessions}  color="#34d399" delay={0.65} />

          {/* CTA */}
          <motion.a href="/ai-assistant"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.75 }}
            whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.97 }}
            className="star-burst flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm text-white uppercase tracking-wider shadow-xl relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 20px 50px rgba(99,102,241,0.4)' }}
          >
            <Zap className="w-4 h-4" /> AI Tutor
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeHeader;