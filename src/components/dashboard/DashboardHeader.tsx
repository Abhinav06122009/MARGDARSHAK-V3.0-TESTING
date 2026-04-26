import React, { useState } from 'react';
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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast({ title: 'Logout Failed', variant: 'destructive' });
  };

  const displayRole = (realRole || currentUser.profile?.role || 'STUDENT').toUpperCase();
  const initials = (currentUser.profile?.full_name || currentUser.email || 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

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
          className="relative"
          style={{ perspective: 600 }}
          onMouseMove={handleLogoMouseMove}
          onMouseLeave={handleLogoMouseLeave}
        >
          <motion.div
            style={{ rotateX: logoRotateX, rotateY: logoRotateY }}
            className="bg-white/95 p-2 rounded-lg md:p-2.5 md:rounded-xl shadow-lg shadow-black/30 cursor-pointer"
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <img src={logo} alt="MARGDARSHAK" className="h-7 md:h-9 object-contain" draggable={false} />
          </motion.div>
          {/* Glow under logo */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-white/20 rounded-full blur-md" />
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
              <p className="text-white font-bold text-sm leading-none">{currentUser.profile?.full_name?.split(' ')[0] || 'User'}</p>
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
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-white font-bold text-sm">{currentUser.profile?.full_name || 'User'}</p>
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