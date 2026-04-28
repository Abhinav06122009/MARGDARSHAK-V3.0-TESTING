import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Shield, Camera, Save, User, Hash, Globe, 
  Cpu, QrCode, Zap, Fingerprint, Target, Radio,
  Activity, RefreshCw
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

  const rotateX = useSpring(useTransform(y, [-300, 300], [12, -12]), { stiffness: 150, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-12, 12]), { stiffness: 150, damping: 30 });

  // Holographic Shift
  const holoX = useTransform(x, [-300, 300], [0, 100]);
  const holoY = useTransform(y, [-300, 300], [0, 100]);

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
  
  // REAL ROLE SYNC LOGIC
  const getDisplayRole = (role: string) => {
    switch(role?.toLowerCase()) {
      case 'admin': return 'SYSTEM OVERSEER';
      case 'superadmin': return 'PREMIUM OVERSEER';
      case 'teacher': return 'FACULTY PROCTOR';
      case 'moderator': return 'SECURITY MONITOR';
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
      // FIXED: Shortened path to match RLS security policies
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
    <div className="flex flex-col items-center justify-center py-4 w-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full max-w-[440px] aspect-[1/1.58] rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.1)] border border-white/20 bg-[#050505] group"
      >
        {/* BASE TITANIUM TEXTURE */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent)] opacity-50" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-20 mix-blend-overlay" />
        
        {/* HOLOGRAPHIC SHIMMER LAYER */}
        <motion.div 
          style={{ 
            background: useTransform(
              [holoX, holoY], 
              ([hx, hy]) => `radial-gradient(circle at ${hx}% ${hy}%, rgba(16,185,129,0.15) 0%, transparent 50%)`
            )
          }}
          className="absolute inset-0 pointer-events-none z-10 opacity-60 mix-blend-color-dodge"
        />

        {/* HUD GRID OVERLAY */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />

        <div className="relative h-full flex flex-col z-20 p-10 lg:p-12" style={{ transform: "translateZ(50px)" }}>
          
          {/* HEADER SECTION: Perfectly Aligned */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-6">
               <div className="relative">
                  <div className="absolute -inset-3 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
                  <div className="p-3.5 bg-black border border-emerald-500/40 rounded-2xl relative shadow-2xl overflow-hidden group/icon">
                     <Shield className="w-8 h-8 text-emerald-400 group-hover/icon:scale-110 transition-transform" />
                     <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent" />
                  </div>
               </div>
               <div className="flex flex-col">
                  <h2 className="text-2xl font-black text-white tracking-[-0.05em] uppercase italic leading-none">MARGDARSHAK</h2>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                     <span className="text-[9px] font-black tracking-[0.4em] text-emerald-500/60 uppercase">ACTIVE_CORE</span>
                  </div>
               </div>
            </div>
            <div className="flex flex-col items-end gap-2">
               <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-md">
                  <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase italic">{tier}</span>
               </div>
               <div className="flex items-center gap-2 text-[8px] font-mono text-white/30 uppercase tracking-widest">
                  <Activity size={10} className="text-emerald-500/50" />
                  STABLE
               </div>
            </div>
          </div>

          {/* AVATAR CENTERPIECE: Holographic HUD */}
          <div className="flex flex-col items-center mb-12 relative" style={{ transform: "translateZ(80px)" }}>
             <div className="relative">
                {/* HUD Elements */}
                <div className="absolute -inset-6 border border-white/5 rounded-full animate-spin-slow pointer-events-none" />
                <div className="absolute -inset-10 border border-emerald-500/10 rounded-full animate-reverse-spin pointer-events-none" />
                
                <div className="w-52 h-52 rounded-[3.5rem] border-[3px] border-white/10 overflow-hidden relative z-10 bg-black shadow-2xl group-hover:border-emerald-500/40 transition-colors duration-700">
                   <img 
                      src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                   />
                   
                   {/* Scanning HUD */}
                   <div className="absolute inset-0 pointer-events-none z-20">
                      <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-emerald-500/20 to-transparent -translate-y-full group-hover:translate-y-[200%] transition-transform duration-[2000ms] ease-linear repeat-infinite" />
                   </div>

                   {/* Interaction Layer */}
                   <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-30 backdrop-blur-sm cursor-pointer"
                   >
                      <Camera className="w-10 h-10 text-white mb-3" />
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Update_Bio</span>
                   </button>
                </div>

                {/* QUANTUM CHIP */}
                <div className="absolute -bottom-4 -right-4 p-4 bg-zinc-950 rounded-3xl border border-emerald-500/30 shadow-2xl z-20 group-hover:scale-110 transition-transform">
                   <Cpu className="w-8 h-8 text-emerald-400" />
                </div>
             </div>
             <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>

          {/* INPUT FIELDS: Perfect Alignment */}
          <form onSubmit={onSubmit} className="space-y-8 flex-1" style={{ transform: "translateZ(40px)" }}>
             <div className="space-y-3">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] ml-2 flex items-center gap-3">
                   <User size={12} className="text-emerald-500/40" /> Scholar_Name
                </label>
                <div className="relative group/field">
                   <input
                     type="text"
                     value={fullName}
                     onChange={(e) => setFullName(e.target.value)}
                     className="w-full px-8 py-5 bg-black/40 border border-white/10 rounded-[1.75rem] text-xl font-black text-white focus:outline-none focus:border-emerald-500/40 transition-all uppercase placeholder-white/5"
                     placeholder="NAME_REQUIRED"
                   />
                   <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-focus-within/field:opacity-100 transition-opacity" />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] ml-2">Registry_ID</label>
                   <input
                     type="text"
                     value={studentId}
                     onChange={(e) => setStudentId(e.target.value)}
                     className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-xs font-mono text-white/60 focus:outline-none focus:border-emerald-500/40 transition-all uppercase"
                     placeholder="ID_NONE"
                   />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] ml-2 text-right block pr-2">Matrix_Link</label>
                   <div className="px-6 py-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-[9px] font-black text-emerald-400/40 uppercase tracking-widest text-center flex items-center justify-center h-[52px]">
                     {joinDate}
                   </div>
                </div>
             </div>

             {/* SIGNATURE PANEL */}
             <div className="mt-8 p-6 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent relative group/sig">
                <div className="justify-between items-center mb-4 flex">
                   <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">Auth_Signature</span>
                   <Fingerprint size={12} className="text-white/10 group-hover/sig:text-emerald-500/40 transition-colors" />
                </div>
                <div className="h-14 flex items-center justify-center italic font-signature text-emerald-500/40 text-4xl group-hover/sig:text-emerald-400/60 transition-all duration-700">
                   {fullName || 'Nexus_Identity'}
                </div>
             </div>

             {/* SYNC ACTION: Aligned Bottom */}
             <div className="flex items-center justify-between pt-8 mt-auto">
                <div className="flex flex-col gap-2">
                   <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                         <div key={i} className={`w-3 h-1 rounded-full ${i < 3 ? 'bg-emerald-500/40' : 'bg-white/10'}`} />
                      ))}
                   </div>
                   <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">ID: {user.id.substring(0, 16).toUpperCase()}</span>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative group/btn flex items-center gap-4 px-10 py-5 rounded-3xl bg-emerald-500 text-black font-black uppercase tracking-widest text-xs hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] disabled:opacity-30"
                >
                   {isSubmitting ? <RefreshCw className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                   {isSubmitting ? 'SYNCING' : 'PUSH'}
                </button>
             </div>
          </form>
        </div>
      </motion.div>
      
      {/* GROUND REFLECTION */}
      <div className="w-1/2 h-4 bg-emerald-500/10 blur-3xl rounded-full mt-10" />
    </div>
  );
};

export default PremiumIDCard;
