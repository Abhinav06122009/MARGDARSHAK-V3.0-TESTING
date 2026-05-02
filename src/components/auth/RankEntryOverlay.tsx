import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShieldCheck, Star, Activity, Cpu, Hexagon, X, Zap, Shield, Award, BrainCircuit, Globe, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/react';
import { useToast } from '@/hooks/use-toast';

const TIER_CONFIG = {
  GOLD: {
    rank: 'S+',
    title: 'GOLD SOVEREIGN',
    designation: 'SYSTEM OWNER & ARCHITECT',
    icon: ShieldCheck,
    theme: 'bg-black',
    style: {
      accent: '#FFD700',
      glow: 'rgba(255, 215, 0, 0.4)',
      border: 'border-yellow-500/40',
      gradient: 'from-yellow-200 via-yellow-500 to-amber-700',
      text: 'text-yellow-400',
      particles: 'bg-yellow-400'
    }
  },
  RHODIUM: {
    rank: 'A+',
    title: 'RHODIUM ZENITH',
    designation: 'EXECUTIVE ADMINISTRATOR',
    icon: Shield,
    theme: 'bg-zinc-950',
    style: {
      accent: '#E5E4E2',
      glow: 'rgba(229, 228, 226, 0.3)',
      border: 'border-zinc-500/30',
      gradient: 'from-zinc-100 via-zinc-400 to-zinc-600',
      text: 'text-zinc-200',
      particles: 'bg-white'
    }
  },
  PLATINUM: {
    rank: 'A',
    title: 'PLATINUM ELITE',
    designation: 'PREMIUM ELITE MEMBER',
    icon: Award,
    theme: 'bg-zinc-950',
    style: {
      accent: '#00F5FF', // Cyan-Platinum
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
      accent: '#f59e0b',
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
      accent: '#6366f1',
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

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const userTier = useMemo(() => {
    if (!clerkUser) return TIER_CONFIG.STANDARD;
    const metadata = (clerkUser.publicMetadata as any) || {};
    
    // Direct mapping to strings for absolute reliability
    const role = String(metadata.role || '').toLowerCase();
    const tier = String(metadata.subscription_tier || metadata.tier || '').toLowerCase();

    if (role === 'owner' || role === 'superadmin') return TIER_CONFIG.GOLD;
    if (role === 'admin') return TIER_CONFIG.RHODIUM;
    if (tier === 'premium_elite' || role === 'elite') return TIER_CONFIG.PLATINUM;
    if (tier === 'premium' || metadata.hasPremiumAccess) return TIER_CONFIG.PREMIUM;
    
    return TIER_CONFIG.STANDARD;
  }, [clerkUser]);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      const hasShown = sessionStorage.getItem('rank_entry_shown_vFINAL');
      if (!hasShown) {
        setShow(true);
        sessionStorage.setItem('rank_entry_shown_vFINAL', 'true');
        const timer = setTimeout(() => {
          setShow(false);
          toast({
            title: "Clearance Granted",
            description: `Identification: ${userTier.title}.`,
          });
        }, 5500);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoaded, clerkUser, userTier, toast]);

  if (!show) return null;

  const Icon = userTier.icon || Shield;

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
          {/* Ambient Background layer */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-noise opacity-10" />
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full"
              style={{ background: `radial-gradient(circle, ${userTier.style.accent}22 0%, transparent 70%)` }}
            />
            {/* Scanline pattern */}
            <div className="absolute inset-0 opacity-[0.03]" 
                 style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, transparent 1px, transparent 3px)', backgroundSize: '100% 4px' }} />
          </div>

          <motion.div
            style={{ rotateX, rotateY, perspective: 1000 }}
            className="relative"
          >
            {/* The Previous Card Layout - High Fidelity */}
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.85 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className={`relative p-[1px] rounded-[3.5rem] bg-gradient-to-br ${userTier.style.gradient} shadow-2xl overflow-hidden group`}
            >
              <div className={`relative px-12 py-16 rounded-[3.4rem] ${userTier.theme} flex flex-col items-center text-center space-y-10 border border-white/5`}>
                
                {/* 3D Icon Cluster */}
                <div className="relative">
                  <div className="absolute inset-0 blur-[60px] opacity-40 scale-150" style={{ backgroundColor: userTier.style.accent }} />
                  <motion.div
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="relative z-10 w-32 h-32 flex items-center justify-center"
                  >
                    <Hexagon className="absolute inset-0 w-full h-full opacity-10 text-white" />
                    <Icon className="w-16 h-16" style={{ color: userTier.style.accent }} />
                  </motion.div>
                </div>

                {/* Rank Branding */}
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] italic">System Clearance Identified</span>
                    <div className="w-24 h-[1px] bg-zinc-800" />
                  </div>

                  <div className="space-y-1">
                    <h2 className={`text-7xl font-black italic uppercase tracking-tighter bg-gradient-to-b ${userTier.style.gradient} bg-clip-text text-transparent`}>
                      {userTier.rank} CLASS
                    </h2>
                    <h3 className={`text-sm font-black tracking-[0.3em] uppercase ${userTier.style.text}`}>
                      {userTier.title}
                    </h3>
                  </div>

                  <p className="text-zinc-500 text-[11px] font-bold tracking-[0.1em] uppercase bg-white/5 px-6 py-2 rounded-xl border border-white/5">
                    {userTier.designation}
                  </p>
                </div>

                {/* Status HUD */}
                <div className="w-full space-y-3">
                   <div className="w-full h-1 bg-zinc-800/50 rounded-full overflow-hidden mt-4">
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "0%" }}
                      transition={{ duration: 5, ease: "linear" }}
                      className="h-full"
                      style={{ backgroundColor: userTier.style.accent }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">
                     <span>Neural Link</span>
                     <span>Verified</span>
                  </div>
                </div>

                {/* Modules */}
                <div className="flex items-center gap-8 pt-2">
                   <Globe size={14} className="text-zinc-800" />
                   <ShieldCheck size={14} className="text-zinc-800" />
                   <Cpu size={14} className="text-zinc-800" />
                </div>
              </div>

              {/* Reflection Layer */}
              <motion.div 
                animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute inset-0 pointer-events-none opacity-10 bg-gradient-to-br from-white via-transparent to-transparent"
              />
            </motion.div>

            {/* Welcome Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="mt-12 text-center"
            >
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
                WELCOME, {clerkUser?.firstName || clerkUser?.username || 'AGENT'}
              </h1>
              <div className="flex items-center justify-center gap-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-3">
                 <Loader2 size={12} className="animate-spin" />
                 <span>Synchronizing Identity</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Environmental Brackets */}
          <div className="absolute inset-0 p-12 pointer-events-none">
            <div className="absolute top-12 left-12 w-32 h-32 border-t border-l border-white/5 rounded-tl-[4rem]" />
            <div className="absolute top-12 right-12 w-32 h-32 border-t border-r border-white/5 rounded-tr-[4rem]" />
            <div className="absolute bottom-12 left-12 w-32 h-32 border-b border-l border-white/5 rounded-bl-[4rem]" />
            <div className="absolute bottom-12 right-12 w-32 h-32 border-b border-r border-white/5 rounded-br-[4rem]" />
          </div>

          {/* Scanning Line */}
          <motion.div
            animate={{ top: ["-5%", "105%", "-5%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-px bg-white/20 z-[100001] pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankEntryOverlay;
