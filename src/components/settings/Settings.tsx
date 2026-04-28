import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings as SettingsIcon, ShieldCheck, Zap, Globe, Cpu, Radio, Target, Activity, Layout, Layers, Terminal, Box } from 'lucide-react';

// Hooks & Components
import { useSettings } from '@/hooks/useSettings';
import SecuritySection from './SecuritySection';
import AccessibilitySection from './AccessibilitySection';
import SettingsFooter from './SettingsFooter';
import Passkeys from "@/components/settings/Passkeys";
import SecurityAdvisor from "@/components/settings/SecurityAdvisor";
import PremiumIDCard from './PremiumIDCard';

// SPEED OPTIMIZED: Simplified Noise
const NoiseOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.02] mix-blend-overlay">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </div>
);

// SPEED OPTIMIZED: Lighter Cursor
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
      className="fixed top-0 left-0 w-6 h-6 pointer-events-none z-[9999] hidden lg:block"
      animate={{
        x: position.x - 12,
        y: position.y - 12,
        scale: isHovering ? 2 : 1,
      }}
      transition={{ type: "spring", damping: 50, stiffness: 400, mass: 0.3 }}
    >
      <div className={`w-full h-full rounded-full border-2 transition-all duration-300 ${isHovering ? 'border-emerald-400 bg-emerald-400/10' : 'border-white/10'}`} />
    </motion.div>
  );
};

// SPEED OPTIMIZED: Lighter Grid
const CircuitryOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M 0 50 L 100 50 M 50 0 L 50 100" stroke="white" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="1" fill="white" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#circuit)" />
    </svg>
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
    <div className="min-h-screen bg-[#010101] flex flex-col items-center justify-center gap-8">
      <div className="w-16 h-16 border-t-2 border-emerald-500 rounded-full animate-spin" />
      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[1em]">INITIALIZING</span>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020202] text-gray-300 selection:bg-emerald-500/30 overflow-x-hidden cursor-none">
      <NexusCursor />
      <NoiseOverlay />
      <CircuitryOverlay />
      
      {/* PERFORMANCE OPTIMIZED AMBIENT LIGHT */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
           className="absolute w-[1000px] h-[1000px] bg-emerald-500/[0.03] blur-[250px] rounded-full"
           animate={{ x: mousePos.x - 500, y: mousePos.y - 500 }}
           transition={{ type: "spring", damping: 100, stiffness: 10 }}
        />
      </div>

      <div className="relative z-10 max-w-[1700px] mx-auto px-8 lg:px-16 py-16 lg:py-24">
        
        {/* HEADER: Surgical Precision & Symmetry */}
        <motion.header
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-16 mb-32"
        >
          <div className="flex items-center gap-12 lg:gap-16">
            <button
              onClick={() => onBack ? onBack() : window.history.back()}
              className="group relative w-20 h-20 flex items-center justify-center rounded-[2.5rem] bg-zinc-950 border border-white/5 hover:border-emerald-500/30 transition-all shadow-xl"
            >
              <ArrowLeft size={24} className="text-white/20 group-hover:text-emerald-400 group-hover:-translate-x-1 transition-all" />
            </button>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-8">
                 <h1 className="text-7xl lg:text-[10rem] font-black text-white tracking-[-0.1em] uppercase italic leading-none drop-shadow-2xl">
                    NEXUS
                 </h1>
                 <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 hidden lg:block">
                    <SettingsIcon size={32} className="text-emerald-400 animate-spin-slow" />
                 </div>
              </div>
              <div className="flex items-center gap-4 ml-2">
                 <p className="text-white/20 font-black uppercase tracking-[1em] text-[9px] italic">Universal_Config</p>
              </div>
            </div>
          </div>

          {/* STATUS BAR: Perfect Right Alignment */}
          <div className="flex items-center gap-6 p-4 bg-zinc-950/40 border border-white/5 rounded-full backdrop-blur-2xl">
             <div className="flex items-center gap-6 px-10 py-3 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                <Cpu size={20} className="text-emerald-400" />
                <span className="text-[11px] font-black text-white/60 tracking-widest leading-none">CORE_ACTIVE</span>
             </div>
             <div className="flex items-center gap-6 px-10 py-3 bg-white/[0.01] border border-white/5 rounded-full">
                <Layers size={20} className="text-white/20" />
                <span className="text-[11px] font-black text-white/30 tracking-widest leading-none">NODE_READY</span>
             </div>
          </div>
        </motion.header>

        {/* CONTENT GRID: Surgical Proportions */}
        <div className="grid grid-cols-1 xl:grid-cols-[480px_1fr] gap-24 lg:gap-32 items-start">
          
          {/* LEFT: ID Component */}
          <div className="flex flex-col gap-16 sticky top-12">
             <div className="flex items-center gap-6 px-4">
                <Box size={20} className="text-emerald-500/40" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.8em] text-white/20">IDENTIFICATION</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
             </div>
             
             <PremiumIDCard 
               user={user} fullName={fullName} setFullName={setFullName}
               studentId={studentId} setStudentId={setStudentId}
               isSubmitting={isSubmittingProfile} onSubmit={handleProfileUpdate} onRefresh={refreshUser}
             />
          </div>

          {/* RIGHT: Modules */}
          <div className="flex flex-col gap-16">
            <div className="flex items-center gap-6 px-4">
               <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
               <h3 className="text-[11px] font-black uppercase tracking-[0.8em] text-white/20">SYSTEM_CONFIG</h3>
               <Activity size={20} className="text-emerald-500/40" />
            </div>

            <div className="grid gap-12">
               {[
                 { Component: SecuritySection, props: { newPassword, setNewPassword, confirmPassword, setConfirmPassword, showPassword, setShowPassword, isSubmitting: isSubmittingPassword, onSubmit: handlePasswordUpdate, lastSignIn: user.last_sign_in_at } },
                 { Component: Passkeys, props: { userId: user.id, userEmail: user.email, fullName: user.profile?.full_name || '' } },
                 { Component: SecurityAdvisor, props: { userId: user.id, userEmail: user.email, passkeyCount, hasFullName: !!(user.profile?.full_name && user.profile.full_name.trim()) } },
                 { Component: AccessibilitySection, props: { dyslexiaMode, setDyslexiaMode } }
               ].map(({ Component, props }, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.5, delay: i * 0.05 }}
                 >
                    <Component {...props} />
                 </motion.div>
               ))}
            </div>
          </div>
        </div>

        <div className="mt-64 pt-24 border-t border-white/5 text-center">
           <SettingsFooter />
        </div>
      </div>
    </div>
  );
};

export default Settings;