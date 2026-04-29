import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, BrainCircuit, Activity, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DoubtSolver from '@/lib/DoubtSolver';
import { motion } from 'framer-motion';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { ScrollArea } from '@/components/ui/scroll-area';

const DoubtSolverPage = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 overflow-x-hidden relative font-sans">
      <Helmet>
        <title>Neural Doubt Resolver | MARGDARSHAK</title>
        <meta name="description" content="Initialize high-fidelity forensic analysis of complex problem vectors with our AI tutor." />
      </Helmet>

      <AmbientBackground />

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-16">
          
          {/* Header Architecture */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <Link to="/dashboard">
                <motion.div 
                  whileHover={{ x: -4 }}
                  className="inline-flex items-center gap-3 text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-8 hover:text-emerald-500 transition-colors cursor-pointer group/back"
                >
                  <ArrowLeft className="w-4 h-4 group-hover/back:scale-125 transition-transform" /> Back to Operational Core
                </motion.div>
              </Link>
              
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
                >
                  <BrainCircuit className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">Intelligence Sector Activated</span>
                </motion.div>
                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">Doubt <span className="text-emerald-500">Resolver</span></h1>
                <p className="text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase mt-4 opacity-60 italic max-w-2xl">Forensic problem decomposition and neural solution synthesis in real-time.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="px-8 py-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 shadow-2xl backdrop-blur-3xl">
                <Activity className="w-5 h-5 text-emerald-500/40" />
                <div>
                  <span className="text-[9px] font-black text-white uppercase tracking-widest block leading-none">Diagnostic Engine</span>
                  <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest mt-1 block opacity-60">Status: Optimal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Solver Unit */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <DoubtSolver />
          </motion.div>
          
          {/* Diagnostic Footer */}
          <div className="flex items-center justify-between opacity-10 py-12 border-t border-white/5">
             <div className="flex items-center gap-4">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <div className="h-[1px] w-40 bg-gradient-to-r from-emerald-500 to-transparent" />
             </div>
             <span className="text-[8px] font-black uppercase tracking-[0.5em] italic">Margdarshak Neural Uplink v3.0.5</span>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};

export default DoubtSolverPage;