import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Shield, CreditCard, Cpu, QrCode, Sparkles, 
  Camera, Save, CheckCircle2, User, Mail, 
  Hash, Globe, Award, Zap, Fingerprint, 
  Binary, Activity, Wifi, Battery, Lock,
  ChevronRight, RefreshCw, Layers, Boxes,
  Hexagon, Target, Radio
} from 'lucide-react';
import { SecureUser } from '@/hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PremiumIDCardProps {
  user: SecureUser;
  fullName: string;
  setFullName: (val: string) => void;
  studentId: string;
  setStudentId: (val: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onRefresh: () => void;
}

const PremiumIDCard: React.FC<PremiumIDCardProps> = ({ 
  user, 
  fullName, 
  setFullName, 
  studentId, 
  setStudentId, 
  isSubmitting, 
  onSubmit,
  onRefresh
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Ultimate 3D Physics with Parallax
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-200, 200], [20, -20]), { stiffness: 150, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-200, 200], [-20, 20]), { stiffness: 150, damping: 30 });

  // Parallax offsets for different layers
  const photoZ = useSpring(useTransform(y, [-200, 200], [40, -40]), { stiffness: 200, damping: 40 });
  const photoX = useSpring(useTransform(x, [-200, 200], [-10, 10]), { stiffness: 200, damping: 40 });
  const chipZ = useSpring(useTransform(y, [-200, 200], [80, -80]), { stiffness: 250, damping: 30 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  const joinDate = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'EST. 2024';
  const tier = user.profile?.user_type === 'admin' ? 'SYSTEM OVERSEER' : (user.profile?.subscription_tier?.toUpperCase() || 'ELITE SCHOLAR');

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "CORE SYNC COMPLETE",
        description: "Bio-metric data has been re-indexed.",
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "SYNC INTERRUPTED",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-10 perspective-2000">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 100, rotateY: -30 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        className="relative w-full max-w-[440px] aspect-[1/1.6] rounded-[4rem] overflow-hidden shadow-[0_80px_160px_rgba(0,0,0,1)] border border-white/20 group bg-[#020202]"
      >
        {/* INSANE HOLOGRAPHIC LAYERS */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-black to-purple-500/20" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay" />
        
        {/* Animated Cybergrid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />

        {/* Floating Particles in Card */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           {[...Array(20)].map((_, i) => (
             <motion.div 
               key={i}
               animate={{ 
                  y: [0, -100, 0],
                  x: [0, Math.random() * 50 - 25, 0],
                  opacity: [0, 0.4, 0]
               }}
               transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "linear" }}
               className="absolute w-1 h-1 bg-emerald-500 rounded-full"
               style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
             />
           ))}
        </div>

        {/* Dynamic Light Sweep */}
        <motion.div 
          animate={{ x: [-1000, 1000] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 4 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent skew-x-[45deg] z-10"
        />

        <div className="relative h-full flex flex-col p-12 z-20" style={{ transform: "translateZ(80px)" }}>
          {/* Header Area */}
          <div className="flex justify-between items-start mb-14" style={{ transform: "translateZ(40px)" }}>
            <div className="flex items-center gap-5">
              <div className="relative">
                 <div className="absolute -inset-4 bg-emerald-500/40 blur-3xl rounded-full animate-pulse" />
                 <div className="p-4 bg-zinc-950 border border-emerald-500/50 rounded-[2rem] relative shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                   <Shield className="w-9 h-9 text-emerald-400" />
                 </div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-3xl font-black text-white tracking-[-0.08em] italic uppercase leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">MARGDARSHAK</h2>
                <div className="flex items-center gap-2 mt-2">
                   <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      <div className="w-1.5 h-1.5 bg-emerald-500/20 rounded-full" />
                   </div>
                   <span className="text-[10px] font-black tracking-[0.4em] text-emerald-500/60 uppercase">System Active</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
               <div className="px-4 py-1.5 bg-zinc-950 border border-white/5 rounded-xl flex items-center gap-3 backdrop-blur-xl">
                  <Radio size={12} className="text-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">CORE-LINK-99</span>
               </div>
               <div className="px-5 py-2 bg-gradient-to-r from-emerald-600/20 to-emerald-800/20 border border-emerald-500/30 rounded-xl backdrop-blur-md">
                  <span className="text-[10px] font-black text-emerald-400 tracking-[0.3em] italic uppercase">{tier}</span>
               </div>
            </div>
          </div>

          {/* Bio-Metric Display (PARALLAX LAYER) */}
          <div className="flex flex-col items-center mb-14 relative" style={{ transform: "translateZ(100px)" }}>
            <motion.div 
               style={{ x: photoX, y: photoZ }}
               className="relative group/avatar"
            >
              <div className="absolute -inset-16 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-1000" />
              
              {/* Spinning Orbital Rings */}
              <div className="absolute inset-[-20px] border border-emerald-500/10 rounded-full animate-spin-slow pointer-events-none" />
              <div className="absolute inset-[-30px] border border-emerald-500/5 rounded-full animate-reverse-spin pointer-events-none" />

              <div className="w-60 h-60 rounded-[4rem] border border-white/20 overflow-hidden relative z-10 bg-black shadow-[0_50px_100px_rgba(0,0,0,0.9)] transition-all duration-1000 group-hover/avatar:scale-[1.05] group-hover/avatar:shadow-emerald-500/20">
                <img 
                  src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover group-hover/avatar:scale-110 transition-all duration-1000 grayscale-[0.2] group-hover/avatar:grayscale-0"
                />
                
                {/* HUD Camera Aperture Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-20 group-hover/avatar:opacity-40 transition-opacity">
                   <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-emerald-500" />
                   <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-emerald-500" />
                   <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-emerald-500" />
                   <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-emerald-500" />
                   <Target className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 text-emerald-500/30 animate-pulse" />
                </div>

                {/* Interaction Overlay */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 cursor-pointer z-20 backdrop-blur-sm"
                >
                  <Camera className="w-14 h-14 text-white mb-4 animate-bounce" />
                  <span className="text-[12px] font-black text-white uppercase tracking-[0.4em] px-10 text-center">Update Identity Seed</span>
                </button>
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-30">
                    <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Re-Encoding...</span>
                  </div>
                )}
              </div>
              
              {/* ADVANCED QUANTUM CHIP (PARALLAX LAYER) */}
              <motion.div 
                style={{ translateZ: chipZ }}
                className="absolute -bottom-8 -right-8 p-5 bg-zinc-950 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,1)] border border-emerald-500/40 z-20 group-hover/avatar:rotate-12 transition-transform duration-700"
              >
                 <div className="relative">
                    <Cpu className="w-10 h-10 text-emerald-400" />
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl animate-pulse" />
                 </div>
              </motion.div>
            </motion.div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>

          {/* Data Fields with Neomorphic Glass */}
          <form onSubmit={onSubmit} className="flex-1 flex flex-col gap-8" style={{ transform: "translateZ(60px)" }}>
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                 <label className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] flex items-center gap-3">
                    <User size={14} className="text-emerald-500/30" /> Identification
                 </label>
                 <Activity size={14} className="text-emerald-500/10" />
              </div>
              <div className="relative group/input">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-purple-500/30 blur-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-700" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-8 py-5 bg-zinc-950 border border-white/5 rounded-[2.5rem] text-2xl font-black text-white placeholder-white/5 focus:outline-none focus:border-emerald-500/30 focus:bg-black transition-all tracking-tight uppercase shadow-inner"
                  placeholder="ID ENTITY NAME"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] ml-2 flex items-center gap-3">
                   <Hash size={14} className="text-emerald-500/30" /> Registry
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-6 py-4.5 bg-zinc-950 border border-white/5 rounded-[2rem] text-sm font-mono text-white/80 placeholder-white/10 focus:outline-none focus:border-emerald-500/30 transition-all uppercase"
                  placeholder="ID-CORE"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] ml-2 flex items-center gap-3">
                   <Globe size={14} className="text-emerald-500/30" /> Established
                </label>
                <div className="px-6 py-4.5 bg-black border border-white/5 rounded-[2rem] text-[10px] font-mono text-emerald-400/40 uppercase tracking-[0.4em] flex items-center justify-center font-black">
                  {joinDate}
                </div>
              </div>
            </div>

            {/* Quantum Signature Area */}
            <div className="mt-4 p-8 border border-white/5 rounded-[3rem] bg-zinc-950 relative overflow-hidden group/sig backdrop-blur-3xl">
               <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-purple-500/5 pointer-events-none" />
               <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.6em]">Encrypted Signature</span>
                  <div className="flex gap-1">
                     <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                     <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse delay-75" />
                     <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse delay-150" />
                  </div>
               </div>
               <div className="h-20 flex items-center justify-center italic font-signature text-emerald-400/40 text-5xl select-none group-hover/sig:text-emerald-400 group-hover/sig:scale-110 transition-all duration-1000 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  {fullName || 'Nexus Scholar'}
               </div>
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-[1.5px] bg-white/5" />
            </div>

            {/* Bottom Sync Control */}
            <div className="flex items-center justify-between mt-auto pt-10 border-t border-white/5" style={{ transform: "translateZ(80px)" }}>
               <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-5">
                     <QrCode className="w-16 h-16 text-white/10 hover:text-emerald-500 hover:scale-110 transition-all duration-500" />
                     <div className="flex flex-col">
                        <div className="h-8 w-44 bg-[url('https://www.transparenttextures.com/patterns/barcode-1.png')] opacity-10" />
                        <span className="text-[9px] font-mono text-white/10 tracking-[0.6em] uppercase mt-2">UUID_NODESTACK_{user.id.substring(0, 12).toUpperCase()}</span>
                     </div>
                  </div>
               </div>
               
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className={`group relative flex items-center justify-center w-24 h-24 rounded-[2.5rem] transition-all active:scale-90 ${
                   isSubmitting 
                     ? 'bg-zinc-900' 
                     : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_60px_rgba(16,185,129,0.6)] hover:shadow-emerald-400/90'
                 }`}
               >
                 <AnimatePresence mode="wait">
                    {isSubmitting ? (
                       <motion.div
                         key="loading"
                         initial={{ rotate: 0 }}
                         animate={{ rotate: 360 }}
                         transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                       >
                          <Zap className="w-10 h-10 text-emerald-200" />
                       </motion.div>
                    ) : (
                       <motion.div
                         key="idle"
                         initial={{ scale: 0.8, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         exit={{ scale: 0.8, opacity: 0 }}
                         className="flex flex-col items-center gap-1"
                       >
                          <Save className="w-10 h-10 text-black" />
                          <span className="text-[10px] font-black text-black uppercase tracking-tighter">Sync</span>
                       </motion.div>
                    )}
                 </AnimatePresence>
               </button>
            </div>
          </form>
        </div>

        {/* TRIPLE REINFORCED EDGES */}
        <div className="absolute inset-0 pointer-events-none border-[3px] border-white/20 rounded-[4rem] z-50" />
        <div className="absolute inset-[10px] pointer-events-none border border-white/5 rounded-[3.5rem] z-40 shadow-[inset_0_0_60px_rgba(255,255,255,0.05)]" />
      </motion.div>
      
      {/* Dynamic 3D Perspective Ground Shadow */}
      <motion.div 
         style={{ 
            scaleX: useTransform(rotateY, [-20, 20], [1.3, 0.7]),
            rotateX: "80deg",
            translateZ: "-100px"
         }}
         className="w-[500px] h-12 bg-black/90 blur-[50px] rounded-[100%] mt-12 opacity-80" 
      />
    </div>
  );
};

export default PremiumIDCard;
