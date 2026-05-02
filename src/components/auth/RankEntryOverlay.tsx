import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShieldCheck, Star, Activity, Cpu, Hexagon, X, Zap, Shield, Award, BrainCircuit, Globe, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/react';
import { useToast } from '@/hooks/use-toast';

const TIER_CONFIG = {
  GOLD: {
    rank: 'S+',
    title: 'IMPERIAL GOLD',
    designation: 'SYSTEM SOVEREIGN',
    icon: ShieldCheck,
    theme: 'bg-[#0a0a0a]',
    style: {
      accent: '#FFD700', // Gold
      glow: 'rgba(255, 215, 0, 0.5)',
      border: 'border-yellow-500/50',
      gradient: 'from-[#ffe566] via-[#ffaa00] to-[#7a4e00]',
      text: 'text-yellow-500',
      particles: 'bg-yellow-400'
    }
  },
  RHODIUM: {
    rank: 'A+',
    title: 'RHODIUM ZENITH',
    designation: 'MULTI-CORE COMMANDER',
    icon: Shield,
    theme: 'bg-[#050505]',
    style: {
      accent: '#F0F0F0', // Rhodium
      glow: 'rgba(255, 255, 255, 0.4)',
      border: 'border-white/40',
      gradient: 'from-[#ffffff] via-[#c8c8c8] to-[#8a8a8a]',
      text: 'text-white',
      particles: 'bg-white'
    }
  },
  PLATINUM: {
    rank: 'A-',
    title: 'PLATINUM EXECUTIVE',
    designation: 'CHIEF ADMINISTRATOR',
    icon: Award,
    theme: 'bg-[#080808]',
    style: {
      accent: '#B0D8FF', // Platinum
      glow: 'rgba(100, 180, 255, 0.4)',
      border: 'border-blue-400/30',
      gradient: 'from-[#e8e8ff] via-[#a0c8ff] to-[#4488dd]',
      text: 'text-blue-300',
      particles: 'bg-blue-300'
    }
  },
  PREMIUM: {
    rank: 'B',
    title: 'ELITE SCHOLAR',
    designation: 'PREMIUM ACCESS MEMBER',
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

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 200, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 200, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const xPct = (e.clientX - rect.left) / rect.width - 0.5;
      const yPct = (e.clientY - rect.top) / rect.height - 0.5;
      x.set(xPct);
      y.set(yPct);
    } catch (err) {}
  };

  const userTier = useMemo(() => {
    try {
      if (!clerkUser) return TIER_CONFIG.STANDARD;
      const metadata = (clerkUser.publicMetadata as any) || {};
      const role = (metadata.role || '').toLowerCase();
      const tier = (metadata.subscription_tier || metadata.tier || '').toLowerCase();
      const userType = (metadata.user_type || '').toLowerCase();

      // GOLD Tier Logic (Owner/SuperAdmin)
      if (role === 'owner' || role === 'superadmin') return TIER_CONFIG.GOLD;
      
      // RHODIUM Tier Logic (Multi-role detection)
      if (role === 'admin' && (tier === 'premium_elite' || userType === 'staff')) return TIER_CONFIG.RHODIUM;
      
      // PLATINUM Tier Logic (Admin/Executive)
      if (role === 'admin' || userType === 'manager' || userType === 'executive') return TIER_CONFIG.PLATINUM;
      
      // PREMIUM Tier Logic
      if (tier === 'premium_elite' || tier === 'premium' || metadata.hasPremiumAccess) return TIER_CONFIG.PREMIUM;
      
      return TIER_CONFIG.STANDARD;
    } catch (err) {
      return TIER_CONFIG.STANDARD;
    }
  }, [clerkUser]);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      const hasShown = sessionStorage.getItem('rank_entry_shown_v5');
      if (!hasShown) {
        setShow(true);
        sessionStorage.setItem('rank_entry_shown_v5', 'true');
        const timer = setTimeout(() => {
          setShow(false);
          toast({
            title: "Security Clearance Verified",
            description: `Tier: ${userTier.title} - Welcome, Agent ${clerkUser.firstName || 'Unknown'}.`,
          });
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoaded, clerkUser, userTier, toast]);

  if (!show) return null;

  const TierIcon = userTier.icon || Shield;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/98 backdrop-blur-3xl overflow-hidden"
          onMouseMove={handleMouseMove}
        >
          {/* Animated Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-noise opacity-10" />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full blur-[100px]"
              style={{ background: `radial-gradient(circle, ${userTier.style.accent}22 0%, transparent 70%)` }}
            />
            {/* HUD Scanline */}
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, transparent 1px, transparent 4px)', backgroundSize: '100% 4px' }} />
          </div>

          <motion.div
            style={{ rotateX, rotateY, perspective: 1200 }}
            className="relative"
          >
            {/* The High-Fidelity Holographic Card */}
            <motion.div
              initial={{ y: 80, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              className={`relative p-[1.5px] rounded-[3.5rem] bg-gradient-to-br ${userTier.style.gradient} shadow-2xl overflow-hidden`}
            >
              <div className={`relative px-14 py-20 rounded-[3.4rem] ${userTier.theme} flex flex-col items-center text-center space-y-10 border border-white/10 backdrop-blur-4xl`}>
                
                {/* 3D Holographic Icon Unit */}
                <div className="relative group">
                  <div className="absolute inset-0 blur-[60px] opacity-40 scale-150 transition-all group-hover:opacity-60" style={{ backgroundColor: userTier.style.accent }} />
                  <motion.div
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="relative z-10 w-32 h-32 flex items-center justify-center"
                  >
                    <Hexagon className="absolute inset-0 w-full h-full opacity-10 text-white" />
                    <TierIcon className="w-16 h-16" style={{ color: userTier.style.accent, filter: `drop-shadow(0 0 15px ${userTier.style.accent}88)` }} />
                  </motion.div>
                </div>

                {/* Rank & Title Cluster */}
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.6em] italic">Authentication Complete</span>
                    <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                  </div>

                  <div className="space-y-1">
                    <motion.h2 
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`text-7xl font-black italic uppercase tracking-tighter bg-gradient-to-b ${userTier.style.gradient} bg-clip-text text-transparent drop-shadow-2xl`}
                    >
                      {userTier.rank} CLASS
                    </motion.h2>
                    <h3 className={`text-sm font-black tracking-[0.4em] uppercase ${userTier.style.text} opacity-80`}>
                      {userTier.title}
                    </h3>
                  </div>

                  <p className="text-zinc-400 text-[11px] font-black tracking-[0.2em] uppercase bg-white/5 px-6 py-2.5 rounded-2xl border border-white/5 backdrop-blur-md">
                    {userTier.designation}
                  </p>
                </div>

                {/* Progress Loading HUD */}
                <div className="w-full space-y-3">
                   <div className="flex justify-between text-[8px] font-bold text-zinc-600 uppercase tracking-widest px-1">
                      <span>Neural Link</span>
                      <span>Secure</span>
                   </div>
                   <div className="w-full h-1.5 bg-zinc-900/50 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "0%" }}
                      transition={{ duration: 4.5, ease: "linear" }}
                      className="h-full relative"
                      style={{ backgroundColor: userTier.style.accent }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </motion.div>
                  </div>
                </div>

                {/* Verification Modules */}
                <div className="flex items-center gap-8 pt-2">
                   <div className="flex flex-col items-center gap-1.5 group cursor-help">
                      <Globe size={14} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                      <span className="text-[7px] font-bold text-zinc-800 uppercase tracking-tighter">Encrypted</span>
                   </div>
                   <div className="h-6 w-px bg-zinc-800/50" />
                   <div className="flex flex-col items-center gap-1.5 group cursor-help">
                      <ShieldCheck size={14} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                      <span className="text-[7px] font-bold text-zinc-800 uppercase tracking-tighter">Verified</span>
                   </div>
                   <div className="h-6 w-px bg-zinc-800/50" />
                   <div className="flex flex-col items-center gap-1.5 group cursor-help">
                      <Cpu size={14} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                      <span className="text-[7px] font-bold text-zinc-800 uppercase tracking-tighter">Neural</span>
                   </div>
                </div>
              </div>

              {/* Holographic Reflection Layer */}
              <motion.div 
                animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute inset-0 pointer-events-none opacity-[0.08] bg-gradient-to-br from-white via-transparent to-white/20"
                style={{ backgroundSize: '200% 200%' }}
              />
            </motion.div>

            {/* Personalized Welcome Unit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-12 text-center"
            >
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tight drop-shadow-xl">
                WELCOME, {clerkUser?.firstName || clerkUser?.username || 'AGENT'}
              </h1>
              <div className="flex items-center justify-center gap-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] mt-3">
                 <div className="flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin text-zinc-500" />
                    <span>Synchronizing Protocol</span>
                 </div>
                 <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                 <span>Secure Access Point</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Environmental Scanning Line */}
          <motion.div
            animate={{ top: ["-5%", "105%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-[100001] pointer-events-none shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          />

          {/* HUD Brackets */}
          <div className="absolute inset-0 p-12 pointer-events-none">
            <div className="absolute top-12 left-12 w-32 h-32 border-t-2 border-l-2 border-white/5 rounded-tl-[4rem]" />
            <div className="absolute top-12 right-12 w-32 h-32 border-t-2 border-r-2 border-white/5 rounded-tr-[4rem]" />
            <div className="absolute bottom-12 left-12 w-32 h-32 border-b-2 border-l-2 border-white/5 rounded-bl-[4rem]" />
            <div className="absolute bottom-12 right-12 w-32 h-32 border-b-2 border-r-2 border-white/5 rounded-br-[4rem]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankEntryOverlay;
