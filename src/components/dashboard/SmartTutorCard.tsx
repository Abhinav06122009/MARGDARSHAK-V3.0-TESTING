import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ChevronRight, BrainCircuit, GraduationCap, FileText, BarChart3, Sparkles } from 'lucide-react';
import { useRankTheme } from '@/context/ThemeContext';

const AI_FEATURES = [
  { icon: BrainCircuit, label: 'Smart Tutor', href: '/ai-assistant', color: 'text-emerald-400' },
  { icon: GraduationCap, label: 'Quiz Generator', href: '/quiz', color: 'text-purple-400' },
  { icon: FileText, label: 'Essay Helper', href: '/essay-helper', color: 'text-blue-400' },
  { icon: BarChart3, label: 'AI Analytics', href: '/ai-analytics', color: 'text-indigo-400' },
];

export const SmartTutorCard = () => {
  const { theme } = useRankTheme();
  const RankIcon = theme.icons.rank;

  return (
    <motion.div whileHover={{ scale: 1.005 }} transition={{ duration: 0.3 }} className="flex-1">
      <div className="relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 group shadow-2xl"
        style={{ background: theme.colors.bg, borderColor: theme.colors.border }}>
        
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700"
          style={{ backgroundImage: `radial-gradient(circle at 20% 30%, ${theme.colors.primary}, transparent 70%), radial-gradient(circle at 80% 70%, ${theme.colors.accent}, transparent 70%)` }} />
        
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-6 max-w-xl flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">
                <Sparkles size={14} className="animate-pulse" style={{ color: theme.colors.primary }} /> 
                Neural Cognitive Link
              </div>
              
              <h3 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tighter">
                SAARTHI <span style={{ color: theme.colors.primary }}>CORE</span>
              </h3>
              
              <p className="text-zinc-400 text-lg leading-relaxed font-medium">
                Unlock the full potential of your {theme.name} status. Seamlessly integrate with our advanced neural networks for total academic mastery.
              </p>
              
              <div className="pt-4">
                <Link 
                  to="/ai-assistant" 
                  className="inline-flex items-center gap-4 px-10 py-4 rounded-2xl font-black text-xs text-white uppercase tracking-widest shadow-2xl transition-all duration-300 group/btn"
                  style={{ background: theme.gradients.main, boxShadow: theme.effects.glowIntensity }}
                >
                  Neural Interface <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"
                style={{ backgroundColor: theme.colors.glow }} />
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
                className="relative"
              >
                <RankIcon className="w-48 h-48 transition-all duration-700" 
                  style={{ color: theme.colors.primary, filter: `drop-shadow(0 0 20px ${theme.colors.glow})` }} />
                
                {/* Secondary orbiting icon */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="w-64 h-64 rounded-full border border-white/5 border-dashed" />
                  <div className="absolute top-0 w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                    <BrainCircuit className="w-4 h-4" style={{ color: theme.colors.accent }} />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10 pt-10 border-t border-white/5">
            {AI_FEATURES.map((feature) => (
              <Link
                key={feature.href}
                to={feature.href}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all group/feat"
              >
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5">
                  <feature.icon className="w-5 h-5" style={{ color: theme.colors.primary }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Deploy</span>
                  <span className="text-xs font-bold text-white transition-colors">
                    {feature.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
