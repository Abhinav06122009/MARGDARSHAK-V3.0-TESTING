import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings as SettingsIcon, ShieldCheck, Zap, Globe, Cpu } from 'lucide-react';

// Hooks & Components
import { useSettings } from '@/hooks/useSettings';
import SecuritySection from './SecuritySection';
import AccessibilitySection from './AccessibilitySection';
import SettingsFooter from './SettingsFooter';
import Passkeys from "@/components/settings/Passkeys";
import SecurityAdvisor from "@/components/settings/SecurityAdvisor";
import PremiumIDCard from './PremiumIDCard';

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
    handlePasswordUpdate,
    refreshUser
  } = useSettings();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="relative">
           <div className="absolute -inset-8 bg-emerald-500/20 blur-[60px] rounded-full animate-pulse" />
           <div className="flex flex-col items-center gap-6 relative">
             <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_20px_#10b98120]" />
             <div className="flex flex-col items-center gap-2">
                <p className="text-white font-black uppercase tracking-[0.4em] text-xs">Decrypting Profile</p>
                <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ x: "-100%" }}
                     animate={{ x: "100%" }}
                     transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                     className="w-full h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" 
                   />
                </div>
             </div>
           </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md p-10 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-2xl space-y-6"
        >
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
             <ShieldCheck size={40} className="text-red-400" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Security Void</h2>
          <p className="text-white/40 leading-relaxed">System failed to establish a secure handshake. Your session may have expired or was interrupted by a protocol shift.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            Re-Initialize
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Premium Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 blur-[120px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20">
        {/* Superior Header */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-20"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <button
              onClick={() => onBack ? onBack() : window.history.back()}
              className="group relative w-14 h-14 flex items-center justify-center rounded-[1.25rem] bg-zinc-900 border border-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all shadow-2xl active:scale-90"
              title="Abort Configuration"
            >
              <div className="absolute inset-0 bg-emerald-500/10 rounded-[1.25rem] opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
              <ArrowLeft size={24} className="text-white/60 group-hover:text-emerald-400 transition-colors relative z-10" />
            </button>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-4 mb-2">
                 <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <SettingsIcon size={16} className="text-emerald-400 animate-spin-slow" />
                 </div>
                 <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                   Nexus Settings
                 </h1>
              </div>
              <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px] ml-1">Universal Control Interface & Identity Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2 bg-zinc-900/50 border border-white/5 rounded-[2rem] backdrop-blur-xl shadow-2xl">
             <div className="flex items-center gap-3 px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <Cpu size={14} className="text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">Core Status: Optimized</span>
             </div>
             <div className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/5 rounded-2xl">
                <Globe size={14} className="text-white/40" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Latency: 14ms</span>
             </div>
          </div>
        </motion.header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: Identity Center (Fixed or Sticky in large view) */}
          <div className="xl:col-span-5 space-y-12">
             <div className="sticky top-12">
                <div className="mb-8 flex items-center justify-between">
                   <h3 className="text-xs font-black uppercase tracking-[0.5em] text-white/20 flex items-center gap-3">
                      <Zap size={12} className="text-emerald-500/40" /> Scholar Identity
                   </h3>
                   <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4" />
                </div>
                
                <PremiumIDCard 
                  user={user} 
                  fullName={fullName}
                  setFullName={setFullName}
                  studentId={studentId}
                  setStudentId={setStudentId}
                  isSubmitting={isSubmittingProfile}
                  onSubmit={handleProfileUpdate}
                  onRefresh={refreshUser}
                />

                <div className="mt-12 p-8 bg-zinc-900/30 border border-white/5 rounded-[2.5rem] backdrop-blur-md relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <ShieldCheck size={120} />
                   </div>
                   <h4 className="text-lg font-black text-white mb-2 tracking-tight">Identity Integrity</h4>
                   <p className="text-sm text-white/40 leading-relaxed">Your digital credentials are encrypted with 256-bit AES protocols. All profile changes are synchronized across the global Margdarshak node network in real-time.</p>
                </div>
             </div>
          </div>

          {/* Right Column: Configuration Modules */}
          <div className="xl:col-span-7 space-y-12">
            <div className="flex items-center justify-between mb-8">
               <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent mr-4" />
               <h3 className="text-xs font-black uppercase tracking-[0.5em] text-white/20 flex items-center gap-3">
                  System Modules <SettingsIcon size={12} className="text-emerald-500/40" />
               </h3>
            </div>

            <div className="grid grid-cols-1 gap-8">
               {/* Security & Password Module */}
               <motion.div
                 initial={{ opacity: 0, x: 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
               >
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
               </motion.div>

               {/* Biometrics Module */}
               <motion.div
                 initial={{ opacity: 0, x: 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.1 }}
               >
                 <Passkeys
                   userId={user.id}
                   userEmail={user.email}
                   fullName={user.profile?.full_name || ''}
                 />
               </motion.div>

               {/* AI Intelligence Module */}
               <motion.div
                 initial={{ opacity: 0, x: 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
               >
                 <SecurityAdvisor
                   userId={user.id}
                   userEmail={user.email}
                   passkeyCount={passkeyCount}
                   hasFullName={!!(user.profile?.full_name && user.profile.full_name.trim())}
                 />
               </motion.div>

               {/* Interface Module */}
               <motion.div
                 initial={{ opacity: 0, x: 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.3 }}
               >
                 <AccessibilitySection 
                   dyslexiaMode={dyslexiaMode}
                   setDyslexiaMode={setDyslexiaMode}
                 />
               </motion.div>
            </div>
          </div>
        </div>

        <div className="mt-32 pt-12 border-t border-white/5">
           <SettingsFooter />
        </div>
      </div>
    </div>
  );
};

export default Settings;