import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShieldCheck, Star, Activity, Cpu, Hexagon, X, Zap, Shield, Award, BrainCircuit, Globe, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/react';
import { useToast } from '@/hooks/use-toast';

const TIER_CONFIG = {
  SUPREME_ADMIN: {
    rank: 'S+',
    title: 'UNIVERSAL ARCHITECT',
    designation: 'SYSTEM OWNER & COMMANDER',
    icon: ShieldCheck,
    theme: 'bg-[#000000]',
    style: {
      accent: '#FFD700', // Gold
      glow: 'rgba(255, 215, 0, 0.4)',
      border: 'border-yellow-500/40',
      gradient: 'from-yellow-200 via-yellow-500 to-amber-700',
      text: 'text-yellow-400',
      particles: 'bg-yellow-400'
    }
  },
  ADMIN: {
    rank: 'A+',
    title: 'COMMAND OVERSEER',
    designation: 'EXECUTIVE ADMINISTRATOR',
    icon: Shield,
    theme: 'bg-[#050505]',
    style: {
      accent: '#E5E4E2', // Rhodium/Platinum
      glow: 'rgba(229, 228, 226, 0.3)',
      border: 'border-zinc-500/30',
      gradient: 'from-zinc-100 via-zinc-400 to-zinc-600',
      text: 'text-zinc-200',
      particles: 'bg-white'
    }
  },
  PREMIUM_ELITE: {
    rank: 'A',
    title: 'ELITE OPERATIVE',
    designation: 'PREMIUM ELITE MEMBER',
    icon: Award,
    theme: 'bg-zinc-950',
    style: {
      accent: '#00F5FF', // Neon Cyan
      glow: 'rgba(0, 245, 255, 0.3)',
      border: 'border-cyan-500/30',
      gradient: 'from-cyan-200 via-cyan-400 to-blue-600',
      text: 'text-cyan-400',
      particles: 'bg-cyan-400'
    }
  },
  PREMIUM: {
    rank: 'B',
    title: 'TACTICAL UNIT',
    designation: 'PREMIUM MEMBER',
    icon: Zap,
    theme: 'bg-zinc-950',
    style: {
      accent: '#f59e0b', // Amber
      glow: 'rgba(245, 158, 11, 0.2)',
      border: 'border-amber-500/30',
      gradient: 'from-amber-300 via-amber-500 to-orange-600',
      text: 'text-amber-500',
      particles: 'bg-amber-500'
    }
  },
  STANDARD: {
    rank: 'C',
    title: 'ACADEMIC CORE',
    designation: 'STANDARD MEMBER',
    icon: BrainCircuit,
    theme: 'bg-zinc-950',
    style: {
      accent: '#6366f1', // Indigo
      glow: 'rgba(99, 102, 241, 0.2)',
      border: 'border-indigo-500/30',
      gradient: 'from-indigo-400 via-purple-500 to-pink-600',
      text: 'text-indigo-400',
      particles: 'bg-indigo-500'
    }
  }
};

const RankEntryOverlay = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const [show, setShow] = useState(false);
  const { toast } = useToast();

  // Mouse tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const userTier = useMemo(() => {
    if (!clerkUser) return TIER_CONFIG.STANDARD;
    const metadata = clerkUser.publicMetadata as any;
    const role = metadata.role?.toLowerCase() || '';
    const tier = metadata.subscription_tier?.toLowerCase() || '';

    if (role === 'superadmin' || role === 'owner') return TIER_CONFIG.SUPREME_ADMIN;
    if (role === 'admin') return TIER_CONFIG.ADMIN;
    if (tier === 'premium_elite') return TIER_CONFIG.PREMIUM_ELITE;
    if (tier === 'premium' || metadata.hasPremiumAccess) return TIER_CONFIG.PREMIUM;
    return TIER_CONFIG.STANDARD;
  }, [clerkUser]);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      const hasShown = sessionStorage.getItem('rank_entry_shown_v3');
      if (!hasShown) {
        setShow(true);
        sessionStorage.setItem('rank_entry_shown_v3', 'true');
        const timer = setTimeout(() => {
          setShow(false);
          toast({
            title: "Access Granted",
            description: `Welcome back, ${userTier.title}.`,
          });
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoaded, clerkUser, userTier, toast]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/98 backdrop-blur-3xl overflow-hidden cursor-none"
          onMouseMove={handleMouseMove}
        >
          {/* ── Background Architecture ── */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Ambient Pulse */}
            <motion.div 
              animate={{ 
                opacity: [0.05, 0.15, 0.05],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute inset-0 bg-noise opacity-10"
            />
            
            {/* Dynamic Glow */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full"
              style={{ background: `radial-gradient(circle, ${userTier.style.accent}22 0%, transparent 70%)` }}
            />

            {/* Matrix Scanlines */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, transparent 1px, transparent 3px)', backgroundSize: '100% 4px' }} />
          </div>

          {/* ── Identity Card Container ── */}
          <motion.div
            style={{ rotateX, rotateY, perspective: 1000 }}
            className="relative flex flex-col items-center"
          >
            {/* Main Holographic Card */}
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className={`relative p-1 rounded-[3.5rem] ${userTier.style.border} bg-zinc-900/40 backdrop-blur-3xl shadow-2xl overflow-hidden group`}
            >
              {/* Card Inner Texture */}
              <div className="absolute inset-0 bg-noise opacity-[0.05] pointer-events-none" />
              
              <div className={`relative px-12 py-16 rounded-[3.4rem] ${userTier.theme} flex flex-col items-center text-center space-y-8 border border-white/5`}>
                
                {/* Ranking Icon Header */}
                <div className="relative">
                  <div 
                    className="absolute inset-0 blur-[60px] opacity-40 scale-150"
                    style={{ backgroundColor: userTier.style.accent }}
                  />
                  <motion.div
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="relative z-10 w-32 h-32 flex items-center justify-center"
                  >
                    <Hexagon className="absolute inset-0 w-full h-full opacity-20 text-white" />
                    <userTier.icon className="w-16 h-16" style={{ color: userTier.style.accent }} />
                  </motion.div>
                </div>

                {/* Identity Metadata */}
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] italic">System Clearance Identified</span>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: 120 }}
                      className="h-[2px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <h2 className={`text-7xl font-black italic uppercase tracking-tighter bg-gradient-to-b ${userTier.style.gradient} bg-clip-text text-transparent`}>
                      {userTier.rank} CLASS
                    </h2>
                    <h3 className={`text-sm font-black tracking-[0.3em] uppercase ${userTier.style.text}`}>
                      {userTier.title}
                    </h3>
                  </div>

                  <p className="text-zinc-500 text-[11px] font-bold tracking-[0.1em] uppercase bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                    {userTier.designation}
                  </p>
                </div>

                {/* Verification Status */}
                <div className="flex items-center gap-6 pt-4">
                   <div className="flex flex-col items-center">
                     <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Encrypted</span>
                     <Globe className="w-4 h-4 text-zinc-700" />
                   </div>
                   <div className="h-8 w-px bg-zinc-800" />
                   <div className="flex flex-col items-center">
                     <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Verified</span>
                     <ShieldCheck className="w-4 h-4 text-zinc-700" />
                   </div>
                   <div className="h-8 w-px bg-zinc-800" />
                   <div className="flex flex-col items-center">
                     <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Neural</span>
                     <BrainCircuit className="w-4 h-4 text-zinc-700" />
                   </div>
                </div>

                {/* Loading Progress Bar */}
                <div className="w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden mt-4">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 4.5, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    style={{ backgroundColor: userTier.style.accent }}
                  />
                </div>
              </div>

              {/* Holographic Glare */}
              <motion.div
                className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-br from-white/20 via-transparent to-transparent"
                animate={{ 
                  backgroundPosition: ["0% 0%", "100% 100%"]
                }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
              />
            </motion.div>

            {/* Greeting Undertext */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="mt-12 text-center"
            >
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tight mb-3">
                WELCOME, {clerkUser?.firstName || clerkUser?.username || 'AGENT'}
              </h1>
              <div className="flex items-center justify-center gap-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                 <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Analyzing Patterns</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                 <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> Core Secured</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Scanning Line ── */}
          <motion.div
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-px bg-white/20 z-[100001] pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.5)]"
          />

          {/* ── HUD Corner Elements ── */}
          <div className="absolute inset-0 p-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-24 h-24 border-t border-l border-white/10 rounded-tl-[3rem]" />
            <div className="absolute top-10 right-10 w-24 h-24 border-t border-r border-white/10 rounded-tr-[3rem]" />
            <div className="absolute bottom-10 left-10 w-24 h-24 border-b border-l border-white/10 rounded-bl-[3rem]" />
            <div className="absolute bottom-10 right-10 w-24 h-24 border-b border-r border-white/10 rounded-br-[3rem]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankEntryOverlay;
