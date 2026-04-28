import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CreditCard, Cpu, QrCode, Sparkles, 
  Camera, Save, CheckCircle2, User, Mail, 
  Hash, Globe, Award, Zap
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
    <div className="flex flex-col items-center">
      {/* Lanyard Strap / Ribbon */}
      <div className="relative flex flex-col items-center mb-[-40px] z-20">
         {/* Top Hook Point */}
         <div className="w-16 h-4 bg-zinc-800 rounded-t-full border border-white/10" />
         {/* Ribbon/Strap */}
         <div className="w-24 h-48 bg-gradient-to-b from-zinc-800 via-emerald-600 to-emerald-700 shadow-2xl relative">
            {/* Ribbon Texture */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            {/* Branding on Ribbon */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rotate-90">
               <span className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase whitespace-nowrap">MARGDARSHAK SECURE ID</span>
            </div>
         </div>
         {/* Metal Connector */}
         <div className="w-12 h-12 bg-zinc-700 rounded-full border-4 border-zinc-900 shadow-xl flex items-center justify-center relative -mt-4">
            <div className="w-4 h-4 bg-zinc-900 rounded-full" />
            <div className="absolute -bottom-6 w-1 h-8 bg-zinc-600" />
         </div>
         {/* Clip */}
         <div className="w-20 h-10 bg-gradient-to-b from-zinc-600 to-zinc-800 rounded-xl border border-white/10 shadow-lg relative -mt-2 flex items-center justify-center">
            <div className="w-12 h-1 bg-zinc-900/50 rounded-full" />
         </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-[420px] aspect-[1/1.5] rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-white/10 group bg-[#080808]"
      >
        {/* Dynamic Backgrounds */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-purple-500/10" />
        
        {/* Animated Shine Effect */}
        <motion.div 
          animate={{ x: [-500, 500], opacity: [0, 0.3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
        />

        <div className="relative h-full flex flex-col p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-inner">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-black text-white tracking-tighter italic uppercase leading-none">MARGDARSHAK</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black tracking-[0.2em] text-emerald-500/60 uppercase">Identity Verified</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Authorization</div>
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-white tracking-widest italic whitespace-nowrap">
                {tier}
              </div>
            </div>
          </div>

          {/* Portrait Photo Area */}
          <div className="flex flex-col items-center mb-8 relative">
            <div className="relative group/avatar">
              <div className="absolute -inset-4 bg-emerald-500/15 rounded-full blur-2xl opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
              <div className="w-44 h-44 rounded-[2rem] border-2 border-white/10 overflow-hidden relative z-10 bg-black/40 backdrop-blur-md shadow-2xl transition-transform duration-500 group-hover/avatar:scale-[1.02]">
                <img 
                  src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover grayscale-0 group-hover/avatar:scale-110 transition-all duration-700"
                />
                
                {/* Upload Overlay */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer z-20"
                >
                  <Camera className="w-8 h-8 text-white mb-2" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Update Identification</span>
                </button>
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
                    <Zap className="w-8 h-8 text-emerald-400 animate-pulse" />
                  </div>
                )}
              </div>
              
              {/* Chip Ornament */}
              <div className="absolute -bottom-2 -right-2 p-2.5 bg-emerald-500 rounded-2xl shadow-xl border-4 border-zinc-900 z-20">
                <Cpu className="w-5 h-5 text-white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>

          {/* Form Fields - Direct Editing */}
          <form onSubmit={onSubmit} className="flex-1 flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                 <User size={10} /> Scholar Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/5 rounded-2xl text-lg font-black text-white placeholder-white/10 focus:outline-none focus:border-emerald-500/30 focus:bg-emerald-500/[0.02] transition-all tracking-tight uppercase"
                  placeholder="System Identity Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                   <Hash size={10} /> Student ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-xs font-mono text-white/80 placeholder-white/10 focus:outline-none focus:border-emerald-500/30 transition-all uppercase"
                  placeholder="ID-0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                   <Globe size={10} /> Registry Date
                </label>
                <div className="px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-xs font-mono text-white/40 uppercase tracking-widest">
                  {joinDate}
                </div>
              </div>
            </div>

            <div className="flex-1" />

            {/* Bottom Section */}
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
               <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                     <QrCode className="w-8 h-8 text-white/20" />
                     <div className="h-6 w-32 bg-[url('https://www.transparenttextures.com/patterns/barcode-1.png')] opacity-10" />
                  </div>
                  <p className="text-[7px] font-mono text-white/20 tracking-[0.4em] uppercase">Auth-Level: Alpha-Zero-One</p>
               </div>
               
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className={`group relative flex items-center justify-center p-4 rounded-2xl transition-all active:scale-95 ${
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
                          <Zap className="w-5 h-5 text-white/40" />
                       </motion.div>
                    ) : (
                       <motion.div
                         key="idle"
                         initial={{ scale: 0.8, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         exit={{ scale: 0.8, opacity: 0 }}
                         className="flex items-center gap-2"
                       >
                          <Save className="w-5 h-5 text-white" />
                          <span className="text-xs font-black text-white uppercase tracking-widest hidden group-hover:inline-block">Sync Identity</span>
                       </motion.div>
                    )}
                 </AnimatePresence>
               </button>
            </div>
          </form>
        </div>

        {/* Edge Shine Overlay */}
        <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-[2.5rem] shadow-[inset_0_0_40px_rgba(255,255,255,0.05)]" />
      </motion.div>
      
      {/* Visual Shadow Background for Card */}
      <div className="w-[380px] h-4 bg-black/60 blur-xl rounded-full mt-4" />
    </div>
  );
};

export default PremiumIDCard;
