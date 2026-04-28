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

  const rotateX = useSpring(useTransform(y, [-300, 300], [15, -15]), { stiffness: 200, damping: 40 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-15, 15]), { stiffness: 200, damping: 40 });

  // Depth-Offset Constants
  const DEPTH_BASE = 0;
  const DEPTH_AVATAR = 60;
  const DEPTH_CHIP = 100;
  const DEPTH_TEXT = 40;

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
      const filePath = `avatars/${user.id}/${Math.random()}.${fileExt}`;

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
    <div className="flex flex-col items-center justify-center py-6 w-full max-w-md mx-auto">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full aspect-[1/1.58] rounded-[3.5rem] overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,1)] border border-white/15 bg-[#010101] group selection:bg-emerald-500/30"
      >
        {/* PHYSICAL BASE LAYERS */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-950" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-soft-light" />
        
        {/* DYNAMIC AMBIENCE */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />
        
        <motion.div 
          animate={{ x: [-1000, 1000] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/[0.05] to-transparent skew-x-12 z-10 pointer-events-none"
        />

        <div className="relative h-full flex flex-col z-20 p-10 lg:p-12" style={{ transform: `translateZ(${DEPTH_BASE}px)` }}>
          
          {/* HEADER: Perfect Alignment */}
          <div className="flex items-start justify-between mb-12">
            <div className="flex items-center gap-5">
               <div className="relative">
                  <div className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
                  <div className="p-3.5 bg-zinc-950 border border-emerald-500/40 rounded-2xl relative shadow-2xl">
                     <Shield className="w-8 h-8 text-emerald-400" />
                  </div>
               </div>
               <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-black text-white tracking-[-0.05em] uppercase italic leading-none">MARGDARSHAK</h2>
                  <div className="flex items-center gap-2">
                     <div className="flex gap-1">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                        <div className="w-1 h-1 bg-emerald-500/20 rounded-full" />
                     </div>
                     <span className="text-[9px] font-black tracking-[0.4em] text-emerald-500/50 uppercase">Identity Verified</span>
                  </div>
               </div>
            </div>
            <div className="flex flex-col items-end gap-2">
               <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase italic">{tier}</span>
               </div>
               <div className="flex items-center gap-2 text-[8px] font-mono text-white/20 uppercase tracking-tighter">
                  <Radio size={10} className="animate-pulse" />
                  NODE-ALPHA-7
               </div>
            </div>
          </div>

          {/* BIO-METRIC CENTERPIECE: Layered Parallax */}
          <div className="flex flex-col items-center mb-12" style={{ transform: `translateZ(${DEPTH_AVATAR}px)` }}>
             <div className="relative group/avatar">
                {/* Orbital Decoration */}
                <div className="absolute inset-[-15px] border border-white/5 rounded-full animate-spin-slow pointer-events-none" />
                <div className="absolute inset-[-25px] border border-emerald-500/10 rounded-full animate-reverse-spin pointer-events-none" />
                
                <div className="w-52 h-52 rounded-[3.5rem] border border-white/10 overflow-hidden relative z-10 bg-black shadow-2xl transition-all duration-700 group-hover/avatar:scale-[1.02] group-hover/avatar:border-emerald-500/40">
                   <img 
                      src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-1000 grayscale-[0.1] group-hover/avatar:grayscale-0"
                   />
                   
                   {/* HUD Overlays */}
                   <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <Target className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 text-emerald-500/40 animate-pulse-slow" />
                      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20 animate-scanline" />
                   </div>

                   {/* Upload Interaction */}
                   <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 z-20 backdrop-blur-sm cursor-pointer"
                   >
                      <Camera className="w-12 h-12 text-white mb-3" />
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] px-8 text-center">Update Bio-Link</span>
                   </button>
                   
                   {isUploading && (
                      <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-30">
                         <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
                         <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Encrypting...</span>
                      </div>
                   )}
                </div>

                {/* ADVANCED QUANTUM CHIP: Parallax Offset */}
                <div 
                   className="absolute -bottom-6 -right-6 p-4 bg-zinc-950 rounded-[2rem] border border-emerald-500/30 shadow-2xl z-20 group-hover/avatar:rotate-12 transition-all duration-500"
                   style={{ transform: `translateZ(${DEPTH_CHIP}px)` }}
                >
                   <Cpu className="w-8 h-8 text-emerald-400 animate-pulse-slow" />
                </div>
             </div>
             <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>

          {/* DATA FIELDS: Precision Sizing */}
          <form onSubmit={onSubmit} className="flex-1 flex flex-col gap-7" style={{ transform: `translateZ(${DEPTH_TEXT}px)` }}>
             <div className="space-y-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] ml-2 flex items-center gap-3">
                   <User size={12} className="text-emerald-500/20" /> Identifier
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-7 py-4.5 bg-white/[0.02] border border-white/5 rounded-3xl text-xl font-black text-white placeholder-white/5 focus:outline-none focus:border-emerald-500/30 transition-all tracking-tight uppercase"
                  placeholder="IDENTITY_NAME"
                />
             </div>

             <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] ml-2 flex items-center gap-3">
                      <Hash size={12} className="text-emerald-500/20" /> Registry
                   </label>
                   <input
                     type="text"
                     value={studentId}
                     onChange={(e) => setStudentId(e.target.value)}
                     className="w-full px-6 py-4 bg-white/[0.01] border border-white/5 rounded-2xl text-xs font-mono text-white/70 placeholder-white/10 focus:outline-none focus:border-emerald-500/30 transition-all uppercase"
                     placeholder="ID-CORE"
                   />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] ml-2 flex items-center gap-3">
                      <Globe size={12} className="text-emerald-500/20" /> Matrix
                   </label>
                   <div className="px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-[9px] font-black text-emerald-500/30 uppercase tracking-[0.3em] flex items-center justify-center">
                     {joinDate}
                   </div>
                </div>
             </div>

             <div className="flex-1" />

             {/* SIGNATURE: High Contrast */}
             <div className="p-6 border border-white/5 rounded-[2.5rem] bg-white/[0.01] relative group/sig overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                   <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">Auth Signature</span>
                   <Fingerprint size={12} className="text-white/5 group-hover/sig:text-emerald-500/20 transition-colors" />
                </div>
                <div className="h-16 flex items-center justify-center italic font-signature text-emerald-500/30 text-4xl group-hover/sig:text-emerald-400 group-hover/sig:scale-110 transition-all duration-700 select-none">
                   {fullName || 'Nexus_User'}
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-px bg-white/5" />
             </div>

             {/* BOTTOM BAR: Alignment Perfection */}
             <div className="flex items-center justify-between pt-6 mt-auto border-t border-white/5">
                <div className="flex items-center gap-4">
                   <QrCode className="w-14 h-14 text-white/5 hover:text-white/20 transition-colors" />
                   <div className="flex flex-col">
                      <div className="h-6 w-32 bg-[url('https://www.transparenttextures.com/patterns/barcode-1.png')] opacity-10" />
                      <span className="text-[8px] font-mono text-white/10 uppercase tracking-widest mt-1">UUID_{user.id.substring(0, 12).toUpperCase()}</span>
                   </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`group relative flex items-center justify-center w-20 h-20 rounded-[2.25rem] transition-all active:scale-95 ${
                    isSubmitting ? 'bg-zinc-900' : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)]'
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
                           <Zap className="w-8 h-8 text-emerald-200" />
                        </motion.div>
                     ) : (
                        <motion.div
                          key="idle"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex flex-col items-center gap-1"
                        >
                           <Save className="w-8 h-8 text-black" />
                           <span className="text-[9px] font-black text-black uppercase">SYNC</span>
                        </motion.div>
                     )}
                  </AnimatePresence>
                </button>
             </div>
          </form>
        </div>

        {/* REINFORCED BORDER GLOW */}
        <div className="absolute inset-0 pointer-events-none border-[2px] border-white/10 rounded-[3.5rem] z-50 group-hover:border-emerald-500/20 transition-colors duration-700" />
      </motion.div>
      
      {/* PERFECTED GROUND SHADOW */}
      <motion.div 
         animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.7, 0.5] }}
         transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
         className="w-[90%] h-8 bg-black/80 blur-[40px] rounded-[100%] mt-12" 
      />
    </div>
  );
};

export default PremiumIDCard;
