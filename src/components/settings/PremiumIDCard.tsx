import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Shield, CreditCard, Cpu, QrCode, Sparkles, 
  Camera, Save, CheckCircle2, User, Mail, 
  Hash, Globe, Award, Zap, Fingerprint, 
  Binary, Activity, Wifi, Battery, AlertTriangle,
  Layers, Lock, Database
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

  // Advanced 3D Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-150, 150], [15, -15]), { stiffness: 120, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-150, 150], [-15, 15]), { stiffness: 120, damping: 25 });
  
  // Shimmer/Glow position based on tilt
  const shimmerX = useTransform(x, [-150, 150], [0, 100]);
  const shimmerY = useTransform(y, [-150, 150], [0, 100]);

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
  
  const joinDate = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'APR 2024';
  const validThru = "APR 2028";
  const tier = user.profile?.user_type === 'admin' ? 'SYSTEM ADMIN' : (user.profile?.subscription_tier?.toUpperCase() || 'STANDARD SCHOLAR');

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
        title: "Identity Synchronized",
        description: "Bio-metric identification photo updated successfully.",
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-20 relative min-h-[900px]">
      
      {/* Left-Rounded Lanyard System */}
      <div className="absolute top-0 left-[-100px] w-[400px] h-[500px] pointer-events-none z-0">
         {/* Curved Strap */}
         <svg className="w-full h-full" viewBox="0 0 400 500">
            <path 
               d="M 0,100 C 150,100 220,150 220,350" 
               fill="none" 
               stroke="url(#strapGradient)" 
               strokeWidth="32" 
               strokeLinecap="round"
               className="drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
            />
            <path 
               d="M 0,100 C 150,100 220,150 220,350" 
               fill="none" 
               stroke="white" 
               strokeOpacity="0.05"
               strokeWidth="32" 
               strokeDasharray="2,10"
               strokeLinecap="round"
            />
            <defs>
               <linearGradient id="strapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#09090b" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#047857" />
               </linearGradient>
            </defs>
         </svg>
         
         {/* Metal Clip at the end of path (approx 220, 350) */}
         <div className="absolute left-[202px] top-[335px] w-12 h-20 bg-gradient-to-br from-zinc-500 to-zinc-800 rounded-2xl border-2 border-zinc-900 shadow-2xl flex flex-col items-center py-3">
            <div className="w-6 h-6 bg-zinc-900 rounded-full border border-white/10 flex items-center justify-center">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
            </div>
            <div className="flex-1 w-1 bg-zinc-950 mt-2 rounded-full opacity-50" />
            <div className="w-10 h-1 bg-white/10 rounded-full mb-1" />
         </div>
      </div>

      {/* Main Card Container */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, scale: 0.8, x: 50 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        className="relative w-full max-w-[460px] aspect-[1/1.58] rounded-[3.5rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,1)] border border-white/20 group bg-[#050505] z-10"
      >
        {/* HOLOGRAPHIC BACKGROUND MAX ENHANCED */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-purple-500/10" />
        
        {/* Matrix/Binary Digital Rain Background */}
        <div className="absolute inset-0 opacity-[0.03] overflow-hidden pointer-events-none">
           {[...Array(10)].map((_, i) => (
             <motion.div 
               key={i}
               initial={{ y: -100 }}
               animate={{ y: 800 }}
               transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
               className="absolute text-[8px] font-mono text-emerald-400 whitespace-nowrap"
               style={{ left: `${i * 10}%` }}
             >
                {Math.random().toString(2).substring(2, 20)}
             </motion.div>
           ))}
        </div>

        {/* HUD Scanline */}
        <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.05]">
           <div className="w-full h-[3px] bg-white animate-scanline shadow-[0_0_10px_white]" />
        </div>

        {/* Reactive Shimmer */}
        <motion.div 
          style={{ 
            background: "radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)",
            left: useTransform(shimmerX, [0, 100], ["-20%", "120%"]),
            top: useTransform(shimmerY, [0, 100], ["-20%", "120%"]),
          }}
          className="absolute w-[200%] h-[200%] pointer-events-none z-40 blur-3xl opacity-30"
        />

        <div className="relative h-full flex flex-col p-12 z-20" style={{ transform: "translateZ(60px)" }}>
          {/* Header with High-Tech Badge */}
          <div className="flex justify-between items-start mb-12">
            <div className="flex items-center gap-5">
              <div className="relative">
                 <div className="absolute -inset-4 bg-emerald-500/30 blur-2xl rounded-full animate-pulse" />
                 <div className="p-4 bg-zinc-900 border border-emerald-500/40 rounded-3xl shadow-2xl relative">
                   <Shield className="w-8 h-8 text-emerald-400" />
                 </div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-white tracking-[-0.05em] italic uppercase leading-none">MARGDARSHAK</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[10px] font-black tracking-[0.2em] text-emerald-400 uppercase">SECURE</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
               <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 backdrop-blur-md">
                  <Wifi size={14} className="text-emerald-500" />
                  <span className="text-[11px] font-black text-white/80 tracking-widest uppercase">ALPHA-CORE</span>
               </div>
               <div className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-xl shadow-lg shadow-emerald-900/20">
                  <span className="text-[11px] font-black text-white tracking-[0.2em] italic uppercase">{tier}</span>
               </div>
            </div>
          </div>

          {/* Photo Area with Silicon Chip Detail */}
          <div className="flex flex-col items-center mb-12 relative">
            <div className="relative group/avatar">
              {/* Outer Glowing Rings */}
              <div className="absolute -inset-12 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
              <div className="absolute -inset-2 border-2 border-emerald-500/20 rounded-[3.5rem] opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700 animate-ping-slow" />
              
              <div className="w-56 h-56 rounded-[3.5rem] border-2 border-white/10 overflow-hidden relative z-10 bg-black/60 backdrop-blur-md shadow-[0_40px_80px_rgba(0,0,0,0.8)] transition-all duration-700 group-hover/avatar:scale-[1.04] group-hover/avatar:border-emerald-500/40">
                <img 
                  src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover group-hover/avatar:scale-105 transition-all duration-1000 ease-out"
                />
                
                {/* HUD Camera Lens Effect */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                   <div className="w-[90%] h-[90%] border-[0.5px] border-emerald-500/30 rounded-full" />
                   <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-emerald-500/60" />
                   <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-emerald-500/60" />
                   <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-emerald-500/60" />
                   <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-emerald-500/60" />
                </div>

                {/* Upload Trigger */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 cursor-pointer z-20 backdrop-blur-md"
                >
                  <Camera className="w-12 h-12 text-white mb-4 animate-bounce" />
                  <span className="text-[12px] font-black text-white uppercase tracking-[0.3em] px-8 text-center">BIOMETRIC UPDATE</span>
                </button>
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-30">
                    <div className="flex flex-col items-center gap-5">
                       <Database className="w-12 h-12 text-emerald-400 animate-pulse" />
                       <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">SYNCHRONIZING...</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* SILICON CHIP ORNAMENT - MAX ENHANCED */}
              <div className="absolute -bottom-6 -right-6 p-4 bg-zinc-900 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.8)] border-4 border-[#050505] z-20 transition-transform duration-500 group-hover/avatar:rotate-[15deg]">
                 <div className="relative">
                    <Cpu className="w-9 h-9 text-emerald-500" />
                    {/* Micro-Circuit Paths */}
                    <div className="absolute top-[-20px] left-[-20px] w-20 h-20 pointer-events-none opacity-20 border border-emerald-500/50 rounded-full" />
                 </div>
              </div>
              
              {/* Identity Verification Mark */}
              <div className="absolute top-8 -left-4 p-2 bg-emerald-500 rounded-lg shadow-xl z-20 flex items-center gap-2">
                 <CheckCircle2 size={14} className="text-white" />
                 <span className="text-[9px] font-black text-white uppercase pr-1">VERIFIED</span>
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>

          {/* Form Fields - MAX ENHANCED DESIGN */}
          <form onSubmit={onSubmit} className="flex-1 flex flex-col gap-8" style={{ transform: "translateZ(40px)" }}>
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                 <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] flex items-center gap-3">
                    <User size={14} className="text-emerald-500" /> IDENTITY IDENTITY
                 </label>
                 <Activity size={14} className="text-emerald-500/20" />
              </div>
              <div className="relative group/input">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-transparent blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 rounded-[2rem] text-2xl font-black text-white placeholder-white/5 focus:outline-none focus:border-emerald-500/30 focus:bg-zinc-900/40 transition-all tracking-tight uppercase shadow-inner"
                  placeholder="RECOGNISED NAME"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] ml-2 flex items-center gap-3">
                   <Hash size={14} className="text-emerald-500" /> SCHOLAR ID
                </label>
                <div className="relative">
                   <input
                     type="text"
                     value={studentId}
                     onChange={(e) => setStudentId(e.target.value)}
                     className="w-full px-6 py-4.5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] text-sm font-mono text-white placeholder-white/10 focus:outline-none focus:border-emerald-500/30 transition-all uppercase"
                     placeholder="ID-8800"
                   />
                   <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-white/10" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] ml-2 flex items-center gap-3">
                   <Globe size={14} className="text-emerald-500" /> VALID THRU
                </label>
                <div className="px-6 py-4.5 bg-zinc-900/80 border border-white/5 rounded-[1.5rem] text-sm font-mono text-emerald-500/60 uppercase tracking-[0.2em] flex items-center justify-center font-black">
                  {validThru}
                </div>
              </div>
            </div>

            {/* Signature Area MAX ENHANCED */}
            <div className="mt-2 p-6 border border-white/5 rounded-[2rem] bg-zinc-900/40 relative overflow-hidden group/sig backdrop-blur-xl">
               <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
               <div className="flex justify-between items-center mb-6">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">CERTIFIED SIGNATURE</span>
                  <Award size={14} className="text-emerald-500/20" />
               </div>
               <div className="h-16 flex items-center justify-center italic font-signature text-emerald-400/50 text-4xl select-none group-hover/sig:text-emerald-400 transition-all duration-500 scale-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  {fullName || 'System User'}
               </div>
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] h-[1px] bg-white/10" />
            </div>

            <div className="flex-1" />

            {/* Advanced Multi-Stage Sync Button */}
            <div className="flex items-center justify-between mt-auto pt-10 border-t border-white/5" style={{ transform: "translateZ(60px)" }}>
               <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                     <QrCode className="w-14 h-14 text-white/20 hover:text-emerald-500 transition-all duration-500 cursor-help" />
                     <div className="flex flex-col">
                        <div className="h-8 w-40 bg-[url('https://www.transparenttextures.com/patterns/barcode-1.png')] opacity-20 hover:opacity-40 transition-opacity" />
                        <span className="text-[8px] font-mono text-white/10 tracking-[0.6em] uppercase mt-1">HASH ID: {user.id.substring(0, 16)}</span>
                     </div>
                  </div>
               </div>
               
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className={`group relative flex items-center justify-center p-6 rounded-[2rem] transition-all active:scale-90 ${
                   isSubmitting 
                     ? 'bg-zinc-800' 
                     : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:shadow-emerald-400/80'
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
                          <Zap className="w-8 h-8 text-emerald-300" />
                       </motion.div>
                    ) : (
                       <motion.div
                         key="idle"
                         initial={{ scale: 0.8, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         exit={{ scale: 0.8, opacity: 0 }}
                         className="flex items-center gap-4"
                       >
                          <Save className="w-8 h-8 text-white" />
                          <div className="flex flex-col items-start leading-tight">
                             <span className="text-[12px] font-black text-white uppercase tracking-widest">SYNC</span>
                             <span className="text-[9px] font-bold text-white/50 uppercase tracking-tighter">DATA NODE</span>
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>
               </button>
            </div>
          </form>
        </div>

        {/* Triple-Layer Outer Edge Finish */}
        <div className="absolute inset-0 pointer-events-none border-[1.5px] border-white/20 rounded-[3.5rem] z-50" />
        <div className="absolute inset-[8px] pointer-events-none border border-white/5 rounded-[3rem] z-40" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 via-transparent to-white/10 opacity-30 z-50" />
      </motion.div>
      
      {/* Visual Perspective Ground Shadow */}
      <motion.div 
         style={{ 
            scaleX: useTransform(rotateY, [-15, 15], [1.2, 0.8]),
            rotate: useTransform(rotateY, [-15, 15], [-5, 5]),
         }}
         className="w-[450px] h-8 bg-black/90 blur-[40px] rounded-[100%] mt-12 opacity-80" 
      />
    </div>
  );
};

export default PremiumIDCard;
