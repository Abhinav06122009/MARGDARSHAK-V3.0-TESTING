// src/components/tasks/TaskGrid.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, addDays, subDays, format, isSameMonth, isToday as isTodayFns } from 'date-fns';
import TaskCard from './TaskCard';
import { Task, SecureUser } from './types';
import { Button } from '@/components/ui/button';

interface TaskGridProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string, name: string) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onToggleTimer: (task: Task) => void;
  onDateUpdate: (taskId: string, newDate: Date) => void;
  onToggleFavorite: (task: Task) => void;
  currentUser: SecureUser | null;
  celebratingTaskId: string | null;
  hasPremiumAccess: boolean;
}

const TaskGrid: React.FC<TaskGridProps> = (props) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevious = () => {
    setCurrentDate(prev => {
      return view === 'month' ? subMonths(prev, 1) : subDays(prev, 7);
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      return view === 'month' ? addMonths(prev, 1) : addDays(prev, 7);
    });
  };

  const generateGrid = () => {
    if (view === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return eachDayOfInterval({ start, end });
    } else { // month view
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));
      return eachDayOfInterval({ start, end });
    }
  };

  const gridDays = generateGrid();
  const gridColsClass = view === 'week' ? 'grid-cols-1 md:grid-cols-7' : 'grid-cols-7';

  return (
    <div className="bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
      {/* Background Aurora Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
        <div className="flex items-center gap-6">
          <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
            <Button variant="ghost" size="icon" onClick={handlePrevious} className="hover:bg-white/10 rounded-xl"><ChevronLeft className="w-5 h-5" /></Button>
            <div className="px-6 flex items-center">
              <h2 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent min-w-[200px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>
            <Button variant="ghost" size="icon" onClick={handleNext} className="hover:bg-white/10 rounded-xl"><ChevronRight className="w-5 h-5" /></Button>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setCurrentDate(new Date())}
            className="border-white/10 bg-white/5 hover:bg-white/10 rounded-2xl px-6 font-black uppercase tracking-widest text-[10px]"
          >
            Present
          </Button>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('month')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'month' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-white'}`}
          >
            Monthly
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('week')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'week' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-white'}`}
          >
            Weekly
          </motion.button>
        </div>
      </header>

      <div className={`relative z-10 grid ${gridColsClass} gap-3`}>
        {daysOfWeek.map(day => (
          <div key={day} className="py-4 text-center font-black text-[10px] uppercase tracking-[0.3em] text-zinc-500 hidden md:block">
            {day}
          </div>
        ))}
        {view === 'week' && <div className="p-2 text-center font-black text-xs uppercase tracking-widest text-zinc-500 md:hidden">Focus Week</div>}

        {gridDays.map((day, index) => (
          <DayCell
            key={day ? day.toISOString() : index}
            day={day}
            view={view}
            currentDisplayDate={currentDate}
            dayName={daysOfWeek[index % 7]}
            draggedTask={draggedTask}
            onDrop={() => {
              if (draggedTask && day) {
                props.onDateUpdate(draggedTask.id, day);
              }
            }}
          >
            {props.tasks
              .filter(task => {
                if (!task.due_date || !day) return false;
                const taskDatePart = task.due_date.substring(0, 10);
                const calendarDatePart = day.toISOString().substring(0, 10);
                return taskDatePart === calendarDatePart;
              })
              .map((task, taskIndex) => (
                <DraggableTask
                  key={task.id}
                  task={task}
                  taskIndex={taskIndex}
                  setDraggedTask={setDraggedTask}
                  onEditTask={props.onEditTask}
                  onDeleteTask={props.onDeleteTask}
                  onStatusChange={props.onStatusChange}
                  onToggleTimer={props.onToggleTimer}
                  onToggleFavorite={props.onToggleFavorite}
                  currentUser={props.currentUser}
                  celebratingTaskId={props.celebratingTaskId}
                  hasPremiumAccess={props.hasPremiumAccess}
                />
              ))}
          </DayCell>
        ))}
      </div>
    </div>
  );
};

interface DayCellProps {
  day: Date | null;
  view: 'month' | 'week';
  currentDisplayDate: Date;
  dayName?: string;
  children: React.ReactNode;
  draggedTask: Task | null;
  onDrop: () => void;
}

const DayCell: React.FC<DayCellProps> = ({ day, view, currentDisplayDate, dayName, children, draggedTask, onDrop }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isToday = day ? isTodayFns(day) : false;
  const isCurrentMonth = day ? isSameMonth(day, currentDisplayDate) : false;
  const hasTasks = React.Children.count(children) > 0;

  return (
    <motion.div
      onDragOver={(e) => { e.preventDefault(); setIsHovered(true); }}
      onDragLeave={() => setIsHovered(false)}
      onDrop={(e) => { e.preventDefault(); onDrop(); setIsHovered(false); }}
      className={`
        relative p-3 rounded-3xl border transition-all duration-500 overflow-hidden group
        ${view === 'month' ? 'min-h-[140px] md:min-h-[180px]' : 'min-h-[600px]'}
        ${day ? (isCurrentMonth ? 'bg-zinc-900/40 border-white/10 shadow-xl' : 'bg-black/20 border-white/5 opacity-50') : 'bg-black/10 border-transparent'}
        ${isToday ? 'border-indigo-500/50 ring-1 ring-indigo-500/30' : ''}
        ${isHovered && draggedTask ? 'bg-indigo-500/10 border-indigo-400/50 scale-[1.02] z-20' : ''}
      `}
    >
      {/* Inner Cell Glow for Days with Tasks */}
      {hasTasks && isCurrentMonth && (
        <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors" />
      )}

      {isToday && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Current</span>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_10px_#818cf8]" />
        </div>
      )}

      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-black md:hidden text-zinc-500 uppercase tracking-widest">{dayName}</span>
        <span className={`
          text-lg font-black tracking-tighter
          ${isCurrentMonth ? 'text-white' : 'text-zinc-600'}
          ${isToday ? 'text-indigo-400' : ''}
        `}>{day?.getDate()}</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar relative z-10 pr-1">
        {isHovered && draggedTask && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
              <Plus className="w-6 h-6 text-indigo-400 animate-bounce" />
            </div>
          </motion.div>
        )}
        {children}
      </div>
    </motion.div>
  );
};


interface DraggableTaskProps {
  task: Task;
  taskIndex: number;
  setDraggedTask: (task: Task | null) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string, name: string) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onToggleTimer: (task: Task) => void;
  onToggleFavorite: (task: Task) => void;
  currentUser: SecureUser | null;
  celebratingTaskId: string | null;
  hasPremiumAccess: boolean;
}

const DraggableTask: React.FC<DraggableTaskProps> = ({ task, taskIndex, setDraggedTask, onEditTask, onDeleteTask, onStatusChange, onToggleTimer, onToggleFavorite, currentUser, celebratingTaskId, hasPremiumAccess }) => {
  return (
    <motion.div
      draggable
      onDragStart={() => setDraggedTask(task)}
      onDragEnd={() => setDraggedTask(null)}
      className="cursor-grab active:cursor-grabbing"
      layoutId={`cal-${task.id}`} // Using a prefix to avoid conflicts with other views
    >
      <TaskCard
        task={task}
        index={taskIndex}
        onEdit={onEditTask}
        onDelete={onDeleteTask}
        onToggleTimer={onToggleTimer}
        onStatusChange={onStatusChange}
        onToggleFavorite={onToggleFavorite}
        currentUser={currentUser}
        celebratingTaskId={celebratingTaskId}
        hasPremiumAccess={hasPremiumAccess}
        isSelected={false} // Selection not supported in calendar view
        onSelect={() => {}} // No-op
        view="calendar"
      />
    </motion.div>
  );
};

export default TaskGrid;