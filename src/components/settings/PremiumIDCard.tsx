import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  Shield, Edit2, Save, User, Hash, Globe,
  Cpu, QrCode, Zap, Fingerprint, Target, Radio,
  Activity, RefreshCw, Box, Layers, Sparkles,
  Command, Terminal, CloudLightning
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

  // MATHEMATICALLY PERFECT PHYSICS
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

  const handleCardClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);
  };

  const joinDate = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'EST. 2024';

  const getDisplayRole = (role: string | string[]) => {
    const roles = Array.isArray(role) ? role : [role || 'student'];
    const normalizedRoles = roles.map(r => String(r).toLowerCase().replace(/_/g, ''));
    
    // A+ CLASS — RHODIUM: Pure Chrome Crystalline (multi-role)
    if (normalizedRoles.length >= 2) {
      return {
        class: 'A+ CLASS',
        title: 'RHODIUM_ZENITH',
        colorStyle: 'linear-gradient(135deg,#ffffff,#c8c8c8,#8a8a8a)',
        color: '',
        text: 'text-white',
        glow: 'shadow-[0_0_60px_rgba(255,255,255,0.4),0_0_20px_rgba(255,255,255,0.6)]',
        accent: 'text-white',
        accentHex: '#F0F0F0',
        codeColor: '#F0F0F0'
      };
    }

    const cleanRole = normalizedRoles[0];

    // A-CLASS — PLATINUM: Cold Silver-Blue Metallic (single C-Suite)
    const cSuite: Record<string, any> = {
      ceo: { title: 'CHIEF_EXECUTIVE', colorStyle: 'linear-gradient(135deg,#e8e8ff,#a0c8ff,#4488dd)', text: 'text-white', glow: 'shadow-[0_0_50px_rgba(100,180,255,0.5)]', accentHex: '#B0D8FF', codeColor: '#B0D8FF' },
      cto: { title: 'CHIEF_TECHNOLOGY', colorStyle: 'linear-gradient(135deg,#e8e8ff,#a0c8ff,#4488dd)', text: 'text-white', glow: 'shadow-[0_0_50px_rgba(100,180,255,0.5)]', accentHex: '#B0D8FF', codeColor: '#B0D8FF' },
      cfo: { title: 'CHIEF_FINANCIAL',  colorStyle: 'linear-gradient(135deg,#e8e8ff,#a0c8ff,#4488dd)', text: 'text-white', glow: 'shadow-[0_0_50px_rgba(100,180,255,0.5)]', accentHex: '#B0D8FF', codeColor: '#B0D8FF' },
      coo: { title: 'CHIEF_OPERATIONS', colorStyle: 'linear-gradient(135deg,#e8e8ff,#a0c8ff,#4488dd)', text: 'text-white', glow: 'shadow-[0_0_50px_rgba(100,180,255,0.5)]', accentHex: '#B0D8FF', codeColor: '#B0D8FF' },
      cmo: { title: 'CHIEF_MARKETING',  colorStyle: 'linear-gradient(135deg,#e8e8ff,#a0c8ff,#4488dd)', text: 'text-white', glow: 'shadow-[0_0_50px_rgba(100,180,255,0.5)]', accentHex: '#B0D8FF', codeColor: '#B0D8FF' },
      cio: { title: 'CHIEF_INFORMATION',colorStyle: 'linear-gradient(135deg,#e8e8ff,#a0c8ff,#4488dd)', text: 'text-white', glow: 'shadow-[0_0_50px_rgba(100,180,255,0.5)]', accentHex: '#B0D8FF', codeColor: '#B0D8FF' }
    };

    if (cSuite[cleanRole]) return { ...cSuite[cleanRole], color: '', class: 'A-CLASS' };

    // B-CLASS — IMPERIAL GOLD: Deep Warm Amber Fire (sovereign)
    const bClass: Record<string, any> = {
      owner:      { title: 'SYSTEM_OWNER', colorStyle: 'linear-gradient(135deg,#ffe566,#ffaa00,#7a4e00)', text: 'text-black', glow: 'shadow-[0_0_60px_rgba(255,180,0,0.6),0_0_20px_rgba(255,215,0,0.8)]', accentHex: '#FFD700', codeColor: '#FFD700' },
      superadmin: { title: 'SUPER_ADMIN',  colorStyle: 'linear-gradient(135deg,#ffe566,#ffaa00,#7a4e00)', text: 'text-black', glow: 'shadow-[0_0_60px_rgba(255,180,0,0.6),0_0_20px_rgba(255,215,0,0.8)]', accentHex: '#FFD700', codeColor: '#FFD700' },
      admin:      { title: 'SYSTEM_ADMIN', colorStyle: 'linear-gradient(135deg,#ffe566,#ffaa00,#7a4e00)', text: 'text-black', glow: 'shadow-[0_0_60px_rgba(255,180,0,0.6),0_0_20px_rgba(255,215,0,0.8)]', accentHex: '#FFD700', codeColor: '#FFD700' }
    };

    if (bClass[cleanRole]) return { ...bClass[cleanRole], color: '', class: 'B-CLASS' };

    // C-Class: Oversight Chromatics
    const cClass: Record<string, any> = {
      moderator: { title: 'SYSTEM_MODERATOR', color: 'bg-[#10B981]', text: 'text-black', glow: 'shadow-[0_0_25px_rgba(16,185,129,0.5)]', accent: 'text-emerald-400' },
      manager: { title: 'DEPT_MANAGER', color: 'bg-[#14B8A6]', text: 'text-white', glow: 'shadow-[0_0_25px_rgba(20,184,166,0.5)]', accent: 'text-teal-400' },
      executive: { title: 'EXEC_PROCTOR', color: 'bg-[#475569]', text: 'text-white', glow: 'shadow-[0_0_25px_rgba(71,85,105,0.5)]', accent: 'text-slate-400' },
      staff: { title: 'OPERATIONAL_STAFF', color: 'bg-[#64748B]', text: 'text-white', glow: 'shadow-[0_0_25px_rgba(100,116,139,0.5)]', accent: 'text-slate-500' }
    };

    if (cClass[cleanRole]) return { ...cClass[cleanRole], class: 'C-CLASS' };

    // CORE: Standard Student Theme
    return {
      class: 'CORE',
      title: 'ELITE_SCHOLAR',
      color: 'bg-[#1a1a1a]',
      text: 'text-zinc-600',
      glow: 'shadow-none',
      accent: 'text-zinc-800'
    };
  };

  const roleData = getDisplayRole(user.profile?.user_type || 'student');

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      if (updateError) throw updateError;
      toast({ title: "IDENTITY_SYNC", description: "Biometric node updated." });
      onRefresh();
    } catch (error: any) {
      toast({ title: "SYNC_ERROR", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[440px] mx-auto perspective-1000 will-change-transform">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full aspect-[1/1.58] rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] border border-white/10 bg-[#050505] group cursor-pointer"
      >
        {/* SURGICAL NEON CLICK */}
        <AnimatePresence>
          {isClicked && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} exit={{ opacity: 0 }}
              className={`absolute inset-0 z-50 border-4 ${roleData.class === 'CORE' ? 'border-zinc-800' : 'border-white/20'} rounded-[3rem] ${roleData.glow} pointer-events-none`}
            />
          )}
        </AnimatePresence>

        {/* CLEAN GRADIENTS */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-fuchsia-500/5 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-20 pointer-events-none" />

        {/* ROLE RIBBON: Perfectly Anchored */}
        <div className="absolute top-10 left-0 z-40">
          <div
            className={`${roleData.glow} px-6 py-2.5 rounded-r-full flex flex-col border-y border-r border-white/10`}
            style={{ background: roleData.colorStyle || undefined, backgroundColor: roleData.colorStyle ? undefined : (roleData.color?.replace('bg-','') || '#1a1a1a') }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={10} style={{ color: roleData.accentHex || '#fff' }} />
              <span className={`text-[8px] font-black ${roleData.text} uppercase tracking-[0.3em]`}>{roleData.class}</span>
            </div>
            <span className={`text-[11px] font-black ${roleData.text} uppercase tracking-widest italic leading-tight`}>{roleData.title}</span>
          </div>
        </div>

        <div className="relative h-full flex flex-col z-20 p-10 lg:p-12" style={{ transform: "translateZ(40px)" }}>

          {/* HEADER: Surgical Alignment */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-white/20 shadow-xl">
                  <img src="/logo.png" alt="M" className="w-6 h-6 object-contain" />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight uppercase italic leading-none">Margdarshak</h2>
              </div>
              <span className="text-[7px] font-mono text-white/20 uppercase tracking-[0.5em] ml-12">ENCRYPTED_STATUS</span>
            </div>
            <div className="text-right">
              <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">REG_CODE</div>
              <div className="text-[11px] font-mono font-bold tracking-widest" style={{ color: roleData.codeColor || (roleData.class === 'C-CLASS' ? '#a855f7' : '#52525b') }}>{studentId || 'ID_0000'}</div>
            </div>
          </div>

          {/* AVATAR: Balanced Proportions */}
          <div className="flex flex-col items-center mb-12 relative" style={{ transform: "translateZ(60px)" }}>
            <div className="relative group/avatar">
              <div className="absolute -inset-4 border border-emerald-500/10 rounded-full animate-spin-slow pointer-events-none" />
              <div className="w-52 h-52 rounded-full border-4 border-white/5 overflow-hidden relative z-10 bg-white shadow-2xl flex items-center justify-center">
                <img
                  src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 shadow-[inset_0px_2px_10px_rgba(0,0,0,0.1)] pointer-events-none" />
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
              </div>

              {/* PEN BUTTON: Rounded Cyan FAB */}
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="absolute bottom-1 right-1 w-12 h-12 bg-cyan-500 text-black rounded-full flex items-center justify-center shadow-2xl z-30 hover:scale-110 active:scale-90 transition-all opacity-0 group-hover/avatar:opacity-100 border-4 border-[#050505]"
              >
                {isUploading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Edit2 size={18} />}
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>

          {/* FIELDS: Surgical Spacing */}
          <form onSubmit={onSubmit} className="space-y-6 flex-1 flex flex-col justify-end" style={{ transform: "translateZ(30px)" }}>
            <div className="space-y-2">
              <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.8em] ml-2">IDENTITY_NAME</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-8 py-5 bg-zinc-950/40 border border-white/5 rounded-[2rem] text-2xl font-black text-white focus:outline-none focus:border-emerald-500/30 transition-all uppercase placeholder-white/5"
                placeholder="NULL_IDENTITY"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.8em] ml-2">S_ID</label>
                <div className="w-full px-6 py-4 bg-zinc-900/20 border border-white/5 rounded-2xl text-[10px] font-mono text-white/20 uppercase cursor-not-allowed">
                  {studentId || 'ID_PENDING'}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.8em] text-right block pr-2">SYNCED</label>
                <div className="px-6 py-4 bg-white/[0.01] border border-white/5 rounded-2xl text-[9px] font-black text-white/20 uppercase tracking-widest text-center flex items-center justify-center h-[52px]">
                  {joinDate}
                </div>
              </div>
            </div>

            {/* SYNC PANEL: Clean & Fast */}
            <div className="pt-8 border-t border-white/5 flex items-end justify-between">
              <div className="flex flex-col gap-2">
                <div className="h-10 italic font-signature text-emerald-500/30 text-4xl">
                  {fullName || 'Nexus_Sign'}
                </div>
                <span className="text-[6px] font-mono text-white/10 uppercase tracking-[0.4em]">UUID_{user.id.substring(0, 8).toUpperCase()}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="relative group/btn flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-emerald-500 text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] disabled:opacity-30"
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
