import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/react';
import { 
  LayoutDashboard, Calendar, FileText, Settings, BookOpen, 
  Users, Award, Bell, Search, BrainCircuit, Target, 
  TrendingUp, Clock, CheckCircle2, ChevronRight, Sparkles,
  Lock, Play, Zap, GraduationCap, BarChart3, 
  Shield, Activity, Globe, MessageSquare, ArrowUp, Rocket, Map
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useDashboardData } from '@/hooks/useDashboardData';
import { 
  handleTaskStatusUpdate as handleStatusUtil,
  handleCreateQuickTask as handleCreateUtil,
  handleExportData 
} from '@/lib/dashboardUtils';
import type { DashboardProps } from '@/types/dashboard';
import { AmbientBackground } from '@/components/ui/AmbientBackground'; 
import { SmartTutorCard } from './SmartTutorCard'; 
import DashboardSkeleton from './DashboardSkeleton';
import DashboardHeader from './DashboardHeader';
import WelcomeHeader from './WelcomeHeader';
import StatsGrid from './StatsGrid'; 
import TasksPanel from './TasksPanel';
import AnalyticsPanel from './AnalyticsPanel';
import QuickActions from './QuickActions';
import SecurityPanel from './SecurityPanel';
import AIBriefingWidget from './AIBriefingWidget';
import UpgradeCard from '@/components/dashboard/UpgradeCard';
import { AmbientSoundPlayer } from '@/components/ui/AmbientSoundPlayer';
import { VirtualPet } from './VirtualPet';
import { LeaderboardWidget } from './LeaderboardWidget';
import { BurnoutPredictorWidget } from './BurnoutPredictorWidget';
// UPDATED: Using the better chart component for Productivity Flow
import { TrendChart } from '@/components/ai/QuantumGraph'; 
// Unified Footer is handled by GlobalFooter in App.tsx

const GlassContainer = ({ children, className = '', glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <motion.div
    whileHover={{ scale: 1.001 }}
    transition={{ duration: 0.2 }}
    className={`relative overflow-hidden rounded-[2rem] border border-white/[0.06] shadow-xl transition-all duration-500
      bg-gradient-to-br from-zinc-900/60 via-zinc-900/40 to-zinc-950/70 backdrop-blur-2xl
      hover:border-white/[0.1] data-stream
      ${glow ? 'hover:shadow-indigo-500/10' : ''} ${className}`}
  >
    {/* Top highlight line */}
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    {/* Gradient inner glow */}
    {glow && (
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.04] via-transparent to-purple-500/[0.04] pointer-events-none rounded-[2rem]" />
    )}
    {children}
  </motion.div>
);

// --- LOCKED COMPONENTS ---

const LockedBriefingWidget = () => {
  const navigate = useNavigate();
  return (
    <div className="glare-card relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-zinc-900/80 backdrop-blur-xl shadow-2xl p-8 flex flex-col items-center justify-center text-center group h-[220px]">
      {/* Animated bg orbs */}
      <motion.div animate={{ scale: [1,1.3,1], opacity: [0.05,0.12,0.05] }} transition={{ repeat: Infinity, duration: 5 }}
        className="absolute top-0 right-0 w-[280px] h-[280px] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"
        style={{ background: 'radial-gradient(circle,#6366f1,transparent 70%)' }} />
      <motion.div animate={{ scale: [1,1.2,1], opacity: [0.04,0.1,0.04] }} transition={{ repeat: Infinity, duration: 7, delay: 1 }}
        className="absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2"
        style={{ background: 'radial-gradient(circle,#10b981,transparent 70%)' }} />
      {/* Scanline */}
      <div className="absolute inset-0 rounded-[2rem] overflow-hidden opacity-20 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.03) 0px,transparent 1px,transparent 3px)' }} />

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Feature icon with lock badge */}
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-600/10 border border-indigo-500/30 group-hover:border-indigo-400/50 shadow-lg group-hover:shadow-indigo-500/20 transition-all duration-400"
            style={{ boxShadow: '0 8px 32px rgba(99,102,241,0.15)' }}
          >
            <BrainCircuit className="w-7 h-7 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          </motion.div>
          {/* Lock badge overlay */}
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
            className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center shadow-md group-hover:border-indigo-500/50 group-hover:bg-indigo-950 transition-all duration-300"
          >
            <Lock className="w-3 h-3 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
          </motion.div>
        </div>
        <div>
          <h3 className="text-lg font-black text-white flex items-center justify-center gap-2">
            Daily Briefing
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 uppercase tracking-widest">Premium</span>
          </h3>
          <p className="text-zinc-500 text-xs mt-2 max-w-xs mx-auto leading-relaxed">Unlock AI-powered daily study plans and personalized focus areas.</p>
        </div>
        <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/upgrade')}
          className="star-burst relative mt-1 px-6 py-2.5 rounded-full text-xs font-black text-white flex items-center gap-2 overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 12px 40px rgba(99,102,241,0.4)' }}>
          <Sparkles className="w-3.5 h-3.5" /> Upgrade to Unlock
        </motion.button>
      </div>
    </div>
  );
};

const LockedTrendChart = () => {
  const navigate = useNavigate();
  return (
    <div className="glare-card w-full h-full bg-zinc-900/60 rounded-xl border border-white/[0.06] p-6 relative overflow-hidden flex flex-col items-center justify-center text-center group">
      {/* Ghost chart lines */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 500 250" preserveAspectRatio="none">
          <path d="M0 200 C 150 200, 150 100, 250 150 C 350 200, 350 50, 500 50" fill="none" stroke="#6366f1" strokeWidth="2" />
          <path d="M0 220 C 100 150, 200 180, 300 120 C 400 60, 450 80, 500 30" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 6" />
        </svg>
      </div>
      <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur-[3px]" />
      <div className="relative z-10 flex flex-col items-center gap-3">
        {/* Feature icon with lock badge */}
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-600/10 border border-indigo-500/30 group-hover:border-indigo-400/50 shadow-lg transition-all duration-400"
            style={{ boxShadow: '0 6px 24px rgba(99,102,241,0.12)' }}
          >
            <BarChart3 className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          </motion.div>
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
            className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center shadow-md group-hover:border-indigo-500/50 group-hover:bg-indigo-950 transition-all duration-300"
          >
            <Lock className="w-2.5 h-2.5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
          </motion.div>
        </div>
        <div>
          <h3 className="text-base font-black text-white flex items-center justify-center gap-2">
            Performance Trends
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 uppercase tracking-widest">Premium</span>
          </h3>
          <p className="text-zinc-500 text-xs mt-1.5 max-w-xs mx-auto">Visualize your learning velocity and task completion rates over time.</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/upgrade')}
          className="star-burst mt-1 px-5 py-2 rounded-full text-xs font-black text-white flex items-center gap-1.5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 10px 30px rgba(99,102,241,0.35)' }}>
          <TrendingUp className="w-3 h-3" /> Unlock Analytics
        </motion.button>
      </div>
    </div>
  );
};

const LockedBurnoutWidget = () => {
  const navigate = useNavigate();
  return (
    <div className="glare-card relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-zinc-900/80 backdrop-blur-xl shadow-2xl p-8 flex flex-col items-center justify-center text-center group h-[220px]">
      <motion.div animate={{ scale: [1,1.4,1], opacity: [0.05,0.14,0.05] }} transition={{ repeat: Infinity, duration: 5 }}
        className="absolute top-0 right-0 w-[280px] h-[280px] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"
        style={{ background: 'radial-gradient(circle,#f43f5e,transparent 70%)' }} />
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Feature icon with lock badge */}
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-600/10 border border-rose-500/30 group-hover:border-rose-400/50 shadow-lg group-hover:shadow-rose-500/20 transition-all duration-400"
            style={{ boxShadow: '0 8px 32px rgba(244,63,94,0.12)' }}
          >
            <Activity className="w-7 h-7 text-rose-400 group-hover:text-rose-300 transition-colors" />
          </motion.div>
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
            className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center shadow-md group-hover:border-rose-500/50 group-hover:bg-rose-950 transition-all duration-300"
          >
            <Lock className="w-3 h-3 text-zinc-400 group-hover:text-rose-400 transition-colors" />
          </motion.div>
        </div>
        <div>
          <h3 className="text-lg font-black text-white flex items-center justify-center gap-2">
            Burnout Predictor
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase tracking-widest">Premium</span>
          </h3>
          <p className="text-zinc-500 text-xs mt-2 max-w-xs mx-auto leading-relaxed">AI analysis of your study patterns to predict and prevent academic exhaustion.</p>
        </div>
        <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/upgrade')}
          className="star-burst relative mt-1 px-6 py-2.5 rounded-full text-xs font-black text-white flex items-center gap-2 overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899)', boxShadow: '0 12px 40px rgba(244,63,94,0.4)' }}>
          <Sparkles className="w-3.5 h-3.5" /> Unlock Health AI
        </motion.button>
      </div>
    </div>
  );
};

const getLast7Days = () => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d; // Return date object for formatting in chart
  });
};

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    stats,
    recentTasks,
    recentSessions,
    recentGrades,
    recentNotes,
    courses,
    timetable,
    analytics,
    loading,
    securityVerified,
    isOnline,
    refreshing,
    handleRefresh,
    ultimateSecurityData,
    activeThreats,
    handleCreateQuickTask,
    handleTaskStatusUpdate,
    handleDeleteTask,
    handleBulkDelete
  } = useDashboardData();
  
  const navigate = useNavigate();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'name'>('date');
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  
  const realSubscriptionTier = useMemo(() => {
    if (!clerkLoaded || !clerkUser) return currentUser?.profile?.subscription_tier || null;
    const metadata = clerkUser.publicMetadata || {};
    
    // Deep Extraction from all known Clerk paths
    const subscription = (metadata.subscription as any) || {};
    const rawTier = (
      subscription.tier || 
      (metadata as any).subscription_tier || 
      (metadata as any).tier || 
      currentUser?.profile?.subscription_tier || 
      'free'
    );
    
    let tier = Array.isArray(rawTier) ? String(rawTier[0]).toLowerCase() : String(rawTier).toLowerCase();
    
    const MASTER_IDS = [
      'user_3CwM4tADcqKhELg4ZX9r2xIRC4L', // Admin
      'user_3CylWpMJnNbVpgJcpk9eSIf73gS'  // User from logs
    ];
    
    const rawRoleData = metadata.role;
    const isCeo = Array.isArray(rawRoleData) ? rawRoleData.includes('ceo') : String(rawRoleData).toLowerCase() === 'ceo';
    
    if (MASTER_IDS.includes(clerkUser.id) || isCeo) {
      tier = 'premium_elite';
    }
    
    return tier;
  }, [clerkUser, clerkLoaded, currentUser]);

  const realRole = useMemo(() => {
    if (!clerkLoaded || !clerkUser) return currentUser?.profile?.role || currentUser?.profile?.user_type || null;
    const rawRole = clerkUser.publicMetadata?.role || (clerkUser.publicMetadata as any)?.user_type || currentUser?.profile?.role || 'student';
    
    if (Array.isArray(rawRole)) {
      return rawRole.map(r => String(r).toLowerCase()).join(', ');
    }
    return String(rawRole).toLowerCase();
  }, [clerkUser, clerkLoaded, currentUser]);

  const realFullName = useMemo(() => {
    if (!clerkLoaded || !clerkUser) return currentUser?.user_metadata?.full_name || currentUser?.profile?.full_name || 'Scholar';
    return clerkUser.fullName || 
           (clerkUser.firstName && clerkUser.lastName ? `${clerkUser.firstName} ${clerkUser.lastName}` : clerkUser.firstName || clerkUser.lastName || clerkUser.username || currentUser?.user_metadata?.full_name || 'Scholar');
  }, [clerkUser, clerkLoaded, currentUser]);
  
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeTasks = useMemo(() => recentTasks?.filter(task => !task.is_deleted) || [], [recentTasks]);

  const dashboardStats = useMemo(() => {
    if (!stats) return null;
    const completedTasks = activeTasks.filter(t => t.status === 'completed').length;
    const totalTasks = activeTasks.length;
    const productivityScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    return { ...stats, totalTasks, completedTasks, productivityScore };
  }, [stats, activeTasks]);

  // FIX: Calculate Real Incomplete Count directly from active tasks
  const realIncompleteTasksCount = useMemo(() => {
    return activeTasks.filter(t => t.status !== 'completed').length;
  }, [activeTasks]);

  // FIX: Override analytics object with real calculations
  const realAnalytics = useMemo(() => {
    if (!analytics) return analytics;
    return {
      ...analytics,
      incompleteTasksCount: realIncompleteTasksCount,
      // FIXED: Use total_courses (from DB stats) instead of undefined totalCourses
      totalClasses: dashboardStats?.total_courses || analytics.totalClasses
    };
  }, [analytics, realIncompleteTasksCount, dashboardStats]);

  const hasPremiumAccess = useMemo(() => {
    const effectiveTier = (realSubscriptionTier || 'free').toLowerCase();
    
    console.log('[Dashboard] Access Check:', {
      effectiveTier,
      hasAccess: effectiveTier.includes('premium') || effectiveTier.includes('elite')
    });

    return effectiveTier.includes('premium') || effectiveTier.includes('elite');
  }, [realSubscriptionTier]);

  const filteredTasks = useMemo(() => {
    if (!activeTasks) return [];
    let filtered = [...activeTasks];
    
    if (taskFilter === 'pending') filtered = filtered.filter(t => t.status !== 'completed');
    if (taskFilter === 'completed') filtered = filtered.filter(t => t.status === 'completed');
    if (taskFilter === 'overdue') filtered = filtered.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed');

    if (searchTerm) {
      filtered = filtered.filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const map = { high: 3, medium: 2, low: 1 };
        return (map[b.priority as keyof typeof map] || 0) - (map[a.priority as keyof typeof map] || 0);
      }
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [activeTasks, searchTerm, taskFilter, sortBy]);

  // PREPARE REAL DATA FOR TREND CHART
  const trendChartData = useMemo(() => {
    const last7Days = getLast7Days();
    return last7Days.map(dateObj => {
      const dateStr = dateObj.toISOString().split('T')[0];
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }); 
      const count = activeTasks.filter(t => 
        t.status === 'completed' && t.updated_at?.startsWith(dateStr)
      ).length;

      return {
        label: dayName,
        value: count,
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
      };
    });
  }, [activeTasks]);

  const taskPriorityAnalytics = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0, other: 0 };
    activeTasks.forEach(t => {
      if (t.status !== 'completed') {
        const p = (String(t.priority || 'other').toLowerCase()) as keyof typeof counts;
        if (counts[p] !== undefined) counts[p]++;
        else counts.other++;
      }
    });
    return counts;
  }, [activeTasks]);

  const taskCompletionTrend = useMemo(() => {
      return trendChartData.map(d => ({ date: d.label, completed: d.value })); 
  }, [trendChartData]);

  const categoryAnalytics = useMemo(() => {
    if (!analytics?.subjectBreakdown) return [];
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
    return analytics.subjectBreakdown.map((subject, index) => ({
      name: subject.subject,
      color: colors[index % colors.length],
      completionRate: Math.floor(Math.random() * 40) + 60,
      timeSpent: subject.time
    }));
  }, [analytics]);

  return (
    <AnimatePresence mode="wait">
      {loading || !securityVerified || !dashboardStats || !currentUser ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <DashboardSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30"
        >
          <AmbientBackground />
          
          <AnimatePresence>
          {showBackToTop && (
              <motion.button
                key="back-to-top"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-24 right-6 z-50 p-3.5 rounded-2xl border border-white/10 group overflow-hidden star-burst"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 20px 50px rgba(99,102,241,0.5)' }}
                initial={{ opacity: 0, scale: 0.7, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: 20 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}>
                  <ArrowUp className="w-5 h-5 text-white" />
                </motion.div>
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-[9px] text-white/70 font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-zinc-900/95 border border-white/10 px-2 py-1 rounded-lg uppercase tracking-widest">Top</span>
              </motion.button>
          )}

      </AnimatePresence>

      <div className="relative z-10 max-w-[1600px] 2xl:max-w-[2000px] 4xl:max-w-[3200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        
        <header className="flex flex-col gap-4">
          <DashboardHeader
            currentUser={currentUser}
            realRole={realRole} 
            isOnline={isOnline}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onExport={() => handleExportData(activeTasks, dashboardStats, realAnalytics)}
            onOpenFeatureSpotlight={() => {}}
          />
          <WelcomeHeader 
            fullName={realFullName || currentUser?.profile?.full_name || currentUser?.user_metadata?.full_name} 
            totalTasks={dashboardStats.totalTasks} 
            totalCourses={dashboardStats.totalCourses} 
            totalStudySessions={dashboardStats.totalStudySessions} 
          />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <main className="lg:col-span-8 flex flex-col gap-8 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {hasPremiumAccess ? (
                <AIBriefingWidget 
                  user={currentUser} 
                  tasks={activeTasks}
                  notes={recentNotes}
                  courses={courses}
                  grades={recentGrades}
                  timetable={timetable}
                  sessions={recentSessions}
                  analytics={realAnalytics} 
                  stats={{
                    studyStreak: stats?.study_streak || 0,
                    tasksCompleted: dashboardStats.completedTasks,
                    hoursStudied: Math.round((stats?.minutes_today || 0) / 60),
                  }}
                />
              ) : (
                <LockedBriefingWidget />
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <StatsGrid stats={dashboardStats} />
            </motion.div>
            
            <motion.div className="h-[320px]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {hasPremiumAccess ? (
                <TrendChart data={trendChartData} />
              ) : (
                <LockedTrendChart />
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <SmartTutorCard />
            </motion.div>
            
            <motion.div className="w-full" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
               {hasPremiumAccess ? (
                 <BurnoutPredictorWidget stats={dashboardStats} />
               ) : (
                 <LockedBurnoutWidget />
               )}
            </motion.div>




          </main>

          <aside className="lg:col-span-4 flex flex-col gap-6 h-full lg:sticky lg:top-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="w-full">
               <AmbientSoundPlayer />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="w-full">
               <QuickActions stats={dashboardStats} onNavigate={onNavigate} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="h-48 w-full">
              <VirtualPet stats={stats} tasks={activeTasks} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex-1 min-h-[500px] flex flex-col">
                <GlassContainer glow className="flex-1 flex flex-col p-1 h-full">
                  <TasksPanel
                    tasks={activeTasks}
                    filteredTasks={filteredTasks}
                    selectedTasks={selectedTasks}
                    taskFilter={taskFilter}
                    searchTerm={searchTerm}
                    sortBy={sortBy}
                    onTaskFilterChange={setTaskFilter}
                    onSearchTermChange={setSearchTerm}
                    onSortByChange={setSortBy}
                    onSelectTask={(id) => setSelectedTasks(prev => (prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]))}
                    onStatusUpdate={handleTaskStatusUpdate}
                    onDelete={handleDeleteTask}
                    onCreateQuickTask={handleCreateQuickTask}
                    onSelectAllTasks={() => setSelectedTasks(filteredTasks.map(t => t.id))}
                    onClearSelection={() => setSelectedTasks([])}
                    onBulkAction={async (action) => { 
                      if (action === 'delete') {
                        await handleBulkDelete(selectedTasks);
                        setSelectedTasks([]);
                      } else if (action === 'complete') {
                        selectedTasks.forEach(id => handleTaskStatusUpdate(id, 'completed'));
                        setSelectedTasks([]);
                      } else if (action === 'export') {
                        const selectedData = activeTasks.filter(t => selectedTasks.includes(t.id));
                        handleExportData(selectedData, {}, {});
                        setSelectedTasks([]);
                      }
                    }}
                    onNavigateToTasks={() => navigate('/tasks')}
                  />
                </GlassContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="w-full">
              <GlassContainer glow className="bg-gradient-to-br from-white/[0.03] to-transparent">
                <AnalyticsPanel 
                  analytics={realAnalytics} 
                  tasks={activeTasks} 
                  taskPriorityAnalytics={taskPriorityAnalytics} 
                  taskCompletionTrend={taskCompletionTrend} 
                  categoryAnalytics={categoryAnalytics} 
                />
              </GlassContainer>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="w-full">
              <GlassContainer glow className="p-6">
                <LeaderboardWidget />
              </GlassContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
              <UpgradeCard />
            </motion.div>
          </aside>
        </div>

        
      </div>
    </motion.div>
    )}
    </AnimatePresence>
  );
};

export default Dashboard;
