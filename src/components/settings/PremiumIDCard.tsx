import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Shield, Edit2, Save, User, Hash, Globe, 
  Cpu, QrCode, Zap, Fingerprint, Target, Radio,
  Activity, RefreshCw, Box, Layers, Sparkles,
  Command, Terminal, ZapOff, CloudLightning
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

const LightningBolt = ({ delay = 0 }: { delay?: number }) => (
  <motion.svg
    initial={{ opacity: 0, scaleY: 0 }}
    animate={{ 
      opacity: [0, 1, 0, 1, 0],
      scaleY: [0, 1.2, 1],
      x: [0, 5, -5, 0]
    }}
    transition={{ 
      duration: 0.3, 
      delay, 
      repeat: Infinity, 
      repeatDelay: Math.random() * 5 + 2 
    }}
    className="absolute text-emerald-400 w-12 h-24 pointer-events-none"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </motion.svg>
);

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

  // HIGH-FIDELITY 3D PHYSICS
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-300, 300], [12, -12]), { stiffness: 100, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-12, 12]), { stiffness: 100, damping: 25 });

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
    setTimeout(() => setIsClicked(false), 1000);
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
      toast({ title: "IDENTITY_SYNC_COMPLETE", description: "Biometric image re-encrypted." });
      onRefresh();
    } catch (error: any) {
      toast({ title: "SYNC_ERROR", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[480px] mx-auto perspective-2000">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative w-full aspect-[1/1.55] rounded-[4rem] overflow-hidden shadow-[0_80px_160px_-40px_rgba(0,0,0,1)] border border-white/10 bg-[#050505] group cursor-pointer transition-shadow duration-500"
      >
        {/* LIGHTNING ARCS */}
        <div className="absolute inset-0 pointer-events-none z-50">
           <div className="absolute top-10 left-10"><LightningBolt /></div>
           <div className="absolute bottom-20 right-10 rotate-180"><LightningBolt delay={1} /></div>
        </div>

        {/* CLICK FLASH EFFECT */}
        <AnimatePresence>
           {isClicked && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: [0, 1, 0, 1, 0] }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 z-50 bg-emerald-500/10 pointer-events-none mix-blend-overlay"
             />
           )}
        </AnimatePresence>

        {/* TEXTURES & GRADIENTS */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-fuchsia-500/10 pointer-events-none" />
        
        {/* SCANLINES */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]" />

        {/* STATUS RIBBON */}
        <div className="absolute top-12 left-0 z-40">
           <motion.div 
             initial={{ x: -100 }}
             animate={{ x: 0 }}
             className="bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-3 rounded-r-full shadow-[15px_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3 border-y border-r border-white/20"
           >
              <Zap size={14} className="text-black animate-pulse" />
              <span className="text-[11px] font-black text-black uppercase tracking-[0.2em] italic">{tier}</span>
           </motion.div>
        </div>

        <div className="relative h-full flex flex-col z-20 p-12 lg:p-14" style={{ transform: "translateZ(80px)" }}>
          
          {/* HEADER NODE */}
          <div className="flex items-start justify-between mb-16">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-950 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                     <Shield size={24} className="text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-[-0.05em] uppercase italic leading-none">NEXUS</h2>
               </div>
               <div className="flex items-center gap-2 ml-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[9px] font-mono text-emerald-500/40 uppercase tracking-[0.5em]">AUTH_PROTOCOL_ACTIVE</span>
               </div>
            </div>
            <div className="flex flex-col items-end gap-2">
               <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Node_Identity</div>
               <div className="px-4 py-1 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg text-xs font-mono text-fuchsia-400 font-bold">
                  {studentId || 'ID_0000'}
               </div>
            </div>
          </div>

          {/* AVATAR: Holographic Core */}
          <div className="flex flex-col items-center mb-16 relative" style={{ transform: "translateZ(120px)" }}>
             <div className="relative group/avatar">
                {/* 3D FLOATING RINGS */}
                <motion.div 
                   animate={{ rotate: 360, scale: [1, 1.05, 1] }} 
                   transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                   className="absolute -inset-10 border-2 border-dashed border-emerald-500/20 rounded-full pointer-events-none" 
                />
                <motion.div 
                   animate={{ rotate: -360, scale: [1, 1.1, 1] }} 
                   transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                   className="absolute -inset-6 border border-white/5 rounded-full pointer-events-none" 
                />
                
                <div className="w-56 h-56 rounded-[3.5rem] border-4 border-white/10 overflow-hidden relative z-10 bg-black shadow-2xl group-hover:border-emerald-500/50 transition-all duration-700">
                   <img 
                      src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000"
                   />
                   
                   {/* SCANNER BOLT */}
                   <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[4px] bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,1)] animate-scan-fast" />
                      <div className="absolute inset-0 bg-emerald-500/[0.05] opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>

                   {/* PEN BUTTON: Rounded & Glowing */}
                   <button 
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="absolute bottom-4 right-4 w-14 h-14 bg-cyan-500 text-black rounded-2xl flex items-center justify-center shadow-[0_15px_30px_rgba(34,211,238,0.4)] z-30 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/avatar:opacity-100 border-4 border-[#050505]"
                   >
                      {isUploading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Edit2 size={24} className="font-bold" />}
                   </button>
                </div>
             </div>
             <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>

          {/* FORM: Kinetic Interactions */}
          <form onSubmit={onSubmit} className="space-y-10 flex-1 flex flex-col justify-end" style={{ transform: "translateZ(60px)" }}>
             <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.8em] flex items-center gap-3">
                      <Terminal size={14} className="text-emerald-500/40" /> Scholar_Kernel
                   </label>
                </div>
                <div className="relative group/field">
                   <input
                     type="text"
                     value={fullName}
                     onChange={(e) => setFullName(e.target.value)}
                     className="w-full px-12 py-8 bg-zinc-950/60 border-2 border-white/5 rounded-[2.5rem] text-3xl font-black text-white focus:outline-none focus:border-emerald-500/40 transition-all uppercase placeholder-white/5 shadow-inner"
                     placeholder="NULL_IDENTITY"
                   />
                   <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/field:opacity-100 group-focus-within/field:text-emerald-400 transition-all">
                      <Command size={24} />
                   </div>
                </div>
             </div>

             {/* SYNC PANEL: Multi-color Glow */}
             <div className="pt-10 border-t border-white/5 flex items-end justify-between">
                <div className="flex flex-col gap-3">
                   <div className="h-12 italic font-signature text-transparent bg-clip-text bg-gradient-to-r from-emerald-500/40 to-fuchsia-500/40 text-5xl tracking-tighter">
                      {fullName || 'Nexus_Identity'}
                   </div>
                   <div className="flex items-center gap-3">
                      <Fingerprint size={16} className="text-emerald-500/20" />
                      <span className="text-[7px] font-mono text-white/10 uppercase tracking-[0.4em]">NODE_{user.id.substring(0, 12).toUpperCase()}</span>
                   </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative group/btn flex items-center gap-6 px-14 py-7 rounded-[2.5rem] bg-emerald-500 text-black font-black uppercase tracking-[0.4em] text-xs hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all shadow-[0_40px_80px_-20px_rgba(16,185,129,0.5)] disabled:opacity-30 overflow-hidden"
                >
                   <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-500" />
                   <span className="relative z-10 flex items-center gap-4">
                      {isSubmitting ? <RefreshCw className="animate-spin w-5 h-5" /> : <Save size={20} />}
                      {isSubmitting ? 'SYNCING' : 'PUSH_CORE'}
                   </span>
                </button>
             </div>
          </form>
        </div>
      </motion.div>
      
      {/* AMBIENT SHADOW */}
      <div className="w-[85%] h-8 bg-emerald-500/10 blur-[60px] rounded-full mt-16 animate-pulse" />
    </div>
  );
};

export default PremiumIDCard;
