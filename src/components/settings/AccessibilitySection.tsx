import React from 'react';
import { Eye } from 'lucide-react';
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
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10 md:col-span-2"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
            <Eye size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Accessibility & Inclusivity</h2>
            <p className="text-white/60 text-sm max-w-xl">
              We believe in making education accessible to everyone. Our dyslexia-friendly mode optimizes 
              typography and spacing to reduce visual stress and improve comprehension.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 min-w-[240px]">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">Dyslexia Mode</h3>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">
              {dyslexiaMode ? 'Activated' : 'Standard View'}
            </span>
          </div>
          <button 
            onClick={() => setDyslexiaMode(!dyslexiaMode)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
              dyslexiaMode ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-zinc-700'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 ${
              dyslexiaMode ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AccessibilitySection;
