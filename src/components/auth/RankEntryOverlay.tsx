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
  const [isScanning, setIsScanning] = useState(true);
  const [scanStep, setScanStep] = useState(0);
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
    // Session Lock: Only show once per session/tab
    const sessionShown = sessionStorage.getItem('margdarshak_rank_shown');
    if (sessionShown) return;

    if (isLoaded && clerkUser) {
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

      if (!primaryRole) return; 

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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020202] overflow-hidden cursor-none"
        >
          {/* Custom Cursor Reticle */}
          <motion.div 
            className="fixed w-8 h-8 border border-emerald-500/50 rounded-full z-[10000] pointer-events-none mix-blend-difference flex items-center justify-center"
            style={{ x: mouseX, y: mouseY, left: '50%', top: '50%' }}
          >
            <div className="w-1 h-1 bg-emerald-500 rounded-full" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute inset-0 border-t border-emerald-500 rounded-full"
            />
          </motion.div>

          {/* === TIER BG: SCANLINES === */}
          <div className="absolute inset-0 pointer-events-none z-[1] opacity-40" style={{ backgroundImage: `repeating-linear-gradient(0deg, ${rankInfo.style.scanline} 0px, transparent 1px, transparent 3px)` }} />

          {/* === TIER BG: DUAL ORB GLOW === */}
          <div className="absolute inset-0 pointer-events-none z-[2]">
            <motion.div
              animate={{ x: [0, 60, -60, 0], y: [0, -40, 40, 0], opacity: [0.18, 0.30, 0.18], scale: [1, 1.25, 1], z: 0 }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[150px] will-change-transform"
              style={{ backgroundColor: rankInfo.style.orb, transform: 'translateZ(0)' }}
            />
          </div>

          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                className="relative z-[10] flex flex-col items-center gap-8 sm:gap-12"
              >
                {/* Biometric Circle - Responsive */}
                <div className="relative w-[65vw] h-[65vw] max-w-[320px] max-h-[320px] flex items-center justify-center">
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
                  
                  {/* Fingerprint / Scanner */}
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="relative z-10 text-emerald-500"
                  >
                    <Fingerprint className="size-[15vw] max-w-[100px] max-h-[100px]" strokeWidth={1} />
                  </motion.div>

                  {/* Scan Line */}
                  <motion.div
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="absolute left-4 right-4 h-0.5 bg-emerald-400/60 shadow-[0_0_25px_rgba(52,211,153,0.8)] z-20"
                  />
                </div>

                {/* Status Readouts */}
                <div className="text-center space-y-4 sm:space-y-6">
                  <div className="flex flex-col gap-1">
                    <motion.p
                      key={scanStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-emerald-400 font-mono text-[10px] sm:text-sm tracking-[0.4em] font-black uppercase"
                    >
                      {scanLabels[scanStep]}
                    </motion.p>
                    <span className="text-white/20 font-mono text-[6px] sm:text-[8px] tracking-[1em] uppercase">SYSTEM_ENCRYPTION_V4.0</span>
                  </div>
                  <div className="flex gap-1 sm:gap-2 justify-center">
                    {[0, 1, 2, 3].map((s) => (
                      <div key={s} className="h-1 w-8 sm:w-12 rounded-full overflow-hidden bg-zinc-900 border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: s <= scanStep ? '100%' : '0%' }}
                          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
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
                initial={{ opacity: 0, scale: 0.5, rotateX: 30 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                className="relative z-[10] group w-[90vw] max-w-[500px]"
              >
                {/* DYNAMIC AMBIENT SHADOW */}
                <div className={`absolute -inset-32 ${rankInfo.style.shadow} opacity-60 rounded-full blur-[120px] pointer-events-none transition-all duration-1000`} />

                {/* THE HIGH-COMMAND ASSET */}
                <div className={`relative w-full aspect-[1/1.45] bg-[#050505] rounded-[4rem] border-2 ${rankInfo.style.border} overflow-hidden flex flex-col p-8 sm:p-14 shadow-2xl backdrop-blur-3xl`}>
                  
                  {/* HOLOGRAPHIC SHIMMER & GLARE */}
                  <motion.div
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
                    className={`absolute inset-0 bg-gradient-to-r ${rankInfo.style.shimmer} skew-x-[-20deg] opacity-10 pointer-events-none`}
                  />
                  <div className="absolute inset-0 z-30 pointer-events-none opacity-20 bg-gradient-to-br from-white/10 via-transparent to-white/5" />

                  {/* HEADER BRANDING */}
                  <div className="flex items-center justify-between mb-8 sm:mb-12">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-white/20 shadow-2xl">
                          <img src="/logo.png" alt="M" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-white tracking-tighter uppercase italic leading-none">Margdarshak</h2>
                      </div>
                      <span className="text-[6px] sm:text-[7px] font-black text-emerald-500/40 uppercase tracking-[0.6em] ml-10 sm:ml-14">VSAV GYANTAPA FAMILY</span>
                    </div>
                  </div>

                  {/* RANK RIBBON */}
                  <div className={`absolute top-20 sm:top-24 left-0 px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r ${rankInfo.style.gradient} rounded-r-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Sparkles size={14} className="text-black/70 sm:size-16" />
                      <div className="flex flex-col">
                        <span className="text-[8px] sm:text-[9px] font-black text-black/40 uppercase tracking-widest leading-none">OFFICER GRADE</span>
                        <span className="text-[10px] sm:text-[12px] font-black text-black uppercase tracking-[0.2em] italic">{rankInfo.grade}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center gap-8 sm:gap-14 text-center">
                    {/* ICON CONSTRUCT */}
                    <div className="relative">
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                        className={`p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-br ${rankInfo.style.gradient} shadow-2xl relative group-hover:scale-110 transition-all duration-500`}
                        style={{ transform: "translateZ(50px)" }}
                      >
                        <rankInfo.icon size={70} className="text-black sm:size-[90px]" strokeWidth={1.5} />
                        <motion.div
                          animate={{ opacity: [0, 0.5, 0], scale: [1, 1.5, 1] }}
                          transition={{ repeat: Infinity, duration: 4 }}
                          className="absolute inset-0 border-4 border-white/30 rounded-[2.5rem]"
                        />
                      </motion.div>
                      
                      {/* Orbiting Text (Prestige Detail) */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-12 sm:-inset-16 pointer-events-none opacity-20"
                      >
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                          <text className="text-[4px] font-black uppercase tracking-[1em] fill-white">
                            <textPath href="#circlePath">
                              • VSAV HIGH COMMAND • AUTHORIZED PERSONNEL ONLY •
                            </textPath>
                          </text>
                        </svg>
                      </motion.div>
                    </div>

                    <div className="space-y-4 sm:space-y-6" style={{ transform: "translateZ(30px)" }}>
                      <div className="flex flex-col gap-1 sm:gap-2">
                        <span className="text-[8px] sm:text-[10px] font-black text-white/20 uppercase tracking-[1em]">IDENTITY_RECOGNIZED</span>
                        <h2 className={`text-3xl sm:text-5xl font-black italic tracking-tighter uppercase leading-tight bg-gradient-to-b ${rankInfo.style.gradient} bg-clip-text text-transparent px-4`}>
                          {rankInfo.title}
                        </h2>
                      </div>
                      
                      <div className="h-px w-24 sm:w-32 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mx-auto" />
                      
                      <div className="space-y-1">
                        <p className="text-zinc-500 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.25em] max-w-[280px] sm:max-w-[320px] leading-relaxed mx-auto">
                          Visionary of the VSAV Ecosystem.<br />
                          <span className="text-zinc-400">Node Session V4.0 Initialized.</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PREMIUM ACTION BUTTON */}
                  <button
                    onClick={handleClose}
                    className="relative mt-6 sm:mt-10 py-5 sm:py-7 rounded-[2rem] bg-white text-black font-black uppercase tracking-[0.6em] text-[9px] sm:text-[11px] hover:scale-105 active:scale-95 transition-all overflow-hidden group/btn shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
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

          {/* Luxury Border Frame */}
          <div className="absolute inset-0 border-[32px] border-black z-[100] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-[60] pointer-events-none opacity-80" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankEntryOverlay;
