import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Shield, Edit2, Save, User, Hash, Globe, 
  Cpu, QrCode, Zap, Fingerprint, Target, Radio,
  Activity, RefreshCw, Box, Layers, Sparkles
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

  // Responsive Depth Physics
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
    <div className="flex flex-col items-center justify-center w-full max-w-[480px] mx-auto perspective-1000">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full aspect-[1/1.58] rounded-[4rem] overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,1)] border border-white/10 bg-[#050505] group"
      >
        {/* MULTI-COLOR ACCENT GLOWS */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 via-fuchsia-500/5 to-cyan-500/5 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

        {/* CARBON TEXTURE OVERLAY */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />

        <div className="relative h-full flex flex-col z-20 p-10 lg:p-12 xl:p-14" style={{ transform: "translateZ(60px)" }}>
          
          {/* HEADER SECTION: Balanced Multi-Color */}
          <div className="flex items-start justify-between mb-12">
            <div className="flex flex-col gap-3">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                     <Shield size={20} className="text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-[-0.05em] uppercase italic leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-emerald-400">
                    MARGDARSHAK
                  </h2>
               </div>
               <div className="flex items-center gap-2 ml-1">
                  <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-[0.5em]">QUANTUM_CORE_V3</span>
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
               </div>
            </div>
            <div className="flex flex-col items-end gap-3">
               <div className="px-5 py-2 bg-zinc-950/80 border border-fuchsia-500/30 rounded-full shadow-[0_0_15px_rgba(217,70,239,0.2)] backdrop-blur-md">
                  <span className="text-[9px] font-black text-fuchsia-400 tracking-[0.2em] uppercase italic">{tier}</span>
               </div>
            </div>
          </div>

          {/* AVATAR CENTERPIECE: Multi-layered Spectrum HUD */}
          <div className="flex flex-col items-center mb-12 relative" style={{ transform: "translateZ(100px)" }}>
             <div className="relative group/avatar">
                {/* DYNAMIC SPECTRUM RINGS */}
                <div className="absolute -inset-8 border-2 border-dashed border-emerald-500/10 rounded-full animate-spin-slow pointer-events-none" />
                <div className="absolute -inset-4 border border-fuchsia-500/10 rounded-full animate-reverse-spin pointer-events-none" />
                
                <div className="w-56 h-56 rounded-full border-4 border-white/10 overflow-hidden relative z-10 bg-black shadow-[0_0_50px_rgba(0,0,0,0.8)] group-hover:border-emerald-500/50 transition-all duration-700">
                   <img 
                      src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                   />
                   
                   {/* SCANNING SPECTRUM */}
                   <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,1)] animate-scan-fast" />
                      <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/[0.02] to-cyan-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                </div>

                {/* EDIT BUTTON: Fuchsia Accent */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-4 right-4 w-14 h-14 bg-fuchsia-600 text-white rounded-full flex items-center justify-center shadow-[0_15px_30px_rgba(217,70,239,0.4)] z-30 hover:bg-fuchsia-500 active:scale-90 transition-all opacity-0 group-hover/avatar:opacity-100 border-4 border-black"
                >
                   {isUploading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Edit2 size={24} />}
                </button>

                {/* QUANTUM STATUS */}
                <div className="absolute -top-2 -right-2 p-4 bg-zinc-950 rounded-full border border-cyan-500/40 shadow-2xl z-20 animate-pulse">
                   <Cpu size={16} className="text-cyan-400" />
                </div>
             </div>
             <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>

          {/* INPUT FIELDS: Balanced Colors & Spacing */}
          <form onSubmit={onSubmit} className="space-y-8 flex-1" style={{ transform: "translateZ(40px)" }}>
             <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                   <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.6em] flex items-center gap-3">
                      <User size={12} className="text-emerald-500/40" /> Scholar_Ident
                   </label>
                   <Sparkles size={12} className="text-fuchsia-500/40" />
                </div>
                <div className="relative group/field">
                   <input
                     type="text"
                     value={fullName}
                     onChange={(e) => setFullName(e.target.value)}
                     className="w-full px-10 py-6 bg-zinc-950/60 border border-white/5 rounded-[2.5rem] text-2xl font-black text-white focus:outline-none focus:border-emerald-500/40 transition-all uppercase placeholder-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                     placeholder="NULL_NAME"
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                   <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.6em] ml-2">REG_ID</label>
                   <div className="relative">
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full px-8 py-5 bg-zinc-950/60 border border-white/5 rounded-2xl text-sm font-mono text-cyan-400/60 focus:outline-none focus:border-cyan-500/40 transition-all uppercase"
                        placeholder="000000"
                      />
                   </div>
                </div>
                <div className="space-y-3">
                   <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.6em] text-right block pr-2">SYNC_LOCK</label>
                   <div className="px-8 py-5 bg-zinc-950/60 border border-fuchsia-500/10 rounded-2xl text-[10px] font-black text-fuchsia-400/40 uppercase tracking-widest text-center flex items-center justify-center h-[62px]">
                     {joinDate}
                   </div>
                </div>
             </div>

             {/* SYNC PANEL: High-Impact Footer */}
             <div className="mt-auto pt-10 border-t border-white/5 flex items-end justify-between">
                <div className="flex flex-col gap-3">
                   <div className="h-12 italic font-signature text-transparent bg-clip-text bg-gradient-to-r from-emerald-500/40 to-fuchsia-500/40 text-5xl tracking-tighter">
                      {fullName || 'Nexus_Sign'}
                   </div>
                   <div className="flex items-center gap-3">
                      <Fingerprint size={14} className="text-emerald-500/20" />
                      <span className="text-[7px] font-mono text-white/10 uppercase tracking-[0.3em]">SECURE_NODE: {user.id.substring(0, 12).toUpperCase()}</span>
                   </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative group/btn flex items-center gap-5 px-12 py-6 rounded-[2.25rem] bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_25px_50px_-15px_rgba(16,185,129,0.5)] disabled:opacity-30 overflow-hidden"
                >
                   <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                   {isSubmitting ? <RefreshCw className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                   {isSubmitting ? 'SYNCING' : 'PUSH_CORE'}
                </button>
             </div>
          </form>
        </div>
      </motion.div>
      
      {/* MULTI-COLOR GROUND REFLECTION */}
      <div className="w-[80%] h-8 bg-gradient-to-r from-emerald-500/10 via-fuchsia-500/10 to-cyan-500/10 blur-[60px] rounded-full mt-14 animate-pulse" />
    </div>
  );
};

export default PremiumIDCard;
