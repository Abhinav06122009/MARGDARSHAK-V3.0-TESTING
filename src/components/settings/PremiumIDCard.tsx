import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Shield, Camera, Save, User, Hash, Globe, 
  Cpu, QrCode, Zap, Fingerprint, Target, Radio,
  Activity, RefreshCw, Box, Layers
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

  // High-Precision 3D Physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-300, 300], [10, -10]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-10, 10]), { stiffness: 100, damping: 30 });

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
  
  const getDisplayRole = (role: string) => {
    switch(role?.toLowerCase()) {
      case 'admin': return 'SYSTEM OVERSEER';
      case 'teacher': return 'FACULTY PROCTOR';
      default: return 'ELITE SCHOLAR';
    }
  };

  const tier = getDisplayRole(user.profile?.user_type || 'student');

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

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

      toast({ title: "CRYPTO-SYNC COMPLETE", description: "Identity image re-encrypted." });
      onRefresh();
    } catch (error: any) {
      toast({ title: "SYNC ERROR", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[480px] mx-auto">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full aspect-[1/1.58] rounded-[4rem] overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,0.9),0_0_40px_rgba(16,185,129,0.05)] border border-white/10 bg-[#050505] group"
      >
        {/* CORNER BRACKETS: Surgical Precision */}
        <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-emerald-500/20 rounded-tl-xl" />
        <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-emerald-500/20 rounded-tr-xl" />
        <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-emerald-500/20 rounded-bl-xl" />
        <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-emerald-500/20 rounded-br-xl" />

        {/* SCANLINES & GRAIN */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent animate-pulse pointer-events-none" />

        <div className="relative h-full flex flex-col z-20 p-12 lg:p-14" style={{ transform: "translateZ(60px)" }}>
          
          {/* HEADER SECTION: Balanced Alignment */}
          <div className="flex items-start justify-between mb-16">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                     <Shield size={20} className="text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-black text-white tracking-[-0.05em] uppercase italic leading-none">NEXUS_ID</h2>
               </div>
               <div className="flex items-center gap-2 mt-1 ml-1">
                  <span className="text-[8px] font-mono text-emerald-500/40 uppercase tracking-[0.5em]">AUTH_PROTOCOL_V3</span>
               </div>
            </div>
            <div className="flex flex-col items-end gap-3">
               <div className="px-5 py-2 bg-zinc-950 border border-white/10 rounded-full shadow-2xl">
                  <span className="text-[9px] font-black text-emerald-400 tracking-[0.2em] uppercase italic">{tier}</span>
               </div>
               <div className="flex items-center gap-2 text-[7px] font-mono text-white/20 uppercase tracking-[0.3em]">
                  <Activity size={8} className="text-emerald-500 animate-pulse" />
                  SYNC_STABLE
               </div>
            </div>
          </div>

          {/* AVATAR: Perfectly Centered Circular HUD */}
          <div className="flex flex-col items-center mb-16 relative" style={{ transform: "translateZ(100px)" }}>
             <div className="relative">
                {/* HUD RINGS */}
                <motion.div 
                   animate={{ rotate: 360 }} 
                   transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                   className="absolute -inset-8 border-2 border-dashed border-emerald-500/10 rounded-full" 
                />
                <motion.div 
                   animate={{ rotate: -360 }} 
                   transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                   className="absolute -inset-4 border border-white/5 rounded-full" 
                />
                
                <div className="w-56 h-56 rounded-full border-4 border-white/10 overflow-hidden relative z-10 bg-black shadow-[0_0_60px_rgba(0,0,0,0.8)] group-hover:border-emerald-500/50 transition-all duration-700">
                   <img 
                      src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                   />
                   
                   {/* SCANNING LASER */}
                   <div className="absolute inset-0 pointer-events-none z-20">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,1)] animate-scan-fast" />
                      <div className="absolute inset-0 bg-emerald-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>

                   {/* INTERACTION OVERLAY */}
                   <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-30 backdrop-blur-md cursor-pointer"
                   >
                      <Camera className="w-10 h-10 text-emerald-400 mb-4 animate-bounce" />
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">INIT_UPLOAD</span>
                   </button>
                </div>

                {/* QUANTUM NODE */}
                <div className="absolute bottom-2 -right-2 p-5 bg-[#050505] rounded-full border border-emerald-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-20 group-hover:scale-110 transition-transform">
                   <Cpu className="w-8 h-8 text-emerald-400" />
                </div>
             </div>
             <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>

          {/* INPUT SYSTEM: Perfectly Aligned */}
          <form onSubmit={onSubmit} className="space-y-10 flex-1 flex flex-col" style={{ transform: "translateZ(40px)" }}>
             <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.6em] flex items-center gap-3">
                      <User size={10} className="text-emerald-500/40" /> Identity_Handle
                   </label>
                   <span className="text-[8px] font-mono text-emerald-500/20">REG_ACTIVE</span>
                </div>
                <div className="relative group/field">
                   <input
                     type="text"
                     value={fullName}
                     onChange={(e) => setFullName(e.target.value)}
                     className="w-full px-10 py-6 bg-zinc-950/50 border border-white/5 rounded-3xl text-2xl font-black text-white focus:outline-none focus:border-emerald-500/40 transition-all uppercase placeholder-white/5 shadow-inner"
                     placeholder="NULL_IDENTITY"
                   />
                   <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-focus-within/field:opacity-100 transition-opacity">
                      <Zap size={16} className="text-emerald-500 animate-pulse" />
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                   <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.6em] ml-2">S_ID</label>
                   <input
                     type="text"
                     value={studentId}
                     onChange={(e) => setStudentId(e.target.value)}
                     className="w-full px-8 py-5 bg-zinc-950/50 border border-white/5 rounded-2xl text-sm font-mono text-white/60 focus:outline-none focus:border-emerald-500/40 transition-all uppercase"
                     placeholder="ID_000"
                   />
                </div>
                <div className="space-y-4">
                   <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.6em] text-right block pr-2">Matrix_EST</label>
                   <div className="px-8 py-5 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl text-[10px] font-black text-emerald-500/40 uppercase tracking-widest text-center flex items-center justify-center h-[62px]">
                     {joinDate}
                   </div>
                </div>
             </div>

             {/* AUTH_SIGNATURE */}
             <div className="mt-auto pt-10 border-t border-white/5 flex items-end justify-between">
                <div className="flex flex-col gap-4">
                   <div className="h-12 italic font-signature text-emerald-500/30 text-5xl tracking-tighter">
                      {fullName || 'Nexus_Link'}
                   </div>
                   <div className="flex items-center gap-3">
                      <Fingerprint size={14} className="text-emerald-500/20" />
                      <span className="text-[7px] font-mono text-white/10 uppercase tracking-[0.3em]">SECURE_ID: {user.id.substring(0, 16).toUpperCase()}</span>
                   </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative group/btn flex items-center gap-5 px-12 py-6 rounded-[2rem] bg-emerald-500 text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_30px_60px_-15px_rgba(16,185,129,0.5)] disabled:opacity-30 overflow-hidden"
                >
                   <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                   {isSubmitting ? <RefreshCw className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                   {isSubmitting ? 'SYNCING' : 'PUSH_CHANGES'}
                </button>
             </div>
          </form>
        </div>
      </motion.div>
      
      {/* SHADOW BASE */}
      <div className="w-[80%] h-6 bg-emerald-500/5 blur-[50px] rounded-full mt-12 animate-pulse" />
    </div>
  );
};

export default PremiumIDCard;
