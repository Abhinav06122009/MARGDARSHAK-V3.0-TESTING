import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/react';
import { Crown, Shield, Zap, Sparkles, Star, Cpu, Award } from 'lucide-react';

interface RankEntryOverlayProps {
  onComplete?: () => void;
}

const RankEntryOverlay: React.FC<RankEntryOverlayProps> = ({ onComplete }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const [show, setShow] = useState(false);
  const [rankInfo, setRankInfo] = useState<{
    tier: 'A+' | 'A' | 'B-' | 'STANDARD';
    title: string;
    style: any;
    icon: any;
  } | null>(null);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      const metadata = clerkUser.publicMetadata || {};
      const role = (Array.isArray(metadata.role) ? metadata.role[0] : metadata.role || 'student').toLowerCase();
      const subscription = (metadata.subscription as any) || {};
      const tier = (subscription.tier || 'free').toLowerCase();

      let info: any = null;

      // A+ CLASS: High Rankers (High Command)
      if (['ceo', 'superadmin', 'super_elite'].includes(role)) {
        info = {
          tier: 'A+',
          title: 'SUPREME HIGH COMMAND',
          icon: Crown,
          style: {
            gradient: 'from-[#FFD700] via-[#FDB931] to-[#9E7E38]',
            glow: 'rgba(255, 215, 0, 0.4)',
            accent: '#FFD700',
            particles: 'bg-[#FFD700]'
          }
        };
      } 
      // A CLASS: Elite Operatives
      else if (['admin', 'premium_elite', 'premium_plus'].includes(role) || ['premium_elite', 'premium_plus'].includes(tier)) {
        info = {
          tier: 'A',
          title: 'ELITE VETERAN OPERATIVE',
          icon: Shield,
          style: {
            gradient: 'from-[#E5E4E2] via-[#00F5FF] to-[#00A3FF]',
            glow: 'rgba(0, 245, 255, 0.3)',
            accent: '#00F5FF',
            particles: 'bg-[#E5E4E2]'
          }
        };
      }
      // B- CLASS: Professional Core
      else if (['mod', 'bdo', 'premium'].includes(role) || tier === 'premium') {
        info = {
          tier: 'B-',
          title: 'TACTICAL PROFICIENCY UNIT',
          icon: Zap,
          style: {
            gradient: 'from-[#CD7F32] via-[#A9A9A9] to-[#4A4A4A]',
            glow: 'rgba(205, 127, 50, 0.2)',
            accent: '#CD7F32',
            particles: 'bg-[#A9A9A9]'
          }
        };
      }

      if (info) {
        // Only show if haven't shown in this session
        const hasShown = sessionStorage.getItem('rank_entry_shown');
        if (!hasShown) {
          setRankInfo(info);
          setShow(true);
          sessionStorage.setItem('rank_entry_shown', 'true');
          
          const timer = setTimeout(() => {
            setShow(false);
            if (onComplete) onComplete();
          }, 4500);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [isLoaded, clerkUser, onComplete]);

  if (!rankInfo) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-2xl overflow-hidden pointer-events-none"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 180, 270, 360],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full border border-${rankInfo.style.accent}/20`}
              style={{ borderColor: `${rankInfo.style.accent}20` }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />
          </div>

          {/* Particles */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 0,
                  scale: 0 
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 800, 
                  y: (Math.random() - 0.5) * 800, 
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                className={`absolute w-1 h-1 rounded-full ${rankInfo.style.particles}`}
              />
            ))}
          </div>

          {/* Main Content Card */}
          <div className="relative flex flex-col items-center">
            {/* Rank Identifier */}
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="relative mb-12"
            >
              <div 
                className="absolute inset-0 blur-[60px] opacity-50"
                style={{ backgroundColor: rankInfo.style.accent }}
              />
              <div className={`relative p-8 rounded-[3rem] bg-black/40 border-2 border-white/10 backdrop-blur-3xl shadow-2xl`}>
                <rankInfo.icon className={`w-24 h-24 mb-6`} style={{ color: rankInfo.style.accent }} />
                
                <div className="flex flex-col items-center text-center">
                   <motion.div
                     initial={{ width: 0 }}
                     animate={{ width: "100%" }}
                     transition={{ delay: 0.8, duration: 1 }}
                     className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mb-4"
                   />
                   <span className={`text-[10px] font-black tracking-[0.5em] uppercase mb-2`} style={{ color: rankInfo.style.accent }}>
                      System Clearance Identified
                   </span>
                   <h2 className={`text-6xl font-black italic uppercase tracking-tighter bg-gradient-to-b ${rankInfo.style.gradient} bg-clip-text text-transparent px-8`}>
                      {rankInfo.tier} Class
                   </h2>
                   <p className="text-zinc-500 text-xs font-bold tracking-[0.2em] mt-4 uppercase italic">
                      {rankInfo.title}
                   </p>
                   <motion.div
                     initial={{ width: 0 }}
                     animate={{ width: "100%" }}
                     transition={{ delay: 0.8, duration: 1 }}
                     className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mt-4"
                   />
                </div>
              </div>
            </motion.div>

            {/* User Greeting */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center"
            >
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tight mb-2">
                Welcome, {clerkUser?.firstName || clerkUser?.username || 'Agent'}
              </h3>
              <div className="flex items-center justify-center gap-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                 <span className="flex items-center gap-1"><Cpu size={10} /> Neural Core Active</span>
                 <div className="w-1 h-1 rounded-full bg-zinc-800" />
                 <span className="flex items-center gap-1"><Shield size={10} /> Enclave Protocol: Secure</span>
                 <div className="w-1 h-1 rounded-full bg-zinc-800" />
                 <span className="flex items-center gap-1"><Award size={10} /> Rank Verified</span>
              </div>
            </motion.div>

            {/* Scanning Line Effect */}
            <motion.div
              animate={{ 
                top: ["0%", "100%", "0%"]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[2px] opacity-20 pointer-events-none"
              style={{ background: `linear-gradient(90deg, transparent, ${rankInfo.style.accent}, transparent)` }}
            />
          </div>

          {/* Decorative Corner Elements */}
          <div className="absolute inset-0 p-12 pointer-events-none opacity-40">
             <div className={`absolute top-12 left-12 w-12 h-12 border-t-4 border-l-4 border-white/20 rounded-tl-3xl`} />
             <div className={`absolute top-12 right-12 w-12 h-12 border-t-4 border-r-4 border-white/20 rounded-tr-3xl`} />
             <div className={`absolute bottom-12 left-12 w-12 h-12 border-b-4 border-l-4 border-white/20 rounded-bl-3xl`} />
             <div className={`absolute bottom-12 right-12 w-12 h-12 border-b-4 border-r-4 border-white/20 rounded-br-3xl`} />
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankEntryOverlay;
