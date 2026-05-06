// src/components/tasks/Tasks.tsx

import React, { useState, useEffect } from 'react';
import TaskAIPanel from './ai/TaskAIPanel';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, Book, Users, Calendar, Search, Filter, BookOpen, X, LayoutGrid, List, Kanban, Play, Folder, Download, CheckSquare,
  GraduationCap, Shield, AlertCircle, CheckCircle, Eye, BarChart3,
  ArrowLeft, Palette, Clock, MapPin, User, Star, TrendingUp, Flag, Target, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { TiltCard } from '@/components/ui/TiltCard';
import { taskService } from './taskService';
import { courseService } from '@/components/dashboard/courseService';
import { useAuth } from '@/contexts/AuthContext';
import type { Task, TaskFormData, SecureUser, TaskStats } from './types';
import type { Course } from '@/components/dashboard/course';
import ParallaxBackground from '@/components/ui/ParallaxBackground';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import TaskCard from './TaskCard';
import KanbanBoard from './KanbanBoard';
import TaskGrid from './TaskGrid';
import modelRouter from '@/lib/ai/modelRouter';

// Social Icons
const LinkedinLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const TwitterLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z" />
  </svg>
);

interface TaskTableProps {
  tasks: Array<Task & { depth: number }>;
  onEdit: (task: Task) => void;
  onDelete: (id: string, name: string) => void;
  selectedTasks: string[];
  onSelectTask: (id: string) => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks, onEdit, onDelete, selectedTasks, onSelectTask, onSelectAll, isAllSelected, isSomeSelected }) => {
  return (
    <div className="overflow-hidden bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-4 shadow-2xl relative">
      {/* Aurora Accent */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[1000px] text-sm text-left">
          <thead className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
            <tr className="border-b border-white/5">
              <th scope="col" className="p-6">
                <Checkbox
                  checked={isAllSelected || (isSomeSelected ? 'indeterminate' : false)}
                  onCheckedChange={onSelectAll}
                  className="h-5 w-5 rounded-md bg-black/40 border-white/20 data-[state=checked]:bg-indigo-500"
                />
              </th>
              <th scope="col" className="px-6 py-6">Title</th>
              <th scope="col" className="px-6 py-6 text-center">Status</th>
              <th scope="col" className="px-6 py-6 text-center">Priority</th>
              <th scope="col" className="px-6 py-6 text-center">Category</th>
              <th scope="col" className="px-6 py-6">Timeline</th>
              <th scope="col" className="px-6 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody layout className="relative z-10">
            <AnimatePresence mode="popLayout">
              {tasks.map((task, index) => (
                <motion.tr
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03, type: 'spring', stiffness: 120, damping: 14 }}
                  className={`
                    border-b border-white/5 hover:bg-white/[0.03] transition-all duration-300 group
                    ${selectedTasks.includes(task.id) ? 'bg-indigo-500/10' : ''}
                  `}
                >
                  <td className="p-6">
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={() => onSelectTask(task.id)}
                      className="h-5 w-5 rounded-md bg-black/40 border-white/20 data-[state=checked]:bg-indigo-500"
                    />
                  </td>
                  <th scope="row" className="px-6 py-6">
                    <div style={{ paddingLeft: `${task.depth * 2}rem` }} className="flex items-center gap-4">
                      <div
                        className="w-1.5 h-10 rounded-full flex-shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-transform duration-500 group-hover:scale-y-110"
                        style={{ backgroundColor: taskService.getCategoryColor(task.category, taskService.getTaskCategories()) }}
                      />
                      <div className="flex flex-col">
                        <span className="text-base font-black text-white tracking-tight leading-tight group-hover:text-indigo-300 transition-colors">
                          {task.title}
                        </span>
                        {task.parent_task_id && (
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Sub-Task</span>
                        )}
                      </div>
                    </div>
                  </th>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <Badge className={`
                        px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                        ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            task.status === 'review' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                              'bg-amber-500/10 text-amber-400 border-amber-500/20'}
                      `}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span
                        className="text-[11px] font-black uppercase tracking-tighter px-3 py-1 bg-white/5 rounded-lg border border-white/5"
                        style={{ color: taskService.getPriorityColor(task.priority) }}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">
                        {task.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-zinc-300 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Flexible'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(task)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-white transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(task.id, task.title)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>
    </div>
  );
};


const Tasks: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [flattenedTasksForTable, setFlattenedTasksForTable] = useState<Array<Task & { depth: number }>>([]);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'kanban' | 'calendar'>('grid');
  const { user: authUser, loading: authLoading } = useAuth();
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [celebratingTaskId, setCelebratingTaskId] = useState<string | null>(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    category: 'general',
    due_date: '',
    tags: [],
    progress_percentage: 0,
    estimated_time: null,
    time_spent: 0,
    timer_active: false,
    timer_start: null,
    parent_task_id: null,
    course_id: null,
    depends_on: [],
  });

  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      initializeSecureTasks();
    }
  }, [authLoading, authUser]);

  useEffect(() => {
    // Clear selection when view mode or filters change
    setSelectedTasks([]);
  }, [viewMode, searchTerm, filterStatus, filterPriority, filterCategory]);

  useEffect(() => {
    if (!tasks.length && !loading) {
      setFilteredTasks([]);
      setFlattenedTasksForTable([]);
      return;
    }
    // 1. Create a map for quick lookups and initialize subtasks array
    const taskMap = new Map<string, Task>();
    tasks.forEach(task => {
      taskMap.set(task.id, { ...task, subtasks: [] });
    });

    // 2. Build the tree structure
    const rootTasks: Task[] = [];
    taskMap.forEach(task => {
      if (task.parent_task_id && taskMap.has(task.parent_task_id)) {
        const parent = taskMap.get(task.parent_task_id);
        parent?.subtasks?.push(task);
      } else {
        rootTasks.push(task);
      }
    });

    // 4. Apply filters (this is a simplified filter on root tasks)
    let results = rootTasks;
    if (searchTerm) {
      results = results.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterStatus !== 'all') {
      results = results.filter(t => t.status === filterStatus);
    }
    if (filterPriority !== 'all') {
      results = results.filter(t => t.priority === filterPriority);
    }
    if (filterCategory !== 'all') {
      results = results.filter(t => t.category === filterCategory);
    }

    const flattenTasks = (tasksToFlatten: Task[], depth = 0): Array<Task & { depth: number }> => {
      return tasksToFlatten.reduce((acc, task) => {
        return acc.concat({ ...task, depth }, flattenTasks(task.subtasks || [], depth + 1));
      }, [] as Array<Task & { depth: number }>);
    };

    setFilteredTasks(results);
    setFlattenedTasksForTable(flattenTasks(results));
  }, [tasks, searchTerm, filterStatus, filterPriority, filterCategory, loading]);

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    const allVisibleIds = (viewMode === 'table' ? flattenedTasksForTable : filteredTasks).map(t => t.id);
    if (selectedTasks.length === allVisibleIds.length) setSelectedTasks([]);
    else setSelectedTasks(allVisibleIds);
  };

  const initializeSecureTasks = async () => {
    try {
      if (authLoading) return;
      setLoading(true);

      if (!authUser) {
        toast({
          title: "Authentication Required",
          description: "Please log in to manage your tasks.",
          variant: "destructive",
        });
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      setCurrentUser({
        id: authUser.id,
        email: authUser.primaryEmailAddress?.emailAddress || '',
        profile: {
          full_name: authUser.fullName || 'User',
          role: authUser.profile?.role || 'student',
          student_id: authUser.id.substring(0, 8),
          subscription_tier: authUser.profile?.subscription_tier || 'free'
        }
      } as SecureUser);
      
      setSecurityVerified(true);

      // Check premium status strictly from Clerk-synced metadata
      const userTier = authUser.profile?.subscription_tier || 'free';
      const userRole = authUser.profile?.role || 'student';
      const isPremiumTier = ['premium', 'premium_elite', 'extra_plus', 'premium_plus'].includes(userTier);
      const isAdminRole = ['admin', 'superadmin', 'ceo', 'bdo'].includes(userRole);
      
      setHasPremiumAccess(isPremiumTier || isAdminRole);

      const [userTasks, stats, userCourses] = await Promise.all([
        taskService.fetchUserTasks(authUser.id),
        taskService.getTaskStatistics(authUser.id),
        courseService.fetchUserCourses(authUser.id)
      ]);

      setTasks(userTasks);
      setTaskStats(stats);
      setCourses(userCourses);

      toast({
        title: (
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
            Tasks Loaded Successfully!
          </span>
        ),
        description: (
          <span className="text-white font-medium">
            Welcome Back <span className="text-emerald-400 font-semibold">{authUser.fullName || 'User'}</span>! Your tasks are ready.
          </span>
        ),
        className: "bg-black border border-blue-400/50 shadow-xl",
        icon: <Shield className="text-emerald-400" />
      });

    } catch (error) {
      console.error('Error initializing tasks:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize task management.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskDateUpdate = async (taskId: string, newDueDate: Date) => {
    if (!currentUser) return;

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    const originalTasks = [...tasks];
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, due_date: newDueDate.toISOString() } : t
    );
    setTasks(updatedTasks);

    try {
      await taskService.updateTask(taskId, { due_date: newDueDate.toISOString() }, currentUser.id);
      toast({
        title: "Task Rescheduled",
        description: `Task "${taskToUpdate.title}" due date updated.`,
        className: "bg-black border border-blue-400/50 shadow-xl",
        icon: <Calendar className="text-blue-400" />,
      });
    } catch (error: any) {
      setTasks(originalTasks);
      toast({
        title: 'Error Rescheduling Task',
        description: `Failed to update due date: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
    if (!currentUser) return;

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate || taskToUpdate.status === newStatus) return;

    // Optimistic UI update
    const originalTasks = [...tasks];
    let updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );

    let parentTaskToUpdate: Task | undefined;
    let parentUpdatePayload: Partial<TaskFormData> | undefined;

    if (taskToUpdate.parent_task_id) {
      const parentTask = updatedTasks.find(t => t.id === taskToUpdate.parent_task_id);
      if (parentTask) {
        const subtasks = updatedTasks.filter(t => t.parent_task_id === parentTask.id);
        const completedSubtasks = subtasks.filter(st => st.status === 'completed').length;
        const newProgress = Math.round((completedSubtasks / subtasks.length) * 100);

        if (parentTask.progress_percentage !== newProgress) {
          parentTaskToUpdate = { ...parentTask, progress_percentage: newProgress };
          parentUpdatePayload = { progress_percentage: newProgress };
          updatedTasks = updatedTasks.map(t =>
            t.id === (parentTaskToUpdate && parentTaskToUpdate.id) ? parentTaskToUpdate : t
          );
        }
      }
    }

    setTasks(updatedTasks);

    try {
      const updatePromises = [
        taskService.updateTask(taskId, { status: newStatus }, currentUser.id)
      ];

      if (parentTaskToUpdate && parentUpdatePayload) {
        updatePromises.push(
          taskService.updateTask(parentTaskToUpdate.id, parentUpdatePayload, currentUser.id)
        );
      }

      await Promise.all(updatePromises);

      toast({
        title: "Task Status Updated",
        description: `Task "${taskToUpdate.title}" moved to ${newStatus.replace('_', ' ')}.`,
        className: "bg-black border border-blue-400/50 shadow-xl",
        icon: <Shield className="text-emerald-400" />,
      });
      // Fetch fresh stats after update
      const stats = await taskService.getTaskStatistics(currentUser.id);
      setTaskStats(stats);
    } catch (error: any) {
      setTasks(originalTasks);
      toast({ title: 'Error Updating Task', description: `Failed to update task status: ${error.message}`, variant: 'destructive' });
    }
  };

  const handleToggleTimer = async (taskToToggle: Task) => {
    if (!currentUser) return;

    const now = new Date();
    const originalTasks = [...tasks];
    let activeTaskStoppedInfo: { title: string } | null = null;

    // Create the new state in a single pass to avoid race conditions
    const updatedTasks = tasks.map(t => {
      // Stop any other currently active timer
      if (t.timer_active && t.id !== taskToToggle.id) {
        activeTaskStoppedInfo = { title: t.title };
        const startTime = new Date(t.timer_start!).getTime();
        const elapsedSeconds = Math.floor((now.getTime() - startTime) / 1000);
        return {
          ...t,
          timer_active: false,
          timer_start: null,
          time_spent: (t.time_spent || 0) + elapsedSeconds,
        };
      }

      // Toggle the selected task
      if (t.id === taskToToggle.id) {
        if (t.timer_active) {
          // It's currently active, so stop it
          const startTime = new Date(t.timer_start!).getTime();
          const elapsedSeconds = Math.floor((now.getTime() - startTime) / 1000);
          return {
            ...t,
            timer_active: false,
            timer_start: null,
            time_spent: (t.time_spent || 0) + elapsedSeconds,
          };
        } else {
          // It's not active, so start it
          return {
            ...t,
            timer_active: true,
            timer_start: now.toISOString(),
          };
        }
      }

      return t; // Return other tasks unchanged
    });

    // Optimistic UI update
    setTasks(updatedTasks);

    // Find all tasks that were changed to update them in the backend
    const tasksToUpdate = updatedTasks.filter((updatedTask, index) => {
      return JSON.stringify(updatedTask) !== JSON.stringify(originalTasks[index]);
    });

    // Persist all changes to the backend
    try {
      await Promise.all(
        tasksToUpdate.map(task =>
          taskService.updateTask(task.id, task, currentUser.id)
        )
      );

      const toggledTaskAfterUpdate = updatedTasks.find(t => t.id === taskToToggle.id);
      if (toggledTaskAfterUpdate) {
        const isStarting = toggledTaskAfterUpdate.timer_active;
        toast({
          title: `Timer ${isStarting ? 'started' : 'stopped'} for "${toggledTaskAfterUpdate.title}"`,
          icon: isStarting ? <Play className="text-blue-400" /> : <CheckCircle className="text-green-400" />,
        });
      }
      if (activeTaskStoppedInfo) {
        toast({
          title: `Timer stopped for "${activeTaskStoppedInfo.title}"`,
          icon: <CheckCircle className="text-green-400" />,
        });
      }
    } catch (error: any) {
      // Revert on error
      setTasks(originalTasks);
      toast({ title: 'Timer Error', description: `Failed to save timer state: ${error.message}`, variant: 'destructive' });
    }
  };

  const handleBulkUpdate = async (updates: Partial<TaskFormData>) => {
    if (!currentUser || selectedTasks.length === 0) return;

    try {
      await taskService.bulkUpdateTasks(selectedTasks, updates, currentUser.id);
      toast({
        title: "Bulk Update Successful",
        description: `${selectedTasks.length} tasks have been updated.`,
        icon: <CheckCircle className="text-green-400" />,
      });
      const userTasks = await taskService.fetchUserTasks(currentUser.id);
      setTasks(userTasks);
      setSelectedTasks([]);
    } catch (error: any) {
      toast({ title: 'Bulk Update Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleBulkDelete = () => {
    if (selectedTasks.length === 0) return;
    setModalState({
      isOpen: true,
      title: `Delete ${selectedTasks.length} Tasks`,
      message: `Are you sure you want to permanently delete ${selectedTasks.length} selected tasks? This action cannot be undone.`,
      onConfirm: async () => {
        if (!currentUser) return;
        try {
          await taskService.bulkDeleteTasks(selectedTasks, currentUser.id);
          toast({
            title: "Tasks Deleted",
            description: `${selectedTasks.length} tasks have been removed.`,
            icon: <Trash2 className="text-rose-400" />,
          });
          const userTasks = await taskService.fetchUserTasks(currentUser.id);
          setTasks(userTasks);
          setSelectedTasks([]);
        } catch (error: any) {
          toast({ title: 'Error Deleting Tasks', description: error.message, variant: 'destructive' });
        } finally {
          setModalState({ ...modalState, isOpen: false });
        }
      },
    });
  };

  const handleExportCSV = () => {
    const tasksToExport = tasks.filter(t => selectedTasks.includes(t.id));
    if (tasksToExport.length === 0) return;

    const headers = ['id', 'title', 'description', 'status', 'priority', 'category', 'due_date', 'time_spent'];
    const csvContent = [
      headers.join(','),
      ...tasksToExport.map(t => headers.map(header => JSON.stringify(t[header as keyof Task], (key, value) => value === null ? '' : value)).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'tasks.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to manage tasks.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    const dataToSubmit: TaskFormData = {
      ...formData,
      due_date: formData.due_date || null,
      parent_task_id: formData.parent_task_id || null,
      depends_on: formData.depends_on || [],
    };

    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, dataToSubmit, currentUser.id);
        toast({
          title: (
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
              Task Updated!
            </span>
          ),
          description: (
            <span className="text-white font-medium">
              <span className="font-semibold">{formData.title}</span> has been updated.
            </span>
          ),
          className: "bg-black border border-blue-400/50 shadow-xl",
          icon: <Shield className="text-emerald-400" />,
        });
      } else {
        await taskService.createTask(dataToSubmit, currentUser.id);
        toast({
          title: (
            <span className="bg-gradient-to-r from-pink-400 via-yellow-400 to-emerald-400 bg-clip-text text-transparent font-bold">
              Task Created!
            </span>
          ),
          description: (
            <span className="text-white font-medium">
              <span className="text-emerald-400 font-semibold">{formData.title}</span> has been added.
            </span>
          ),
          className: "bg-black border border-pink-400/40 shadow-2xl",
          icon: <Sparkles className="text-yellow-400" />,
        });
      }

      setIsSheetOpen(false);
      setEditingTask(null);
      resetForm();

      const userTasks = await taskService.fetchUserTasks(currentUser.id);
      setTasks(userTasks);

      const stats = await taskService.getTaskStatistics(currentUser.id);
      setTaskStats(stats);

    } catch (error: any) {
      console.error('Error saving task:', error);
      toast({
        title: 'Error Saving Task',
        description: `Failed to save task: ${error.message || 'Please try again.'}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      category: task.category,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      tags: task.tags || [],
      progress_percentage: task.progress_percentage || 0,
      estimated_time: task.estimated_time || null,
      parent_task_id: task.parent_task_id || null,
      course_id: task.course_id || null,
      depends_on: task.depends_on || [],
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (taskId: string, taskName: string) => {
    setModalState({
      isOpen: true,
      title: `Delete Task: ${taskName}`,
      message: `Are you sure you want to permanently delete "${taskName}"? This action cannot be undone.`,
      onConfirm: async () => {
        if (!currentUser) return;
        try {
          await taskService.deleteTask(taskId, currentUser.id);
          toast({
            title: (
              <span className="bg-gradient-to-r from-pink-500 via-red-500 to-rose-400 bg-clip-text text-transparent font-bold">
                Task Deleted
              </span>
            ),
            description: (
              <span className="text-white font-medium">
                <span className="text-rose-400 font-semibold">{taskName}</span> has been removed.
              </span>
            ),
            className: "bg-black border border-red-400/40 shadow-2xl",
            icon: <Trash2 className="text-rose-400" />,
          });
          const userTasks = await taskService.fetchUserTasks(currentUser.id);
          setTasks(userTasks);
          const stats = await taskService.getTaskStatistics(currentUser.id);
          setTaskStats(stats);
        } catch (error: any) {
          toast({ title: 'Error Deleting Task', description: `Failed to delete task: ${error.message}`, variant: 'destructive' });
        } finally {
          setModalState({ ...modalState, isOpen: false });
        }
      },
    });
  };

  const handleToggleFavorite = async (task: Task) => {
    if (!currentUser) return;
    try {
      const newStatus = !task.is_favorited;
      await taskService.updateTask(task.id, { is_favorited: newStatus }, currentUser.id);

      // Update local state
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_favorited: newStatus } : t));

      toast({
        title: newStatus ? "Added to Favorites" : "Removed from Favorites",
        description: `"${task.title}" updated.`,
        icon: <Star className={newStatus ? "text-amber-400 fill-amber-400" : "text-zinc-500"} />,
        className: "bg-black border border-amber-400/20"
      });
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to update favorite status', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      category: 'general',
      due_date: '',
      tags: [],
      progress_percentage: 0,
      estimated_time: null,
      parent_task_id: null,
      depends_on: [],
      time_spent: 0,
      timer_active: false,
      timer_start: null,
    });
  };

  const openCreateDialog = () => {
    setEditingTask(null);
    resetForm();
    setIsSheetOpen(true);
  };

  const allVisibleTaskIds = (viewMode === 'table' ? flattenedTasksForTable : filteredTasks).map(t => t.id);
  const isAllSelected = allVisibleTaskIds.length > 0 && selectedTasks.length === allVisibleTaskIds.length;
  const isSomeSelected = selectedTasks.length > 0 && !isAllSelected;

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing Task System...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-white/80 mb-6">Please Login To Access Your Tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center relative overflow-hidden">
      <ParallaxBackground />

      {/* Premium Neural Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              x: Math.random() * 2000 - 1000,
              y: Math.random() * 2000 - 1000
            }}
            animate={{
              opacity: [0, 0.2, 0],
              x: Math.random() * 2000 - 1000,
              y: Math.random() * 2000 - 1000,
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-indigo-500 rounded-full blur-[1px]"
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedTasks.length > 0 && hasPremiumAccess && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 ring-1 ring-white/5"
          >
            <div className="absolute inset-0 bg-indigo-500/5 rounded-[2rem] pointer-events-none overflow-hidden">
              <motion.div
                animate={{ x: [-100, 100] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 h-px w-full bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent"
              />
            </div>

            <div className="flex items-center gap-3 pr-4 border-r border-white/10">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-xs font-black text-white">{selectedTasks.length}</span>
              </div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Selections</span>
            </div>

            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-12 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                    <CheckSquare className="w-4 h-4 mr-2 text-indigo-400" />
                    Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl p-2 min-w-[160px] shadow-2xl">
                  {(['pending', 'in_progress', 'review', 'completed'] as const).map(status => (
                    <DropdownMenuItem
                      key={status}
                      onSelect={() => handleBulkUpdate({ status })}
                      className="rounded-xl py-3 px-4 focus:bg-indigo-500/20 focus:text-indigo-300 cursor-pointer text-xs font-bold uppercase tracking-wider"
                    >
                      {status.replace('_', ' ')}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-12 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                    <Folder className="w-4 h-4 mr-2 text-purple-400" />
                    Categorize
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl p-2 min-w-[160px] shadow-2xl">
                  {taskService.getTaskCategories().map(cat => (
                    <DropdownMenuItem
                      key={cat.id}
                      onSelect={() => handleBulkUpdate({ category: cat.id })}
                      className="rounded-xl py-3 px-4 focus:bg-purple-500/20 focus:text-purple-300 cursor-pointer text-xs font-bold uppercase tracking-wider"
                    >
                      {cat.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                onClick={handleExportCSV}
                className="h-12 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <Download className="w-4 h-4 mr-2 text-emerald-400" />
                Export
              </Button>

              <div className="w-px h-6 bg-white/10 mx-2" />

              <Button
                variant="ghost"
                onClick={handleBulkDelete}
                className="h-12 px-4 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Purge
              </Button>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedTasks([])}
                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-all border border-white/5"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
      />
      <div className="w-full universal-container z-10 pt-12">
        {/* ── Premium Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
          className="relative overflow-hidden rounded-b-[3rem] mb-12 shadow-[0_20px_80px_rgba(0,0,0,0.4)]"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12), rgba(16,185,129,0.08))',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderBottom: '1px solid rgba(255,255,255,0.12)'
          }}
        >
          {/* Advanced Mesh Gradient Orbs */}
          <motion.div
            animate={{
              x: [0, 60, 0],
              y: [0, -40, 0],
              scale: [1, 1.3, 1],
              rotate: [0, 45, 0]
            }}
            transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
            className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"
          />
          <motion.div
            animate={{
              x: [0, -70, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
              rotate: [0, -30, 0]
            }}
            transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none"
          />

          <div className="relative px-12 py-16">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12">
              {/* Left section: Identity & Primary Action */}
              <div className="flex items-start space-x-8">
                {onBack && (
                  <motion.button
                    onClick={onBack}
                    className="p-5 bg-white/5 hover:bg-white/10 backdrop-blur-2xl rounded-[1.5rem] transition-all duration-300 border border-white/10 hover:border-white/20 shadow-2xl"
                    whileHover={{ scale: 1.1, x: -8 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowLeft className="w-7 h-7 text-white" />
                  </motion.button>
                )}

                <div className="space-y-6">
                  <motion.div className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                      <Target className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Tasks</span>
                    <div className="h-px w-12 bg-indigo-500/30" />
                  </motion.div>

                  <div className="flex flex-wrap items-center gap-10">
                    <motion.h1
                      className="text-2xl md:text-4xl font-black text-white flex flex-wrap items-center tracking-tighter"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                    >
                      <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">Task</span>
                      <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent italic px-2">Management</span>
                    </motion.h1>
                  </div>

                  <motion.div
                    className="flex flex-wrap items-center gap-6"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-zinc-400 text-lg font-medium">
                      Strategic Tasks for <span className="font-black text-white tracking-tight border-b-2 border-indigo-500/50 pb-1">{currentUser.profile?.full_name}</span>
                    </p>
                    <div className="h-6 w-px bg-white/10 hidden sm:block" />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-zinc-300 text-[10px] font-black uppercase tracking-widest">{tasks.length} Active Tasks</span>
                      </div>

                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Right Section: Primary Action */}
              <motion.button
                onClick={openCreateDialog}
                className="group relative h-14 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 px-8 font-black text-white shadow-[0_15px_40px_rgba(79,70,229,0.3)] transition-all duration-700 hover:shadow-[0_20px_60px_rgba(79,70,229,0.5)] hover:-translate-y-1 active:scale-95 flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000" />
                <div className="relative z-10 flex items-center gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Plus className="w-5 h-5 transition-transform duration-700 group-hover:rotate-180" />
                  </div>
                  <span className="text-base tracking-tight uppercase">ADD TASK</span>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Enhanced Statistics Dashboard ── */}
        {taskStats && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="mb-12 px-2"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: BookOpen, value: taskStats.total_tasks, label: 'Global Scope', grad: 'from-blue-600 to-indigo-600', ring: '#4f46e5' },
                { icon: Play, value: taskStats.pending_tasks, label: 'Active Process', grad: 'from-amber-600 to-orange-600', ring: '#d97706' },
                { icon: CheckCircle, value: taskStats.completed_tasks, label: 'Success Nodes', grad: 'from-emerald-600 to-teal-600', ring: '#059669' },
                { icon: BarChart3, value: taskStats.completion_rate, label: 'Completion Rate', grad: 'from-violet-600 to-purple-600', ring: '#7c3aed' },
              ].map((stat, i) => (
                <TiltCard key={stat.label}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="relative p-8 rounded-[2.5rem] bg-zinc-950/40 backdrop-blur-3xl border border-white/10 group overflow-hidden shadow-2xl"
                  >
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-700" style={{ background: stat.ring }} />
                    <div className="flex items-center justify-between mb-8">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.grad} shadow-[0_10px_30px_rgba(0,0,0,0.3)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                        <stat.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">Smart Sync</div>
                    </div>
                    <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">{stat.label}</p>
                    <div className="flex items-baseline gap-3">
                      <p className="text-4xl font-black text-white tracking-tighter">{stat.value}{stat.label.includes('%') ? '%' : ''}</p>
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
                        className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-black text-emerald-400 flex items-center"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" /> +2.4%
                      </motion.div>
                    </div>
                  </motion.div>
                </TiltCard>
              ))}
            </div>
          </motion.div>
        )}


        {/* ── Modernized Search & View Controls ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative group mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative p-6 bg-zinc-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col xl:flex-row items-center gap-6">

            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder="Query your tasks or projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border-2 border-white/5 focus:border-indigo-500/50 rounded-2xl py-4 pl-14 pr-6 text-white placeholder:text-zinc-600 transition-all duration-300 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10">
                {[
                  { id: 'grid', icon: LayoutGrid, label: 'Grid' },
                  { id: 'table', icon: List, label: 'Table' },
                  { id: 'kanban', icon: Kanban, label: 'Board' },
                  { id: 'calendar', icon: Calendar, label: 'Plan' }
                ].map((mode) => (
                  <motion.button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-widest ${viewMode === mode.id
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <mode.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="h-10 w-px bg-white/10 hidden xl:block" />

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] h-12 bg-black/40 border-white/10 text-white rounded-xl focus:ring-indigo-500">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-zinc-500" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Under Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[140px] h-12 bg-black/40 border-white/10 text-white rounded-xl focus:ring-indigo-500">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-zinc-500" />
                    <SelectValue placeholder="Priority" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* ── Main Content Area ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-6 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Filter className="w-5 h-5 text-blue-400" />
                      Filter & Search
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* ...existing filter UI... */}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <TaskAIPanel tasks={tasks} />
              </motion.div>
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9">
            <AnimatePresence mode="wait">
              {viewMode === 'grid' && (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {filteredTasks.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleTimer={handleToggleTimer}
                      onStatusChange={handleTaskStatusUpdate}
                      onToggleFavorite={handleToggleFavorite}
                      isSelected={selectedTasks.includes(task.id)}
                      onSelect={handleSelectTask}
                      hasPremiumAccess={hasPremiumAccess}
                      currentUser={currentUser}
                      courses={courses}
                      celebratingTaskId={celebratingTaskId}
                    />
                  ))}
                </motion.div>
              )}
              {viewMode === 'table' && (
                <motion.div key="table" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <TaskTable
                    tasks={flattenedTasksForTable}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    selectedTasks={selectedTasks}
                    onSelectTask={handleSelectTask}
                    onSelectAll={handleSelectAll}
                    isAllSelected={allVisibleTaskIds.length > 0 && selectedTasks.length === allVisibleTaskIds.length}
                    isSomeSelected={selectedTasks.length > 0 && selectedTasks.length < allVisibleTaskIds.length}
                  />
                </motion.div>
              )}
              {viewMode === 'kanban' && (
                <motion.div key="kanban" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <KanbanBoard
                    tasks={filteredTasks}
                    onEditTask={handleEdit}
                    onDeleteTask={handleDelete}
                    onTaskStatusUpdate={handleTaskStatusUpdate}
                    onToggleTimer={handleToggleTimer}
                    onToggleFavorite={handleToggleFavorite}
                    selectedTasks={selectedTasks}
                    onSelectTask={handleSelectTask}
                    currentUser={currentUser}
                    hasPremiumAccess={hasPremiumAccess}
                    celebratingTaskId={celebratingTaskId}
                  />
                </motion.div>
              )}
              {viewMode === 'calendar' && (
                <motion.div key="calendar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <TaskGrid
                    tasks={tasks}
                    onEditTask={handleEdit}
                    onDeleteTask={handleDelete}
                    onStatusChange={handleTaskStatusUpdate}
                    onToggleTimer={handleToggleTimer}
                    onToggleFavorite={handleToggleFavorite}
                    onDateUpdate={handleTaskDateUpdate}
                    currentUser={currentUser}
                    hasPremiumAccess={hasPremiumAccess}
                    celebratingTaskId={celebratingTaskId}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {filteredTasks.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative mt-20"
              >
                <div className="relative overflow-hidden bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-16 max-w-2xl mx-auto shadow-2xl text-center">
                  {/* Decorative Elements */}
                  <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
                  <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />

                  <motion.div
                    animate={{
                      y: [0, -15, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-10 inline-flex items-center justify-center p-8 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] border border-white/10 mb-10 shadow-2xl"
                  >
                    <BookOpen className="h-20 w-20 text-white opacity-80" />
                    <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-400 animate-pulse" />
                  </motion.div>

                  <h3 className="relative z-10 text-4xl font-black text-white tracking-tighter mb-4 leading-tight">
                    Your Tasks Canvas <br />
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent italic">is currently empty</span>
                  </h3>

                  <p className="relative z-10 text-zinc-500 text-lg font-medium max-w-sm mx-auto mb-10 leading-relaxed">
                    No tasks match your current filters. Refine your search or initialize a new workload.
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative z-10 inline-block"
                  >
                    <Button
                      onClick={openCreateDialog}
                      className="h-16 px-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)] transition-all duration-500"
                    >
                      <Plus className="h-5 w-5 mr-3" />
                      Initialize Task
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}

          </div>
          <AnimatePresence>
            {isSheetOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSheetOpen(false)}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed top-0 right-0 w-full max-w-2xl h-fit max-h-screen bg-zinc-950/80 backdrop-blur-3xl border-l border-white/10 z-[101] shadow-2xl flex flex-col overflow-y-auto custom-scrollbar"
                >
                  {/* Form Header */}
                  <div className="p-8 border-b border-white/5 relative shrink-0">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                            <Plus className="w-5 h-5 text-indigo-400" />
                          </div>
                          <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Task Management</span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tighter">
                          {editingTask ? 'Edit Task' : 'Create New Task'}
                        </h2>
                      </div>
                      <button
                        onClick={() => setIsSheetOpen(false)}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group"
                      >
                        <X className="w-6 h-6 text-zinc-500 group-hover:text-white transition-colors" />
                      </button>
                    </div>
                  </div>

                  {/* Form Body */}
                  <div className="p-8">
                    <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Task Title</Label>
                          <Input
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Quantum Mechanics Problem Set #4"
                            className="h-14 bg-white/5 border-2 border-white/5 focus:border-indigo-500/50 rounded-2xl px-6 text-lg font-bold placeholder:text-zinc-700 transition-all duration-300"
                          />
                        </div>

                        <div className="space-y-2 relative group">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Context & Description</Label>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!formData.title) {
                                  toast({ title: "Title Required", description: "Please enter a title for AI to generate a description.", variant: "destructive" });
                                  return;
                                }
                                setIsSubmitting(true);
                                try {
                                  const userTier = authUser?.publicMetadata?.subscription?.tier || authUser?.publicMetadata?.tier || 'free';
                                  const desc = await modelRouter.complete(`Generate a professional and detailed study task description for: ${formData.title}. Focus on actionable steps and learning objectives. Keep it under 100 words.`, { 
                                    tier: userTier,
                                    task: 'tasks'
                                  });
                                  setFormData({ ...formData, description: desc });
                                  toast({ title: "AI Generation Complete", description: "AI has optimized your task description." });
                                } catch (e: any) {
                                  toast({ title: "AI Error", description: e.message, variant: "destructive" });
                                } finally {
                                  setIsSubmitting(false);
                                }
                              }}
                              className="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg border border-indigo-500/30 transition-all group/ai"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover/ai:scale-125 transition-transform" />
                              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">AI Assistant</span>
                            </button>
                          </div>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detailed strategy for this workload..."
                            className="min-h-[120px] bg-white/5 border-2 border-white/5 focus:border-indigo-500/50 rounded-2xl px-6 py-4 text-zinc-300 leading-relaxed placeholder:text-zinc-700 transition-all duration-300 resize-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Due Date</Label>
                          <Input
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            className="h-12 bg-white/5 border-2 border-white/5 focus:border-indigo-500/50 rounded-2xl px-6 font-bold text-white transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Priority</Label>
                          <Select
                            value={formData.priority}
                            onValueChange={(val) => setFormData({ ...formData, priority: val as any })}
                          >
                            <SelectTrigger className="h-12 bg-white/5 border-2 border-white/5 focus:border-indigo-500/50 rounded-2xl px-6 font-bold">
                              <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                              <SelectItem value="low">Low Priority</SelectItem>
                              <SelectItem value="medium">Medium Priority</SelectItem>
                              <SelectItem value="high">High Priority</SelectItem>
                              <SelectItem value="urgent">Urgent (SOS)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Academic Category</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(val) => setFormData({ ...formData, category: val as any })}
                          >
                            <SelectTrigger className="h-12 bg-white/5 border-2 border-white/5 focus:border-indigo-500/50 rounded-2xl px-6 font-bold">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                              {taskService.getTaskCategories().map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Link Course</Label>
                          <Select
                            value={formData.course_id || 'none'}
                            onValueChange={(val) => setFormData({ ...formData, course_id: val === 'none' ? null : val })}
                          >
                            <SelectTrigger className="h-12 bg-white/5 border-2 border-white/5 focus:border-indigo-500/50 rounded-2xl px-6 font-bold">
                              <SelectValue placeholder="Link a Course" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                              <SelectItem value="none">Independent Task</SelectItem>
                              {courses.map(course => (
                                <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Estimated Time (Minutes)</Label>
                        <Input
                          type="number"
                          value={formData.estimated_time || ''}
                          onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value ? parseInt(e.target.value) : null })}
                          placeholder="e.g. 60"
                          className="h-12 bg-white/5 border-2 border-white/5 focus:border-indigo-500/50 rounded-2xl px-6 font-bold text-white transition-all"
                        />
                      </div>

                      {/* Action Buttons Snapped to Content */}
                      <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
                        <Button
                          type="button"
                          onClick={() => setIsSheetOpen(false)}
                          variant="ghost"
                          className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5"
                        >
                          Discard
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || !formData.title}
                          className="flex-[2] h-14 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black uppercase tracking-widest shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)] transition-all duration-500 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Syncing...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Shield className="w-5 h-5" />
                              <span>{editingTask ? 'Update' : 'Initialize'}</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={openCreateDialog}
        className="fixed bottom-10 right-10 w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.4)] z-[100] group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <Plus size={32} className="relative z-10" />
      </motion.button>
    </div>
  );
};

export default Tasks;
