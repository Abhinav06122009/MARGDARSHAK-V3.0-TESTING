import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Cloud, Sparkles, Star, Zap } from 'lucide-react';
import { StaggeredText, CountUp } from '@/components/ui/animated-text';
import { quotes } from '@/lib/quotes';

interface WelcomeHeaderProps {
  fullName?: string;
  totalTasks: number;
  totalCourses: number;
  totalStudySessions: number;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', Icon: Sun, gradient: 'from-amber-400 to-orange-500', particles: '☀️' };
  if (hour < 18) return { text: 'Good Afternoon', Icon: Cloud, gradient: 'from-sky-400 to-blue-600', particles: '⛅' };
  if (hour < 21) return { text: 'Good Evening', Icon: Moon, gradient: 'from-violet-400 to-purple-600', particles: '🌙' };
  return { text: 'Good Night', Icon: Moon, gradient: 'from-indigo-400 to-purple-700', particles: '🌌' };
};

const FloatingOrb = ({ className }: { className: string }) => (
  <motion.div
    animate={{ y: [0, -18, 0], scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
    transition={{ repeat: Infinity, duration: 5 + Math.random() * 3, ease: 'easeInOut' }}
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
  />
);

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ fullName, totalTasks, totalCourses, totalStudySessions }) => {
  const greeting = getGreeting();
  const GIcon = greeting.Icon;

  const motivationalQuote = useMemo(() => {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, []);

  const stats = [
    { label: 'Tasks', value: totalTasks, color: 'from-blue-400 to-cyan-500', icon: '📋' },
    { label: 'Courses', value: totalCourses, color: 'from-purple-400 to-pink-500', icon: '📚' },
    { label: 'Sessions', value: totalStudySessions, color: 'from-emerald-400 to-teal-500', icon: '⚡' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, type: 'spring', stiffness: 80 }}
      className="relative overflow-hidden rounded-[2.5rem]"
    >
      {/* Glass base */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/80 via-zinc-900/60 to-black/80 backdrop-blur-2xl rounded-[2.5rem]" />

      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-[2.5rem] p-[1px]"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.5), rgba(59,130,246,0.3), rgba(16,185,129,0.3), rgba(139,92,246,0.1))' }}
      >
        <div className="w-full h-full rounded-[calc(2.5rem-1px)] bg-zinc-950/50" />
      </div>

      {/* Floating orbs */}
      <FloatingOrb className="w-[400px] h-[400px] -top-32 -left-20 bg-indigo-600/20" />
      <FloatingOrb className="w-[300px] h-[300px] -bottom-20 right-10 bg-purple-600/15" />
      <FloatingOrb className="w-[200px] h-[200px] top-10 right-1/3 bg-cyan-500/10" />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative z-10 p-8 md:p-12">
        {/* Greeting row */}
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            animate={{ rotate: [0, 15, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className={`p-2.5 rounded-2xl bg-gradient-to-br ${greeting.gradient} shadow-lg`}
          >
            <GIcon className="w-5 h-5 text-white" />
          </motion.div>
          <span className="text-zinc-400 font-semibold tracking-wide">{greeting.text}</span>
          <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-amber-400">LIVE</span>
          </motion.div>
        </motion.div>

        {/* Main headline */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-none">
            <span className="bg-gradient-to-br from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Hey, {fullName?.split(' ')[0] || 'Scholar'}
            </span>
            <motion.span
              animate={{ rotate: [0, 20, -5, 15, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 1 }}
              className="inline-block ml-3"
            >
              👋
            </motion.span>
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter mt-1">
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Ready to achieve?
            </span>
          </h2>
        </motion.div>

        {/* Quote */}
        <motion.div
          className="mb-4 flex items-start gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Sparkles className="w-4 h-4 text-indigo-400 mt-1 flex-shrink-0" />
          <p className="text-zinc-400 text-sm italic leading-relaxed">"{motivationalQuote}"</p>
        </motion.div>

        {/* Stats pills */}
        <div className="flex flex-wrap gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl cursor-default transition-colors"
            >
              <span>{stat.icon}</span>
              <div>
                <span className={`text-xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  <CountUp end={stat.value} />
                </span>
                <span className="text-zinc-500 text-xs font-medium ml-1.5">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeHeader;