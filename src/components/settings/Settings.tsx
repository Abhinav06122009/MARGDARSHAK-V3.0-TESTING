import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings as SettingsIcon, ShieldCheck, Zap, Globe, Cpu, Radio, Target, Activity, Layout } from 'lucide-react';

// Hooks & Components
import { useSettings } from '@/hooks/useSettings';
import SecuritySection from './SecuritySection';
import AccessibilitySection from './AccessibilitySection';
import SettingsFooter from './SettingsFooter';
import Passkeys from "@/components/settings/Passkeys";
import SecurityAdvisor from "@/components/settings/SecurityAdvisor";
import PremiumIDCard from './PremiumIDCard';

const ParticleBackground = () => {
  const particles = useMemo(() => {
    return [...Array(25)].map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 25 + 15,
      delay: Math.random() * 10
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: "110%" }}
          animate={{ 
            opacity: [0, 0.4, 0],
            y: ["110%", "-10%"],
            x: [`${p.x}%`, `${p.x + (Math.random() * 10 - 5)}%`]
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
          className="absolute rounded-full bg-emerald-500/10 blur-[1px]"
          style={{ width: p.size, height: p.size, left: `${p.x}%` }}
        />
      ))}
    </div>
  );
};

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

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#010101] flex items-center justify-center overflow-hidden">
        <ParticleBackground />
        <div className="flex flex-col items-center gap-10">
           <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 border-[1px] border-emerald-500/10 rounded-full" />
              <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin" />
              <div className="absolute inset-4 border-b-2 border-purple-500/30 rounded-full animate-reverse-spin" />
              <Layout size={32} className="text-emerald-500 animate-pulse" />
           </div>
           <div className="text-center space-y-2">
              <h2 className="text-white font-black uppercase tracking-[1.2em] text-[10px] leading-none">Nexus_Architecture_Init</h2>
              <p className="text-white/20 text-[8px] font-mono tracking-widest uppercase">Calibrating Precision Layout...</p>
           </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#010101] text-gray-300 selection:bg-emerald-500/30 overflow-x-hidden">
      <ParticleBackground />
      
      {/* Precision Light Ambiance */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
           className="absolute w-[800px] h-[800px] bg-emerald-500/[0.04] blur-[150px] rounded-full"
           animate={{ x: mousePos.x - 400, y: mousePos.y - 400 }}
           transition={{ type: "spring", damping: 40, stiffness: 60 }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(1,1,1,1)_95%)]" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-8 lg:px-12 py-12 lg:py-20">
        
        {/* HEADER: Standardized Alignment */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-20"
        >
          <div className="flex items-center gap-10">
            <button
              onClick={() => onBack ? onBack() : window.history.back()}
              className="group relative w-16 h-16 flex items-center justify-center rounded-[2rem] bg-zinc-950 border border-white/5 hover:border-emerald-500/40 transition-all duration-500 shadow-2xl active:scale-95"
            >
              <ArrowLeft size={24} className="text-white/60 group-hover:text-emerald-400 group-hover:-translate-x-1 transition-all" />
              <div className="absolute inset-0 rounded-[2rem] border border-emerald-500/0 group-hover:border-emerald-500/20 transition-all scale-105 group-hover:scale-100" />
            </button>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-6 mb-3">
                 <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 relative group/icon">
                    <SettingsIcon size={20} className="text-emerald-400 animate-spin-slow group-hover/icon:animate-spin transition-all" />
                    <div className="absolute inset-0 bg-emerald-400/20 blur-xl opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black text-white tracking-[-0.06em] uppercase italic leading-none hover:animate-glitch cursor-default">
                    Nexus_Config
                 </h1>
              </div>
              <div className="flex items-center gap-3 ml-1">
                 <span className="h-[2px] w-10 bg-emerald-500/40" />
                 <p className="text-white/30 font-black uppercase tracking-[0.5em] text-[9px]">Identity & Security Architecture</p>
              </div>
            </div>
          </div>

          {/* HUD Monitors: Precision Sized */}
          <div className="flex items-center gap-6 p-3 bg-zinc-950/60 border border-white/5 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl overflow-hidden relative">
             <div className="flex items-center gap-5 px-8 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-[1.5rem] relative group/status">
                <Cpu size={16} className="text-emerald-400 animate-pulse" />
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">NODE_STABLE</span>
                   <span className="text-[8px] font-bold text-emerald-400/40 uppercase tracking-tighter mt-1 italic">V3.0_LIVE</span>
                </div>
             </div>
             <div className="flex items-center gap-5 px-8 py-4 bg-white/5 border border-white/5 rounded-[1.5rem] relative group/security">
                <Radio size={16} className="text-white/40" />
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">LEVEL_ALPHA</span>
                   <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter mt-1">ENCRYPTED</span>
                </div>
             </div>
          </div>
        </motion.header>

        {/* MAIN LAYOUT: Proportional Columns */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* COLUMN 1: Identity Center (Fixed Width Column) */}
          <div className="xl:col-span-5 2xl:col-span-4 flex flex-col gap-12">
             <div className="sticky top-12 space-y-12">
                <div className="flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                      <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center">
                         <Target size={18} className="text-emerald-400 animate-pulse" />
                      </div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/30 group-hover:text-emerald-400 transition-colors">
                        Core_Identity
                      </h3>
                   </div>
                   <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent ml-6 group-hover:from-emerald-500/20 transition-all" />
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

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-10 bg-zinc-950/60 border border-white/10 rounded-[3.5rem] backdrop-blur-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-700 shadow-2xl"
                >
                   <div className="absolute -top-12 -right-12 p-4 opacity-5 group-hover:opacity-[0.1] transition-all duration-1000 rotate-12 group-hover:rotate-0 scale-125">
                      <ShieldCheck size={180} />
                   </div>
                   <div className="relative z-10 space-y-5">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                         <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-[0.4em]">Data_Privacy_Protocol</span>
                      </div>
                      <h4 className="text-2xl font-black text-white tracking-tight uppercase italic leading-none">Security_Index</h4>
                      <p className="text-xs text-white/30 leading-relaxed font-medium">Your identity is managed via encrypted node clusters. All metadata changes are broadcasted through secure tunnels to the global registry, ensuring 99.9% sync uptime.</p>
                   </div>
                   <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                </motion.div>
             </div>
          </div>

          {/* COLUMN 2: Configuration Modules (Wide Column) */}
          <div className="xl:col-span-7 2xl:col-span-8 flex flex-col gap-12">
            <div className="flex items-center justify-between group">
               <div className="h-[1px] flex-1 bg-gradient-to-l from-white/10 to-transparent mr-6 group-hover:from-emerald-500/20 transition-all" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/30 group-hover:text-emerald-400 transition-colors flex items-center gap-4">
                  Nexus_Modules <Activity size={14} className="text-emerald-500/40" />
               </h3>
            </div>

            <div className="flex flex-col gap-10">
               {[
                 { Component: SecuritySection, props: { newPassword, setNewPassword, confirmPassword, setConfirmPassword, showPassword, setShowPassword, isSubmitting: isSubmittingPassword, onSubmit: handlePasswordUpdate, lastSignIn: user.last_sign_in_at }, delay: 0 },
                 { Component: Passkeys, props: { userId: user.id, userEmail: user.email, fullName: user.profile?.full_name || '' }, delay: 0.1 },
                 { Component: SecurityAdvisor, props: { userId: user.id, userEmail: user.email, passkeyCount, hasFullName: !!(user.profile?.full_name && user.profile.full_name.trim()) }, delay: 0.2 },
                 { Component: AccessibilitySection, props: { dyslexiaMode, setDyslexiaMode }, delay: 0.3 }
               ].map(({ Component, props, delay }, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, x: 20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true, margin: "-50px" }}
                   transition={{ duration: 0.6, delay, ease: "easeOut" }}
                   className="w-full"
                 >
                    <Component {...props} />
                 </motion.div>
               ))}
            </div>
          </div>
        </div>

        {/* FOOTER: Standardized Padding */}
        <div className="mt-40 pt-16 border-t border-white/5 relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
           <SettingsFooter />
        </div>
      </div>
    </div>
  );
};

export default Settings;