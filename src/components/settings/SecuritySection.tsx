import React from 'react';
import { Shield, Eye, EyeOff, KeyRound } from 'lucide-react';
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
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10"
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Shield className="text-purple-400" />
        Security
      </h2>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 pr-10 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 transition-all shadow-inner-soft"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute inset-y-0 right-0 px-3 flex items-center text-white/50 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">Confirm New Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 transition-all shadow-inner-soft"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !newPassword}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <KeyRound size={18} />
          {isSubmitting ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
      
      {lastSignIn && (
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-white/30 font-bold">Access Audit</span>
          <span className="text-sm text-white/50">
            Last sign-in: <span className="text-white/70 font-mono italic">{new Date(lastSignIn).toLocaleString()}</span>
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default SecuritySection;
