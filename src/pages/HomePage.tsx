import React, { useState, useEffect } from 'react';
import { useClerk } from '@clerk/react';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Calendar, CheckSquare, BookOpen, Trophy, Timer, Calculator, LogOut, User, TrendingUp, Target, Zap, Star, Bell, Sparkles, Search, Plus, MoreHorizontal, Edit, Trash2, Database, Shield, LayoutGrid } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { dashboardService } from '@/lib/dashboardService';
import logo from "@/components/logo/logo.png";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  totalStudyTime: number;
  averageGrade: number;
  upcomingClasses: number;
  totalNotes: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  created_at: string;
}

interface StudySession {
  id: string;
  subject?: string;
  duration: number;
  start_time: string;
  session_type: string;
}

interface UserProfile {
  id: string;
  email?: string;
  profile?: {
    full_name?: string;
    avatar_url?: string;
    subscription_tier?: string;
    role?: string;
  };
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    totalStudyTime: 0,
    averageGrade: 0,
    upcomingClasses: 0,
    totalNotes: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { signOut } = useClerk();

  const getCurrentUser = React.useCallback(async () => {
    const secureUser = await dashboardService.getCurrentUser();
    if (secureUser) {
      setUser({
        id: secureUser.id,
        email: secureUser.email,
        profile: {
          full_name: secureUser.profile?.full_name,
          subscription_tier: secureUser.profile?.subscription_tier,
          role: secureUser.profile?.role
        }
      });
    }
  }, []);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      const secureUser = await dashboardService.getCurrentUser();
      if (!secureUser) return;

      const data = await dashboardService.fetchAllUserData(secureUser.id);
      const calculatedStats = dashboardService.calculateSecureStats(data);

      setStats({
        totalTasks: calculatedStats.totalTasks,
        completedTasks: calculatedStats.completedTasks,
        totalStudyTime: calculatedStats.totalStudyTime,
        averageGrade: calculatedStats.averageGrade,
        upcomingClasses: calculatedStats.totalClassesCount,
        totalNotes: calculatedStats.totalNotes,
      });

      setRecentTasks(data.tasks?.slice(0, 3) || []);
      setRecentSessions(data.studySessions?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCurrentUser();
    fetchDashboardData();
  }, [getCurrentUser, fetchDashboardData]);

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      if (!user) return;
      await dashboardService.updateTaskStatus(taskId, newStatus, user.id);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCreateQuickTask = async () => {
    try {
      if (!user) return;
      await dashboardService.createQuickTask(user.id);
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({ title: "Session Terminated", description: "Safe extraction complete." });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
          <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 animate-pulse" />
        </div>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Initializing Zenith Core...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Zenith Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,20,15,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        
        {/* Animated Neural Orbs */}
        <motion.div 
          animate={{ opacity: [0.1, 0.15, 0.1], scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute top-0 -left-40 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ opacity: [0.05, 0.1, 0.05], scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 -right-40 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px]"
        />
        
        {/* Neural Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10">
          
          {/* Header Architecture */}
          <header className="flex flex-col md:flex-row items-center justify-between p-6 rounded-[2.8rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.05] to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-6">
              <div className="p-2 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-all duration-700">
                <img src={logo} alt="Margdarshak" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white leading-none">
                  Zenith <span className="text-emerald-500 not-italic font-light">Dashboard</span>
                </h1>
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 ml-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Margdarshak Intelligence Suite
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8 md:mt-0">
              <div className="flex items-center gap-3 bg-white/[0.02] px-6 py-3 rounded-2xl border border-white/10 shadow-xl group/profile transition-all hover:border-emerald-500/30">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-lg group-hover/profile:scale-110 transition-transform">
                  <User className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-1">{user?.profile?.full_name || 'Vanguard'}</div>
                  <div className="text-[8px] text-emerald-500 font-black uppercase tracking-widest opacity-60">Elite Scholar Status</div>
                </div>
              </div>
              <Button onClick={handleLogout} variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 text-zinc-500 hover:text-red-500 transition-all">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </header>

          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-2">
                <Zap size={10} className="text-emerald-400" />
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Neural Sync: Active</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
                Operational <span className="text-emerald-500">Core</span>
              </h2>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.4em] mt-2">Engineering Academic Excellence</p>
            </div>
            
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 backdrop-blur-3xl shadow-2xl transition-all hover:border-emerald-500/20">
                <Search className="w-4 h-4 text-zinc-500 mr-3" />
                <input 
                  type="text" 
                  placeholder="SCAN ARCHITECTURAL SUITE..." 
                  className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-white focus:outline-none w-full placeholder-zinc-700"
                />
              </div>
            </div>
          </div>

          {/* Core Grid Architecture */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Task Matrix */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.01] border border-white/5 backdrop-blur-3xl rounded-[3rem] p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Tactical Objectives</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleCreateQuickTask} variant="ghost" size="icon" className="h-10 w-10 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400">
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => onNavigate('tasks')} variant="ghost" size="icon" className="h-10 w-10 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/5 text-zinc-500">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                {recentTasks.length > 0 ? (
                  recentTasks.map((task, index) => (
                    <motion.div 
                      key={task.id} 
                      whileHover={{ x: 4 }}
                      className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-500 hover:shadow-xl ${index === 0 ? 'bg-emerald-500/[0.02] border-emerald-500/10 hover:border-emerald-500/30' : index === 1 ? 'bg-blue-500/[0.02] border-blue-500/10 hover:border-blue-500/30' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                    >
                      <button
                        onClick={() => handleTaskStatusUpdate(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          task.status === 'completed' 
                            ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                            : 'border-white/10 hover:border-emerald-500/50'
                        }`}
                      >
                        {task.status === 'completed' && <CheckSquare className="w-3 h-3 text-black" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[11px] font-black uppercase tracking-widest truncate ${task.status === 'completed' ? 'text-zinc-500 line-through' : 'text-white'}`}>{task.title}</div>
                        <div className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-1">{task.description || 'No Protocol Assigned'}</div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-16 opacity-30">
                    <Database className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Active Signals</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Neural Progress */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white/[0.01] border border-white/5 backdrop-blur-3xl rounded-[3rem] p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col items-center justify-center group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.02] to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 mb-10 w-full">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Cognitive Mastery</h3>
              </div>

              <div className="relative mb-10 group/progress">
                <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-0 group-hover/progress:opacity-20 transition-opacity duration-1000" />
                <svg className="w-48 h-48 transform -rotate-90 relative z-10">
                  <circle cx="96" cy="96" r="80" stroke="rgba(255,255,255,0.02)" strokeWidth="12" fill="none" />
                  <motion.circle
                    cx="96" cy="96" r="80" stroke="url(#dash-gradient)" strokeWidth="12" fill="none" strokeLinecap="round"
                    initial={{ strokeDasharray: "0 502.65" }}
                    animate={{ strokeDasharray: `${(stats.completedTasks / (stats.totalTasks || 1)) * 502.65} 502.65` }}
                    transition={{ duration: 2, ease: "circOut" }}
                  />
                  <defs>
                    <linearGradient id="dash-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <span className="text-4xl font-black text-white italic leading-none">{Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)}%</span>
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-2">Efficiency Index</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 w-full px-4">
                <div className="text-left">
                  <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Completed</div>
                  <div className="text-xl font-black text-emerald-500 italic">{stats.completedTasks} <span className="text-[10px] opacity-40">UNITS</span></div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Pending</div>
                  <div className="text-xl font-black text-white/40 italic">{stats.totalTasks - stats.completedTasks} <span className="text-[10px] opacity-40">NODES</span></div>
                </div>
              </div>
            </motion.div>

            {/* Neural Sessions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white/[0.01] border border-white/5 backdrop-blur-3xl rounded-[3rem] p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Neural Sessions</h3>
                </div>
                <Button onClick={() => onNavigate('timer')} variant="ghost" size="icon" className="h-10 w-10 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400">
                  <Timer className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4 relative z-10">
                {recentSessions.length > 0 ? (
                  recentSessions.map((session, index) => (
                    <div key={session.id} className="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-500 group/session shadow-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 group-hover/session:scale-110 transition-transform">
                          <BookOpen className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-white uppercase tracking-widest">{session.subject || 'General Orchestration'}</div>
                          <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-1">Academic Protocol</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-black text-emerald-500 italic">{Math.floor(session.duration / 60)}h {session.duration % 60}m</div>
                        <div className="text-[7px] text-zinc-700 font-black uppercase tracking-widest mt-1">Duration</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 opacity-30">
                    <Timer className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Sessions Detected</p>
                  </div>
                )}

                <Button 
                  onClick={() => onNavigate('timer')}
                  className="w-full h-14 mt-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-emerald-500 hover:text-black transition-all shadow-2xl shadow-white/5 group/btn overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-700" />
                  <span className="relative z-10">Initialize New Session →</span>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Quick Command Interface */}
          <div className="space-y-6">
             <div className="flex items-center gap-4 px-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Subsystem Access</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                  { page: 'timetable', icon: Calendar, title: 'Timetable', desc: `${stats.upcomingClasses} Classes`, color: 'from-emerald-500 to-blue-600', bg: 'bg-emerald-500/10' },
                  { page: 'tasks', icon: CheckSquare, title: 'Tasks', desc: `${stats.totalTasks} Units`, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500/10' },
                  { page: 'timer', icon: Timer, title: 'Session', desc: `${Math.floor(stats.totalStudyTime / 60)}h Total`, color: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-500/10' },
                  { page: 'notes', icon: BookOpen, title: 'Signals', desc: `${stats.totalNotes} Saved`, color: 'from-blue-400 to-blue-600', bg: 'bg-blue-500/10' },
                  { page: 'grades', icon: Trophy, title: 'Metrics', desc: `${stats.averageGrade.toFixed(1)}% Avg`, color: 'from-emerald-600 to-blue-600', bg: 'bg-emerald-500/10' },
                  { page: 'calculator', icon: Calculator, title: 'Compute', desc: 'Neural Math', color: 'from-blue-600 to-indigo-700', bg: 'bg-blue-500/10' }
                ].map((item, index) => (
                  <motion.button
                    key={item.page}
                    onClick={() => onNavigate(item.page)}
                    className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 text-left hover:border-emerald-500/30 transition-all duration-700 group relative overflow-hidden shadow-2xl"
                    whileHover={{ y: -8, scale: 1.02 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + (index * 0.05), duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${item.color} mb-6 shadow-xl group-hover:scale-110 transition-transform duration-700`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-[11px] font-black text-white uppercase italic tracking-tighter mb-1 relative z-10">{item.title}</h3>
                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] relative z-10 opacity-60">{item.desc}</p>
                  </motion.button>
                ))}
              </div>
          </div>

          {/* Tactical Diagnostic Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
              className="p-10 rounded-[3.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
              <div className="flex items-center gap-6 mb-8 relative z-10">
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <Shield className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Security <span className="text-emerald-500">Protocol</span></h3>
                  <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-1">Margdarshak Guard v3.0.2</p>
                </div>
              </div>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8 uppercase tracking-widest opacity-80">
                Your architectural session is protected by <span className="text-white italic">Mission Critical Encryption</span>. Autonomous threat detection is monitoring all neural handshakes.
              </p>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest italic">RSA-4096 Secured</span>
                 </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
              className="p-10 rounded-[3.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />
              <div className="flex items-center gap-6 mb-8 relative z-10">
                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                  <LayoutGrid className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Neural <span className="text-blue-500">Sync</span></h3>
                  <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-1">Margdarshak Real-Time Engine</p>
                </div>
              </div>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8 uppercase tracking-widest opacity-80">
                All academic signals are currently synchronized with the <span className="text-white italic">Margdarshak Global Intelligence Network</span>. Low-latency data streaming is active.
              </p>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                    <span className="w-1 h-1 rounded-full bg-blue-500 animate-ping" />
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest italic">Signal Strength: 100%</span>
                 </div>
              </div>
            </motion.div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};

export default Dashboard;
