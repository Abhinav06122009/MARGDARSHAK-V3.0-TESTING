import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Check, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const UpgradeCard = () => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative overflow-hidden rounded-[2.5rem] border border-amber-500/30 bg-zinc-950 group glare-card h-full"
      style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 80px rgba(245,158,11,0.05)' }}
    >
      {/* Animated Background Effects */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute top-0 right-0 w-80 h-80 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none" 
      />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-orange-600/10 rounded-full blur-[80px] pointer-events-none" />
      
      {/* Aurora Sweep */}
      <div className="absolute inset-0 opacity-[0.03] aurora-border pointer-events-none" />

      <div className="relative z-10 p-8 flex flex-col h-full">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="p-4 rounded-[1.5rem] bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 shadow-[0_10px_30px_rgba(245,158,11,0.4)]"
          >
            <Crown className="w-7 h-7 text-black fill-black" />
          </motion.div>
          <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] shadow-lg">
            Nexus_Elite_V3
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Premium Intelligence</span>
          </div>
          <h3 className="text-3xl font-black text-white leading-tight tracking-tighter">
            ELEVATE TO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500">SUPREME ACCESS</span>
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-bold">
            Transcend standard limits. Unlock unlimited neural processing, predictive health analytics, and the complete academic command suite.
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
              <div className="flex-shrink-0 p-1 rounded-full bg-amber-500/20 text-amber-500 group-hover/item:bg-amber-500/30 transition-colors">
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
            className="group/btn relative flex items-center justify-center w-full py-5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 rounded-2xl font-black text-black text-sm tracking-[0.1em] overflow-hidden shadow-2xl shadow-amber-500/20 transition-all hover:shadow-amber-500/40"
          >
            <span className="relative z-10 flex items-center gap-3">
              INITIALIZE UPGRADE <ArrowRight size={18} strokeWidth={3} />
            </span>
            {/* Shimmer */}
            <div className="absolute inset-0 bg-white/40 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-in-out skew-x-12" />
          </Link>
          <div className="flex flex-col items-center gap-2 mt-4">
             <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
               No Questions Asked Refund Policy
             </p>
          </div>
        </div>

      </div>

      {/* Decorative Sparkles */}
      <Sparkles className="absolute top-4 right-4 text-amber-500/20 w-12 h-12 rotate-12" />
    </motion.div>
  );
};

export default UpgradeCard;