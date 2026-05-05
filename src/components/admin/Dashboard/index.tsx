import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, Shield, LogOut, Search, Plus, 
  CheckSquare, BookOpen, GraduationCap, BarChart3, PlusCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useDashboardData } from './useDashboardData';
import { 
  AuroraBackground, 
  DashboardSkeleton, 
  ConfirmationModal 
} from './UIComponents';
import { 
  StatisticsGrid, 
  TasksPanel, 
  AnalyticsPanel, 
  QuickActionsGrid 
} from './MainPanels';
import { DashboardProps } from './types';

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const {
    currentUser, stats, recentTasks, recentSessions, recentGrades, recentNotes, courses, timetable, analytics,
    loading, securityVerified, isOnline, refreshing, handleRefresh, handleCreateQuickTask, handleTaskStatusUpdate,
  } = useDashboardData();

  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'name'>('date');
  const { toast } = useToast();

  const logo = "https://orkoqwrdfygfkqqerqvh.supabase.co/storage/v1/object/public/profile-images/VSAV%20GYANTA%20(LOGO).png?t=2025-02-01T07%3A43%3A19.497Z";

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const filteredTasks = useMemo(() => {
    let filtered = [...recentTasks];
    if (taskFilter === 'pending') filtered = filtered.filter(t => t.status !== 'completed');
    if (taskFilter === 'completed') filtered = filtered.filter(t => t.status === 'completed');
    if (taskFilter === 'overdue') filtered = filtered.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed');
    if (searchTerm) filtered = filtered.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [recentTasks, searchTerm, taskFilter]);

  if (loading || !securityVerified) return <DashboardSkeleton />;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden">
        <motion.div className="bg-white/5 backdrop-blur-md rounded-3xl p-12 border border-red-400/20 text-center relative z-10 max-w-md mx-4" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-white/70 mb-8">Please log in to access your secure dashboard.</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-white/60"><Shield className="w-4 h-4" /><span>Secure Isolation Mode Active</span></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 relative overflow-hidden selection:bg-emerald-500/30">
      <AuroraBackground />
      
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-12 bg-white/[0.03] backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl p-2 rounded-2xl flex items-center justify-center shadow-inner-soft hover:rotate-6 transition-transform">
                  <img src={logo} alt="Logo" className="h-10 object-contain" />
                </div>
                <div><h1 className="text-3xl font-black text-white tracking-tighter uppercase">Margdarshak <span className="text-emerald-400">V3.0</span></h1><p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em]">Universal Academic Protocol</p></div>
             </div>
             <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-black/20 rounded-2xl border border-white/5"><div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} /> <span className="text-xs font-bold uppercase tracking-widest">{isOnline ? 'Online' : 'Offline'}</span></div>
                <button onClick={handleRefresh} className={`p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all ${refreshing ? 'animate-spin' : ''}`}><PlusCircle className="w-6 h-6" /></button>
             </div>
          </header>

          <StatisticsGrid stats={stats} formatTime={formatTime} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <TasksPanel 
              filteredTasks={filteredTasks} handleTaskStatusUpdate={handleTaskStatusUpdate} 
              getPriorityClasses={() => ''} getStatusBorderColor={() => ''}
            />
            <AnalyticsPanel analytics={analytics} formatTime={formatTime} />
          </div>

          <QuickActionsGrid onNavigate={onNavigate} />

          <footer className="mt-12 py-8 border-t border-white/10 flex items-center justify-between opacity-50">
            <p>© 2026 VSAV GYANTA • UNIVERSAL ACADEMIC PROTOCOL</p>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /><span className="text-[10px] uppercase font-black">Quantum Isolation Node • Active</span></div>
          </footer>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={modalState.isOpen} title={modalState.title} message={modalState.message} 
        onConfirm={modalState.onConfirm} onClose={() => setModalState({ ...modalState, isOpen: false })} 
      />
    </div>
  );
};

export default Dashboard;
export { Dashboard };
