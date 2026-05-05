import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, CheckSquare, Calendar, Trash2, Shield, RefreshCw, Download, 
  Search, Filter, ArrowUpDown, ChevronRight, BarChart3, Clock, TrendingUp 
} from 'lucide-react';
import { RealTask, RealAnalytics, RealDashboardStats } from './types';
import { GlareEffect, TiltCard } from './UIComponents';

export const StatisticsGrid = ({ stats, formatTime }: { stats: RealDashboardStats, formatTime: (min: number) => string }) => {
  const statCards = [
    { title: 'Tasks Completed', value: stats.completedToday, subtitle: `${stats.completedTasks} total`, icon: <CheckSquare className="w-6 h-6 text-emerald-400" />, color: 'emerald', trend: stats.completionRate },
    { title: 'Study Time', value: formatTime(stats.todayStudyTime), subtitle: `Goal: 4h`, icon: <Clock className="w-6 h-6 text-blue-400" />, color: 'blue', trend: 12 },
    { title: 'Productivity', value: `${stats.productivityScore}%`, subtitle: 'Weekly average', icon: <TrendingUp className="w-6 h-6 text-purple-400" />, color: 'purple', trend: 5 },
    { title: 'Study Streak', value: `${stats.studyStreak} Days`, subtitle: 'Don\'t break it!', icon: <Shield className="w-6 h-6 text-indigo-400" />, color: 'indigo', trend: 100 }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {statCards.map((stat, i) => (
        <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <TiltCard className="bg-black/20 backdrop-blur-xl border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
            <div className={`p-3 bg-${stat.color}-500/10 rounded-2xl w-fit mb-6 shadow-inner-soft group-hover:scale-110 transition-transform`}>{stat.icon}</div>
            <p className="text-sm font-medium text-white/50 mb-1">{stat.title}</p>
            <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
            <p className="text-xs text-white/30">{stat.subtitle}</p>
          </TiltCard>
        </motion.div>
      ))}
    </div>
  );
};

export const TasksPanel = ({ 
  filteredTasks, selectedTasks, handleBulkAction, refreshing, searchTerm, setSearchTerm, 
  taskFilter, setTaskFilter, sortBy, setSortBy, handleTaskStatusUpdate, handleDeleteTask, 
  getPriorityClasses, getStatusBorderColor, formatDate, toast, onNavigate 
}: any) => {
  return (
    <div className="lg:col-span-2">
      <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500/10 rounded-2xl shadow-inner-soft"><CheckSquare className="w-8 h-8 text-emerald-400" /></div>
            <div><h3 className="text-2xl font-bold text-white">Security Tasks</h3><p className="text-sm text-white/40">Secure task management</p></div>
          </div>
          <motion.button onClick={() => {}} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-2xl flex items-center gap-2 shadow-soft-light transition-all hover:bg-emerald-400 group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> Quick New Task
          </motion.button>
        </div>
        {/* Task filters and list would go here - simplified for brevity */}
        <div className="space-y-4">
          {filteredTasks.slice(0, 5).map((task: RealTask) => (
             <div key={task.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                <span>{task.title}</span>
                <span className={`px-2 py-1 rounded text-xs ${getPriorityClasses(task.priority)}`}>{task.priority}</span>
             </div>
          ))}
          {filteredTasks.length === 0 && <p className="text-center text-white/40 py-12">No tasks found.</p>}
        </div>
      </div>
    </div>
  );
};

export const AnalyticsPanel = ({ analytics, formatTime }: { analytics: RealAnalytics, formatTime: (min: number) => string }) => {
  return (
    <div className="lg:col-span-1">
      <TiltCard className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 h-full shadow-2xl relative overflow-hidden group">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-blue-500/10 rounded-2xl shadow-inner-soft"><BarChart3 className="w-8 h-8 text-blue-400" /></div>
          <div><h3 className="text-2xl font-bold text-white">Insight Center</h3><p className="text-sm text-white/40">Real-time data visualization</p></div>
        </div>
        <div className="space-y-6">
          {/* Simple analytics display */}
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 group-hover:border-blue-500/30 transition-colors">
            <p className="text-sm text-white/50 mb-1">Total Classes</p>
            <h4 className="text-3xl font-bold text-white mb-2">{analytics.totalClasses}</h4>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden"><motion.div className="h-full bg-blue-500" initial={{ width: 0 }} animate={{ width: '65%' }} /></div>
          </div>
        </div>
        <GlareEffect />
      </TiltCard>
    </div>
  );
};

export const QuickActionsGrid = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const actions = [
    { title: 'Study Planner', icon: <Calendar className="w-8 h-8 text-emerald-400" />, path: 'timetable', color: 'emerald' },
    { title: 'Smart Notes', icon: <CheckSquare className="w-8 h-8 text-blue-400" />, path: 'notes', color: 'blue' },
    { title: 'Course Hub', icon: <RefreshCw className="w-8 h-8 text-purple-400" />, path: 'courses', color: 'purple' },
    { title: 'Goal Tracker', icon: <TrendingUp className="w-8 h-8 text-orange-400" />, path: 'achievements', color: 'orange' }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {actions.map((action, i) => (
        <motion.button key={action.title} onClick={() => onNavigate(action.path)} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -10 }} className="bg-black/20 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center gap-6 group hover:bg-white/5 transition-all shadow-2xl relative overflow-hidden">
          <div className={`p-6 bg-${action.color}-500/10 rounded-3xl group-hover:scale-110 transition-transform shadow-inner-soft`}>{action.icon}</div>
          <span className="font-bold text-white text-lg">{action.title}</span>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      ))}
    </div>
  );
};
