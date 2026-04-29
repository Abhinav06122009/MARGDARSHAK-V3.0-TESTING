import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Shield, User, Mail, Calendar, 
  MapPin, Phone, Briefcase, Award, Zap,
  Cpu, Command, Sparkles, Fingerprint, Camera,
  Edit3, Save, X, Github, Twitter, Linkedin
} from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import PremiumIDCard from '@/components/settings/PremiumIDCard';
import GlobalFooter from '@/components/layout/GlobalFooter';
import ParallaxBackground from '@/components/ui/ParallaxBackground';

const ProfilePage = ({ onBack }: { onBack?: () => void }) => {
  const { 
    user, loading, fullName, setFullName, studentId, setStudentId,
    handleProfileUpdate, refreshUser 
  } = useSettings();

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('identity');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center gap-8">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="w-16 h-16 border-t-2 border-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
      />
      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[1.5em] animate-pulse">SYNCHRONIZING_BIOMETRICS</span>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-300 selection:bg-emerald-500/30 overflow-x-hidden">
      <ParallaxBackground />
      
      {/* AMBIENT GLOW SYSTEM */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute w-[1000px] h-[1000px] bg-emerald-500/[0.03] blur-[250px] rounded-full"
          animate={{ x: mousePos.x - 500, y: mousePos.y - 500 }}
          transition={{ type: "spring", damping: 120, stiffness: 30 }}
        />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/[0.02] blur-[200px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        
        {/* TOP NAVIGATION / STATUS BAR */}
        <nav className="flex items-center justify-between mb-24">
          <button
            onClick={() => onBack ? onBack() : window.history.back()}
            className="group flex items-center gap-4 px-6 py-3 bg-zinc-950/50 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all backdrop-blur-xl"
          >
            <ArrowLeft size={18} className="text-zinc-500 group-hover:text-emerald-400 group-hover:-translate-x-1 transition-all" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Return_to_Nexus</span>
          </button>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-3 px-5 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Identity_Verified</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center group hover:border-emerald-500/20 transition-all cursor-pointer">
              <Command size={16} className="text-zinc-600 group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* LEFT COLUMN: THE ID CARD (PHYSICAL IDENTITY) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-12 lg:sticky lg:top-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Identity <span className="text-emerald-500">Node</span></h2>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">Your Margdarshak Universal ID. This holographic asset represents your verified status across the ecosystem.</p>
            </div>

            <PremiumIDCard
              user={user}
              fullName={fullName}
              setFullName={setFullName}
              studentId={studentId}
              setStudentId={setStudentId}
              isSubmitting={false}
              onSubmit={handleProfileUpdate}
              onRefresh={refreshUser}
            />

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-2 gap-4">
               <button className="flex flex-col items-center justify-center p-6 bg-zinc-950/40 border border-white/5 rounded-3xl hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all group">
                 <Fingerprint className="w-6 h-6 text-emerald-500/40 mb-3 group-hover:text-emerald-400" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">Security_Key</span>
               </button>
               <button className="flex flex-col items-center justify-center p-6 bg-zinc-950/40 border border-white/5 rounded-3xl hover:border-blue-500/20 hover:bg-blue-500/[0.02] transition-all group">
                 <Award className="w-6 h-6 text-blue-500/40 mb-3 group-hover:text-blue-400" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">Certifications</span>
               </button>
            </div>
          </div>

          {/* RIGHT COLUMN: METADATA & MANAGEMENT */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-16">
            
            {/* CALLIGRAPHY WELCOME HEADER */}
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.5em] mb-4">AESTHETIC_RECOGNITION</span>
              <h1 className="text-6xl lg:text-8xl font-signature text-white italic leading-tight drop-shadow-2xl">
                {fullName || user.profile?.full_name || 'Scholar'}
              </h1>
              <div className="flex items-center gap-6 mt-6">
                <div className="px-6 py-2 bg-emerald-500 text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-full shadow-[0_10px_20px_rgba(16,185,129,0.3)]">
                  {user.profile?.user_type || 'ELITE_MEMBER'}
                </div>
                <div className="px-6 py-2 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-full backdrop-blur-md">
                  V3.0_PROTOCOL
                </div>
              </div>
            </div>

            {/* MANAGEMENT MODULES */}
            <div className="grid gap-8">
              
              {/* BIO-NODE SECTION */}
              <div className="p-10 bg-zinc-950/40 border border-white/5 rounded-[3rem] backdrop-blur-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                   <Cpu className="w-32 h-32 text-emerald-500" />
                </div>
                
                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.6em] mb-10 flex items-center gap-4">
                  <span className="w-10 h-px bg-emerald-500/30" />
                  BIO_SYNCHRONIZATION
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-3">
                     <div className="flex items-center gap-3 mb-2">
                       <Mail size={14} className="text-zinc-600" />
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Protocol_Email</span>
                     </div>
                     <p className="text-xl font-bold text-white tracking-tight">{user.email}</p>
                     <div className="h-px w-full bg-white/5" />
                   </div>

                   <div className="space-y-3">
                     <div className="flex items-center gap-3 mb-2">
                       <Calendar size={14} className="text-zinc-600" />
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Commission_Date</span>
                     </div>
                     <p className="text-xl font-bold text-white tracking-tight">
                       {new Date(user.created_at || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                     </p>
                     <div className="h-px w-full bg-white/5" />
                   </div>

                   <div className="space-y-3">
                     <div className="flex items-center gap-3 mb-2">
                       <MapPin size={14} className="text-zinc-600" />
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Neural_Location</span>
                     </div>
                     <p className="text-xl font-bold text-white tracking-tight">Mumbai_Central_Node</p>
                     <div className="h-px w-full bg-white/5" />
                   </div>

                   <div className="space-y-3">
                     <div className="flex items-center gap-3 mb-2">
                       <Shield size={14} className="text-zinc-600" />
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Subscription_Tier</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <p className="text-xl font-black text-white uppercase tracking-tighter italic">Premium_Elite</p>
                       <Zap size={16} className="text-amber-400 fill-amber-400" />
                     </div>
                     <div className="h-px w-full bg-white/5" />
                   </div>
                </div>

                <div className="mt-16 flex justify-end">
                   <button 
                     onClick={handleProfileUpdate}
                     className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                   >
                     COMMIT_CHANGES
                   </button>
                </div>
              </div>

              {/* SOCIAL GRAPH MODULE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'GitHub', icon: <Github size={20} />, status: 'LINKED', color: 'text-white' },
                  { label: 'Twitter', icon: <Twitter size={20} />, status: 'PENDING', color: 'text-blue-400' },
                  { label: 'LinkedIn', icon: <Linkedin size={20} />, status: 'LINKED', color: 'text-blue-600' }
                ].map((social, i) => (
                  <div key={i} className="p-8 bg-zinc-950/40 border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-white/20 transition-all group cursor-pointer">
                    <div className={`${social.color} opacity-40 group-hover:opacity-100 transition-opacity`}>
                      {social.icon}
                    </div>
                    <span className="text-[10px] font-black text-white/20 group-hover:text-white uppercase tracking-widest transition-colors">{social.label}</span>
                    <div className={`px-4 py-1 rounded-full text-[7px] font-black tracking-[0.2em] ${social.status === 'LINKED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-600'}`}>
                      {social.status}
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>

        {/* FOOTER PUSH */}
        <div className="mt-48">
          <GlobalFooter />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
