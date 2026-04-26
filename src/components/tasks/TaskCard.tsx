// src/components/tasks/TaskCard.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, Flag, Play, Pause, CheckSquare, Link, ChevronDown, ChevronUp, CheckCircle, GitCommitHorizontal, Star, MoreVertical, BookOpen, Lock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Task, SecureUser, Course } from './types';
import { Checkbox } from '@/components/ui/checkbox';
import { taskService } from './taskService';
import CompletionCelebration from './CompletionCelebration';

const GlareEffect = () => (
  <motion.div
    className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none"
    style={{ transform: "translateZ(50px)" }}
  >
    <motion.div
      className="absolute w-96 h-96 bg-white/10 -top-1/4 -left-1/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        transform: 'rotate(45deg)',
        filter: 'blur(50px)',
        mixBlendMode: 'overlay'
      }}
    />
  </motion.div>
);

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (id: string, name: string) => void;
  onToggleTimer: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onToggleFavorite: (task: Task) => void;
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  hasPremiumAccess: boolean;
  currentUser: SecureUser | null;
  courses: Course[];
  celebratingTaskId: string | null;
  view?: 'default' | 'calendar';
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onEdit, onDelete, onToggleTimer, onStatusChange, onToggleFavorite, isSelected, onSelect, hasPremiumAccess, currentUser, courses, celebratingTaskId, view = 'default' }) => {
  const categoryColor = taskService.getCategoryColor(task.category, taskService.getTaskCategories()) || '#6B7280';
  const priorityColor = taskService.getPriorityColor(task.priority);
  const [currentTime, setCurrentTime] = useState(task.time_spent || 0);
  const [isInteractionHovered, setIsInteractionHovered] = useState(false);
  const [isSubtasksVisible, setIsSubtasksVisible] = useState(true);

  useEffect(() => {
    let interval: number | undefined;
    if (task.timer_active && task.timer_start) {
      const startTime = new Date(task.timer_start).getTime();
      const baseTime = task.time_spent || 0;

      // Set initial time immediately
      const initialElapsed = Math.floor((Date.now() - startTime) / 1000);
      setCurrentTime(baseTime + initialElapsed);

      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setCurrentTime(baseTime + elapsed);
      }, 1000);
    } else {
      setCurrentTime(task.time_spent || 0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [task.timer_active, task.timer_start, task.time_spent]);

  const estimatedTimeInSeconds = task.estimated_time ? task.estimated_time * 60 : 0;
  const timeProgress = estimatedTimeInSeconds > 0 ? Math.min(100, (currentTime / estimatedTimeInSeconds) * 100) : 0;

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (timeProgress / 100) * circumference;

  const getRollupProgress = (t: Task): number => {
    if (!t.subtasks || t.subtasks.length === 0) {
      // For a task with no subtasks, progress is based on its own status.
      return t.status === 'completed' ? 100 : (t.progress_percentage || 0);
    }
    const completedSubtasks = t.subtasks.filter(sub => sub.status === 'completed').length;
    return Math.round((completedSubtasks / t.subtasks.length) * 100);
  };
  const displayProgress = task.subtasks && task.subtasks.length > 0 ? getRollupProgress(task) : (task.status === 'completed' ? 100 : (task.progress_percentage || 0));

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const handleInteractionEnter = () => setIsInteractionHovered(true);
  const handleInteractionLeave = () => setIsInteractionHovered(false);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
  };

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12.5deg", "-12.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12.5deg", "12.5deg"]);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isInteractionHovered) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const { width, height } = rect;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (view === 'calendar') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="group relative"
        onClick={() => onEdit(task)}
      >
        <div className="w-full p-1.5 rounded-md text-white text-xs font-medium cursor-pointer border overflow-hidden"
          style={{ backgroundColor: `${categoryColor}20`, borderColor: `${categoryColor}80` }}
          title={task.title}>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: priorityColor }}></div>
            <span className="flex-grow truncate">{task.title}</span>
            <div className="flex-shrink-0 flex items-center gap-1">
              {task.is_favorited && <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />}
              {task.subtasks && task.subtasks.length > 0 && <GitCommitHorizontal className="h-3 w-3 text-white/70" title={`${task.subtasks.length} subtasks`} />}
              {task.timer_active && <Play className="h-3 w-3 text-white/90 animate-pulse" title="Timer active" />}
            </div>
          </div>
          {displayProgress > 0 && (
            <div className="w-full bg-black/30 rounded-full h-1 mt-1 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.5, ease: 'circOut' }}
              />
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, y: 50, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, y: -20, rotateX: -10 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 100, damping: 12 }}
      className="group h-full"
      style={{ perspective: '1200px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} whileHover={{ scale: 1.03, z: 20 }} className="h-full">
        <Card className={`
        relative bg-zinc-950/60 backdrop-blur-2xl border border-white/10 
        rounded-[2rem] transition-all duration-500 shadow-2xl h-full 
        overflow-hidden flex flex-col transform-gpu
        ${task.status === 'completed' ? 'opacity-80 hover:opacity-100' : ''}
      `} style={{ transform: "translateZ(20px)" }}>

          {/* Animated Background Glow */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute -top-1/2 -left-1/2 w-full h-full bg-indigo-500/10 rounded-full blur-[100px]"
            />
          </div>

          {/* Glare and Celebration */}
          <GlareEffect />
          {celebratingTaskId === task.id && <CompletionCelebration />}

          {/* Top Priority/Category Indicator Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex z-30">
            <div className="flex-1 h-full shadow-[0_0_15px_rgba(255,255,255,0.2)]" style={{ backgroundColor: categoryColor }} />
            <div className="flex-1 h-full shadow-[0_0_15px_rgba(255,255,255,0.2)]" style={{ backgroundColor: priorityColor }} />
          </div>

          {/* Selection Checkbox */}
          <div
            className="absolute top-6 right-6 z-40"
            onMouseEnter={handleInteractionEnter}
            onMouseLeave={handleInteractionLeave}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(task.id)}
              className="h-6 w-6 rounded-lg bg-black/40 border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-400 transition-all duration-300 shadow-lg"
            />
          </div>

          <CardHeader className="pb-4 relative z-20 pt-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4 flex-grow min-w-0">
                <motion.div
                  className="p-3.5 rounded-2xl border border-white/10 shadow-glass-neumorphic"
                  style={{ backgroundColor: `${categoryColor}20` }}
                  whileHover={{ scale: 1.1, rotate: 8 }}
                >
                  {React.createElement(taskService.getCategoryIcon(task.category), {
                    className: "h-7 w-7",
                    style: { color: categoryColor }
                  })}
                </motion.div>
                <div className="min-w-0">
                  <CardTitle className="text-xl font-black text-white tracking-tighter leading-tight mb-2 truncate">
                    {task.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-zinc-300"
                    >
                      {task.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-white/10 text-white"
                      style={{ backgroundColor: `${priorityColor}20`, borderColor: `${priorityColor}40`, color: priorityColor }}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0" onMouseEnter={handleInteractionEnter} onMouseLeave={handleInteractionLeave}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 p-0 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900/95 backdrop-blur-2xl border-white/10 text-white rounded-2xl p-2 min-w-[160px] shadow-2xl">
                    <DropdownMenuItem onClick={() => onEdit(task)} className="rounded-xl focus:bg-white/10 cursor-pointer p-3">
                      <Edit className="mr-3 h-4 w-4 text-indigo-400" />
                      <span className="font-bold text-sm">Edit Task</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleFavorite(task)} className="rounded-xl focus:bg-white/10 cursor-pointer p-3">
                      <Star className={`mr-3 h-4 w-4 ${task.is_favorited ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`} />
                      <span className="font-bold text-sm">{task.is_favorited ? 'Unfavorite' : 'Favorite'}</span>
                    </DropdownMenuItem>
                    <div className="h-px bg-white/5 my-2" />
                    <DropdownMenuItem onClick={() => onDelete(task.id, task.title)} className="rounded-xl focus:bg-red-500/10 text-red-400 focus:text-red-300 cursor-pointer p-3">
                      <Trash2 className="mr-3 h-4 w-4" />
                      <span className="font-bold text-sm">Delete Task</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 flex-grow flex flex-col justify-between relative z-20">
            <div className="space-y-4">
              {task.description && (
                <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 font-medium">
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                {task.due_date && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                      {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
                {task.course_id && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <BookOpen className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider truncate max-w-[120px]">
                      {courses.find(c => c.id === task.course_id)?.name || 'Course'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Progress Visualization */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Completion Rate</span>
                  <span className="text-sm font-black text-white">{displayProgress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${displayProgress}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className="h-full rounded-full relative"
                    style={{ background: `linear-gradient(90deg, ${categoryColor}, ${priorityColor})` }}
                  >
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  </motion.div>
                </div>
              </div>

              {/* Actions & Timer */}
              <div
                className="flex items-center justify-between p-4 bg-white/5 rounded-[1.5rem] border border-white/10"
                onMouseEnter={handleInteractionEnter}
                onMouseLeave={handleInteractionLeave}
              >
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: task.timer_active ? 0 : 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onToggleTimer(task)}
                    disabled={!hasPremiumAccess}
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-xl ${task.timer_active
                      ? 'bg-red-500 text-white shadow-red-500/20'
                      : 'bg-indigo-500 text-white shadow-indigo-500/20'
                      } disabled:opacity-50 disabled:grayscale`}
                  >
                    {task.timer_active ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                  </motion.button>
                  <div>
                    <p className="text-lg font-black text-white tracking-tight font-mono">{formatTime(currentTime)}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Focus</p>
                  </div>
                </div>

                <div className="relative h-12 w-12">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                    <motion.circle
                      cx="22" cy="22" r="18"
                      fill="transparent"
                      stroke={priorityColor}
                      strokeLinecap="round" strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 18}
                      initial={{ strokeDashoffset: 2 * Math.PI * 18 }}
                      animate={{ strokeDashoffset: (2 * Math.PI * 18) * (1 - timeProgress / 100) }}
                      transition={{ duration: 1 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
                    {Math.round(timeProgress)}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Subtasks Section */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="px-6 pb-6 pt-0 relative z-20 border-t border-white/5 mt-auto">
              <button
                onClick={() => setIsSubtasksVisible(!isSubtasksVisible)}
                onMouseEnter={handleInteractionEnter}
                onMouseLeave={handleInteractionLeave}
                className="flex items-center justify-between w-full py-4 text-left group/btn"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                    <GitCommitHorizontal className="h-3.5 w-3.5 text-indigo-400" />
                  </div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover/btn:text-white transition-colors">
                    Subtasks ({task.subtasks.length})
                  </span>
                </div>
                <div className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                  {isSubtasksVisible ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                </div>
              </button>
              <AnimatePresence>
                {isSubtasksVisible && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 pb-2">
                      {task.subtasks.map((subtask) => (
                        <SubtaskItem
                          key={subtask.id}
                          task={subtask}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onStatusChange={onStatusChange}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

const SubtaskItem: React.FC<{
  task: Task,
  onEdit: (task: Task) => void,
  onDelete: (id: string, name: string) => void,
  onStatusChange: (id: string, status: Task['status']) => void
}> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const priorityColor = taskService.getPriorityColor(task.priority);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusChange(task.id, 'completed');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id, task.title);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 border ${task.status === 'completed'
        ? 'bg-emerald-500/10 border-emerald-500/20'
        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
        }`}
    >
      <div
        className="flex items-center gap-4 overflow-hidden flex-grow cursor-pointer"
        onClick={() => onEdit(task)}
      >
        <div
          className="w-1.5 h-6 rounded-full flex-shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ backgroundColor: priorityColor }}
        />
        <div className="min-w-0">
          <span className={`text-xs font-bold transition-all ${task.status === 'completed' ? 'line-through text-emerald-400/60' : 'text-zinc-200 group-hover:text-white'
            }`}>{task.title}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{task.priority} Priority</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
        <AnimatePresence mode="wait">
          {task.status !== 'completed' ? (
            <motion.div
              key="actions"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1"
            >
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-xl text-emerald-400 hover:bg-emerald-500/20"
                onClick={handleComplete}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-xl text-rose-400 hover:bg-rose-500/20"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="status"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-1.5 bg-emerald-500/20 rounded-lg"
            >
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TaskCard;
