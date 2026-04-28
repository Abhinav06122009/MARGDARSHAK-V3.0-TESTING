import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Shield, CreditCard, Cpu, QrCode, Sparkles, 
  Camera, Save, CheckCircle2, User, Mail, 
  Hash, Globe, Award, Zap, Fingerprint, 
  Binary, Activity, Wifi, Battery, Lock,
  ChevronRight, RefreshCw, Layers
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

  // Advanced 3D Physics
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
  
  const joinDate = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'EST. 2024';
  const tier = user.profile?.user_type === 'admin' ? 'ADMINISTRATOR' : (user.profile?.subscription_tier?.toUpperCase() || 'SCHOLAR');

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
        title: "Profile Synchronized",
        description: "Your identification photo has been updated across the network.",
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
    <div className="flex flex-col items-center">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-[420px] aspect-[1/1.58] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10 group bg-[#0a0a0a]"
      >
        {/* HOLOGRAPHIC LAYERS */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-purple-500/10" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]" />
        
        {/* Dynamic Light Beam */}
        <motion.div 
          animate={{ 
            x: [-500, 1000],
            opacity: [0, 0.3, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[30deg] z-10 pointer-events-none"
        />

        <div className="relative h-full flex flex-col p-10 z-20" style={{ transform: "translateZ(50px)" }}>
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                 <div className="absolute -inset-2 bg-emerald-500/20 blur-lg rounded-full animate-pulse" />
                 <div className="p-3 bg-zinc-900 border border-white/5 rounded-2xl relative">
                    <Shield className="w-7 h-7 text-emerald-400" />
                 </div>
              </div>
              <div>
                 <h2 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">MARGDARSHAK</h2>
                 <div className="flex items-center gap-2 mt-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black tracking-[0.3em] text-emerald-500/60 uppercase">System Identity</span>
                 </div>
              </div>
            </div>
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
               <span className="text-[9px] font-black text-white/40 tracking-widest uppercase">{tier}</span>
            </div>
          </div>

          {/* Portrait Photo Centerpiece */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative group/avatar">
              <div className="absolute -inset-6 bg-emerald-500/10 rounded-full blur-[40px] opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
              
              <div className="w-48 h-48 rounded-[2.5rem] border-2 border-white/10 overflow-hidden relative z-10 bg-black/40 backdrop-blur-md shadow-2xl transition-all duration-700 group-hover/avatar:scale-[1.03] group-hover/avatar:border-emerald-500/30">
                <img 
                  src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-all duration-1000 group-hover/avatar:scale-110"
                />
                
                {/* Upload Overlay */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 cursor-pointer z-20"
                >
                  <Camera className="w-10 h-10 text-white mb-3" />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Update Bio-Metric</span>
                </button>
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
                    <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Silicon Chip Accessory */}
              <div className="absolute -bottom-3 -right-3 p-3 bg-zinc-900 rounded-[1.25rem] shadow-2xl border-4 border-[#0a0a0a] z-20 group-hover/avatar:scale-110 transition-transform">
                <Cpu className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>

          {/* Identification Details - Ultra Sleek */}
          <form onSubmit={onSubmit} className="flex-1 flex flex-col gap-6" style={{ transform: "translateZ(30px)" }}>
            <div className="space-y-3">
              <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] ml-1 flex items-center gap-2">
                 <User size={12} className="text-emerald-500/40" /> Scholar Name
              </label>
              <div className="relative group/input">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-xl font-black text-white placeholder-white/5 focus:outline-none focus:border-emerald-500/30 focus:bg-white/[0.04] transition-all tracking-tight uppercase"
                  placeholder="IDENTITY NAME"
                />
                <div className="absolute inset-0 border border-emerald-500/0 rounded-2xl pointer-events-none group-focus-within/input:border-emerald-500/20 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] ml-1 flex items-center gap-2">
                   <Hash size={12} className="text-emerald-500/40" /> Student ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white/[0.02] border border-white/5 rounded-2xl text-xs font-mono text-white/80 placeholder-white/10 focus:outline-none focus:border-emerald-500/30 transition-all uppercase"
                  placeholder="ID-0000"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] ml-1 flex items-center gap-2">
                   <Globe size={12} className="text-emerald-500/40" /> Registry
                </label>
                <div className="px-5 py-3.5 bg-white/[0.01] border border-white/5 rounded-2xl text-xs font-mono text-white/30 uppercase tracking-widest flex items-center justify-center">
                  {joinDate}
                </div>
              </div>
            </div>

            <div className="flex-1" />

            {/* Signature Area */}
            <div className="p-4 border border-white/5 rounded-2xl bg-white/[0.02] relative group/sig">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em]">Auth Signature</span>
                  <Fingerprint size={10} className="text-white/5" />
               </div>
               <div className="h-10 flex items-center justify-center italic font-signature text-emerald-500/40 text-2xl group-hover/sig:text-emerald-500/60 transition-colors">
                  {fullName || 'System User'}
               </div>
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-px bg-white/5" />
            </div>

            {/* Sync Action */}
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
               <div className="flex items-center gap-3">
                  <QrCode size={32} className="text-white/10" />
                  <div className="flex flex-col">
                     <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em]">SECURE-HASH</span>
                     <span className="text-[7px] font-mono text-white/10">{user.id.substring(0, 16).toUpperCase()}</span>
                  </div>
               </div>
               
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all active:scale-90 ${
                   isSubmitting ? 'bg-zinc-800' : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
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
                          <RefreshCw className="w-6 h-6 text-white/40" />
                       </motion.div>
                    ) : (
                       <motion.div
                         key="idle"
                         initial={{ scale: 0.8, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         exit={{ scale: 0.8, opacity: 0 }}
                       >
                          <Save className="w-6 h-6 text-black" />
                       </motion.div>
                    )}
                 </AnimatePresence>
               </button>
            </div>
          </form>
        </div>

        {/* Edge Polish */}
        <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-[3rem] shadow-[inset_0_0_40px_rgba(255,255,255,0.05)] z-50" />
      </motion.div>
      
      {/* Ground Shadow */}
      <div className="w-[380px] h-6 bg-black/60 blur-[30px] rounded-[100%] mt-8 opacity-50" />
    </div>
  );
};

export default PremiumIDCard;
