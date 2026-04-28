import React from 'react';
import { Eye, Sparkles, Globe, Heart } from 'lucide-react';
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
      className="bg-zinc-900/40 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/5 md:col-span-2 relative overflow-hidden group shadow-2xl"
    >
      <div className="absolute -bottom-10 -right-10 p-10 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
         <Heart size={200} />
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
        <div className="flex items-start gap-6 max-w-2xl">
          <div className="p-4 bg-blue-500/10 rounded-[1.5rem] text-blue-400 shadow-inner">
            <Eye size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight italic uppercase">Inclusive Interface</h2>
            <p className="text-white/40 text-sm leading-relaxed">
              We believe in universal education. The Dyslexia-Friendly protocol optimizes typography, 
              color contrast, and spatial hierarchy to ensure a seamless learning experience for every scholar.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-black/40 p-6 rounded-[2rem] border border-white/5 min-w-[320px] shadow-2xl">
          <div className="flex-1">
             <div className="flex items-center gap-2 mb-1">
                <Globe size={12} className="text-blue-400/50" />
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Dyslexia Protocol</h3>
             </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${
              dyslexiaMode ? 'bg-blue-500/10 text-blue-400' : 'text-white/20'
            }`}>
              {dyslexiaMode ? 'SYSTEM OVERRIDE ACTIVE' : 'STANDARD ARCHITECTURE'}
            </span>
          </div>
          
          <button 
            onClick={() => setDyslexiaMode(!dyslexiaMode)}
            className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-500 p-1 ${
              dyslexiaMode ? 'bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'bg-zinc-800'
            }`}
          >
            <div className={`absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
            <motion.span 
              layout
              className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-xl flex items-center justify-center ${
                dyslexiaMode ? 'translate-x-10' : 'translate-x-0'
              }`} 
            >
               <Sparkles size={14} className={dyslexiaMode ? 'text-blue-500' : 'text-zinc-400'} />
            </motion.span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AccessibilitySection;
