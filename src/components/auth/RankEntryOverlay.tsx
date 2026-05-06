import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useUser } from '@clerk/react';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Shield, Zap, Sparkles, Star, Cpu, Award, Hexagon, Fingerprint, Activity, X } from 'lucide-react';

interface RankEntryOverlayProps {
  onComplete?: () => void;
}

const RankEntryOverlay: React.FC<RankEntryOverlayProps> = ({ onComplete }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { setVerified } = useAuth();
  const [show, setShow] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [scanStep, setScanStep] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [rankInfo, setRankInfo] = useState<{
    tier: 'A+' | 'A' | 'B-' | 'STANDARD';
    grade: string;
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
    // Session Lock: Only show once per session/tab
    const sessionShown = sessionStorage.getItem('margdarshak_rank_shown');
    
    if (isLoaded && clerkUser) {
      console.log('🛡️ [RankOverlay] Analyzing Identity:', { 
        id: clerkUser.id, 
        role: clerkUser.publicMetadata.role,
        alreadyShown: sessionShown
      });

      if (sessionShown === 'true') {
        setVerified(true);
        return;
      }

      const metadata = clerkUser.publicMetadata || {};
      const roles = Array.isArray(metadata.role) ? metadata.role : [metadata.role || 'student'];
      const normalizedRoles = roles.map((r: string) => r.toLowerCase().replace(/\s+/g, '_'));

      const aPlusRoles = ['ceo', 'cto', 'cfo', 'coo', 'cmo', 'cio', 'cso', 'owner', 'co-founder', 'cofounder'];
      const aRoles = ['aceo', 'acto', 'acfo', 'acoo', 'acmo', 'acio'];
      const bRoles = ['aeo', 'ato', 'afo', 'aoo', 'amo', 'aio', 'superadmin'];
      const cRoles = ['moderator', 'staff', 'support_executive', 'supportexecutive', 'manager', 'hr', 'admin'];

      const getFullTitle = (role: string) => {
        const mapping: Record<string, string> = {
          ceo: 'CHIEF EXECUTIVE OFFICER',
          cto: 'CHIEF TECHNOLOGY OFFICER',
          cfo: 'CHIEF FINANCIAL OFFICER',
          coo: 'CHIEF OPERATIONS OFFICER',
          cmo: 'CHIEF MARKETING OFFICER',
          cio: 'CHIEF INFORMATION OFFICER',
          cso: 'CHIEF SECURITY OFFICER',
          owner: 'PLATFORM OWNER',
          'co-founder': 'CO-FOUNDER & VISIONARY',
          cofounder: 'CO-FOUNDER & VISIONARY',
          aceo: 'ASST. CHIEF EXECUTIVE OFFICER',
          acto: 'ASST. CHIEF TECHNOLOGY OFFICER',
          acfo: 'ASST. CHIEF FINANCIAL OFFICER',
          acoo: 'ASST. CHIEF OPERATIONS OFFICER',
          acmo: 'ASST. CHIEF MARKETING OFFICER',
          acio: 'ASST. CHIEF INFORMATION OFFICER',
          aeo: 'ASSISTANT EXECUTIVE OFFICER',
          ato: 'ASSISTANT TECHNICAL OFFICER',
          afo: 'ASSISTANT FINANCIAL OFFICER',
          aoo: 'ASSISTANT OPERATIONAL OFFICER',
          amo: 'ASSISTANT MARKETING OFFICER',
          aio: 'ASSISTANT INFORMATION OFFICER',
          superadmin: 'SUPREME SYSTEM ADMINISTRATOR',
          admin: 'SYSTEM ADMINISTRATOR',
          manager: 'DEPARTMENTAL MANAGER',
          hr: 'HUMAN RESOURCES DIRECTOR',
          moderator: 'SYSTEM MODERATOR',
          staff: 'OPERATIONAL STAFF',
          support_executive: 'CUSTOMER SUPPORT EXECUTIVE',
          supportexecutive: 'CUSTOMER SUPPORT EXECUTIVE'
        };
        return mapping[role] || 'ACADEMIC SENTINEL';
      };

      let info: any = null;
      const primaryRole = normalizedRoles.find(r => [...aPlusRoles, ...aRoles, ...bRoles, ...cRoles].includes(r));

      if (!primaryRole) {
        console.log('🛡️ [RankOverlay] No matching officer role found. Bailing.');
        return; 
      }

      console.log('🛡️ [RankOverlay] Officer Identity Confirmed:', primaryRole);

      if (aPlusRoles.includes(primaryRole)) {
        info = {
          tier: 'A+',
          grade: 'RHODIUM',
          title: getFullTitle(primaryRole),
          icon: Crown,
          style: {
            gradient: 'from-[#FFFFFF] via-[#E2E8F0] to-[#94A3B8]',
            glow: 'rgba(255,255,255,0.9)',
            accent: '#FFFFFF',
            accentAlt: '#94A3B8',
            particles: 'bg-white',
            shimmer: 'from-white/60 via-white/10 to-white/60',
            border: 'border-white/80',
            shadow: 'shadow-[0_0_200px_60px_rgba(255,255,255,0.35),0_0_80px_rgba(255,255,255,0.6)]',
            orb: 'rgba(226,232,240,0.3)',
            scanline: 'rgba(255,255,255,0.05)',
            theme: 'rhodium'
          }
        };
      } else if (aRoles.includes(primaryRole)) {
        info = {
          tier: 'A',
          grade: 'PLATINUM',
          title: getFullTitle(primaryRole),
          icon: Shield,
          style: {
            gradient: 'from-[#E2E8F0] via-[#94A3B8] to-[#475569]',
            glow: 'rgba(148,163,184,0.85)',
            accent: '#CBD5E1',
            accentAlt: '#64748B',
            particles: 'bg-[#CBD5E1]',
            shimmer: 'from-blue-200/40 via-white/10 to-slate-400/40',
            border: 'border-slate-300/70',
            shadow: 'shadow-[0_0_160px_50px_rgba(148,163,184,0.3),0_0_60px_rgba(203,213,225,0.5)]',
            orb: 'rgba(148,163,184,0.2)',
            scanline: 'rgba(203,213,225,0.04)',
            theme: 'platinum'
          }
        };
      } else if (bRoles.includes(primaryRole)) {
        info = {
          tier: 'B',
          grade: 'GOLD',
          title: getFullTitle(primaryRole),
          icon: Zap,
          style: {
            gradient: 'from-[#FDE047] via-[#EAB308] to-[#854D0E]',
            glow: 'rgba(234,179,8,0.9)',
            accent: '#FDE047',
            accentAlt: '#CA8A04',
            particles: 'bg-[#FDE047]',
            shimmer: 'from-yellow-300/50 via-amber-200/10 to-orange-500/40',
            border: 'border-yellow-400/80',
            shadow: 'shadow-[0_0_180px_50px_rgba(234,179,8,0.3),0_0_60px_rgba(253,224,71,0.6)]',
            orb: 'rgba(234,179,8,0.2)',
            scanline: 'rgba(253,224,71,0.04)',
            theme: 'gold'
          }
        };
      } else if (cRoles.includes(primaryRole)) {
        info = {
          tier: 'C',
          grade: 'SILVER',
          title: getFullTitle(primaryRole),
          icon: Activity,
          style: {
            gradient: 'from-[#D1D5DB] via-[#9CA3AF] to-[#4B5563]',
            glow: 'rgba(156,163,175,0.8)',
            accent: '#D1D5DB',
            accentAlt: '#6B7280',
            particles: 'bg-[#9CA3AF]',
            shimmer: 'from-gray-300/40 via-white/10 to-gray-500/40',
            border: 'border-gray-400/60',
            shadow: 'shadow-[0_0_140px_40px_rgba(75,85,99,0.3),0_0_50px_rgba(156,163,175,0.4)]',
            orb: 'rgba(75,85,99,0.2)',
            scanline: 'rgba(156,163,175,0.03)',
            theme: 'silver'
          }
        };
      }

      if (info) {
        setRankInfo(info);
        setShow(true);
        sessionStorage.setItem('margdarshak_rank_shown', 'true');

        // SCANNING SEQUENCE
        const steps = ['BIOMETRIC_INIT', 'NEURAL_HANDSHAKE', 'VSAV_ENCRYPTION_CHECK', 'ACCESS_GRANTED'];
        steps.forEach((_, i) => {
          setTimeout(() => setScanStep(i), i * 600);
        });
        setTimeout(() => setIsScanning(false), 2400);
      }
    }
  }, [isLoaded, clerkUser]);

  const handleClose = () => {
    setShow(false);
    setVerified(true);
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

  const scanLabels = ['INITIALIZING BIOMETRIC SCAN...', 'ESTABLISHING NEURAL HANDSHAKE...', 'VSAV ENCRYPTION VERIFIED', 'OFFICER IDENTITY CONFIRMED'];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseMove={handleMouseMove}
          onMouseDown={() => setIsClicked(true)}
          onMouseUp={() => setIsClicked(false)}
          className="fixed inset-0 z-[100000] w-screen h-[100dvh] bg-[#020202] flex items-center justify-center overflow-hidden select-none"
        >

          {/* Custom Cursor Reticle - Interactive (Only for non-touch devices) */}
          <motion.div 
            className="fixed z-[100001] pointer-events-none mix-blend-difference hidden sm:flex items-center justify-center"
            animate={{ 
              width: isHovering ? 80 : 40, 
              height: isHovering ? 80 : 40,
              scale: isClicked ? 0.8 : 1,
              backgroundColor: isHovering ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0)'
            }}
            style={{ 
              translateX: mouseX, 
              translateY: mouseY, 
              left: '50%', 
              top: '50%',
              boxShadow: isHovering ? '0 0 40px rgba(52, 211, 153, 0.4)' : 'none'
            }}
          >
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isHovering ? 'bg-emerald-400 scale-150' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className={`absolute inset-0 border-2 rounded-full transition-all duration-500 ${isHovering ? 'border-emerald-400 border-t-transparent border-b-transparent' : 'border-emerald-500/30 border-t-emerald-500'}`}
            />
            {isHovering && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.2 }}
                className="absolute inset-0 border border-emerald-400/30 rounded-full blur-md animate-pulse"
              />
            )}
          </motion.div>

          {/* QUICK CLOSE BUTTON FOR OFFICIALS */}
          <button 
            onClick={handleClose}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="fixed top-6 right-6 sm:top-10 sm:right-10 z-[100001] p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white transition-all group"
            title="Dismiss Overlay"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* === TIER BG: SCANLINES === */}
          <div className="absolute inset-0 pointer-events-none z-[1] opacity-40" style={{ backgroundImage: `repeating-linear-gradient(0deg, ${rankInfo.style.scanline} 0px, transparent 1px, transparent 3px)` }} />

          {/* === TIER BG: DUAL ORB GLOW === */}
          <div className="absolute inset-0 pointer-events-none z-[2]">
            <motion.div
              animate={{ x: [0, 60, -60, 0], y: [0, -40, 40, 0], opacity: [0.18, 0.30, 0.18], scale: [1, 1.25, 1] }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] rounded-full blur-[120px] will-change-transform"
              style={{ backgroundColor: rankInfo.style.orb }}
            />
          </div>

          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
                className="relative z-[10] flex flex-col items-center justify-center gap-6 sm:gap-10 w-full max-w-md px-6 h-auto"
              >
                {/* Biometric Circle - Scaled for Viewport */}
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    className="absolute inset-0 border-2 border-emerald-500/20 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                    className="absolute inset-4 sm:inset-6 border border-emerald-500/10 border-dashed rounded-full"
                  />
                  
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="relative z-10 text-emerald-500"
                  >
                    <Fingerprint className="size-16 sm:size-20" strokeWidth={1} />
                  </motion.div>

                  <motion.div
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="absolute left-4 right-4 h-0.5 bg-emerald-400/60 shadow-[0_0_20px_rgba(52,211,153,0.8)] z-20"
                  />
                </div>

                {/* Status Readouts */}
                <div className="text-center space-y-4">
                  <div className="flex flex-col gap-1">
                    <motion.p
                      key={scanStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-emerald-400 font-mono text-[10px] sm:text-sm tracking-[0.4em] font-black uppercase"
                    >
                      {scanLabels[scanStep]}
                    </motion.p>
                    <span className="text-white/20 font-mono text-[7px] sm:text-[8px] tracking-[1em] uppercase">SEC_V4_NODE</span>
                  </div>
                  <div className="flex gap-1.5 sm:gap-2 justify-center">
                    {[0, 1, 2, 3].map((s) => (
                      <div key={s} className="h-1 w-8 sm:w-10 rounded-full overflow-hidden bg-zinc-900 border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: s <= scanStep ? '100%' : '0%' }}
                          className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
          <motion.div
            key="rank-reveal"
            style={{ rotateX, rotateY, perspective: 2000, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-[10] group w-full h-auto flex items-center justify-center p-4 sm:p-0"
          >
            {/* DYNAMIC AMBIENT SHADOW */}
            <div className={`absolute -inset-24 ${rankInfo.style.shadow} opacity-60 rounded-full blur-[100px] pointer-events-none transition-all duration-1000`} />

          {/* THE HIGH-COMMAND ASSET */}
          <div className={`relative w-full max-w-[400px] h-auto max-h-[95vh] bg-[#050505] rounded-[2.5rem] sm:rounded-[3.5rem] border-2 ${rankInfo.style.border} overflow-hidden flex flex-col p-6 sm:p-10 shadow-2xl backdrop-blur-3xl`}>
            
            {/* HOLOGRAPHIC SHIMMER & GLARE */}
            <motion.div
              animate={{ x: ['-200%', '200%'] }}
              transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
              className={`absolute inset-0 bg-gradient-to-r ${rankInfo.style.shimmer} skew-x-[-20deg] opacity-10 pointer-events-none`}
            />
            <div className="absolute inset-0 z-30 pointer-events-none opacity-20 bg-gradient-to-br from-white/10 via-transparent to-white/5" />

            {/* HEADER BRANDING */}
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 sm:p-2 bg-white rounded-lg border border-white/20 shadow-xl">
                    <img src="/logo.png" alt="M" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                  </div>
                  <h2 className="text-sm sm:text-lg font-black text-white tracking-tighter uppercase italic leading-none">Margdarshak</h2>
                </div>
                <span className="text-[5px] sm:text-[6px] font-black text-emerald-500/40 uppercase tracking-[0.5em] ml-10 sm:ml-12">VSAV GYANTAPA FAMILY</span>
              </div>
            </div>

            {/* RANK RIBBON */}
            <div className={`absolute top-12 sm:top-16 left-0 px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r ${rankInfo.style.gradient} rounded-r-full shadow-lg z-20`}>
              <div className="flex items-center gap-2 sm:gap-2.5">
                <Sparkles size={10} className="text-black/70 sm:size-12" />
                <div className="flex flex-col">
                  <span className="text-[6px] sm:text-[8px] font-black text-black/40 uppercase tracking-widest leading-none">OFFICER GRADE</span>
                  <span className="text-[8px] sm:text-[10px] font-black text-black uppercase tracking-[0.15em] italic">{rankInfo.grade}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-5 sm:gap-8 text-center py-2 sm:py-6">
              {/* ICON CONSTRUCT */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  className={`p-4 sm:p-9 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br ${rankInfo.style.gradient} shadow-2xl relative group-hover:scale-105 transition-all duration-500`}
                  style={{ transform: "translateZ(50px)" }}
                >
                  <rankInfo.icon size={35} className="text-black sm:size-[65px]" strokeWidth={1.5} />
                  <motion.div
                    animate={{ opacity: [0, 0.5, 0], scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="absolute inset-0 border-4 border-white/30 rounded-2xl sm:rounded-[2rem]"
                  />
                </motion.div>
                
                {/* Orbiting Text */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-8 sm:-inset-12 pointer-events-none opacity-20"
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                    <text className="text-[3.5px] font-black uppercase tracking-[1em] fill-white">
                      <textPath href="#circlePath">
                        • VSAV HIGH COMMAND • AUTHORIZED PERSONNEL ONLY •
                      </textPath>
                    </text>
                  </svg>
                </motion.div>
              </div>

              <div className="space-y-2 sm:space-y-4" style={{ transform: "translateZ(30px)" }}>
                <div className="flex flex-col gap-1">
                  <span className="text-[7px] sm:text-[9px] font-black text-white/20 uppercase tracking-[0.8em]">IDENTITY_RECOGNIZED</span>
                  <h2 className={`text-xl sm:text-3xl font-black italic tracking-tighter uppercase leading-tight bg-gradient-to-b ${rankInfo.style.gradient} bg-clip-text text-transparent px-2`}>
                    {rankInfo.title}
                  </h2>
                </div>
                
                <div className="h-px w-20 sm:w-28 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mx-auto" />
                
                <p className="text-zinc-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] max-w-[240px] sm:max-w-[280px] leading-relaxed mx-auto">
                  Visionary of the VSAV Ecosystem.<br />
                  <span className="text-zinc-400">Node Session V4.0 Initialized.</span>
                </p>
              </div>
            </div>

            {/* PREMIUM ACTION BUTTON */}
            <button
              onClick={handleClose}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="relative mt-auto py-4 sm:py-5 rounded-xl sm:rounded-[1.25rem] bg-white text-black font-black uppercase tracking-[0.4em] text-[8px] sm:text-[9px] hover:bg-emerald-400 active:scale-95 transition-all overflow-hidden group/btn shadow-xl"
            >
              <span className="relative z-10">ENTER_DASHBOARD</span>
            </button>
          </div>

                {/* TECH DECORATIONS */}
                <div className="absolute -left-40 top-1/2 -translate-y-1/2 space-y-16 opacity-30 pointer-events-none">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="h-px w-32 bg-gradient-to-r from-white to-transparent" />
                      <span className="text-[8px] font-mono text-white tracking-[0.4em]">SEC_LINK_0{i}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Luxury Ambient Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-[60] pointer-events-none opacity-60" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankEntryOverlay;
