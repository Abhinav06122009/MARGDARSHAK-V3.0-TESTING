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

      // A+ CLASS: RHODIUM ZENITH — Pure Chrome Crystalline (Dual C-Suite)
      if (userCSuiteCount >= 2) {
        info = {
          tier: 'A+',
          title: 'VSAV GYANTAPA HIGH COMMAND',
          icon: Crown,
          style: {
            gradient: 'from-[#FFFFFF] via-[#C8C8C8] to-[#8A8A8A]',
            glow: 'rgba(255,255,255,0.9)',
            accent: '#F0F0F0',
            accentAlt: '#AAAAAA',
            particles: 'bg-white',
            shimmer: 'from-white/60 via-white/10 to-white/60',
            border: 'border-white/80',
            shadow: 'shadow-[0_0_200px_60px_rgba(255,255,255,0.35),0_0_80px_rgba(255,255,255,0.6)]',
            orb: 'rgba(220,220,220,0.25)',
            scanline: 'rgba(255,255,255,0.04)',
            badge: 'from-[#ffffff] via-[#d4d4d4] to-[#8e8e8e]',
            ribbonBg: 'linear-gradient(135deg,#ffffff,#b0b0b0,#6e6e6e)',
            theme: 'rhodium'
          }
        };
      }
      // A CLASS: PLATINUM ASTRAL — Cold Silver-Blue Metallic (Single C-Suite)
      else if (userCSuiteCount === 1) {
        const activeRole = normalizedRoles.find(r => cSuiteRoles.includes(r));
        info = {
          tier: 'A',
          title: `CHIEF ${activeRole?.toUpperCase()} OFFICER`,
          icon: Shield,
          style: {
            gradient: 'from-[#E8E8FF] via-[#A0C8FF] to-[#4488DD]',
            glow: 'rgba(160,200,255,0.85)',
            accent: '#B0D8FF',
            accentAlt: '#5599EE',
            particles: 'bg-[#B0D8FF]',
            shimmer: 'from-blue-200/40 via-white/10 to-cyan-400/40',
            border: 'border-blue-300/70',
            shadow: 'shadow-[0_0_160px_50px_rgba(100,180,255,0.3),0_0_60px_rgba(160,200,255,0.5)]',
            orb: 'rgba(120,180,255,0.2)',
            scanline: 'rgba(160,210,255,0.04)',
            badge: 'from-[#e8f0ff] via-[#90b8f8] to-[#3366cc]',
            ribbonBg: 'linear-gradient(135deg,#c8deff,#7aaad4,#3366aa)',
            theme: 'platinum'
          }
        };
      }
      // B CLASS: IMPERIAL GOLD — Deep Warm Amber Fire (Sovereign)
      else if (normalizedRoles.some(r => sovereignRoles.includes(r))) {
        const activeRole = normalizedRoles.find(r => sovereignRoles.includes(r));
        info = {
          tier: 'B',
          title: activeRole === 'owner' ? 'SYSTEM OWNER' : (activeRole === 'superadmin' ? 'SUPER ADMINISTRATOR' : 'SYSTEM ADMINISTRATOR'),
          icon: Zap,
          style: {
            gradient: 'from-[#FFE566] via-[#FFAA00] to-[#7A4E00]',
            glow: 'rgba(255,180,0,0.9)',
            accent: '#FFD700',
            accentAlt: '#FF9900',
            particles: 'bg-[#FFD700]',
            shimmer: 'from-yellow-300/50 via-amber-200/10 to-orange-500/40',
            border: 'border-yellow-400/80',
            shadow: 'shadow-[0_0_180px_50px_rgba(255,180,0,0.3),0_0_60px_rgba(255,215,0,0.6)]',
            orb: 'rgba(255,160,0,0.2)',
            scanline: 'rgba(255,200,0,0.04)',
            badge: 'from-[#ffe566] via-[#ffaa00] to-[#7a4e00]',
            ribbonBg: 'linear-gradient(135deg,#ffe566,#fdb931,#9e7e38)',
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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020202] overflow-hidden"
        >
          {/* === TIER BG: SCANLINES === */}

          <div className="absolute inset-0 pointer-events-none z-[1] opacity-40" style={{ backgroundImage: `repeating-linear-gradient(0deg, ${rankInfo.style.scanline} 0px, transparent 1px, transparent 3px)` }} />

          {/* === TIER BG: GEOMETRIC CRYSTALS === */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.12, 0],
                  scale: [0.4, 1.4, 0.4],
                  rotate: [0, 180, 360],
                  x: [(i % 2 === 0 ? 1 : -1) * (100 + i * 80), (i % 2 === 0 ? -1 : 1) * (100 + i * 80)],
                  y: [(i % 3 === 0 ? 1 : -1) * (60 + i * 50), (i % 3 === 0 ? -1 : 1) * (60 + i * 50)],
                  z: 0
                }}
                transition={{ duration: 10 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                className="absolute top-1/2 left-1/2 w-[350px] h-[350px] will-change-transform"
                style={{
                  background: `linear-gradient(135deg, ${rankInfo.style.accent}08, ${rankInfo.style.accentAlt}04, transparent)`,
                  clipPath: i % 2 === 0 ? 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)' : 'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)',
                  border: `1px solid ${rankInfo.style.accent}10`,
                  transform: 'translateZ(0)'
                }}
              />
            ))}
          </div>

          {/* === TIER BG: FLOATING PARTICLES === */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-[3]">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: '100vh', x: `${(i / 15) * 100}vw` }}
                animate={{ 
                  opacity: [0, 0.8, 0], 
                  y: '-20vh', 
                  x: [`${(i / 15) * 100}vw`, `${((i / 15) * 100) + (i % 2 === 0 ? 3 : -3)}vw`],
                  z: 0 
                }}
                transition={{ duration: 5 + (i % 5), repeat: Infinity, delay: i * 0.4, ease: 'linear' }}
                className={`absolute bottom-0 rounded-full ${rankInfo.style.particles} will-change-transform`}
                style={{ width: 2 + (i % 3), height: 2 + (i % 3), opacity: 0.6, filter: `blur(${i % 2}px)`, transform: 'translateZ(0)' }}
              />
            ))}
          </div>

          {/* === TIER BG: DUAL ORB GLOW === */}
          <div className="absolute inset-0 pointer-events-none z-[2]">
            <motion.div
              animate={{ x: [0, 60, -60, 0], y: [0, -40, 40, 0], opacity: [0.18, 0.30, 0.18], scale: [1, 1.25, 1], z: 0 }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[150px] will-change-transform"
              style={{ backgroundColor: rankInfo.style.orb, transform: 'translateZ(0)' }}
            />
            <motion.div
              animate={{ x: [0, -40, 40, 0], y: [0, 30, -30, 0], opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1], z: 0 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full blur-[100px] will-change-transform"
              style={{ backgroundColor: rankInfo.style.accent, transform: 'translateZ(0)' }}
            />
          </div>


          {/* 3D Container */}
          <motion.div
            style={{ rotateX, rotateY, perspective: 2500, transformStyle: 'preserve-3d' }}

            className="relative flex flex-col items-center"
          >
            <motion.div
              initial={{ y: 200, opacity: 0, scale: 0.2, rotateX: 45 }}
              animate={{ y: 0, opacity: 1, scale: 0.75, rotateX: 0 }}
              transition={{ delay: 0.3, duration: 1.5, type: "spring", bounce: 0.3 }}
              className={`relative p-8 rounded-[4rem] border-2 ${rankInfo.style.border} backdrop-blur-[64px] ${rankInfo.style.shadow} group max-w-[80vw] will-change-transform`}
              style={{ background: `linear-gradient(145deg, rgba(0,0,0,0.8) 0%, ${rankInfo.style.accent}08 50%, rgba(0,0,0,0.9) 100%)`, transform: 'translateZ(0)' }}
            >
              {/* Grain Texture */}
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none overflow-hidden rounded-[4rem]">
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-60 mix-blend-overlay" />
              </div>

              {/* Metallic Inner Edge Highlight */}
              <div className="absolute inset-0 rounded-[4rem] pointer-events-none" style={{ boxShadow: `inset 0 1px 0 ${rankInfo.style.accent}40, inset 0 -1px 0 ${rankInfo.style.accentAlt}20` }} />

              <div className={`absolute inset-0 bg-gradient-to-br ${rankInfo.style.shimmer} opacity-20 rounded-[4rem] overflow-hidden`}>
                <motion.div
                  animate={{ x: ['-200%', '200%'], y: ['-100%', '100%'], z: 0 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                  className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-35deg] will-change-transform"
                />
              </div>

              {/* Dual Energy Arcs */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <motion.circle cx="50%" cy="50%" r="52%" fill="none" stroke={rankInfo.style.accent} strokeWidth="0.6" strokeDasharray="6 18"
                  animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} />
                <motion.circle cx="50%" cy="50%" r="48%" fill="none" stroke={rankInfo.style.accentAlt} strokeWidth="0.3" strokeDasharray="3 12"
                  animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} />
              </svg>

              <div className="relative z-10 flex flex-col items-center">
                {/* Official Margdarshak Logo */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="mb-6 flex flex-col items-center gap-2"
                >
                  <img src="/logo.png" alt="Margdarshak Logo" className="w-12 h-12 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  <span className="text-[8px] font-black tracking-[0.8em] text-white/50 uppercase">VSAV GYANTAPA HIGH COMMAND</span>
                </motion.div>

                <motion.div
                  initial={{ scale: 0, filter: 'blur(20px)' }}
                  animate={{ scale: 1, filter: 'blur(0px)' }}
                  transition={{ delay: 1, type: "spring", damping: 15 }}
                  className="mb-4 relative"
                >
                   <div className="absolute inset-0 blur-[30px] opacity-60" style={{ backgroundColor: rankInfo.style.accent }} />
                   <rankInfo.icon className="w-24 h-24 relative z-10" style={{ color: rankInfo.style.accent, filter: `drop-shadow(0 0 20px ${rankInfo.style.glow})` }} />
                </motion.div>
                
                <div className="flex flex-col items-center text-center">
                   <div className="inline-flex items-center gap-4 mb-4 px-5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                      <Fingerprint className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-[8px] font-black tracking-[0.8em] text-zinc-300 uppercase italic">
                         Verified Official Identity
                      </span>
                   </div>

                   <h2 className={`text-5xl font-black italic uppercase tracking-tighter bg-gradient-to-b ${rankInfo.style.gradient} bg-clip-text text-transparent px-8 mb-4`}
                     style={{ filter: `drop-shadow(0 0 30px ${rankInfo.style.glow})` }}>
                       <motion.span
                         initial={{ letterSpacing: "0.5em", opacity: 0 }}
                         animate={{ letterSpacing: "-0.05em", opacity: 1 }}
                         transition={{ delay: 1.5, duration: 1.2, ease: "circOut" }}
                       >
                         {rankInfo.tier} Class
                       </motion.span>
                    </h2>

                   <div className="relative h-8 overflow-hidden mb-6">
                     <motion.div
                       initial={{ y: 80, skewY: 10 }}
                       animate={{ y: 0, skewY: 0 }}
                       transition={{ delay: 2, duration: 1, ease: "backOut" }}
                       className="text-xl font-black text-white italic tracking-[0.3em] uppercase flex items-center gap-4"
                     >
                       <Sparkles className="w-4 h-4" style={{ color: rankInfo.style.accent }} />
                       {rankInfo.title}
                       <Sparkles className="w-4 h-4" style={{ color: rankInfo.style.accent }} />
                     </motion.div>
                   </div>

                   {/* Rank Achievement Badges */}
                   <div className="flex gap-2">
                      {[rankInfo.style.theme === 'rhodium' ? 'RHODIUM' : rankInfo.style.theme === 'platinum' ? 'PLATINUM' : 'IMPERIAL',
                        'VERIFIED', 'ELITE'].map((label, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 2.5 + i * 0.2 }}
                          className="px-4 py-1.5 rounded-lg border flex items-center gap-2"
                          style={{ background: `${rankInfo.style.accent}10`, borderColor: `${rankInfo.style.accent}30` }}
                        >
                           <Star className="w-2 h-2" style={{ color: rankInfo.style.accent, fill: rankInfo.style.accent }} />
                           <span className="text-[6px] font-black uppercase tracking-widest" style={{ color: rankInfo.style.accent }}>{label}</span>
                        </motion.div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Corner High-Command Branding */}
              <div className="absolute bottom-6 left-6 opacity-30 flex items-center gap-2">
                 <Hexagon size={10} />
                 <span className="text-[6px] font-black tracking-widest">HIGH RANKED OFFICIAL</span>
              </div>
            </motion.div>

            {/* Greeting Sub-Section */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 3 }}
              className="mt-8 flex flex-col items-center"
            >
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-3">
                Welcome, Commander {clerkUser?.firstName || clerkUser?.username}
              </h3>
              
              <div className="flex items-center gap-6 text-[7px] font-black text-zinc-500 uppercase tracking-[0.5em]">
                 <div className="flex items-center gap-2 group">
                    <Activity className="w-3 h-3 text-emerald-500 group-hover:animate-pulse" />
                    <span>VSAV GYANTA STATUS: Synchronized</span>
                 </div>
                 <div className="w-1 h-1 rounded-full bg-zinc-800" />
                 <div className="flex items-center gap-2 group">
                    <Cpu className="w-3 h-3 text-blue-500 group-hover:rotate-90 transition-transform" />
                    <span>Margdarshak Core: Online</span>
                 </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Luxury Frame & Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-[60] pointer-events-none opacity-60" />
          <div className="absolute inset-0 border-[20px] border-black z-[100] pointer-events-none" />
          
          {/* Close Button (X) - Moved to apex of stack for click reliability */}
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            onClick={handleClose}
            className="absolute top-8 right-8 z-[999999] w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group hover:bg-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-auto"
          >
            <X size={24} className="text-white group-hover:text-emerald-400 group-hover:rotate-90 transition-all" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankEntryOverlay;
