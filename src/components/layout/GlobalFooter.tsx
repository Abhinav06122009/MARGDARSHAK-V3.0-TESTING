import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, ExternalLink, Cpu } from 'lucide-react';

const GlobalFooter = () => {
  return (
    <footer className="w-full py-12 px-6 relative z-10 overflow-hidden">
      {/* Visual Separator */}
      <div className="max-w-6xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />
      
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Brand Core */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/[0.03] border border-white/10 rounded-xl">
              <Cpu size={16} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-black tracking-tighter text-white italic uppercase">
              Margdarshak <span className="text-blue-500">Systems</span>
            </h3>
          </div>
          <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.4em] text-center md:text-left leading-relaxed">
            Elite Cognitive Architecture <br />
            v3.0.4_Build_Stable
          </p>
        </div>

        {/* System Navigation */}
        <div className="flex items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-3">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.5em]">Protocols</span>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-[10px] font-bold text-zinc-400 hover:text-blue-400 transition-colors uppercase tracking-widest">Privacy</Link>
              <Link to="/terms" className="text-[10px] font-bold text-zinc-400 hover:text-blue-400 transition-colors uppercase tracking-widest">Terms</Link>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-start gap-3">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.5em]">Identity</span>
            <div className="flex items-center gap-6">
              <Link to="/auth" className="text-[10px] font-bold text-zinc-400 hover:text-blue-400 transition-colors uppercase tracking-widest">Access</Link>
              <Link to="/support" className="text-[10px] font-bold text-zinc-400 hover:text-blue-400 transition-colors uppercase tracking-widest">Support</Link>
            </div>
          </div>
        </div>

        {/* Global Security Badge */}
        <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl group hover:border-blue-500/20 transition-all duration-500">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)] animate-pulse" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-blue-500 blur-sm animate-ping" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Neural Secured</span>
            <span className="text-[7px] font-mono uppercase text-zinc-600 tracking-widest">256_BIT_ENCRYPTION</span>
          </div>
        </div>
      </div>

      {/* Copyright Line */}
      <div className="max-w-6xl mx-auto mt-12 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 opacity-30">
          <Shield size={10} className="text-zinc-500" />
          <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.5em]">
            © 2026 MARGDARSHAK_SYSTEMS. ALL_RIGHTS_RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
