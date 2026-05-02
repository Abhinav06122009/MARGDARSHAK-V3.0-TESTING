import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Check, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const UpgradeCard = () => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative overflow-hidden rounded-[2rem] border border-amber-500/20 bg-zinc-900/40 backdrop-blur-2xl group glare-card h-full"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 p-6 sm:p-8 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-500">
            <Crown className="w-6 h-6" />
          </div>
          <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-widest">
            Supreme Access
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-2xl font-black text-white leading-tight mb-2">
            TRANSFORM YOUR <br />
            <span className="text-amber-500">ACADEMIC JOURNEY</span>
          </h3>
          <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
            Unlock the full power of Margdarshak AI. Get unlimited neural processing, advanced predictors, and elite command suite.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {[
            "Unlimited AI Neural Tasks",
            "Burnout Predictor Logic",
            "Advanced Command Center",
            "Elite Identity Badging"
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Check size={8} className="text-amber-500" strokeWidth={4} />
              </div>
              <span className="text-[11px] font-bold text-zinc-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* Action */}
        <div className="mt-auto">
          <Link
            to="/upgrade"
            className="group/btn relative flex items-center justify-center w-full py-4 bg-amber-500 rounded-xl font-black text-black text-xs tracking-widest overflow-hidden transition-all hover:bg-amber-400"
          >
            <span className="relative z-10 flex items-center gap-2">
              UPGRADE NOW <ArrowRight size={16} strokeWidth={3} />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
          </Link>
          <p className="text-center text-[9px] text-zinc-500 mt-3 font-bold uppercase tracking-widest">
            24-Hour Satisfaction Guarantee
          </p>
        </div>
      </div>

      <Sparkles className="absolute top-4 right-4 text-amber-500/10 w-8 h-8 rotate-12" />
    </motion.div>
  );
};

export default UpgradeCard;