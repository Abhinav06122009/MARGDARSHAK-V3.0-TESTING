import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Shield, Edit2, Save, User, Hash, Globe, 
  Cpu, QrCode, Zap, Fingerprint, Target, Radio,
  Activity, RefreshCw, Box, Layers, Sparkles,
  Command, Terminal, ZapOff
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
  const [isClicked, setIsClicked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // OPTIMIZED 3D PHYSICS
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

  const handleCardClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 800);
  };
  
  const joinDate = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'EST. 2024';
  
  const getDisplayRole = (role: string) => {
    switch(role?.toLowerCase()) {
      case 'admin': return 'SYSTEM_OVERSEER';
      case 'teacher': return 'FACULTY_PROCTOR';
      default: return 'ELITE_SCHOLAR';
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
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
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
    <div className="flex flex-col items-center justify-center w-full max-w-[460px] mx-auto perspective-1000 will-change-transform">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full aspect-[1/1.58] rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border border-white/10 bg-[#050505] group cursor-pointer"
      >
        {/* NEON CLICK EFFECT */}
        <AnimatePresence>
           {isClicked && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1.2 }}
               exit={{ opacity: 0, scale: 1.5 }}
               className="absolute inset-0 z-50 border-4 border-emerald-500 rounded-[3.5rem] shadow-[0_0_100px_rgba(16,185,129,0.8),inset_0_0_50px_rgba(16,185,129,0.4)] pointer-events-none"
             />
           )}
        </AnimatePresence>

        {/* INDUSTRIAL TEXTURE */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-fuchsia-500/5 pointer-events-none" />

        {/* RIBBON: Rounded left role tag */}
        <div className="absolute top-10 left-0 z-40">
           <div className="bg-emerald-500 px-6 py-2 rounded-r-full shadow-[5px_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 border-y border-r border-white/20">
              <Sparkles size={12} className="text-black" />
              <span className="text-[10px] font-black text-black uppercase tracking-widest italic">{tier}</span>
           </div>
        </div>

        <div className="relative h-full flex flex-col z-20 p-10 lg:p-12" style={{ transform: "translateZ(50px)" }}>
          
          {/* HEADER SECTION */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                     <Shield size={16} className="text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-black text-white tracking-[-0.05em] uppercase italic leading-none">NEXUS_CORE</h2>
               </div>
               <span className="text-[7px] font-mono text-white/20 uppercase tracking-[0.5em] ml-1">SYSTEM_ACCESS_GRANTED</span>
            </div>
            <div className="flex flex-col items-end">
               <div className="text-[8px] font-black text-emerald-500/40 uppercase tracking-[0.3em]">NODE_SYNC</div>
               <div className="text-[10px] font-mono text-fuchsia-400 font-bold">{studentId || 'ID_PENDING'}</div>
            </div>
          </div>

          {/* AVATAR: Centered HUD */}
          <div className="flex flex-col items-center mb-12 relative" style={{ transform: "translateZ(80px)" }}>
             <div className="relative group/avatar">
                {/* HUD RINGS */}
                <div className="absolute -inset-6 border border-emerald-500/10 rounded-full animate-spin-slow pointer-events-none" />
                <div className="absolute -inset-2 border border-white/5 rounded-full pointer-events-none" />
                
                <div className="w-52 h-52 rounded-full border-4 border-white/10 overflow-hidden relative z-10 bg-black shadow-2xl">
                   <img 
                      src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                   />
                   {/* SCANNER */}
                   <div className="absolute inset-0 pointer-events-none z-20">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,1)] animate-scan-fast" />
                   </div>
                </div>

                {/* PEN BUTTON: Rounded Cyan */}
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="absolute bottom-1 right-1 w-12 h-12 bg-cyan-500 text-black rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(34,211,238,0.3)] z-30 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/avatar:opacity-100 border-4 border-[#050505]"
                >
                   {isUploading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Edit2 size={18} />}
                </button>
             </div>
             <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>

          {/* INPUT FIELDS */}
          <form onSubmit={onSubmit} className="space-y-6 flex-1" style={{ transform: "translateZ(30px)" }}>
             <div className="space-y-2">
                <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.8em] ml-2">IDENTITY_NAME</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-8 py-5 bg-zinc-950/40 border border-white/5 rounded-[2rem] text-2xl font-black text-white focus:outline-none focus:border-emerald-500/40 transition-all uppercase placeholder-white/5"
                  placeholder="NULL_IDENTITY"
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.8em] ml-2">REG_REF</label>
                   <input
                     type="text"
                     value={studentId}
                     onChange={(e) => setStudentId(e.target.value)}
                     className="w-full px-6 py-4 bg-zinc-950/40 border border-white/5 rounded-2xl text-[10px] font-mono text-white/40 focus:outline-none focus:border-emerald-500/40 transition-all uppercase"
                     placeholder="000_000"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.8em] text-right block pr-2">SYNCED</label>
                   <div className="px-6 py-4 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl text-[9px] font-black text-emerald-400/30 uppercase tracking-widest text-center flex items-center justify-center h-[52px]">
                     {joinDate}
                   </div>
                </div>
             </div>

             {/* SYNC ACTION */}
             <div className="mt-auto pt-8 border-t border-white/5 flex items-end justify-between">
                <div className="flex flex-col gap-2">
                   <div className="h-10 italic font-signature text-emerald-500/20 text-4xl">
                      {fullName || 'Nexus_Identity'}
                   </div>
                   <div className="flex items-center gap-2">
                      <Fingerprint size={12} className="text-emerald-500/20" />
                      <span className="text-[6px] font-mono text-white/5 uppercase tracking-[0.3em]">SECURE_STORAGE_ACTIVE</span>
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
