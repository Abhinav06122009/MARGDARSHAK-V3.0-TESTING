import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Check, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRankTheme } from '@/context/ThemeContext';

const UpgradeCard = () => {
  const { theme } = useRankTheme();
  
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative overflow-hidden rounded-[2.5rem] border bg-zinc-950 group glare-card h-full"
      style={{ borderColor: theme.colors.border, boxShadow: `0 20px 50px rgba(0,0,0,0.5), inset 0 0 80px ${theme.colors.glow}` }}
    >
      {/* Animated Background Effects */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none" 
        style={{ backgroundColor: theme.colors.primary }}
      />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full blur-[80px] pointer-events-none opacity-10" 
        style={{ backgroundColor: theme.colors.accent }} />
      
      <div className="relative z-10 p-8 flex flex-col h-full">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="p-4 rounded-[1.5rem] shadow-2xl"
            style={{ background: theme.gradients.main }}
          >
            <Crown className="w-7 h-7 text-white fill-white" />
          </motion.div>
          <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">
            {theme.id.includes('a+') ? 'COMMAND_TIER' : 'NEXUS_UPGRADE'}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4" style={{ color: theme.colors.primary }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.colors.primary }}>Supreme Intelligence</span>
          </div>
          <h3 className="text-3xl font-black text-white leading-tight tracking-tighter">
            ELEVATE TO <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: theme.gradients.main }}>SUPREME ACCESS</span>
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-bold">
            Unlock the full potential of your {theme.name} status. Infinite neural processing and predictive command suites await.
          </p>
        </div>

        {/* Feature List */}
        <div className="space-y-4 mb-10">
          {[
            "Infinite AI Neural Processing",
            "Burnout & Health Predictor",
            "Advanced Academic Command Center",
            "Personalized AI Career Roadmap"
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
              className="flex items-center gap-4 text-sm text-zinc-300 group/item"
            >
              <div className="flex-shrink-0 p-1 rounded-full bg-white/5 border border-white/10 transition-colors"
                style={{ color: theme.colors.primary }}>
                <Check size={10} strokeWidth={4} />
              </div>
              <span className="text-xs font-black tracking-tight text-zinc-200 group-hover/item:text-white transition-colors">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <Link
            to="/upgrade"
            className="group/btn relative flex items-center justify-center w-full py-5 rounded-2xl font-black text-white text-sm tracking-[0.1em] overflow-hidden shadow-2xl transition-all"
            style={{ background: theme.gradients.main, boxShadow: theme.effects.glowIntensity }}
          >
            <span className="relative z-10 flex items-center gap-3">
              INITIALIZE UPGRADE <ArrowRight size={18} strokeWidth={3} />
            </span>
            <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-in-out skew-x-12" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default UpgradeCard;