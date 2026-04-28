import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings as SettingsIcon, ShieldCheck, Zap, Globe, Cpu, Radio, Target, Activity, Layout, Layers, Terminal, Box, Sparkles } from 'lucide-react';

// Hooks & Components
import { useSettings } from '@/hooks/useSettings';
import SecuritySection from './SecuritySection';
import AccessibilitySection from './AccessibilitySection';
import SettingsFooter from './SettingsFooter';
import Passkeys from "@/components/settings/Passkeys";
import SecurityAdvisor from "@/components/settings/SecurityAdvisor";
import PremiumIDCard from './PremiumIDCard';

const NoiseOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </div>
);

const NexusCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      setIsHovering(!!target.closest('button, input, [role="button"], .group, a'));
    };
    window.addEventListener('mousemove', updatePosition);
    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] hidden lg:block"
      animate={{
        x: position.x - 16,
        y: position.y - 16,
        scale: isHovering ? 2.5 : 1,
      }}
      transition={{ type: "spring", damping: 40, stiffness: 300, mass: 0.5 }}
    >
      <div className={`w-full h-full rounded-full border-2 transition-all duration-500 ${isHovering ? 'border-fuchsia-400 bg-fuchsia-400/20 blur-[1px]' : 'border-white/20 bg-transparent'}`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-colors duration-500 ${isHovering ? 'bg-fuchsia-400' : 'bg-white'}`} />
    </motion.div>
  );
};

const SpectrumBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-emerald-600/[0.05] blur-[160px] rounded-full animate-pulse" />
    <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-fuchsia-600/[0.05] blur-[160px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
    <div className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] bg-cyan-600/[0.05] blur-[160px] rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
  </div>
);

const Settings: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const {
    user, loading, fullName, setFullName, studentId, setStudentId,
    newPassword, setNewPassword, confirmPassword, setConfirmPassword,
    isSubmittingProfile, isSubmittingPassword, showPassword, setShowPassword,
    dyslexiaMode, setDyslexiaMode, passkeyCount, handleProfileUpdate,
    handlePasswordUpdate, refreshUser
  } = useSettings();

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#010101] flex flex-col items-center justify-center gap-12">
      <div className="w-20 h-20 border-t-2 border-fuchsia-500 rounded-full animate-spin shadow-[0_0_50px_rgba(217,70,239,0.3)]" />
      <span className="text-[12px] font-black text-fuchsia-500 uppercase tracking-[1.5em] animate-pulse">INIT_SPECTRUM</span>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020202] text-gray-300 selection:bg-fuchsia-500/30 overflow-x-hidden cursor-none">
      <NexusCursor />
      <NoiseOverlay />
      <SpectrumBackground />
      
      {/* MOUSE FOLLOWING LIGHT */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
           className="absolute w-[1200px] h-[1200px] bg-white/[0.01] blur-[200px] rounded-full"
           animate={{ x: mousePos.x - 600, y: mousePos.y - 600 }}
           transition={{ type: "spring", damping: 100, stiffness: 15 }}
        />
      </div>

      <div className="relative z-10 max-w-[1750px] mx-auto px-6 lg:px-20 py-20 lg:py-32">
        
        {/* HEADER: Spectrum Theme */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-16 mb-40"
        >
          <div className="flex items-center gap-10 lg:gap-16">
            <button
              onClick={() => onBack ? onBack() : window.history.back()}
              className="group relative w-20 h-20 flex items-center justify-center rounded-[2.5rem] bg-zinc-950 border border-white/5 hover:border-fuchsia-500/50 transition-all duration-700 shadow-2xl"
            >
              <ArrowLeft size={28} className="text-white/30 group-hover:text-fuchsia-400 group-hover:-translate-x-1 transition-all" />
            </button>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-10">
                 <h1 className="text-8xl lg:text-[11rem] font-black text-white tracking-[-0.08em] uppercase italic leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-fuchsia-500 drop-shadow-2xl">
                    NEXUS
                 </h1>
                 <div className="p-4 bg-zinc-950 border border-fuchsia-500/20 rounded-2xl hidden xl:block shadow-2xl">
                    <SettingsIcon size={36} className="text-fuchsia-400 animate-spin-slow" />
                 </div>
              </div>
              <div className="flex items-center gap-6 ml-2">
                 <div className="w-2 h-2 bg-fuchsia-500 rounded-full animate-ping" />
                 <p className="text-white/20 font-black uppercase tracking-[1em] text-[10px] italic">Spectrum_Protocol_V3.0</p>
              </div>
            </div>
          </div>

          {/* STATUS MONITOR: Balanced Colors */}
          <div className="flex items-center gap-8 p-6 bg-zinc-950/60 border border-white/10 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl">
             <div className="flex items-center gap-8 px-10 py-4 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
                <Cpu size={24} className="text-emerald-400" />
                <div className="flex flex-col">
                   <span className="text-[13px] font-black text-white tracking-widest leading-none">CORE_SYNC</span>
                   <span className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest mt-2">Active_Pulse</span>
                </div>
             </div>
             <div className="flex items-center gap-8 px-10 py-4 bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-3xl">
                <Layers size={24} className="text-fuchsia-400" />
                <div className="flex flex-col">
                   <span className="text-[13px] font-black text-white tracking-widest leading-none">NODE_LINK</span>
                   <span className="text-[9px] font-bold text-fuchsia-500/40 uppercase tracking-widest mt-2">Relay_Secure</span>
                </div>
             </div>
          </div>
        </motion.header>

        {/* LAYOUT: Universal Device Balance */}
        <div className="grid grid-cols-1 xl:grid-cols-[520px_1fr] gap-24 lg:gap-40 items-start">
          
          {/* LEFT: Identity Column */}
          <div className="flex flex-col gap-20 xl:sticky xl:top-12">
             <div className="flex items-center gap-8 px-4">
                <Box size={22} className="text-fuchsia-500/60" />
                <h3 className="text-[12px] font-black uppercase tracking-[0.8em] text-white/20">IDENT_MODULE</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
             </div>
             
             <PremiumIDCard 
               user={user} fullName={fullName} setFullName={setFullName}
               studentId={studentId} setStudentId={setStudentId}
               isSubmitting={isSubmittingProfile} onSubmit={handleProfileUpdate} onRefresh={refreshUser}
             />

             <div className="p-12 bg-zinc-950/60 border border-white/10 rounded-[4rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-fuchsia-500/[0.03] blur-[100px] rounded-full" />
                <div className="relative z-10 space-y-8">
                   <div className="flex items-center gap-4">
                      <Sparkles size={16} className="text-fuchsia-500" />
                      <span className="text-[11px] font-black text-fuchsia-400 uppercase tracking-[0.5em]">Quantum_Link</span>
                   </div>
                   <h4 className="text-3xl font-black text-white italic tracking-tight uppercase leading-none">Spectrum_Node</h4>
                   <p className="text-sm text-white/30 leading-relaxed font-medium">Your identity is anchored to the Margdarshak Spectrum. Secure, colorful, and synchronized across all universal terminals.</p>
                </div>
             </div>
          </div>

          {/* RIGHT: System Modules */}
          <div className="flex flex-col gap-20">
            <div className="flex items-center gap-8 px-4">
               <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
               <h3 className="text-[12px] font-black uppercase tracking-[0.8em] text-white/20">CONFIG_STACK</h3>
               <Activity size={22} className="text-cyan-500/60" />
            </div>

            <div className="grid gap-14">
               {[
                 { Component: SecuritySection, props: { newPassword, setNewPassword, confirmPassword, setConfirmPassword, showPassword, setShowPassword, isSubmitting: isSubmittingPassword, onSubmit: handlePasswordUpdate, lastSignIn: user.last_sign_in_at } },
                 { Component: Passkeys, props: { userId: user.id, userEmail: user.email, fullName: user.profile?.full_name || '' } },
                 { Component: SecurityAdvisor, props: { userId: user.id, userEmail: user.email, passkeyCount, hasFullName: !!(user.profile?.full_name && user.profile.full_name.trim()) } },
                 { Component: AccessibilitySection, props: { dyslexiaMode, setDyslexiaMode } }
               ].map(({ Component, props }, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, x: 40 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true, margin: "-100px" }}
                   transition={{ duration: 0.8, delay: i * 0.1 }}
                 >
                    <Component {...props} />
                 </motion.div>
               ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-72 pt-32 border-t border-white/5 text-center">
           <SettingsFooter />
        </div>
      </div>
    </div>
  );
};

export default Settings;