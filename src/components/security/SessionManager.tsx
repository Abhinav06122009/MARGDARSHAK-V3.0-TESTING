import { Monitor, Smartphone, Globe, Shield, Activity, Sparkles, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export interface SessionItem {
  id: string;
  device: string;
  location?: string | null;
  lastActive: string;
  isCurrent?: boolean;
}

interface SessionManagerProps {
  sessions: SessionItem[];
  onTerminate?: (id: string) => void;
}

export const SessionManager = ({ sessions, onTerminate }: SessionManagerProps) => {
  return (
    <div className="space-y-6">
      {sessions.map((session, index) => (
        <motion.div 
          key={session.id} 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-8 backdrop-blur-3xl shadow-2xl transition-all duration-700 hover:bg-white/[0.03] group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex items-center gap-8 relative z-10">
            <div className={`p-4 rounded-[1.5rem] border transition-all duration-700 group-hover:scale-110 shadow-2xl ${
              session.isCurrent ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/[0.02] border-white/5 text-zinc-600 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20'
            }`}>
              {session.device.toLowerCase().includes('mobile') ? <Smartphone className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-4">
                <p className="text-xl font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-emerald-400 transition-colors">{session.device}</p>
                {session.isCurrent && (
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-500 uppercase tracking-widest italic animate-pulse">Active_Node</span>
                )}
              </div>
              <div className="flex items-center gap-6 mt-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> {session.location || 'SECURE_UPLINK'}</span>
                <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> {session.lastActive}</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10">
            {session.isCurrent ? (
              <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-2xl">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Identity_Verified</span>
              </div>
            ) : (
              <button 
                onClick={() => onTerminate?.(session.id)}
                className="flex items-center gap-3 px-8 py-4 bg-white/[0.02] hover:bg-red-500/10 text-zinc-700 hover:text-red-500 border border-white/5 hover:border-red-500/20 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] italic transition-all shadow-2xl hover:translate-y-[-4px] active:scale-95 group/btn"
              >
                <XCircle className="w-4 h-4 group-hover/btn:scale-125 transition-transform" /> Revoke Access
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
