import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Plus, Search, ChevronDown, AlertCircle, Trash2, Download, Eye, Inbox, X } from 'lucide-react';
import TaskItem from './TaskItem';
import type { RealTask } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import NeumorphicButton from '@/lib/NeumorphicButton';
import { Button } from '@/components/ui/button';

interface TasksPanelProps {
  tasks: RealTask[];
  filteredTasks: RealTask[];
  selectedTasks: string[];
  taskFilter: 'all' | 'pending' | 'completed' | 'overdue';
  searchTerm: string;
  sortBy: 'date' | 'priority' | 'name';
  onTaskFilterChange: (filter: 'all' | 'pending' | 'completed' | 'overdue') => void;
  onSearchTermChange: (term: string) => void;
  onSortByChange: (sort: 'date' | 'priority' | 'name') => void;
  onSelectTask: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onCreateQuickTask: () => void;
  onBulkAction: (action: 'complete' | 'delete' | 'export') => void;
  onNavigateToTasks: () => void;
  onSelectAllTasks: () => void;
  onClearSelection: () => void;
  className?: string;
}

const getPriorityClasses = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-300 bg-red-500/20 border-red-400/30';
    case 'medium': return 'text-amber-300 bg-amber-500/20 border-amber-400/30';
    case 'low': return 'text-emerald-300 bg-emerald-500/20 border-emerald-400/30';
    default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
};

const getStatusBorderColor = (status: string) => {
  switch (status) {
    case 'completed': return 'border-emerald-500/50';
    case 'in_progress': return 'border-amber-500/50';
    case 'pending': return 'border-blue-500/50';
    default: return 'border-gray-600/50';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export const TasksPanel: React.FC<TasksPanelProps> = ({
  tasks,
  filteredTasks,
  selectedTasks,
  taskFilter,
  searchTerm,
  sortBy,
  onTaskFilterChange,
  onSearchTermChange,
  onSortByChange,
  onSelectTask,
  onStatusUpdate,
  onDelete,
  onCreateQuickTask,
  onBulkAction,
  onNavigateToTasks,
  onSelectAllTasks,
  onClearSelection,
  className,
}) => {
  const overdueTasks = filteredTasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  ).length;
  
  const highPriorityTasks = filteredTasks.filter(task => 
    task.priority === 'high' && task.status !== 'completed'
  ).length;

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-zinc-950/40 backdrop-blur-3xl p-6 md:p-10 rounded-[3rem] border border-white/10 relative overflow-hidden group shadow-[0_30px_80px_rgba(0,0,0,0.5)]", className)}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="p-5 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
            >
              <CheckSquare className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Objective_Core</h2>
              <p className="text-zinc-500 text-sm font-bold tracking-tight mt-1">Operational Task Tracking</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Efficiency</span>
               <span className="text-2xl font-black text-emerald-400 tabular-nums">{Math.round(progress)}%</span>
            </div>
            <div className="w-56 h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, type: 'spring' }}
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[280px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search active objectives..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all shadow-inner"
            />
          </div>
          
          <div className="flex gap-2 p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => onTaskFilterChange(f)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                  taskFilter === f ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateQuickTask}
            className="p-4 bg-gradient-to-br from-emerald-400 to-teal-600 text-white rounded-2xl shadow-xl shadow-emerald-500/20"
          >
            <Plus className="w-6 h-6" strokeWidth={3} />
          </motion.button>
        </div>

        {/* Task Alerts */}
        {(overdueTasks > 0 || highPriorityTasks > 0) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 p-5 bg-red-500/5 border border-red-500/20 rounded-[1.5rem] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent animate-pulse" />
            <AlertCircle className="w-5 h-5 text-red-500 relative z-10" />
            <div className="text-xs font-black uppercase tracking-widest text-zinc-300 relative z-10">
              {overdueTasks > 0 && <span className="text-red-500">{overdueTasks} Critical Overdue</span>}
              {overdueTasks > 0 && highPriorityTasks > 0 && <span className="mx-2 text-zinc-700">|</span>}
              {highPriorityTasks > 0 && <span className="text-orange-500">{highPriorityTasks} High Priority</span>}
            </div>
          </motion.div>
        )}

        {/* Task List */}
        <div className="relative min-h-[450px]">
          <ScrollArea className="h-[500px] pr-4">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length > 0 ? (
                <div className="space-y-4">
                  {filteredTasks.map((task, idx) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <TaskItem 
                        task={task}
                        isSelected={selectedTasks.includes(task.id)}
                        onSelect={() => onSelectTask(task.id)}
                        onStatusUpdate={onStatusUpdate}
                        onDelete={onDelete}
                        getPriorityClasses={getPriorityClasses}
                        getStatusBorderColor={getStatusBorderColor}
                        formatDate={formatDate}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-32 text-center"
                >
                  <div className="p-10 rounded-full bg-white/[0.02] border border-white/5 mb-8 relative">
                    <Inbox className="w-20 h-20 text-zinc-800" />
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                      className="absolute inset-0 border border-dashed border-zinc-800 rounded-full"
                    />
                  </div>
                  <p className="text-zinc-500 font-black text-xl uppercase tracking-tighter">No Objectives Active</p>
                  <p className="text-zinc-700 text-xs mt-2 uppercase tracking-[0.3em] font-black">All parameters operating at nominal levels</p>
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>
      </div>
    </motion.div>
  );
};

export default TasksPanel;