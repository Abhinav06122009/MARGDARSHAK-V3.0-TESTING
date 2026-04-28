import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Shield, Edit2, Save, User, Hash, Globe, 
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

  // High-Precision 3D Physics (Optimized for performance)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-300, 300], [8, -8]), { stiffness: 80, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-8, 8]), { stiffness: 80, damping: 25 });

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
        className="relative w-full aspect-[1/1.55] rounded-[4rem] overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,1),0_0_80px_rgba(16,185,129,0.05)] border border-white/5 bg-[#030303] group"
      >
        {/* ULTRA-GLASS SIEVE TEXTURE */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-20 pointer-events-none" />

        <div className="relative h-full flex flex-col z-20 p-12 lg:p-14" style={{ transform: "translateZ(50px)" }}>
          
          {/* HEADER SECTION: Surgical & Compact */}
          <div className="flex items-start justify-between mb-12">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                     <Shield size={18} className="text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-black text-white tracking-[-0.05em] uppercase italic leading-none">NEXUS_ID</h2>
               </div>
               <span className="text-[7px] font-mono text-white/20 uppercase tracking-[0.6em] ml-1">AUTH_LEVEL_MAX</span>
            </div>
            <div className="flex flex-col items-end gap-3">
               <div className="px-5 py-2 bg-zinc-950/80 border border-emerald-500/20 rounded-full shadow-2xl backdrop-blur-md">
                  <span className="text-[9px] font-black text-emerald-400 tracking-[0.2em] uppercase italic">{tier}</span>
               </div>
            </div>
          </div>

          {/* AVATAR: Centered with Tiny Pen Icon */}
          <div className="flex flex-col items-center mb-12 relative" style={{ transform: "translateZ(80px)" }}>
             <div className="relative group/avatar">
                {/* HUD CIRCLE */}
                <div className="absolute -inset-4 border border-emerald-500/10 rounded-full animate-spin-slow pointer-events-none" />
                <div className="absolute -inset-1 border border-white/5 rounded-full pointer-events-none" />
                
                <div className="w-52 h-52 rounded-full border-4 border-white/10 overflow-hidden relative z-10 bg-black shadow-2xl">
                   <img 
                      src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                   />
                   
                   {/* SCANNING LASER */}
                   <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-emerald-400/30 animate-scan-fast" />
                   </div>
                </div>

                {/* TINY PEN SYMBOL: Only appears on hover or after upload */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 w-12 h-12 bg-emerald-500 text-black rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(16,185,129,0.3)] z-30 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/avatar:opacity-100 border-4 border-black"
                >
                   {isUploading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Edit2 size={18} className="font-bold" />}
                </button>

                {/* STATUS INDICATOR */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-black z-20 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
             </div>
             <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>

          {/* FORM FIELDS: Perfect Alignment */}
          <form onSubmit={onSubmit} className="space-y-8 flex-1" style={{ transform: "translateZ(30px)" }}>
             <div className="space-y-3">
                <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.8em] ml-2 flex items-center gap-2">
                   <User size={10} className="text-emerald-500/30" /> IDENTIFIER
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-10 py-6 bg-zinc-950/40 border border-white/5 rounded-3xl text-2xl font-black text-white focus:outline-none focus:border-emerald-500/40 transition-all uppercase placeholder-white/5 shadow-inner"
                  placeholder="IDENTITY_NULL"
                />
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                   <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.8em] ml-2">REG_ID</label>
                   <input
                     type="text"
                     value={studentId}
                     onChange={(e) => setStudentId(e.target.value)}
                     className="w-full px-8 py-5 bg-zinc-950/40 border border-white/5 rounded-2xl text-xs font-mono text-white/40 focus:outline-none focus:border-emerald-500/40 transition-all uppercase"
                     placeholder="000_000"
                   />
                </div>
                <div className="space-y-3">
                   <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.8em] text-right block pr-2">SYNCED</label>
                   <div className="px-8 py-5 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl text-[9px] font-black text-emerald-400/40 uppercase tracking-widest text-center flex items-center justify-center h-[58px]">
                     {joinDate}
                   </div>
                </div>
             </div>

             {/* SIGNATURE & SUBMIT */}
             <div className="mt-auto pt-8 border-t border-white/5 flex items-end justify-between gap-6">
                <div className="flex flex-col gap-3">
                   <div className="h-10 italic font-signature text-emerald-500/20 text-4xl">
                      {fullName || 'Nexus_Identity'}
                   </div>
                   <div className="flex items-center gap-2">
                      <Fingerprint size={12} className="text-emerald-500/20" />
                      <span className="text-[6px] font-mono text-white/10 uppercase tracking-[0.4em]">UUID_ENCRYPTED</span>
                   </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative group/btn flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-emerald-500 text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] disabled:opacity-30"
                >
                   {isSubmitting ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save size={16} />}
                   SYNC
                </button>
             </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumIDCard;
