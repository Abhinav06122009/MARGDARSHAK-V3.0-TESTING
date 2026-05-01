import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useUser } from '@clerk/react';
import { Crown, Shield, Zap, Sparkles, Star, Cpu, Award, Hexagon, Fingerprint, Activity } from 'lucide-react';

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

      // A+ CLASS: Dual High Ranked (Multiple C-Suite Roles)
      if (userCSuiteCount >= 2) {
        info = {
          tier: 'A+',
          title: 'ZENITH HIGH COMMAND',
          icon: Crown,
          style: {
            gradient: 'from-[#FFD700] via-[#FDB931] to-[#9E7E38]',
            glow: 'rgba(255, 215, 0, 0.6)',
            accent: '#FFD700',
            particles: 'bg-[#FFD700]',
            shimmer: 'from-yellow-400/20 via-transparent to-yellow-600/20',
            border: 'border-yellow-500/50',
            shadow: 'shadow-[0_0_100px_rgba(255,215,0,0.3)]'
          }
        };
      }
      // A CLASS: High Command (Single C-Suite Role)
      else if (userCSuiteCount === 1) {
        const activeRole = normalizedRoles.find(r => cSuiteRoles.includes(r));
        info = {
          tier: 'A',
          title: `CHIEF ${activeRole?.toUpperCase()} OFFICER`,
          icon: Shield,
          style: {
            gradient: 'from-[#E5E4E2] via-[#00F5FF] to-[#00A3FF]',
            glow: 'rgba(0, 245, 255, 0.4)',
            accent: '#00F5FF',
            particles: 'bg-[#E5E4E2]',
            shimmer: 'from-blue-400/20 via-transparent to-cyan-600/20',
            border: 'border-cyan-500/50',
            shadow: 'shadow-[0_0_100px_rgba(0,245,255,0.2)]'
          }
        };
      }
      // B- CLASS: Sovereign Command
      else if (normalizedRoles.some(r => sovereignRoles.includes(r))) {
        const activeRole = normalizedRoles.find(r => sovereignRoles.includes(r));
        info = {
          tier: 'B-',
          title: activeRole === 'owner' ? 'SYSTEM OWNER' : (activeRole === 'superadmin' ? 'SUPER ADMINISTRATOR' : 'SYSTEM ADMINISTRATOR'),
          icon: Zap,
          style: {
            gradient: 'from-[#CD7F32] via-[#A9A9A9] to-[#4A4A4A]',
            glow: 'rgba(205, 127, 50, 0.3)',
            accent: '#CD7F32',
            particles: 'bg-[#A9A9A9]',
            shimmer: 'from-orange-400/20 via-transparent to-zinc-600/20',
            border: 'border-orange-500/40',
            shadow: 'shadow-[0_0_100px_rgba(205,127,50,0.15)]'
          }
        };
      }

      if (!info) return;

      if (info) {
        setRankInfo(info);
        setShow(true);
        
        const timer = setTimeout(() => {
          setShow(false);
          if (onComplete) onComplete();
        }, 5500); // Slightly longer for more impact
        return () => clearTimeout(timer);
      }
    }
  }, [isLoaded, clerkUser, onComplete]);

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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/98 backdrop-blur-3xl overflow-hidden cursor-none"
        >
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ 
                x: [0, 100, -100, 0],
                y: [0, -50, 50, 0],
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.5, 1]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full blur-[150px]"
              style={{ backgroundColor: rankInfo.style.accent }}
            />
            <motion.div
              animate={{ 
                x: [0, -100, 100, 0],
                y: [0, 50, -50, 0],
                opacity: [0.05, 0.2, 0.05],
                scale: [1, 1.8, 1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
              className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] rounded-full blur-[150px] bg-white/5"
            />
            
            {/* Neural Grid with Ripple */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:100px_100px]" />
            <motion.div 
               animate={{ opacity: [0, 0.1, 0], scale: [0.5, 1.5, 0.5] }}
               transition={{ duration: 10, repeat: Infinity }}
               className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0%,transparent_70%)] opacity-5"
            />
          </div>

          {/* 3D Container */}
          <motion.div
            style={{ rotateX, rotateY, perspective: 2000 }}
            className="relative flex flex-col items-center"
          >
            {/* Rank Identifier Card */}
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.5, rotateY: -90 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: 0.3, duration: 1, type: "spring", bounce: 0.4 }}
              className={`relative p-12 rounded-[5rem] bg-white/[0.02] border-2 ${rankInfo.style.border} backdrop-blur-3xl ${rankInfo.style.shadow} group`}
            >
              {/* Shimmer Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${rankInfo.style.shimmer} opacity-40 rounded-[5rem] overflow-hidden`}>
                <motion.div 
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
                />
              </div>

              {/* Energy Arcs (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <motion.circle
                  cx="50%" cy="50%" r="48%"
                  fill="none"
                  stroke={rankInfo.style.accent}
                  strokeWidth="1"
                  strokeDasharray="10 20"
                  animate={{ rotate: 360, opacity: [0.1, 0.5, 0.1] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <motion.circle
                  cx="50%" cy="50%" r="45%"
                  fill="none"
                  stroke={rankInfo.style.accent}
                  strokeWidth="2"
                  strokeDasharray="100 200"
                  animate={{ rotate: -360, opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
              </svg>

              <div className="relative z-10 flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8, type: "spring", damping: 12 }}
                  className="mb-8"
                >
                  <rankInfo.icon className="w-32 h-32" style={{ color: rankInfo.style.accent, filter: `drop-shadow(0 0 20px ${rankInfo.style.glow})` }} />
                </motion.div>
                
                <div className="flex flex-col items-center text-center">
                   <div className="inline-flex items-center gap-4 mb-4 px-6 py-2 rounded-full bg-white/5 border border-white/10">
                      <Fingerprint className="w-4 h-4 text-zinc-500" />
                      <span className="text-[10px] font-black tracking-[0.6em] text-zinc-400 uppercase italic">
                        Biometric Auth Success
                      </span>
                   </div>

                   <h2 className={`text-8xl font-black italic uppercase tracking-tighter bg-gradient-to-b ${rankInfo.style.gradient} bg-clip-text text-transparent px-12 mb-6`}>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 1 }}
                      >
                        {rankInfo.tier} Class
                      </motion.span>
                   </h2>

                   <div className="relative h-8 overflow-hidden mb-8">
                     <motion.div
                       initial={{ y: 50 }}
                       animate={{ y: 0 }}
                       transition={{ delay: 1.5, duration: 0.8, ease: "circOut" }}
                       className="text-2xl font-black text-white/90 italic tracking-widest uppercase"
                     >
                       {rankInfo.title}
                     </motion.div>
                   </div>

                   <div className="flex gap-1.5">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1.8 + i * 0.1 }}
                        >
                          <Star className="w-4 h-4 fill-white text-white" />
                        </motion.div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Decorative Corner Ornaments */}
              <div className="absolute top-8 left-8 flex flex-col gap-1">
                 <div className="w-8 h-[2px] bg-white/20" />
                 <div className="w-[2px] h-8 bg-white/20" />
              </div>
              <div className="absolute top-8 right-8 flex flex-col items-end gap-1">
                 <div className="w-8 h-[2px] bg-white/20" />
                 <div className="w-[2px] h-8 bg-white/20" />
              </div>
            </motion.div>

            {/* Greeting Sub-Section */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.2 }}
              className="mt-16 flex flex-col items-center"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 blur-xl opacity-20" style={{ backgroundColor: rankInfo.style.accent }} />
                <h3 className="relative text-4xl font-black text-white italic uppercase tracking-tight">
                  Welcome Back, Agent {clerkUser?.firstName || clerkUser?.username}
                </h3>
              </div>
              
              <div className="flex items-center gap-8 text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em]">
                 <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <span>Neural Link: 99.8%</span>
                 </div>
                 <div className="w-px h-6 bg-white/10" />
                 <div className="flex items-center gap-3">
                    <Hexagon className="w-4 h-4 text-blue-500" />
                    <span>Enclave 7 Secured</span>
                 </div>
                 <div className="w-px h-6 bg-white/10" />
                 <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4 text-purple-500" />
                    <span>Qwen_Core Primed</span>
                 </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Luxury Border Mask */}
          <div className="absolute inset-0 border-[40px] border-black z-50 pointer-events-none" />
          <div className="absolute inset-0 border border-white/5 z-50 pointer-events-none" />
          
          {/* Progress Bar (Entry Duration) */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 5.5, ease: "linear" }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent origin-left z-[100]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankEntryOverlay;
