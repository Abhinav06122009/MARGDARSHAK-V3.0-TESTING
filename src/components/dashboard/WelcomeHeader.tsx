import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Cloud, Sparkles, Star, Zap, Target, BookOpen } from 'lucide-react';
import { quotes } from '@/lib/quotes';
import { useRankTheme } from '@/context/ThemeContext';

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
  const { theme } = useRankTheme();
  const RankIcon = theme.icons.rank;

  const particles = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i, delay: i * 0.4,
      x: 5 + (i / 14) * 90,
      color: theme.colors.primary
    })), [theme]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, type: 'spring', stiffness: 80 }}
      className="relative overflow-hidden rounded-[2.5rem]"
    >
      {/* ── Layered Backgrounds ─────────────────────────────────────────── */}
      <div className="absolute inset-0 backdrop-blur-2xl rounded-[2.5rem]" 
        style={{ background: theme.colors.bg }} />

      {/* Aurora animated border */}
      <div className="absolute inset-0 rounded-[2.5rem] p-[1px]"
        style={{ background: theme.gradients.main }}>
        <div className="w-full h-full rounded-[calc(2.5rem-1px)] bg-zinc-950/80" />
      </div>

      {/* Animated horizontal highlight */}
      <motion.div
        className="absolute inset-x-0 top-0 h-px"
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ background: theme.gradients.shimmer, backgroundSize: '200% 100%' }}
      />

      {/* Floating orbs */}
      <motion.div animate={{ y: [0, -20, 0], opacity: [0.1, 0.2, 0.1] }} transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        className="absolute w-[600px] h-[600px] -top-64 -left-40 rounded-full blur-[140px]"
        style={{ background: `radial-gradient(circle, ${theme.colors.glow}, transparent 70%)` }} />
      <motion.div animate={{ y: [0, 16, 0], opacity: [0.05, 0.15, 0.05] }} transition={{ repeat: Infinity, duration: 9, delay: 1, ease: 'easeInOut' }}
        className="absolute w-[500px] h-[500px] -bottom-40 right-20 rounded-full blur-[120px]"
        style={{ background: `radial-gradient(circle, ${theme.colors.accent}, transparent 70%)` }} />

      {/* Content */}
      <div className="relative z-10 p-8 md:p-12">
        <motion.div className="flex items-center gap-3 mb-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <motion.div
            animate={{ rotate: [0, 15, -8, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="p-2.5 rounded-2xl shadow-lg border"
            style={{ background: theme.gradients.main, borderColor: theme.colors.border, boxShadow: theme.effects.glowIntensity }}
          >
            <RankIcon className="w-5 h-5 text-white" />
          </motion.div>

          <span className="text-zinc-400 font-bold tracking-widest text-xs uppercase">{theme.name} Protocol</span>
          <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          <LiveClock />
        </motion.div>

        <motion.div className="mb-6" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none">
            <span style={{ backgroundImage: theme.gradients.text, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="bg-clip-text drop-shadow-2xl">
              Hey, {fullName?.split(' ')[0] || 'Scholar'}
            </span>
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="inline-block ml-6"
            >
              <RankIcon className="w-12 h-12 md:w-20 md:h-20" style={{ color: theme.colors.primary, filter: `drop-shadow(0 0 10px ${theme.colors.glow})` }} />
            </motion.div>
          </h1>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mt-4">
            <span className="text-gradient-animated bg-gradient-to-r from-white via-zinc-400 to-white bg-clip-text text-transparent opacity-80">Operational Dominance</span>
          </h2>
        </motion.div>

        <motion.div className="mb-8 flex items-start gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Sparkles className="w-4 h-4 text-white/50 mt-1 animate-pulse" />
          <p className="text-zinc-500 text-sm italic leading-relaxed max-w-lg">"{quote}"</p>
        </motion.div>

        <div className="flex flex-wrap gap-4">
          <StatPill icon="📋" label="Objectives" value={totalTasks} color={theme.colors.primary} delay={0.45} />
          <StatPill icon="📚" label="Knowledge" value={totalCourses} color={theme.colors.secondary} delay={0.55} />
          <StatPill icon="⚡" label="Velocity" value={totalStudySessions} color={theme.colors.accent} delay={0.65} />

          <motion.a href="/ai-assistant"
            whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2.5 px-6 py-4 rounded-2xl font-black text-xs text-white uppercase tracking-widest shadow-2xl transition-all duration-300"
            style={{ background: theme.gradients.main, boxShadow: theme.effects.glowIntensity }}
          >
            <Zap className="w-4 h-4 fill-white" /> Neural Interface
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeHeader;