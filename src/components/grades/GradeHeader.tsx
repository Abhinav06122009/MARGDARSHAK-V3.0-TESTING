
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Shield } from 'lucide-react';

interface GradeHeaderProps {
  onBack?: () => void;
  openCreateDialog: () => void;
  userName: string;
}

const GradeHeader: React.FC<GradeHeaderProps> = ({ onBack, openCreateDialog, userName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden border-b border-white/5 bg-zinc-950/20 backdrop-blur-3xl rounded-b-[3rem]"
    >
      <div className="relative px-8 py-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            {onBack && (
              <motion.button
                onClick={onBack}
                className="group p-4 bg-zinc-900/50 hover:bg-zinc-800/80 backdrop-blur-3xl rounded-2xl transition-all duration-500 border border-white/5 hover:border-white/10 shadow-2xl"
                whileHover={{ scale: 1.05, x: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
              </motion.button>
            )}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em]">Performance Manager</span>
              </div>
              <motion.h1
                className="text-5xl lg:text-7xl font-black text-white tracking-tighter flex items-center gap-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">GRADES</span>

              </motion.h1>
              <motion.p
                className="text-zinc-500 font-medium tracking-tight mt-2 max-w-xl text-sm lg:text-base"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                academic performance of <span className="text-white font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">{userName}</span>
              </motion.p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <motion.button
              onClick={openCreateDialog}
              className="group relative h-16 w-full lg:w-auto px-10 flex items-center justify-center overflow-hidden rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Plus className="w-5 h-5 mr-3 relative z-10 group-hover:text-white transition-colors duration-500 group-hover:rotate-90" />
              <span className="relative z-10 group-hover:text-white transition-colors duration-500">Add Grade</span>
            </motion.button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </motion.div>
  );
};

export default GradeHeader;
