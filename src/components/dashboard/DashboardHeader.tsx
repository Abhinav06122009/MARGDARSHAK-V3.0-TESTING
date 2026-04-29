import React, { useState, useMemo } from 'react';
import { useClerk } from '@clerk/react';
import { supabase } from '@/integrations/supabase/client';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { 
  RefreshCw, Wifi, WifiOff, Download, User as UserIcon, 
  Shield, LogOut, Sparkles, ChevronDown, Settings, Bell
} from 'lucide-react';
import logo from "@/components/logo/logo.png";
import type { SecureUser } from '@/types/dashboard';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';

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

  const roleColor = displayRole === 'ADMIN' ? 'from-red-500 to-orange-600'
    : displayRole === 'PREMIUM' || displayRole === 'PREMIUM_ELITE' ? 'from-amber-500 to-yellow-600'
    : 'from-emerald-500 to-teal-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 120, damping: 18 }}
      className="relative flex items-center justify-between px-5 py-3.5 rounded-2xl overflow-hidden"
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-2xl rounded-2xl border border-white/[0.07]" />
      {/* Top highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {/* Subtle left glow */}
      <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* ── LEFT: Logo + Status ── */}
      <div className="relative z-10 flex items-center gap-2 md:gap-4">
        {/* 3D Logo */}
        <motion.div
          className="relative group"
          style={{ perspective: 600 }}
          onMouseMove={handleLogoMouseMove}
          onMouseLeave={handleLogoMouseLeave}
        >
          <motion.div
            style={{ rotateX: logoRotateX, rotateY: logoRotateY }}
            className="relative p-2 md:p-2.5 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-2xl cursor-pointer overflow-hidden group-hover:border-blue-500/50 transition-colors"
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Animated background glow inside logo box */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <img 
              src={logo} 
              alt="MARGDARSHAK" 
              className="h-8 md:h-10 w-auto object-contain relative z-10 brightness-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" 
              draggable={false} 
            />
          </motion.div>
          
          {/* Enhanced Glow under logo */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Brand name - Hidden on small mobile */}
        <div className="hidden xs:block md:block">
          <p className="text-white font-black text-xs md:text-base tracking-tight leading-none">MARGDARSHAK</p>
          <p className="text-zinc-500 text-[8px] md:text-[10px] font-semibold tracking-widest uppercase mt-0.5">AI Academic Platform</p>
        </div>

        {/* Divider - Hidden on mobile */}
        <div className="hidden md:block h-8 w-px bg-white/10 mx-1" />

        {/* Online pill - Simplified on mobile */}
        <motion.div
          className={`flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-full border text-[10px] md:text-xs font-bold transition-colors ${isOnline ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-red-500/10 border-red-500/25 text-red-400'}`}
          animate={isOnline ? { scale: [1, 1.02, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <motion.div
            className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`}
            animate={isOnline ? { opacity: [1, 0.4, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <span className="hidden sm:inline">{isOnline ? 'LIVE' : 'OFFLINE'}</span>
        </motion.div>

        {/* Refresh - Compact on mobile */}
        <motion.button
          onClick={onRefresh}
          disabled={refreshing}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-emerald-400"
        >
          <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* ── RIGHT: Actions + User ── */}
      <div className="relative z-10 flex items-center gap-3">
        {extraActions}

        {/* Export dropdown */}
        <div className="relative">
          <motion.button
            onClick={() => { setShowExportMenu(v => !v); setShowUserMenu(false); }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-zinc-300 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            Export
            <ChevronDown className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
          </motion.button>
          <AnimatePresence>
            {showExportMenu && (
              <motion.div
                key="export-menu"
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-40 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {['CSV', 'JSON'].map(type => (
                  <button key={type}
                    onClick={() => { onExport(type.toLowerCase() as any); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-500" />
                    Export as {type}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <motion.button
          onClick={() => navigate('/settings')}
          whileHover={{ scale: 1.08, rotate: 30 }}
          whileTap={{ scale: 0.92 }}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-zinc-400"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </motion.button>

        {/* Direct Logout Button */}
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-red-400 group"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        </motion.button>

        {/* User pill */}
        <div className="relative">
          <motion.button
            onClick={() => { setShowUserMenu(v => !v); setShowExportMenu(false); }}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-4 py-2 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all cursor-pointer group"
          >
            {/* Avatar */}
            <div className="relative">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center shadow-lg text-white text-sm font-black`}>
                {initials}
              </div>
              {/* Online dot */}
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-zinc-900"
                animate={{ scale: [1, 1.3, 1], boxShadow: ['0 0 0px 0px rgba(52,211,153,0)', '0 0 6px 2px rgba(52,211,153,0.7)', '0 0 0px 0px rgba(52,211,153,0)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-white font-bold text-sm leading-none">{nameToUse.split(' ')[0]}</p>
              <p className={`text-xs font-bold mt-0.5 flex items-center gap-1 bg-gradient-to-r ${roleColor} bg-clip-text text-transparent`}>
                <Shield className="w-2.5 h-2.5 text-emerald-400" />
                {displayRole}
              </p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </motion.button>

          {/* User dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                key="user-menu"
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-white font-bold text-sm">{nameToUse}</p>
                  <p className="text-zinc-500 text-xs truncate">{currentUser.email}</p>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors font-medium"
                  >
                    <Settings className="w-4 h-4 text-zinc-500" /> Account Settings
                  </button>
                  <button
                    onClick={() => { navigate('/upgrade'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-amber-300 hover:bg-amber-500/10 transition-colors font-medium"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" /> Upgrade Plan
                  </button>
                </div>
                <div className="p-1.5 border-t border-white/5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;