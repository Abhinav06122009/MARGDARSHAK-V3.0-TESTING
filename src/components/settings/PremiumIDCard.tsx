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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // EXTREME 3D PHYSICS
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-300, 300], [15, -15]), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-15, 15]), { stiffness: 120, damping: 20 });

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
      toast({ title: "CRYPTO_SYNC COMPLETE", description: "Identity image re-encrypted." });
      onRefresh();
    } catch (error: any) {
      toast({ title: "SYNC ERROR", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[500px] mx-auto perspective-2000">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full aspect-[1/1.5] rounded-[3rem] overflow-hidden shadow-[0_80px_160px_-40px_rgba(0,0,0,1)] border border-white/10 bg-[#020202] group"
      >
        {/* EXTREME NEON VIBE */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-fuchsia-500/10 opacity-40" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.15),transparent_70%)]" />
        
        {/* ROUNDED LEFT RIBBON: User Role */}
        <div className="absolute top-12 left-0 z-50">
           <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 px-8 rounded-r-full shadow-[10px_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3 border-y border-r border-white/20">
              <Sparkles size={16} className="text-black animate-pulse" />
              <span className="text-[11px] font-black text-black uppercase tracking-[0.2em] italic">{tier}</span>
           </div>
           <div className="absolute -bottom-2 left-0 w-2 h-2 bg-emerald-900 rounded-bl-full" />
        </div>

        {/* TOP RIGHT NODE: Student ID */}
        <div className="absolute top-12 right-12 text-right">
           <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-1">Matrix_Code</div>
           <div className="text-sm font-mono text-fuchsia-400 font-bold tracking-widest">{studentId || 'N/A_000'}</div>
        </div>

        <div className="relative h-full flex flex-col z-20 p-12 lg:p-14" style={{ transform: "translateZ(80px)" }}>
          
          {/* CENTER AVATAR: Hyper-Enhanced HUD */}
          <div className="mt-24 mb-16 flex flex-col items-center">
             <div className="relative group/avatar">
                {/* 3D FLOATING RINGS */}
                <div className="absolute -inset-10 border-2 border-emerald-500/20 rounded-full animate-spin-slow pointer-events-none" />
                <div className="absolute -inset-6 border border-fuchsia-500/30 rounded-full animate-reverse-spin pointer-events-none shadow-[0_0_20px_rgba(217,70,239,0.2)]" />
                
                <div className="w-60 h-60 rounded-[3.5rem] border-[6px] border-white/5 overflow-hidden relative z-10 bg-black shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:border-emerald-500/40">
                   <img 
                      src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                   
                   {/* SCANNING LASER */}
                   <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)] animate-scan-fast" />
                   </div>
                </div>

                {/* PEN ICON: Rounded Cyan Button */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-16 h-16 bg-cyan-500 text-black rounded-2xl flex items-center justify-center shadow-[0_15px_30px_rgba(34,211,238,0.4)] z-30 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/avatar:opacity-100 border-4 border-[#020202]"
                >
                   {isUploading ? <RefreshCw className="animate-spin w-6 h-6" /> : <Edit2 size={24} className="font-bold" />}
                </button>
             </div>
             <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>

          {/* IDENTITY SECTION: Perfectly Balanced */}
          <form onSubmit={onSubmit} className="flex-1 flex flex-col justify-end gap-10" style={{ transform: "translateZ(50px)" }}>
             <div className="space-y-4">
                <div className="flex items-center gap-4 pl-2">
                   <Terminal size={14} className="text-emerald-500/40" />
                   <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.8em]">Identity_Kernel</label>
                </div>
                <div className="relative">
                   <input
                     type="text"
                     value={fullName}
                     onChange={(e) => setFullName(e.target.value)}
                     className="w-full px-12 py-8 bg-zinc-950/60 border-2 border-white/5 rounded-[2.5rem] text-3xl font-black text-white focus:outline-none focus:border-emerald-500/40 transition-all uppercase placeholder-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                     placeholder="NULL_IDENTITY"
                   />
                   <div className="absolute right-8 top-1/2 -translate-y-1/2">
                      <Fingerprint size={24} className="text-emerald-500/20 group-hover:text-emerald-500 transition-colors duration-1000" />
                   </div>
                </div>
             </div>

             <div className="flex items-center justify-between gap-8 pt-8 border-t border-white/5">
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">SYNC_ESTABLISHED</span>
                   </div>
                   <div className="text-[8px] font-mono text-emerald-500/40 uppercase tracking-[0.2em]">{joinDate} // NODE_{user.id.substring(0, 8).toUpperCase()}</div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative group/btn flex items-center gap-6 px-14 py-7 rounded-[2.5rem] bg-white text-black font-black uppercase tracking-[0.3em] text-sm hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_40px_80px_-20px_rgba(255,255,255,0.15)] overflow-hidden"
                >
                   <div className="absolute inset-0 bg-emerald-500 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500" />
                   <span className="relative z-10 flex items-center gap-4 group-hover/btn:text-black">
                      {isSubmitting ? <RefreshCw className="animate-spin w-5 h-5" /> : <Save size={20} />}
                      {isSubmitting ? 'SYNCING' : 'PUSH_CHANGES'}
                   </span>
                </button>
             </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumIDCard;
