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
      className="bg-zinc-950/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 relative overflow-hidden group shadow-2xl"
    >
      {/* Module HUD Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-[200%] animate-scanline pointer-events-none opacity-20" />

      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
        <Lock size={120} />
      </div>

      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Shield size={24} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight italic uppercase leading-none">Security</h2>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">Credential Manager</p>
          </div>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent ml-6" />
      </div>

      <form onSubmit={onSubmit} className="space-y-8 relative z-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-2 flex items-center gap-3">
            <KeyRound size={12} className="text-emerald-500/40" /> New Password
          </label>
          <div className="relative group/input">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-8 py-5 bg-black/60 border border-white/5 rounded-[1.75rem] text-white placeholder-white/10 focus:outline-none focus:border-emerald-500/40 transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-6 px-3 flex items-center text-white/20 hover:text-emerald-400 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-2 flex items-center gap-3">
            <Fingerprint size={12} className="text-emerald-500/40" /> Confirm Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-8 py-5 bg-black/60 border border-white/5 rounded-[1.75rem] text-white placeholder-white/10 focus:outline-none focus:border-emerald-500/40 transition-all shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !newPassword}
          className="w-full flex items-center justify-center gap-4 py-6 rounded-[2rem] bg-emerald-500 text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-emerald-400 active:scale-[0.97] transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed group/btn"
        >
          <div className="relative">
            <Shield size={20} className="group-hover/btn:rotate-12 transition-transform" />
            {isSubmitting && <div className="absolute inset-0 animate-ping bg-black/20 rounded-full" />}
          </div>
          {isSubmitting ? 'Encoding Core...' : 'Update Credentials'}
        </button>
      </form>

      {lastSignIn && (
        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black">Node Access Audit Log</span>
          </div>
          <span className="text-xs text-white/40 font-mono tracking-tight bg-black/40 p-4 rounded-xl border border-white/5">
            Last secure handshake: <span className="text-emerald-400 italic">{new Date(lastSignIn).toLocaleString()}</span>
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default SecuritySection;
