import React, { useState, useMemo } from 'react';
import { useClerk } from '@clerk/react';
import { supabase } from '@/integrations/supabase/client';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { 
  RefreshCw, Wifi, WifiOff, Download, User as UserIcon, 
  Shield, LogOut, Sparkles, ChevronDown, Settings, Bell, Search
} from 'lucide-react';
import logo from "@/components/logo/logo.png";
import type { SecureUser } from '@/types/dashboard';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { useRankTheme } from '@/context/ThemeContext';

interface DashboardHeaderProps {
  currentUser: SecureUser;
  realRole?: string | null;
  isOnline: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onExport: (type: 'csv' | 'json') => void;
  onOpenFeatureSpotlight: () => void;
  extraActions?: React.ReactNode;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  currentUser, realRole, isOnline, refreshing, onRefresh, onExport, extraActions 
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme } = useRankTheme();
  const RankIcon = theme.icons.rank;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const logoX = useMotionValue(0);
  const logoY = useMotionValue(0);
  const logoRotateX = useTransform(logoY, [-30, 30], [10, -10]);
  const logoRotateY = useTransform(logoX, [-30, 30], [-10, 10]);

  const handleLogoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    logoX.set(e.clientX - rect.left - rect.width / 2);
    logoY.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleLogoMouseLeave = () => { logoX.set(0); logoY.set(0); };

  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast({ title: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      toast({ title: 'Logout Failed', variant: 'destructive' });
    }
  };

  const displayRole = (realRole || currentUser.profile?.role || 'STUDENT').toUpperCase();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  const nameToUse = useMemo(() => {
    if (clerkLoaded && clerkUser) {
      return clerkUser.fullName || 
             (clerkUser.firstName && clerkUser.lastName ? `${clerkUser.firstName} ${clerkUser.lastName}` : clerkUser.firstName || clerkUser.lastName || clerkUser.username || currentUser.user_metadata?.full_name || currentUser.profile?.full_name || currentUser.email || 'User');
    }
    return currentUser.user_metadata?.full_name || currentUser.profile?.full_name || currentUser.email || 'User';
  }, [clerkUser, clerkLoaded, currentUser]);

  const initials = useMemo(() => {
    return nameToUse.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }, [nameToUse]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 120, damping: 18 }}
      className="relative flex items-center justify-between px-5 py-3.5 rounded-2xl overflow-hidden"
    >
      {/* Premium glass background */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur-2xl" />
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-60"
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ background: theme.gradients.shimmer, backgroundSize: '200% 100%' }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      
      {/* Dynamic Theme Glow */}
      <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[100px] pointer-events-none opacity-20"
        style={{ backgroundColor: theme.colors.glow }} />

      {/* LEFT: Logo + Status */}
      <div className="relative z-10 flex items-center gap-2 md:gap-4">
        <motion.div
          className="relative group"
          style={{ perspective: 1000 }}
          onMouseMove={handleLogoMouseMove}
          onMouseLeave={handleLogoMouseLeave}
        >
          <motion.div
            style={{ rotateX: logoRotateX, rotateY: logoRotateY }}
            className="relative p-2 md:p-3 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer overflow-hidden group-hover:border-white/30 transition-all duration-500"
            whileHover={{ scale: 1.1, rotateZ: 2 }}
          >
            <motion.div 
              animate={{ translateX: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none" 
            />
            <img src={logo} alt="MARGDARSHAK" className="h-9 md:h-11 w-auto object-contain relative z-10 brightness-125 contrast-125" draggable={false} />
          </motion.div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-full h-4 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"
            style={{ backgroundColor: theme.colors.glow }} />
        </motion.div>

        <div className="hidden xs:block">
          <p className="text-white font-black text-xs md:text-base tracking-tighter leading-none">MARGDARSHAK</p>
          <p className="text-zinc-500 text-[8px] md:text-[10px] font-bold tracking-[0.2em] uppercase mt-0.5">{theme.name}</p>
        </div>

        <div className="hidden md:block h-8 w-px bg-white/10 mx-1" />

        <motion.div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black transition-colors ${isOnline ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-red-500/10 border-red-500/25 text-red-400'}`}
          animate={isOnline ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <span className="tracking-widest">{isOnline ? 'ACTIVE' : 'OFFLINE'}</span>
        </motion.div>

        <motion.button
          onClick={onRefresh}
          disabled={refreshing}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* RIGHT: Actions + User */}
      <div className="relative z-10 flex items-center gap-3">
        {extraActions}

        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { const e = new KeyboardEvent('keydown', { ctrlKey: true, key: 'k', bubbles: true }); window.dispatchEvent(e); }}
          className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/20 transition-all text-zinc-400 hover:text-white text-xs font-bold"
        >
          <Search className="w-4 h-4" />
          <span className="tracking-wide">Quick Access</span>
          <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono opacity-50">⌘K</kbd>
        </motion.button>

        <div className="relative">
          <motion.button
            onClick={() => { setShowExportMenu(v => !v); setShowUserMenu(false); }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-xs font-black uppercase tracking-widest"
          >
            <Download className="w-4 h-4" />
            <ChevronDown className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
          </motion.button>
          <AnimatePresence>
            {showExportMenu && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                {['CSV', 'JSON'].map(type => (
                  <button key={type} onClick={() => { onExport(type.toLowerCase() as any); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-xs font-bold text-zinc-400 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest">
                    <Download className="w-4 h-4" /> {type} Format
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          onClick={() => { setShowUserMenu(v => !v); setShowExportMenu(false); }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-2xl border bg-white/5 transition-all"
          style={{ borderColor: theme.colors.border }}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-2xl"
              style={{ background: theme.gradients.main }}>
              {initials}
            </div>
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-900 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <RankIcon className="w-2 h-2 text-white fill-current" />
            </motion.div>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-white font-black text-xs leading-none uppercase tracking-tighter">{nameToUse.split(' ')[0]}</p>
            <p className="text-[9px] font-black mt-1 uppercase tracking-widest opacity-60" style={{ color: theme.colors.primary }}>{displayRole}</p>
          </div>
        </motion.button>

        <AnimatePresence>
          {showUserMenu && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-64 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl z-50 p-2 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 mb-2">
                <p className="text-white font-black text-sm uppercase tracking-tighter">{nameToUse}</p>
                <p className="text-zinc-500 text-[10px] font-bold mt-1 truncate">{currentUser.email}</p>
              </div>
              <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-xs font-black text-zinc-400 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest">
                <Settings className="w-4 h-4" /> Account Interface
              </button>
              <button onClick={() => navigate('/upgrade')} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-xs font-black text-amber-400 hover:bg-amber-400/10 transition-all uppercase tracking-widest">
                <Sparkles className="w-4 h-4 fill-amber-400" /> Ascension
              </button>
              <div className="h-px bg-white/5 my-2 mx-4" />
              <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-xs font-black text-red-500 hover:bg-red-500/10 transition-all uppercase tracking-widest">
                <LogOut className="w-4 h-4" /> Terminate Session
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;