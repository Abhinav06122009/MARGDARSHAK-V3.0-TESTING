import React from 'react';
import { Shield, Eye, EyeOff, KeyRound, Lock, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

interface SecuritySectionProps {
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  lastSignIn?: string;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  isSubmitting,
  onSubmit,
  lastSignIn
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-zinc-900/40 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-2xl"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
         <Lock size={120} />
      </div>

      <div className="flex items-center justify-between mb-10">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
               <Shield size={24} className="text-emerald-400" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">Security</h2>
               <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Credential Management</p>
            </div>
         </div>
         <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent ml-6" />
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
             <KeyRound size={12} className="text-emerald-500/40" /> New Password
          </label>
          <div className="relative group/input">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute inset-y-0 right-4 px-3 flex items-center text-white/20 hover:text-emerald-400 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
             <Fingerprint size={12} className="text-emerald-500/40" /> Confirm Handshake
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !newPassword}
          className="w-full flex items-center justify-center gap-3 py-5 rounded-[1.5rem] bg-emerald-500 text-black font-black uppercase tracking-[0.2em] hover:bg-emerald-400 active:scale-[0.97] transition-all shadow-xl shadow-emerald-500/10 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
        >
          <div className="relative">
             <Shield size={20} />
             {isSubmitting && <div className="absolute inset-0 animate-ping bg-black/20 rounded-full" />}
          </div>
          {isSubmitting ? 'Updating Core...' : 'Sync New Password'}
        </button>
      </form>
      
      {lastSignIn && (
        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
             <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black">Authentication Log</span>
          </div>
          <span className="text-xs text-white/40 font-mono tracking-tight">
            Last secure session: <span className="text-emerald-400/60 italic">{new Date(lastSignIn).toLocaleString()}</span>
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default SecuritySection;
