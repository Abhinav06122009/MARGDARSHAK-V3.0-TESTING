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
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-emerald-400/50 transition-all shadow-inner-soft"
            placeholder="Your full name"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">Student ID (Optional)</label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-emerald-400/50 transition-all shadow-inner-soft"
            placeholder="e.g. STU12345"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">Email Address</label>
          <div className="flex items-center gap-3 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white/60 select-none">
            <Mail size={18} />
            <span>{user.email}</span>
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
