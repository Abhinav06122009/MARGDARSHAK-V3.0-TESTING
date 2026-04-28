import React from 'react';
import { Command } from 'lucide-react';
import logo from "@/components/logo/logo.png";

const SettingsFooter: React.FC = () => {
  return (
    <footer className="mt-12 py-8 border-t border-white/10 text-sm flex flex-col md:flex-row items-center justify-between gap-8 text-white/70 bg-black/10 backdrop-blur-sm rounded-t-3xl px-8 shadow-2xl">
      <div className="flex items-center gap-5 group">
        <div className="w-14 h-14 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
          <img
            src={logo}
            alt="VSAV Logo"
            className="h-10 object-contain"
            draggable={false}
          />
        </div>
        <div>
          <div className="font-black text-emerald-400 tracking-tighter text-lg leading-none">VSAV GYANTAPA</div>
          <div className="text-[10px] font-bold tracking-[0.2em] text-white/40 mt-1 uppercase">Advanced Learning Systems</div>
        </div>
      </div>

      <div className="flex flex-col items-center md:items-end gap-3">
        <button
          disabled
          className="text-xs text-white/40 hover:text-white transition-all flex items-center gap-2 group/btn py-1.5 px-3 rounded-lg border border-white/5 hover:border-white/10"
        >
          <Command size={14} className="group-hover/btn:rotate-12 transition-transform" />
          <span className="font-medium">Command Menu</span>
          <span className="ml-2 font-mono text-[9px] bg-white/10 px-1.5 py-0.5 rounded opacity-50">Ctrl+K</span>
        </button>

        <div className="flex flex-col items-center md:items-end gap-1.5">
          <div className="text-[10px] flex items-center gap-2 font-bold text-white/40 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            Active • Encrypted • Synced
          </div>
          <div className="text-[10px] font-medium text-white/30 tracking-tight">
            © 2025 VSAV GYANTAPA - Engineered for Excellence
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SettingsFooter;
