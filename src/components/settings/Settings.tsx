import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings as SettingsIcon, ShieldCheck, Zap, Globe, Cpu, Radio, Target, Activity } from 'lucide-react';

// Hooks & Components
import { useSettings } from '@/hooks/useSettings';
import SecuritySection from './SecuritySection';
import AccessibilitySection from './AccessibilitySection';
import SettingsFooter from './SettingsFooter';
import Passkeys from "@/components/settings/Passkeys";
import SecurityAdvisor from "@/components/settings/SecurityAdvisor";
import PremiumIDCard from './PremiumIDCard';

// Particle Engine for "Max" UI
const ParticleBackground = () => {
  const particles = useMemo(() => {
    return [...Array(30)].map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 10
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: "100%" }}
          animate={{ 
            opacity: [0, 0.5, 0],
            y: ["110%", "-10%"],
            x: [`${p.x}%`, `${p.x + (Math.random() * 10 - 5)}%`]
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            delay: p.delay,
            ease: "linear" 
          }}
          className="absolute rounded-full bg-emerald-500/20 blur-[1px]"
          style={{ 
            width: p.size, 
            height: p.size,
            left: `${p.x}%`
          }}
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
        <div className="relative">
           <div className="absolute -inset-20 bg-emerald-500/10 blur-[100px] rounded-full animate-pulse" />
           <div className="flex flex-col items-center gap-8 relative">
             <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-emerald-500/5 rounded-full" />
                <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-4 border-2 border-purple-500/20 border-b-transparent rounded-full animate-reverse-spin" />
             </div>
             <div className="flex flex-col items-center gap-3">
                <h2 className="text-white font-black uppercase tracking-[1em] text-[10px] animate-pulse">Initializing Nexus</h2>
                <div className="flex gap-1">
                   {[...Array(3)].map((_, i) => (
                     <motion.div 
                       key={i}
                       animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                       transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                       className="w-1.5 h-1.5 bg-emerald-500 rounded-full" 
                     />
                   ))}
                </div>
             </div>
           </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#010101] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full p-12 bg-zinc-900/40 border border-white/5 rounded-[4rem] backdrop-blur-3xl text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-20" />
          <ShieldCheck size={64} className="text-red-500/40 mx-auto mb-8 animate-pulse" />
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-4 italic">Protocol Failure</h2>
          <p className="text-white/30 leading-relaxed mb-10 font-medium">The secure handshake between your local node and the Margdarshak cloud was severed. Re-authorization required.</p>
          <button 
            onClick={() => window.location.reload()}
            className="group relative w-full py-5 bg-white text-black font-black uppercase tracking-[0.3em] rounded-3xl overflow-hidden active:scale-95 transition-all"
          >
            <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10">Re-Connect Node</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010101] text-gray-300 selection:bg-emerald-500/30 overflow-x-hidden">
      {/* EXTREME AMBIENCE ENGINE */}
      <ParticleBackground />
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-emerald-500/[0.03] blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1.1, 1, 1.1],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-purple-500/[0.03] blur-[150px] rounded-full" 
        />
        
        {/* Mouse Follow Light */}
        <motion.div 
           className="absolute w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full"
           animate={{ 
              x: mousePos.x - 300,
              y: mousePos.y - 300,
           }}
           transition={{ type: "spring", damping: 30, stiffness: 50 }}
        />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-8 lg:px-16 py-16 lg:py-24">
        {/* EXTREME HEADER ARCHITECTURE */}
        <motion.header
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-16 mb-24"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-12">
            <button
              onClick={() => onBack ? onBack() : window.history.back()}
              className="group relative w-20 h-20 flex items-center justify-center rounded-[2.5rem] bg-zinc-950 border border-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all duration-500 active:scale-90"
            >
              <ArrowLeft size={28} className="text-white group-hover:text-emerald-400 transition-all duration-500 group-hover:-translate-x-1" />
              <div className="absolute inset-0 rounded-[2.5rem] border border-emerald-500/0 group-hover:border-emerald-500/20 transition-all scale-110 group-hover:scale-100" />
            </button>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-6 mb-4">
                 <div className="p-4 bg-emerald-500/10 rounded-2xl relative overflow-hidden group/icon">
                    <SettingsIcon size={24} className="text-emerald-400 animate-spin-slow group-hover/icon:animate-spin transition-all" />
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                 </div>
                 <h1 className="text-6xl md:text-8xl font-black text-white tracking-[-0.08em] uppercase italic leading-none group cursor-default">
                    <span className="inline-block group-hover:animate-glitch">N</span>
                    <span className="inline-block group-hover:animate-glitch delay-75">E</span>
                    <span className="inline-block group-hover:animate-glitch delay-150">X</span>
                    <span className="inline-block group-hover:animate-glitch delay-225">U</span>
                    <span className="inline-block group-hover:animate-glitch delay-300">S</span>
                 </h1>
              </div>
              <div className="flex items-center gap-4 ml-1">
                 <span className="h-px w-12 bg-emerald-500" />
                 <p className="text-white/40 font-black uppercase tracking-[0.6em] text-[10px]">Universal Identity Hub & Core Configuration</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-zinc-950/40 border border-white/5 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-purple-500/5" />
             <div className="flex items-center gap-4 px-8 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-[1.75rem] shadow-inner relative group/status">
                <Cpu size={18} className="text-emerald-400 animate-pulse" />
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Node Status</span>
                   <span className="text-[9px] font-bold text-emerald-400/50 uppercase tracking-tighter mt-1 italic">Optimized Sync</span>
                </div>
                <div className="absolute inset-0 bg-emerald-400/5 blur-xl opacity-0 group-hover/status:opacity-100 transition-opacity" />
             </div>
             <div className="flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/5 rounded-[1.75rem] relative group/net">
                <Radio size={18} className="text-white/40" />
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Security Level</span>
                   <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter mt-1">Alpha-Tier 7</span>
                </div>
             </div>
          </div>
        </motion.header>

        {/* EXTREME CONTENT GRID ARCHITECTURE */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Left Column: The Star (Identity) */}
          <div className="xl:col-span-5 2xl:col-span-4 space-y-16">
             <div className="sticky top-24">
                <div className="mb-10 flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center">
                         <Target size={20} className="text-emerald-400 animate-pulse" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.6em] text-white/40 group-hover:text-emerald-400 transition-colors">
                        Scholar Matrix
                      </h3>
                   </div>
                   <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-8 group-hover:from-emerald-500/20 transition-all" />
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
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-16 p-10 bg-zinc-950 border border-white/10 rounded-[4rem] backdrop-blur-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-700 shadow-2xl"
                >
                   <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-[0.08] transition-all duration-1000 rotate-12 group-hover:rotate-0 scale-150">
                      <ShieldCheck size={200} />
                   </div>
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                         <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Encrypted Storage</span>
                      </div>
                      <h4 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase italic">Bio-Metric Integrity</h4>
                      <p className="text-sm text-white/30 leading-relaxed font-medium">Your identity signature is wrapped in a multi-layered cryptographic shell. Each modification triggers a network-wide recalculation of your unique scholar hash, ensuring absolute data permanence.</p>
                   </div>
                   <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0" />
                </motion.div>
             </div>
          </div>

          {/* Right Column: The Core (Modules) */}
          <div className="xl:col-span-7 2xl:col-span-8 space-y-20">
            <div className="flex items-center justify-between mb-12 group">
               <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent mr-8 group-hover:from-emerald-500/20 transition-all" />
               <h3 className="text-xs font-black uppercase tracking-[0.6em] text-white/40 group-hover:text-emerald-400 transition-colors flex items-center gap-4">
                  Nexus Command Modules <Activity size={14} className="text-emerald-500/40" />
               </h3>
            </div>

            <div className="grid grid-cols-1 gap-12">
               {/* Modules with Staggered Animation */}
               {[
                 { Component: SecuritySection, props: { newPassword, setNewPassword, confirmPassword, setConfirmPassword, showPassword, setShowPassword, isSubmitting: isSubmittingPassword, onSubmit: handlePasswordUpdate, lastSignIn: user.last_sign_in_at }, delay: 0 },
                 { Component: Passkeys, props: { userId: user.id, userEmail: user.email, fullName: user.profile?.full_name || '' }, delay: 0.1 },
                 { Component: SecurityAdvisor, props: { userId: user.id, userEmail: user.email, passkeyCount, hasFullName: !!(user.profile?.full_name && user.profile.full_name.trim()) }, delay: 0.2 },
                 { Component: AccessibilitySection, props: { dyslexiaMode, setDyslexiaMode }, delay: 0.3 }
               ].map(({ Component, props, delay }, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, x: 100, filter: "blur(10px)" }}
                   whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                   viewport={{ once: true, margin: "-100px" }}
                   transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
                   className="relative"
                 >
                    {/* Module Connector Visual */}
                    <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-8 h-px bg-white/5 group-hover:bg-emerald-500/20 transition-colors hidden xl:block" />
                    <Component {...props} />
                 </motion.div>
               ))}
            </div>
          </div>
        </div>

        <div className="mt-48 pt-16 border-t border-white/5 relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
           <SettingsFooter />
        </div>
      </div>
    </div>
  );
};

export default Settings;