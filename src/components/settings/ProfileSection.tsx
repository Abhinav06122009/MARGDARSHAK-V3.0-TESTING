import React from 'react';
import { User as UserIcon, Mail, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { SecureUser } from '@/hooks/useSettings';

interface ProfileSectionProps {
  user: SecureUser;
  fullName: string;
  setFullName: (val: string) => void;
  studentId: string;
  setStudentId: (val: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  fullName,
  setFullName,
  studentId,
  setStudentId,
  isSubmitting,
  onSubmit
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10"
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <UserIcon className="text-emerald-400" />
        Profile Information
      </h2>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Full Name</label>
          <div className="relative group">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/30 focus:bg-emerald-500/[0.02] transition-all"
              placeholder="Your full name"
            />
            <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-emerald-500/40 transition-colors" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Student ID (Optional)</label>
          <div className="relative group">
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/30 focus:bg-emerald-500/[0.02] transition-all font-mono"
              placeholder="e.g. STU12345"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/10 uppercase tracking-widest group-focus-within:text-emerald-500/40 transition-colors">Scholar-ID</div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Email Address</label>
          <div className="flex items-center gap-4 px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-white/40 select-none backdrop-blur-md">
            <Mail size={16} className="text-white/10" />
            <span className="text-sm font-mono tracking-tight">{user.email}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </form>
    </motion.div>
  );
};

export default ProfileSection;
