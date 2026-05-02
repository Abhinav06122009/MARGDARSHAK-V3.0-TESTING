import React, { useState, useEffect, useMemo } from 'react';
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
      accent: '#FFD700',
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
      accent: '#E5E4E2',
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
      accent: '#00F5FF',
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

  // Mouse tilt effect - Using numbers instead of strings for safety
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect) return;
      const xPct = (e.clientX - rect.left) / rect.width - 0.5;
      const yPct = (e.clientY - rect.top) / rect.height - 0.5;
      x.set(xPct);
      y.set(yPct);
    } catch (err) {
      console.error('Mouse move error:', err);
    }
  };

  const userTier = useMemo(() => {
    try {
      if (!clerkUser) return TIER_CONFIG.STANDARD;
      const metadata = (clerkUser.publicMetadata as any) || {};
      const role = (metadata.role || '').toLowerCase();
      const tier = (metadata.subscription_tier || metadata.tier || '').toLowerCase();

      if (role === 'superadmin' || role === 'owner') return TIER_CONFIG.SUPREME_ADMIN;
      if (role === 'admin') return TIER_CONFIG.ADMIN;
      if (tier === 'premium_elite') return TIER_CONFIG.PREMIUM_ELITE;
      if (tier === 'premium' || metadata.hasPremiumAccess) return TIER_CONFIG.PREMIUM;
      return TIER_CONFIG.STANDARD;
    } catch (err) {
      return TIER_CONFIG.STANDARD;
    }
  }, [clerkUser]);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      const hasShown = sessionStorage.getItem('rank_entry_shown_v4');
      if (!hasShown) {
        setShow(true);
        sessionStorage.setItem('rank_entry_shown_v4', 'true');
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

  // Destructure Icon to avoid lowercase tag issue
  const TierIcon = userTier.icon || Shield;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/95 backdrop-blur-3xl overflow-hidden"
          onMouseMove={handleMouseMove}
        >
          {/* Ambient Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay" />
            <motion.div
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[120px]"
              style={{ background: `radial-gradient(circle, ${userTier.style.accent}33 0%, transparent 70%)` }}
            />
          </div>

          <motion.div
            style={{ rotateX, rotateY, perspective: 1200 }}
            className="relative"
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              className={`relative p-1 rounded-[3rem] ${userTier.style.border} bg-zinc-900/40 backdrop-blur-3xl shadow-2xl overflow-hidden`}
            >
              <div className={`relative px-12 py-16 rounded-[2.9rem] ${userTier.theme} flex flex-col items-center text-center space-y-8 border border-white/5`}>
                
                {/* Icon Section */}
                <div className="relative">
                  <div className="absolute inset-0 blur-[40px] opacity-30" style={{ backgroundColor: userTier.style.accent }} />
                  <motion.div
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="relative z-10 w-24 h-24 flex items-center justify-center"
                  >
                    <Hexagon className="absolute inset-0 w-full h-full opacity-10 text-white" />
                    <TierIcon className="w-12 h-12" style={{ color: userTier.style.accent }} />
                  </motion.div>
                </div>

                {/* Identity Text */}
                <div className="space-y-4">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em]">S_CLR_ID_00X</span>
                    <div className="w-20 h-px bg-zinc-800 mt-2" />
                  </div>

                  <div className="space-y-1">
                    <h2 className={`text-6xl font-black italic uppercase tracking-tighter bg-gradient-to-b ${userTier.style.gradient} bg-clip-text text-transparent`}>
                      {userTier.rank} CLASS
                    </h2>
                    <h3 className={`text-xs font-black tracking-[0.2em] uppercase ${userTier.style.text}`}>
                      {userTier.title}
                    </h3>
                  </div>

                  <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase border border-white/5 px-4 py-1.5 rounded-full">
                    {userTier.designation}
                  </p>
                </div>

                {/* Status Bar */}
                <div className="w-full h-1 bg-zinc-800/50 rounded-full overflow-hidden mt-4">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 4.8, ease: "linear" }}
                    className="h-full"
                    style={{ backgroundColor: userTier.style.accent }}
                  />
                </div>

                {/* Footnotes */}
                <div className="flex gap-4 opacity-30">
                  <Globe size={12} />
                  <ShieldCheck size={12} />
                  <Cpu size={12} />
                </div>
              </div>
            </motion.div>

            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 text-center"
            >
              <h4 className="text-2xl font-black text-white italic uppercase tracking-tight">
                WELCOME, {clerkUser?.firstName || clerkUser?.username || 'AGENT'}
              </h4>
              <div className="flex items-center justify-center gap-3 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-2">
                 <Loader2 className="w-3 h-3 animate-spin" />
                 <span>Analyzing Neural Patterns</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Scanning Line */}
          <motion.div
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-px bg-white/10 pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankEntryOverlay;
