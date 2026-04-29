import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/react';
import { ArrowLeft, Settings as SettingsIcon, ShieldCheck, Zap, Globe, Cpu, Radio, Target, Activity, Layout, Layers, Terminal, Box, Sparkles, Command } from 'lucide-react';

// Hooks & Components
import { useSettings } from '@/hooks/useSettings';
import SecuritySection from './SecuritySection';
import AccessibilitySection from './AccessibilitySection';
import SettingsFooter from './SettingsFooter';
import Passkeys from "@/components/settings/Passkeys";
import SecurityAdvisor from "@/components/settings/SecurityAdvisor";
import PremiumIDCard from './PremiumIDCard';

// FAST LOADING NOISE
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

// FAST LOADING CURSOR
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
      transition={{ type: "spring", damping: 50, stiffness: 400, mass: 0.4 }}
    >
      <div className={`w-full h-full rounded-full border-2 transition-all duration-300 ${isHovering ? 'border-emerald-400 bg-emerald-400/10' : 'border-white/10'}`} />
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
  const { user: clerkUser } = useUser();
  const clerkPasskeyCount = clerkUser?.passkeys?.length || 0;

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center gap-8">
      <div className="w-12 h-12 border-t-2 border-emerald-500 rounded-full animate-spin" />
      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[1.5em]">INITIALIZING</span>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020202] text-gray-300 selection:bg-emerald-500/30 overflow-x-hidden cursor-none">
      <NexusCursor />
      <NoiseOverlay />

      {/* FAST LOADING AMBIENT LIGHT */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute w-[800px] h-[800px] bg-emerald-500/[0.03] blur-[200px] rounded-full"
          animate={{ x: mousePos.x - 400, y: mousePos.y - 400 }}
          transition={{ type: "spring", damping: 100, stiffness: 20 }}
        />
      </div>

      <div className="relative z-10 max-w-[1700px] mx-auto px-8 lg:px-16 py-16 lg:py-24">

        {/* HEADER: Geometric Perfection */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-24"
        >
          <div className="flex items-center gap-10 lg:gap-14">
            <button
              onClick={() => onBack ? onBack() : window.history.back()}
              className="group relative w-16 h-16 flex items-center justify-center rounded-2xl bg-zinc-950 border border-white/5 hover:border-emerald-500/40 transition-all shadow-xl"
            >
              <ArrowLeft size={24} className="text-white/20 group-hover:text-emerald-400 group-hover:-translate-x-1 transition-all" />
            </button>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-6">
                <h1 className="text-7xl lg:text-[9rem] font-black text-white tracking-[-0.08em] uppercase italic leading-none">
                  SETTING
                </h1>
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl hidden xl:block">
                  <SettingsIcon size={28} className="text-emerald-400 animate-spin-slow" />
                </div>
              </div>
              
              {/* Calligraphy Username & Role */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 mt-4 ml-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-1">Identity_Persona</span>
                  <span className="text-5xl lg:text-7xl font-signature text-white italic drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {fullName || user.profile?.full_name || 'Anonymous'}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">System_Privilege</span>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                        {String(user.profile?.user_type || 'student').replace(/_/g, ' ')}
                      </span>
                    </div>
                    {/* A+ Class Badge */}
                    <div className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 border border-white/10 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                      <span className="text-xs font-black text-white uppercase tracking-widest italic">A+ CLASS PROTOCOL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STATUS CONSOLE: Aligned Pill */}
          <div className="flex items-center gap-4 p-3 bg-zinc-950/40 border border-white/5 rounded-full backdrop-blur-3xl shadow-2xl">
            <div className="flex items-center gap-6 px-10 py-3 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <Cpu size={20} className="text-emerald-400" />
              <span className="text-[11px] font-black text-white/60 tracking-widest uppercase leading-none">Nexus_Active</span>
            </div>
          </div>
        </motion.header>

        {/* CONTENT GRID: Mathematical Balance */}
        <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-20 lg:gap-32 items-start">

          {/* LEFT: ID Component */}
          <div className="flex flex-col gap-16 xl:sticky xl:top-12">
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
              <h3 className="text-[11px] font-black uppercase tracking-[0.8em] text-white/20">Settings</h3>
              <Activity size={20} className="text-emerald-500/40" />
            </div>

            <div className="grid gap-12">
              {[
                { Component: SecuritySection, props: { newPassword, setNewPassword, confirmPassword, setConfirmPassword, showPassword, setShowPassword, isSubmitting: isSubmittingPassword, onSubmit: handlePasswordUpdate, lastSignIn: user.last_sign_in_at } },
                { Component: Passkeys, props: { userId: user.id, userEmail: user.email, fullName: user.profile?.full_name || '' } },
                { Component: SecurityAdvisor, props: { userId: user.id, userEmail: user.email, passkeyCount: clerkPasskeyCount, hasFullName: !!(user.profile?.full_name && user.profile.full_name.trim()) } },
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