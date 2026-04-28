import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, LogOut, Mail } from 'lucide-react';

interface BlockedUserOverlayProps {
  reason: string | null;
}

export const BlockedUserOverlay: React.FC<BlockedUserOverlayProps> = ({ reason }) => {
  return (
    <div className="fixed inset-0 z-[99999999] bg-[#020202] flex items-center justify-center p-6 lg:p-12 overflow-hidden selection:bg-red-500/30">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#ff0000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative max-w-2xl w-full"
      >
        <div className="bg-zinc-950 border border-red-500/20 rounded-[2.5rem] p-10 lg:p-16 shadow-[0_0_100px_rgba(239,68,68,0.1)] backdrop-blur-3xl overflow-hidden">
          {/* Geometric Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mb-10 rotate-3 group">
                <ShieldAlert className="w-12 h-12 text-red-500 animate-pulse" />
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-6 uppercase italic leading-none">
                ACCESS <span className="text-red-500">DENIED</span>
              </h1>
              
              <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-xs mb-10">Security_Protocol_Active</p>

              <div className="w-full bg-red-500/5 border border-red-500/10 rounded-2xl p-8 mb-10 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Violation_Report</span>
                </div>
                <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                  {reason || "Your account has been restricted due to a severe security violation. Unauthorized inspection or tampering detected."}
                </p>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">ID: TRACE_ACTIVE</span>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <a 
                  href="mailto:support@margdarshan.tech"
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                >
                  <Mail className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Appeal Ban</span>
                </a>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all font-black uppercase tracking-widest text-xs"
                >
                  <LogOut className="w-5 h-5" />
                  Exit Portal
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer info */}
        <p className="mt-8 text-center text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] italic">
          MARGDARSHAK Security Core v3.0
        </p>
      </motion.div>
    </div>
  );
};
