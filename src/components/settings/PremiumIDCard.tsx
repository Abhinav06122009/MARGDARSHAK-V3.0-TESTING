import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Shield, CreditCard, Cpu, QrCode, Sparkles, 
  Camera, Save, CheckCircle2, User, Mail, 
  Hash, Globe, Award, Zap, Fingerprint, 
  Binary, Activity, Wifi, Battery
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

  // 3D Tilt Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), { stiffness: 100, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), { stiffness: 100, damping: 20 });

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
        title: "Avatar Updated",
        description: "Your identification photo has been synchronized.",
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center perspective-1000 py-10">
      {/* Enhanced Lanyard Strap */}
      <div className="relative flex flex-col items-center mb-[-60px] z-20 pointer-events-none">
         {/* Top Anchor */}
         <div className="w-20 h-6 bg-zinc-900 rounded-t-3xl border-t border-x border-white/5 shadow-2xl flex items-center justify-center">
            <div className="w-10 h-1 bg-white/10 rounded-full" />
         </div>
         {/* Ribbon/Strap */}
         <div className="w-28 h-64 bg-zinc-900 relative overflow-hidden flex justify-center border-x border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-emerald-600/80 to-emerald-700/90" />
            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            
            {/* Repeated Branding on Ribbon */}
            <div className="absolute inset-0 flex flex-col items-center justify-around py-4 opacity-30 select-none">
               {[...Array(6)].map((_, i) => (
                 <span key={i} className="text-[8px] font-black tracking-[0.4em] text-white uppercase rotate-90 whitespace-nowrap py-4">
                   MARGDARSHAK SECURE
                 </span>
               ))}
            </div>

            {/* Micro-stitching Effect */}
            <div className="absolute inset-y-0 left-2 w-px bg-white/5" />
            <div className="absolute inset-y-0 right-2 w-px bg-white/5" />
         </div>

         {/* Heavy Metal Connector */}
         <div className="w-16 h-16 bg-gradient-to-br from-zinc-600 to-zinc-800 rounded-2xl border-4 border-zinc-900 shadow-2xl flex items-center justify-center relative -mt-6">
            <div className="w-6 h-6 bg-zinc-900 rounded-full border border-white/10 flex items-center justify-center">
               <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,1)]" />
            </div>
            <div className="absolute -bottom-8 w-1.5 h-10 bg-zinc-700 rounded-full border-x border-black/20" />
         </div>

         {/* Magnetic Clip */}
         <div className="w-24 h-12 bg-gradient-to-b from-zinc-700 to-zinc-900 rounded-2xl border border-white/10 shadow-2xl relative -mt-3 flex items-center justify-center gap-1 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/binding-dark.png')] opacity-20" />
            <div className="w-14 h-1.5 bg-zinc-950 rounded-full shadow-inner" />
            <div className="flex gap-1">
               <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
               <div className="w-1 h-1 bg-white/20 rounded-full" />
            </div>
         </div>
      </div>

      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-[440px] aspect-[1/1.55] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.9)] border border-white/10 group bg-[#0a0a0a]"
      >
        {/* Holographic Watermark Logo */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5 flex items-center justify-center scale-150">
           <Binary className="w-full h-full text-white rotate-12" />
        </div>

        {/* Dynamic Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden opacity-[0.03]">
           <div className="w-full h-[2px] bg-white animate-scanline" />
        </div>

        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05] pointer-events-none" />
        
        {/* Animated Shine Effect */}
        <motion.div 
          animate={{ x: [-1000, 1000], opacity: [0, 0.2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[30deg] pointer-events-none z-40"
        />

        <div className="relative h-full flex flex-col p-10 z-10" style={{ transform: "translateZ(50px)" }}>
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                 <div className="absolute -inset-2 bg-emerald-500/20 blur-lg rounded-full animate-pulse" />
                 <div className="p-3 bg-zinc-900 border border-emerald-500/20 rounded-2xl shadow-2xl relative">
                   <Shield className="w-7 h-7 text-emerald-400" />
                 </div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-white tracking-tighter italic uppercase leading-none">MARGDARSHAK</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex gap-0.5">
                     <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                     <div className="w-1 h-1 bg-emerald-500/50 rounded-full" />
                     <div className="w-1 h-1 bg-emerald-500/20 rounded-full" />
                  </div>
                  <span className="text-[9px] font-black tracking-[0.3em] text-emerald-500/60 uppercase">System Integrity: OK</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
               <div className="px-3 py-1.5 bg-zinc-900/80 border border-white/5 rounded-xl flex items-center gap-2">
                  <Wifi className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-mono text-white/60">NODE-IND-01</span>
               </div>
               <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <span className="text-[10px] font-black text-emerald-400 tracking-widest italic">{tier}</span>
               </div>
            </div>
          </div>

          {/* Portrait Photo Area with Multi-Layer Shadow */}
          <div className="flex flex-col items-center mb-10 relative">
            <div className="relative group/avatar">
              <div className="absolute -inset-8 bg-emerald-500/10 rounded-full blur-[40px] opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700" />
              
              <div className="w-52 h-52 rounded-[3rem] border border-white/10 overflow-hidden relative z-10 bg-black/40 backdrop-blur-md shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-all duration-700 group-hover/avatar:scale-[1.03] group-hover/avatar:shadow-emerald-500/20 group-hover/avatar:border-emerald-500/30">
                <img 
                  src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover group-hover/avatar:scale-110 transition-all duration-1000 ease-out"
                />
                
                {/* HUD Elements Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
                   <div className="w-[80%] h-[80%] border border-white/10 rounded-full animate-ping-slow" />
                   <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/40" />
                   <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/40" />
                   <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/40" />
                   <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/40" />
                </div>

                {/* Upload Overlay */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 cursor-pointer z-20 backdrop-blur-sm"
                >
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                     <Camera className="w-10 h-10 text-white mb-3" />
                  </motion.div>
                  <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] px-4 text-center">Sync Identity Photo</span>
                </button>
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
                    <div className="flex flex-col items-center gap-4">
                       <Zap className="w-10 h-10 text-emerald-400 animate-bounce" />
                       <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Encrypting...</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Floating Bio-Metric Ring */}
              <div className="absolute -bottom-4 -right-4 p-3 bg-zinc-900 rounded-[1.5rem] shadow-2xl border-4 border-[#0a0a0a] z-20 group-hover/avatar:scale-110 transition-transform">
                <Fingerprint className="w-7 h-7 text-emerald-500" />
              </div>
              
              {/* Tiny Status Lights */}
              <div className="absolute top-6 -left-2 flex flex-col gap-1 z-20">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                 <div className="w-2 h-2 bg-white/20 rounded-full" />
                 <div className="w-2 h-2 bg-white/20 rounded-full" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>

          {/* Form Fields with Glassmorphic Inputs */}
          <form onSubmit={onSubmit} className="flex-1 flex flex-col gap-6" style={{ transform: "translateZ(30px)" }}>
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                 <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                    <User size={12} className="text-emerald-500/40" /> Scholar Identity
                 </label>
                 <Activity size={12} className="text-white/10" />
              </div>
              <div className="relative group/input">
                <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-6 py-4.5 bg-zinc-900/50 border border-white/5 rounded-[1.5rem] text-xl font-black text-white placeholder-white/5 focus:outline-none focus:border-emerald-500/30 focus:bg-zinc-900 transition-all tracking-tight uppercase shadow-inner"
                  placeholder="IDENTITY NAME"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                   <Hash size={12} className="text-emerald-500/40" /> Reg ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-5 py-4 bg-zinc-900/50 border border-white/5 rounded-2xl text-sm font-mono text-white/80 placeholder-white/10 focus:outline-none focus:border-emerald-500/30 transition-all uppercase"
                  placeholder="ID-8822"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                   <Globe size={12} className="text-emerald-500/40" /> Since
                </label>
                <div className="px-5 py-4 bg-zinc-900/80 border border-white/5 rounded-2xl text-xs font-mono text-white/40 uppercase tracking-[0.2em] flex items-center justify-center">
                  {joinDate}
                </div>
              </div>
            </div>

            {/* Simulated Signature Area */}
            <div className="mt-4 p-4 border border-white/5 rounded-2xl bg-zinc-900/30 relative overflow-hidden group/sig">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Official Signature</span>
                  <Award size={10} className="text-white/10" />
               </div>
               <div className="h-12 flex items-center justify-center italic font-signature text-emerald-500/40 text-2xl select-none group-hover/sig:text-emerald-500/60 transition-colors">
                  {fullName || 'System Scholar'}
               </div>
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-px bg-white/5" />
            </div>

            <div className="flex-1" />

            {/* Advanced Bottom Toolbar */}
            <div className="flex items-center justify-between mt-auto pt-8 border-t border-white/5" style={{ transform: "translateZ(40px)" }}>
               <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                     <QrCode className="w-10 h-10 text-white/30 hover:text-emerald-500/40 transition-colors" />
                     <div className="flex flex-col">
                        <div className="h-6 w-32 bg-[url('https://www.transparenttextures.com/patterns/barcode-1.png')] opacity-10" />
                        <span className="text-[7px] font-mono text-white/10 tracking-[0.5em] uppercase">VERIFICATION HASH: {user.id.substring(0, 8)}</span>
                     </div>
                  </div>
               </div>
               
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className={`group relative flex items-center justify-center p-5 rounded-[1.5rem] transition-all active:scale-90 ${
                   isSubmitting 
                     ? 'bg-zinc-900' 
                     : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-emerald-500/60'
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
                          <Zap className="w-6 h-6 text-emerald-400" />
                       </motion.div>
                    ) : (
                       <motion.div
                         key="idle"
                         initial={{ scale: 0.8, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         exit={{ scale: 0.8, opacity: 0 }}
                         className="flex items-center gap-3"
                       >
                          <Save className="w-6 h-6 text-white" />
                          <div className="flex flex-col items-start leading-none">
                             <span className="text-[10px] font-black text-white uppercase tracking-widest">Update</span>
                             <span className="text-[8px] font-bold text-white/60 uppercase tracking-tighter">Core Profile</span>
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>
               </button>
            </div>
          </form>
        </div>

        {/* Triple Edge Polish */}
        <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-[3rem] shadow-[inset_0_0_50px_rgba(255,255,255,0.05)] z-50" />
        <div className="absolute inset-0 pointer-events-none border-[8px] border-black/20 rounded-[3rem] z-40" />
        
        {/* Subtle Bottom Battery/Status Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-10 pointer-events-none z-50">
           <Battery size={10} />
           <div className="w-20 h-1 bg-white/20 rounded-full" />
           <Binary size={10} />
        </div>
      </motion.div>
      
      {/* Dynamic Floor Shadow */}
      <motion.div 
         style={{ scaleX: useTransform(rotateY, [-10, 10], [1.1, 0.9]) }}
         className="w-[400px] h-6 bg-black/80 blur-2xl rounded-[100%] mt-8 opacity-60" 
      />
    </div>
  );
};

export default PremiumIDCard;
