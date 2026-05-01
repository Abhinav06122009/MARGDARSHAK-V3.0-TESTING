import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useUser } from '@clerk/react';
import { Crown, Shield, Zap, Sparkles, Star, Cpu, Award, Hexagon, Fingerprint, Activity, X } from 'lucide-react';

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

  // 3D Tilt Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [15, -15]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]), { stiffness: 100, damping: 30 });

  useEffect(() => {
    if (isLoaded && clerkUser) {
      const metadata = clerkUser.publicMetadata || {};
      const roles = Array.isArray(metadata.role) ? metadata.role : [metadata.role || 'student'];
      const normalizedRoles = roles.map((r: string) => r.toLowerCase());

      const cSuiteRoles = ['ceo', 'cto', 'cfo', 'coo', 'cmo', 'cio'];
      const sovereignRoles = ['owner', 'superadmin', 'admin'];

      // Count how many C-Suite roles the user has
      const userCSuiteCount = normalizedRoles.filter(r => cSuiteRoles.includes(r)).length;
      
      let info: any = null;

      // A+ CLASS: RHODIUM ZENITH (Dual C-Suite)
      if (userCSuiteCount >= 2) {
        info = {
          tier: 'A+',
          title: 'ZENITH HIGH COMMAND',
          icon: Crown,
          style: {
            gradient: 'from-[#FFFFFF] via-[#E5E4E2] to-[#71706E]',
            glow: 'rgba(255, 255, 255, 0.7)',
            accent: '#FFFFFF',
            particles: 'bg-white',
            shimmer: 'from-white/30 via-transparent to-white/30',
            border: 'border-white/60',
            shadow: 'shadow-[0_0_150px_rgba(255,255,255,0.4)]',
            theme: 'rhodium'
          }
        };
      }
      // A CLASS: PLATINUM ASTRAL (Single C-Suite)
      else if (userCSuiteCount === 1) {
        const activeRole = normalizedRoles.find(r => cSuiteRoles.includes(r));
        info = {
          tier: 'A',
          title: `CHIEF ${activeRole?.toUpperCase()} OFFICER`,
          icon: Shield,
          style: {
            gradient: 'from-[#E5E4E2] via-[#00F5FF] to-[#00A3FF]',
            glow: 'rgba(0, 245, 255, 0.5)',
            accent: '#00F5FF',
            particles: 'bg-[#E5E4E2]',
            shimmer: 'from-blue-400/30 via-transparent to-cyan-600/30',
            border: 'border-cyan-500/50',
            shadow: 'shadow-[0_0_120px_rgba(0,245,255,0.3)]',
            theme: 'platinum'
          }
        };
      }
      // B- CLASS: IMPERIAL GOLD (Sovereign)
      else if (normalizedRoles.some(r => sovereignRoles.includes(r))) {
        const activeRole = normalizedRoles.find(r => sovereignRoles.includes(r));
        info = {
          tier: 'B-',
          title: activeRole === 'owner' ? 'SYSTEM OWNER' : (activeRole === 'superadmin' ? 'SUPER ADMINISTRATOR' : 'SYSTEM ADMINISTRATOR'),
          icon: Zap,
          style: {
            gradient: 'from-[#FFD700] via-[#FDB931] to-[#9E7E38]',
            glow: 'rgba(255, 215, 0, 0.5)',
            accent: '#FFD700',
            particles: 'bg-[#FFD700]',
            shimmer: 'from-yellow-400/30 via-transparent to-yellow-600/30',
            border: 'border-yellow-500/50',
            shadow: 'shadow-[0_0_100px_rgba(255,215,0,0.25)]',
            theme: 'gold'
          }
        };
      }

      if (!info) return;

      if (info) {
        setRankInfo(info);
        setShow(true);
        // Timeout removed: Stays until officer clicks X
      }
    }
  }, [isLoaded, clerkUser, onComplete]);

  const handleClose = () => {
    setShow(false);
    if (onComplete) onComplete();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  if (!rankInfo) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseMove={handleMouseMove}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020202] overflow-hidden cursor-none"
        >
          {/* Close Button (X) */}
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2 }}
            onClick={handleClose}
            className="absolute top-12 right-12 z-[150] w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={24} className="text-white group-hover:rotate-90 transition-transform" />
            <div className="absolute inset-0 rounded-full blur-[20px] group-hover:bg-white/10 transition-all" />
          </motion.button>

          {/* Advanced Geometric Crystal Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {[...Array(6)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, scale: 0 }}
                 animate={{ 
                    opacity: [0, 0.1, 0], 
                    scale: [0.5, 1.2, 0.5],
                    rotate: [0, 180, 360],
                    x: (Math.random() - 0.5) * 1000,
                    y: (Math.random() - 0.5) * 1000
                 }}
                 transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute top-1/2 left-1/2 w-[400px] h-[400px] border border-white/5 rotate-45 backdrop-blur-3xl"
                 style={{ 
                   background: `linear-gradient(135deg, ${rankInfo.style.accent}05, transparent)`,
                   clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' 
                 }}
               />
             ))}
          </div>

          {/* Liquid Refraction Orb */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ 
                x: [0, 50, -50, 0],
                y: [0, -30, 30, 0],
                opacity: [0.15, 0.25, 0.15],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[180px]"
              style={{ backgroundColor: rankInfo.style.accent }}
            />
          </div>

          {/* 3D Container */}
          <motion.div
            style={{ rotateX, rotateY, perspective: 2500 }}
            className="relative flex flex-col items-center"
          >
            {/* Rank Identifier Card */}
            <motion.div
              initial={{ y: 200, opacity: 0, scale: 0.2, rotateX: 45 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ delay: 0.3, duration: 1.5, type: "spring", bounce: 0.3 }}
              className={`relative p-16 rounded-[6rem] bg-black/40 border-2 ${rankInfo.style.border} backdrop-blur-[100px] ${rankInfo.style.shadow} group`}
            >
              {/* Glass Refraction Texture */}
              <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden rounded-[6rem]">
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay" />
              </div>

              {/* Shimmer / Liquid Light */}
              <div className={`absolute inset-0 bg-gradient-to-br ${rankInfo.style.shimmer} opacity-20 rounded-[6rem] overflow-hidden`}>
                <motion.div 
                  animate={{ x: ["-200%", "200%"], y: ["-100%", "100%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-35deg]"
                />
              </div>

              {/* Energy Arcs (High Fidelity) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <motion.circle
                  cx="50%" cy="50%" r="52%"
                  fill="none"
                  stroke={rankInfo.style.accent}
                  strokeWidth="0.5"
                  strokeDasharray="5 15"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />
                <motion.path
                   d="M 50,0 A 50,50 0 1 1 50,100 A 50,50 0 1 1 50,0"
                   fill="none"
                   stroke={rankInfo.style.accent}
                   strokeWidth="1"
                   strokeDasharray="40 160"
                   className="opacity-40"
                   style={{ transformOrigin: 'center', transform: 'scale(1.15)' }}
                   animate={{ rotate: -360 }}
                   transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
              </svg>

              <div className="relative z-10 flex flex-col items-center">
                {/* Brand Watermark */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  transition={{ delay: 2 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-black tracking-[1.2em] text-white uppercase italic"
                >
                  BRAND VSAV GYANTAPA
                </motion.div>

                <motion.div
                  initial={{ scale: 0, filter: 'blur(20px)' }}
                  animate={{ scale: 1, filter: 'blur(0px)' }}
                  transition={{ delay: 1, type: "spring", damping: 15 }}
                  className="mb-10 relative"
                >
                   <div className="absolute inset-0 blur-[40px] opacity-60" style={{ backgroundColor: rankInfo.style.accent }} />
                   <rankInfo.icon className="w-40 h-40 relative z-10" style={{ color: rankInfo.style.accent, filter: `drop-shadow(0 0 30px ${rankInfo.style.glow})` }} />
                </motion.div>
                
                <div className="flex flex-col items-center text-center">
                   <div className="inline-flex items-center gap-4 mb-6 px-8 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                      <Fingerprint className="w-5 h-5 text-zinc-400" />
                      <span className="text-[11px] font-black tracking-[0.8em] text-zinc-300 uppercase italic">
                         Verified Official Identity
                      </span>
                   </div>

                   <h2 className={`text-9xl font-black italic uppercase tracking-tighter bg-gradient-to-b ${rankInfo.style.gradient} bg-clip-text text-transparent px-16 mb-8`}>
                      <motion.span
                        initial={{ letterSpacing: "0.5em", opacity: 0 }}
                        animate={{ letterSpacing: "-0.05em", opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1.2, ease: "circOut" }}
                      >
                        {rankInfo.tier} Class
                      </motion.span>
                   </h2>

                   <div className="relative h-12 overflow-hidden mb-10">
                     <motion.div
                       initial={{ y: 80, skewY: 10 }}
                       animate={{ y: 0, skewY: 0 }}
                       transition={{ delay: 2, duration: 1, ease: "backOut" }}
                       className="text-3xl font-black text-white italic tracking-[0.3em] uppercase flex items-center gap-4"
                     >
                       <Sparkles className="w-6 h-6" style={{ color: rankInfo.style.accent }} />
                       {rankInfo.title}
                       <Sparkles className="w-6 h-6" style={{ color: rankInfo.style.accent }} />
                     </motion.div>
                   </div>

                   {/* Rank Achievement Badges */}
                   <div className="flex gap-4">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 2.5 + i * 0.2 }}
                          className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2"
                        >
                           <Star className="w-3 h-3 fill-white text-white" />
                           <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Excellence_{i+1}</span>
                        </motion.div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Corner High-Command Branding */}
              <div className="absolute bottom-10 left-10 opacity-30 flex items-center gap-3">
                 <Hexagon size={16} />
                 <span className="text-[8px] font-black tracking-widest">ENCLAVE_NODE_SECURE</span>
              </div>
            </motion.div>

            {/* Greeting Sub-Section */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 3 }}
              className="mt-20 flex flex-col items-center"
            >
              <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4">
                Welcome, Commander {clerkUser?.firstName || clerkUser?.username}
              </h3>
              
              <div className="flex items-center gap-12 text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em]">
                 <div className="flex items-center gap-4 group">
                    <Activity className="w-5 h-5 text-emerald-500 group-hover:animate-pulse" />
                    <span>Neural Link: Synchronized</span>
                 </div>
                 <div className="w-1 h-1 rounded-full bg-zinc-800" />
                 <div className="flex items-center gap-4 group">
                    <Cpu className="w-5 h-5 text-blue-500 group-hover:rotate-90 transition-transform" />
                    <span>Margdarshak Core: Online</span>
                 </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Luxury Frame & Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-[60] pointer-events-none opacity-60" />
          <div className="absolute inset-0 border-[60px] border-black z-[100] pointer-events-none" />
          
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankEntryOverlay;
