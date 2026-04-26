import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

// Hooks & Components
import { useSettings } from '@/hooks/useSettings';
import ProfileSection from './ProfileSection';
import SecuritySection from './SecuritySection';
import AccessibilitySection from './AccessibilitySection';
import SettingsFooter from './SettingsFooter';
import Passkeys from "@/components/settings/Passkeys";
import SecurityAdvisor from "@/components/settings/SecurityAdvisor";

interface SettingsProps {
  onBack?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const {
    user,
    loading,
    fullName,
    setFullName,
    studentId,
    setStudentId,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isSubmittingProfile,
    isSubmittingPassword,
    showPassword,
    setShowPassword,
    dyslexiaMode,
    setDyslexiaMode,
    passkeyCount,
    handleProfileUpdate,
    handlePasswordUpdate
  } = useSettings();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Synchronizing Core</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-white">Session Unavailable</h2>
          <p className="text-white/60">We could not retrieve your security profile. Please verify your connection or re-authenticate.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
          >
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-gray-300 selection:bg-emerald-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Header Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16"
        >
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="group p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all shadow-xl active:scale-95"
              title="Return to Dashboard"
            >
              <ArrowLeft size={20} className="text-white/60 group-hover:text-emerald-400 transition-colors" />
            </button>
            
            <div className="h-12 w-px bg-white/10 hidden md:block" />
            
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                Settings
                <span className="text-xs font-black uppercase tracking-[0.3em] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md ml-2">
                  v2.0
                </span>
              </h1>
              <p className="text-white/40 font-medium">Configure your academic environment and security protocols.</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 p-1.5 bg-white/5 border border-white/5 rounded-2xl">
             <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-xs font-bold text-emerald-400">Standard Tier</span>
             </div>
             <div className="px-4 py-2">
                <span className="text-xs font-bold text-white/40">Secure Node: IND-01</span>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Main Configuration Panels */}
          <ProfileSection 
            user={user}
            fullName={fullName}
            setFullName={setFullName}
            studentId={studentId}
            setStudentId={setStudentId}
            isSubmitting={isSubmittingProfile}
            onSubmit={handleProfileUpdate}
          />

          <SecuritySection 
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isSubmitting={isSubmittingPassword}
            onSubmit={handlePasswordUpdate}
            lastSignIn={user.last_sign_in_at}
          />

          {/* Biometrics & Hardware Keys */}
          <Passkeys
            userId={user.id}
            userEmail={user.email}
            fullName={user.profile?.full_name || ''}
          />

          {/* AI Security Analysis */}
          <SecurityAdvisor
            userId={user.id}
            userEmail={user.email}
            passkeyCount={passkeyCount}
            hasFullName={!!(user.profile?.full_name && user.profile.full_name.trim())}
          />

          {/* Experience Settings */}
          <AccessibilitySection 
            dyslexiaMode={dyslexiaMode}
            setDyslexiaMode={setDyslexiaMode}
          />
        </div>

        <SettingsFooter />
      </div>
    </div>
  );
};

export default Settings;