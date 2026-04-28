import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings as SettingsIcon, ShieldCheck, Zap, Globe, Cpu, Radio, Target, Activity, Layout, Layers, Terminal, Box, Sparkles, Command, CloudLightning } from 'lucide-react';

// Hooks & Components
import { useSettings } from '@/hooks/useSettings';
import SecuritySection from './SecuritySection';
import AccessibilitySection from './AccessibilitySection';
import SettingsFooter from './SettingsFooter';
import Passkeys from "@/components/settings/Passkeys";
import SecurityAdvisor from "@/components/settings/SecurityAdvisor";
import PremiumIDCard from './PremiumIDCard';

// SPEED OPTIMIZED NOISE
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

// DYNAMIC LIGHTNING BACKGROUND
const LightningAura = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.04]">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute text-emerald-500"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 1, 0, 0.8, 0],
          x: Math.random() * 100 + "%",
          y: Math.random() * 100 + "%",
          scale: Math.random() * 1.5 + 1
        }}
        transition={{ 
          duration: 0.4, 
          delay: Math.random() * 15, 
          repeat: Infinity, 
          repeatDelay: Math.random() * 10 
        }}
      >
        <CloudLightning size={48} />
      </motion.div>
    ))}
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
        scale: isHovering ? 2.2 : 1,
      }}
      transition={{ type: "spring", damping: 40, stiffness: 350, mass: 0.5 }}
    >
      <div className={`w-full h-full rounded-full border-2 transition-all duration-300 ${isHovering ? 'border-emerald-400 bg-emerald-400/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-white/10'}`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-300 ${isHovering ? 'bg-emerald-400 shadow-[0_0_10px_white]' : 'bg-white/20'}`} />
    </motion.div>
  );
};

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
    <div className="min-h-screen bg-[#010101] flex flex-col items-center justify-center gap-10">
      <div className="w-20 h-20 border-t-2 border-emerald-500 rounded-full animate-spin shadow-[0_0_50px_rgba(16,185,129,0.3)]" />
      <span className="text-[12px] font-black text-emerald-500 uppercase tracking-[1.5em] animate-pulse">INIT_NEXUS</span>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020202] text-gray-300 selection:bg-emerald-500/30 overflow-x-hidden cursor-none">
      <NexusCursor />
      <NoiseOverlay />
      <LightningAura />
      
      {/* AMBIENT LIGHTING */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
           className="absolute w-[1200px] h-[1200px] bg-emerald-500/[0.04] blur-[250px] rounded-full"
           animate={{ x: mousePos.x - 600, y: mousePos.y - 600 }}
           transition={{ type: "spring", damping: 100, stiffness: 15 }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.06),transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto px-8 lg:px-20 py-20 lg:py-32">
        
        {/* HEADER: Surgical Alignment */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-20 mb-40"
        >
          <div className="flex items-center gap-12 lg:gap-20">
            <button
              onClick={() => onBack ? onBack() : window.history.back()}
              className="group relative w-24 h-24 flex items-center justify-center rounded-[3rem] bg-zinc-950 border-2 border-white/5 hover:border-emerald-500/50 transition-all duration-700 shadow-[0_40px_80px_rgba(0,0,0,1)]"
            >
              <ArrowLeft size={36} className="text-white/20 group-hover:text-emerald-400 group-hover:-translate-x-2 transition-all" />
              <div className="absolute inset-0 rounded-[3rem] border-2 border-emerald-500/0 group-hover:border-emerald-500/20 transition-all scale-125 group-hover:scale-100" />
            </button>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-12">
                 <h1 className="text-8xl lg:text-[11rem] font-black text-white tracking-[-0.08em] uppercase italic leading-none drop-shadow-2xl">
                    NEXUS
                 </h1>
                 <div className="p-6 bg-zinc-950 border-2 border-emerald-500/20 rounded-[2rem] hidden xl:block shadow-2xl">
                    <SettingsIcon size={48} className="text-emerald-400 animate-spin-slow" />
                 </div>
              </div>
              <div className="flex items-center gap-6 ml-4">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                 <p className="text-white/20 font-black uppercase tracking-[1.5em] text-[11px] italic">Universal_Config_Matrix</p>
              </div>
            </div>
          </div>

          {/* STATUS PILL */}
          <div className="flex items-center gap-10 p-8 bg-zinc-950/80 border-2 border-white/10 rounded-[4rem] backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,1)]">
             <div className="flex items-center gap-10 px-12 py-5 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-[2rem] group transition-all hover:bg-emerald-500/10">
                <Cpu size={32} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                   <span className="text-[16px] font-black text-white tracking-widest uppercase leading-none">CORE_SYNC</span>
                   <span className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest mt-2">Relay_Secure</span>
                </div>
             </div>
             <div className="flex items-center gap-10 px-12 py-5 bg-white/[0.02] border-2 border-white/5 rounded-[2rem] group transition-all hover:bg-white/[0.05]">
                <Layers size={32} className="text-white/40 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                   <span className="text-[16px] font-black text-white/50 tracking-widest uppercase leading-none">NODE_READY</span>
                   <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest mt-2">Matrix_Link</span>
                </div>
             </div>
          </div>
        </motion.header>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-[480px_1fr] gap-32 lg:gap-48 items-start">
          
          {/* LEFT: ID */}
          <div className="flex flex-col gap-24 xl:sticky xl:top-16">
             <div className="flex items-center gap-10 px-4">
                <Box size={24} className="text-emerald-500/60" />
                <h3 className="text-[13px] font-black uppercase tracking-[1em] text-white/20">IDENTIFICATION</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
             </div>
             
             <PremiumIDCard 
               user={user} fullName={fullName} setFullName={setFullName}
               studentId={studentId} setStudentId={setStudentId}
               isSubmitting={isSubmittingProfile} onSubmit={handleProfileUpdate} onRefresh={refreshUser}
             />

             <div className="p-16 bg-zinc-950/80 border-2 border-white/5 rounded-[4rem] backdrop-blur-[40px] shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-500/[0.03] blur-[120px] rounded-full" />
                <div className="relative z-10 space-y-10">
                   <div className="flex items-center gap-6">
                      <Sparkles size={20} className="text-emerald-500 animate-pulse" />
                      <span className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.6em]">Quantum_Sync</span>
                   </div>
                   <h4 className="text-4xl font-black text-white italic tracking-tight uppercase leading-none">Matrix_Persistence</h4>
                   <p className="text-lg text-white/40 leading-relaxed font-medium">Your biometric node is synchronized across the Margdarshak cloud lattice. Secure, lightning-fast, and visible on all universal devices.</p>
                </div>
             </div>
          </div>

          {/* RIGHT: Modules */}
          <div className="flex flex-col gap-24">
            <div className="flex items-center gap-10 px-4">
               <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
               <h3 className="text-[13px] font-black uppercase tracking-[1em] text-white/20">SYSTEM_CONFIG</h3>
               <Activity size={24} className="text-emerald-500/60" />
            </div>

            <div className="grid gap-16">
               {[
                 { Component: SecuritySection, props: { newPassword, setNewPassword, confirmPassword, setConfirmPassword, showPassword, setShowPassword, isSubmitting: isSubmittingPassword, onSubmit: handlePasswordUpdate, lastSignIn: user.last_sign_in_at } },
                 { Component: Passkeys, props: { userId: user.id, userEmail: user.email, fullName: user.profile?.full_name || '' } },
                 { Component: SecurityAdvisor, props: { userId: user.id, userEmail: user.email, passkeyCount, hasFullName: !!(user.profile?.full_name && user.profile.full_name.trim()) } },
                 { Component: AccessibilitySection, props: { dyslexiaMode, setDyslexiaMode } }
               ].map(({ Component, props }, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, scale: 0.95, y: 30 }}
                   whileInView={{ opacity: 1, scale: 1, y: 0 }}
                   viewport={{ once: true, margin: "-100px" }}
                   transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                 >
                    <Component {...props} />
                 </motion.div>
               ))}
            </div>
          </div>
        </div>

        <div className="mt-80 pt-40 border-t border-white/5 text-center">
           <SettingsFooter />
        </div>
      </div>
    </div>
  );
};

export default Settings;