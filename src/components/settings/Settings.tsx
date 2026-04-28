import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings as SettingsIcon, ShieldCheck, Zap, Globe, Cpu, Radio, Target, Activity, Layout, Layers, Terminal } from 'lucide-react';

// Hooks & Components
import { useSettings } from '@/hooks/useSettings';
import SecuritySection from './SecuritySection';
import AccessibilitySection from './AccessibilitySection';
import SettingsFooter from './SettingsFooter';
import Passkeys from "@/components/settings/Passkeys";
import SecurityAdvisor from "@/components/settings/SecurityAdvisor";
import PremiumIDCard from './PremiumIDCard';

// INFINITY TIER: Subtle Digital Grain / Noise
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
        scale: isHovering ? 2 : 1,
      }}
      transition={{ type: "spring", damping: 40, stiffness: 250, mass: 0.4 }}
    >
      <div className={`w-full h-full rounded-full border-2 transition-all duration-500 ${isHovering ? 'border-emerald-400 bg-emerald-400/20 blur-[1px]' : 'border-white/30 bg-transparent'}`} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full" />
    </motion.div>
  );
};

const CircuitryOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <pattern id="circuit" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
        <path d="M 20 20 L 100 20 L 100 100 L 20 100 Z" fill="none" stroke="white" strokeWidth="0.5" />
        <path d="M 0 60 L 20 60 M 100 60 L 120 60 M 60 0 L 60 20 M 60 100 L 60 120" stroke="white" strokeWidth="0.5" />
        <circle cx="20" cy="20" r="1.5" fill="white" />
        <circle cx="100" cy="20" r="1.5" fill="white" />
        <circle cx="100" cy="100" r="1.5" fill="white" />
        <circle cx="20" cy="100" r="1.5" fill="white" />
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
    <div className="min-h-screen bg-[#010101] flex flex-col items-center justify-center gap-12">
      <div className="w-24 h-24 border-t-2 border-emerald-500 rounded-full animate-spin" />
      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[1em]">Nexus_Booting</span>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020202] text-gray-300 selection:bg-emerald-500/30 overflow-x-hidden cursor-none">
      <NexusCursor />
      <NoiseOverlay />
      <CircuitryOverlay />
      
      {/* INFINITY TIER: High-End Glass Backing */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
           className="absolute w-[1200px] h-[1200px] bg-emerald-500/[0.03] blur-[200px] rounded-full"
           animate={{ x: mousePos.x - 600, y: mousePos.y - 600 }}
           transition={{ type: "spring", damping: 60, stiffness: 30 }}
        />
      </div>

      <div className="relative z-10 max-w-[1700px] mx-auto px-10 lg:px-20 py-16 lg:py-24">
        
        {/* HEADER: Absolute Precision */}
        <motion.header
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-16 mb-32"
        >
          <div className="flex items-center gap-16">
            <button
              onClick={() => onBack ? onBack() : window.history.back()}
              className="group relative w-20 h-20 flex items-center justify-center rounded-[2.5rem] bg-zinc-950 border border-white/5 hover:border-emerald-500/40 transition-all duration-700 shadow-2xl"
            >
              <ArrowLeft size={28} className="text-white/40 group-hover:text-emerald-400 group-hover:-translate-x-1 transition-all" />
              <div className="absolute inset-0 rounded-[2.5rem] border border-emerald-500/0 group-hover:border-emerald-500/10 transition-all scale-110 group-hover:scale-100" />
            </button>
            
            <div className="space-y-4">
              <div className="flex items-center gap-8">
                 <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                    <SettingsIcon size={32} className="text-emerald-400 animate-spin-slow" />
                 </div>
                 <h1 className="text-7xl lg:text-9xl font-black text-white tracking-[-0.08em] uppercase italic leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,1)]">
                    NEXUS
                 </h1>
              </div>
              <div className="flex items-center gap-4 ml-2">
                 <Terminal size={14} className="text-emerald-500/40" />
                 <p className="text-white/20 font-black uppercase tracking-[0.8em] text-[10px]">Command_Protocol_Active</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 p-6 bg-zinc-950/40 border border-white/5 rounded-[3rem] backdrop-blur-3xl shadow-2xl">
             <div className="flex items-center gap-6 px-10 py-4 bg-emerald-500/5 border border-emerald-500/20 rounded-[1.75rem]">
                <Cpu size={20} className="text-emerald-400" />
                <div className="flex flex-col">
                   <span className="text-[12px] font-black text-white tracking-widest leading-none">ALPHA_01</span>
                   <span className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest mt-2">Core_Encrypted</span>
                </div>
             </div>
             <div className="flex items-center gap-6 px-10 py-4 bg-white/[0.02] border border-white/5 rounded-[1.75rem]">
                <Layers size={20} className="text-white/30" />
                <div className="flex flex-col">
                   <span className="text-[12px] font-black text-white/40 tracking-widest leading-none">NODE_V3</span>
                   <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest mt-2">Stack_Stable</span>
                </div>
             </div>
          </div>
        </motion.header>

        {/* LAYOUT: Infinity Symmetry */}
        <div className="grid grid-cols-1 xl:grid-cols-[450px_1fr] gap-24 lg:gap-40 items-start">
          
          {/* LEFT: Identity Column */}
          <div className="flex flex-col gap-16 sticky top-12">
             <div className="flex items-center gap-6">
                <Target size={20} className="text-emerald-500/40" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-white/20">CORE_IDENTITY</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
             </div>
             
             <PremiumIDCard 
               user={user} fullName={fullName} setFullName={setFullName}
               studentId={studentId} setStudentId={setStudentId}
               isSubmitting={isSubmittingProfile} onSubmit={handleProfileUpdate} onRefresh={refreshUser}
             />

             <div className="p-10 bg-zinc-950/60 border border-white/10 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000 rotate-12">
                   <ShieldCheck size={200} />
                </div>
                <div className="relative z-10 space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.4em]">Vault_Status</span>
                   </div>
                   <h4 className="text-2xl font-black text-white italic tracking-tight uppercase leading-none">Integrity_Link</h4>
                   <p className="text-xs text-white/30 leading-relaxed font-medium">Your biometric node is synchronized with the Margdarshak cloud lattice. Changes persist across all encrypted terminals instantly.</p>
                </div>
             </div>
          </div>

          {/* RIGHT: Modules Column */}
          <div className="flex flex-col gap-16">
            <div className="flex items-center gap-6">
               <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
               <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-white/20">CONFIG_MODULES</h3>
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
                   initial={{ opacity: 0, x: 50 }}
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
        <div className="mt-64 pt-24 border-t border-white/5 text-center">
           <SettingsFooter />
        </div>
      </div>
    </div>
  );
};

export default Settings;