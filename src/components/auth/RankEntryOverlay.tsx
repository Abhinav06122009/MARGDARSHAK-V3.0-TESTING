import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Star, Activity, Cpu, Hexagon, X } from 'lucide-react';
import { useUser } from '@clerk/react';
import { useToast } from '@/hooks/use-toast';

const TIER_CONFIG = {
  SUPREME: {
    tier: 'Premium Elite',
    icon: ShieldCheck,
    style: {
      accent: '#10b981', 
      glow: 'rgba(16,185,129,0.5)',
      border: 'border-emerald-500/30',
      shadow: 'shadow-[0_0_50px_rgba(16,185,129,0.2)]',
      gradient: 'from-emerald-400 to-teal-500'
    }
  },
  ADMIN: {
    tier: 'Administrator',
    icon: ShieldCheck,
    style: {
      accent: '#3b82f6',
      glow: 'rgba(59,130,246,0.5)',
      border: 'border-blue-500/30',
      shadow: 'shadow-[0_0_50px_rgba(59,130,246,0.2)]',
      gradient: 'from-blue-400 to-indigo-500'
    }
  },
  STANDARD: {
    tier: 'Standard',
    icon: Star,
    style: {
      accent: '#a855f7',
      glow: 'rgba(168,85,247,0.5)',
      border: 'border-purple-500/30',
      shadow: 'shadow-[0_0_50px_rgba(168,85,247,0.2)]',
      gradient: 'from-purple-400 to-pink-500'
    }
  }
};

const RankEntryOverlay = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isLoaded && clerkUser) {
      const hasSeenRank = sessionStorage.getItem('hasSeenRankEntry');
      if (!hasSeenRank) {
        setIsVisible(true);
        sessionStorage.setItem('hasSeenRankEntry', 'true');
      }
    }
  }, [isLoaded, clerkUser]);

  const userTier = useMemo(() => {
    if (!clerkUser) return TIER_CONFIG.STANDARD;
    const metadata = clerkUser.publicMetadata as any;
    if (metadata.role === 'admin' || metadata.role === 'superadmin') return TIER_CONFIG.ADMIN;
    if (metadata.hasPremiumAccess) return TIER_CONFIG.SUPREME;
    return TIER_CONFIG.STANDARD;
  }, [clerkUser]);

  const handleClose = () => {
    setIsVisible(false);
    toast({
      title: "Identity Verified",
      description: "Welcome back to Margdarshak Command.",
    });
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-3xl overflow-hidden"
        >
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 180, 270, 360],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-[120px]"
              style={{ background: `radial-gradient(circle, ${userTier.style.accent}33 0%, transparent 70%)` }}
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                rotate: [360, 270, 180, 90, 0],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-[120px]"
              style={{ background: `radial-gradient(circle, ${userTier.style.accent}22 0%, transparent 70%)` }}
            />
          </div>

          {/* Main Card Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className={`relative p-8 sm:p-12 rounded-[3rem] border border-white/10 bg-zinc-900/40 backdrop-blur-2xl ${userTier.style.shadow} w-[92vw] max-w-[600px] max-h-[90vh] overflow-y-auto sm:overflow-visible`}
          >
            {/* Grain Texture */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-noise rounded-[3rem]" />

            {/* Header Identity */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="mb-6 p-4 rounded-3xl bg-white/5 border border-white/10"
              >
                <userTier.icon className="w-16 h-16" style={{ color: userTier.style.accent }} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className="text-[10px] font-black tracking-[0.5em] text-zinc-500 uppercase mb-2 block">
                  Identity Verified
                </span>
                <h2 className="text-4xl sm:text-5xl font-black text-white italic uppercase tracking-tighter mb-4">
                  {userTier.tier} <br />
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${userTier.style.gradient}`}>
                    Official Access
                  </span>
                </h2>
              </motion.div>

              {/* Status Pills */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status: Ready</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                  <Cpu className="w-3 h-3 text-blue-400" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Core: Linked</span>
                </div>
              </div>

              {/* Greeting */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 text-center"
              >
                <p className="text-sm font-medium text-zinc-400">
                  Welcome back, <span className="text-white font-bold">{clerkUser?.firstName || clerkUser?.username}</span>. <br />
                  Your academic command center is synchronized.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-8 px-10 py-4 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-colors"
                >
                  Enter Command
                </button>
              </motion.div>
            </div>

            {/* Corner Branding */}
            <div className="absolute bottom-8 left-8 opacity-20 hidden sm:flex items-center gap-2">
              <Hexagon size={12} className="text-white" />
              <span className="text-[8px] font-black text-white tracking-[0.3em] uppercase">VSAV Gyantapa HQ</span>
            </div>
          </motion.div>

          {/* Close Button (X) */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={handleClose}
            className="absolute top-8 right-8 z-[100000] p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            <X size={24} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankEntryOverlay;
