import React from 'react';
import { Eye, Sparkles, Globe, Heart, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface AccessibilitySectionProps {
  dyslexiaMode: boolean;
  setDyslexiaMode: (val: boolean) => void;
}

const AccessibilitySection: React.FC<AccessibilitySectionProps> = ({
  dyslexiaMode,
  setDyslexiaMode
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-950/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 md:col-span-2 relative overflow-hidden group shadow-2xl"
    >
      {/* Module HUD Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent h-[200%] animate-scanline pointer-events-none opacity-20" />

      <div className="absolute -bottom-20 -right-20 p-10 opacity-[0.02] group-hover:opacity-[0.04] transition-all duration-1000 rotate-12 group-hover:rotate-0">
         <Heart size={300} />
      </div>

      <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-12 relative z-10">
        <div className="flex items-start gap-8 max-w-3xl">
          <div className="p-5 bg-blue-500/10 rounded-[2rem] text-blue-400 shadow-inner border border-blue-500/20 group-hover:scale-110 transition-transform">
            <Eye size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Inclusion Core</span>
               <Activity size={12} className="text-blue-500/30 animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight italic uppercase leading-none">Universal Interface</h2>
            <p className="text-white/30 text-sm leading-relaxed font-medium">
              We engineer for the neuro-diverse spectrum. The Dyslexia-Friendly override recalibrates 
              lexical kerning, chromatic contrast, and spatial density to minimize visual load 
              and optimize neural processing speeds.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-8 bg-black/60 p-8 rounded-[2.5rem] border border-white/5 min-w-[360px] shadow-2xl relative overflow-hidden group/toggle">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover/toggle:opacity-100 transition-opacity" />
          <div className="flex-1 relative z-10">
             <div className="flex items-center gap-3 mb-2">
                <Globe size={14} className="text-blue-400/50" />
                <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Protocol Delta</h3>
             </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-lg border ${
              dyslexiaMode ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'text-white/10 border-white/5'
            } transition-all duration-500`}>
              {dyslexiaMode ? 'OVERRIDE_ENABLED' : 'ARCH_STANDARD'}
            </span>
          </div>
          
          <button 
            onClick={() => setDyslexiaMode(!dyslexiaMode)}
            className={`relative inline-flex h-12 w-24 items-center rounded-full transition-all duration-700 p-1.5 ${
              dyslexiaMode ? 'bg-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.4)]' : 'bg-zinc-900 border border-white/5'
            }`}
          >
            <motion.span 
              layout
              className={`inline-block h-9 w-9 transform rounded-full bg-white shadow-2xl flex items-center justify-center ${
                dyslexiaMode ? 'translate-x-12' : 'translate-x-0'
              }`} 
            >
               <Sparkles size={16} className={dyslexiaMode ? 'text-blue-500' : 'text-zinc-400'} />
            </motion.span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AccessibilitySection;
