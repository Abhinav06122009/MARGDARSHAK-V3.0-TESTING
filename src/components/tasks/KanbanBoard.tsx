// src/components/tasks/KanbanBoard.tsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Download } from 'lucide-react';
import { Task, SecureUser } from './types';
import TaskCard from './TaskCard';

type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed';

const KANBAN_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'pending', title: 'Pending', color: 'border-yellow-500/50' },
  { id: 'in_progress', title: 'In Progress', color: 'border-blue-500/50' },
  { id: 'review', title: 'In Review', color: 'border-purple-500/50' },
  { id: 'completed', title: 'Completed', color: 'border-green-500/50' },
];

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string, name: string) => void;
  onTaskStatusUpdate: (taskId: string, newStatus: TaskStatus) => void;
  onToggleTimer: (task: Task) => void;
  onToggleFavorite: (task: Task) => void;
  selectedTasks: string[];
  onSelectTask: (taskId: string) => void;
  currentUser: SecureUser | null;
  hasPremiumAccess: boolean;
  celebratingTaskId: string | null;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  tasks, 
  onEditTask, 
  onDeleteTask, 
  onTaskStatusUpdate, 
  onToggleTimer, 
  onToggleFavorite, 
  selectedTasks, 
  onSelectTask, 
  currentUser, 
  hasPremiumAccess, 
  celebratingTaskId 
}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const tasksByStatus = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.id] = tasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <LayoutGroup>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {KANBAN_COLUMNS.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByStatus[column.id]}
            draggedTask={draggedTask}
            setDraggedTask={setDraggedTask}
            onTaskStatusUpdate={onTaskStatusUpdate}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onToggleTimer={onToggleTimer}
            onToggleFavorite={onToggleFavorite}
            selectedTasks={selectedTasks}
            onSelectTask={onSelectTask}
            currentUser={currentUser}
            hasPremiumAccess={hasPremiumAccess}
            celebratingTaskId={celebratingTaskId}
          />
        ))}
      </div>
    </LayoutGroup>
  );
};

interface KanbanColumnProps {
  column: { id: TaskStatus; title: string; color: string };
  tasks: Task[];
  draggedTask: Task | null;
  setDraggedTask: React.Dispatch<React.SetStateAction<Task | null>>;
  onTaskStatusUpdate: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string, name: string) => void;
  onToggleTimer: (task: Task) => void;
  onToggleFavorite: (task: Task) => void;
  selectedTasks: string[];
  onSelectTask: (taskId: string) => void;
  currentUser: SecureUser | null;
  hasPremiumAccess: boolean;
  celebratingTaskId: string | null;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  draggedTask,
  setDraggedTask,
  onTaskStatusUpdate,
  onEditTask,
  onDeleteTask,
  onToggleTimer,
  onToggleFavorite,
  selectedTasks,
  onSelectTask,
  currentUser,
  hasPremiumAccess,
  celebratingTaskId,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDrop = () => {
    if (!draggedTask || draggedTask.status === column.id) return;
    onTaskStatusUpdate(draggedTask.id, column.id);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsHovered(true);
      }}
      onDragLeave={() => setIsHovered(false)}
      onDrop={(e) => {
        e.preventDefault();
        handleDrop();
        setIsHovered(false);
      }}
      className={`relative group bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 transition-all duration-500 min-h-[700px] flex flex-col ${
        isHovered ? `bg-zinc-900/60 ring-2 ring-indigo-500/30 shadow-[0_30px_60px_rgba(0,0,0,0.4)] scale-[1.01]` : 'shadow-2xl'
      }`}
    >
      {/* Decorative Aurora Glow */}
      <div 
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" 
        style={{ backgroundColor: column.id === 'pending' ? '#f59e0b' : column.id === 'in_progress' ? '#3b82f6' : column.id === 'review' ? '#8b5cf6' : '#10b981' }} 
      />

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div 
            className="w-4 h-4 rounded-full shadow-[0_0_15px_currentColor] animate-pulse" 
            style={{ backgroundColor: column.id === 'pending' ? '#f59e0b' : column.id === 'in_progress' ? '#3b82f6' : column.id === 'review' ? '#8b5cf6' : '#10b981' }} 
          />
          <h3 className="font-black text-white text-xl uppercase tracking-[0.2em]">{column.title}</h3>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
          <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Active</span>
          <span className="text-sm font-black text-white">{tasks.length}</span>
        </div>
      </div>

      <div className="space-y-8 flex-grow relative z-10 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, index) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              index={index}
              setDraggedTask={setDraggedTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onToggleTimer={onToggleTimer}
              onStatusChange={onTaskStatusUpdate}
              onToggleFavorite={onToggleFavorite}
              isSelected={selectedTasks.includes(task.id)}
              onSelect={onSelectTask}
              currentUser={currentUser}
              hasPremiumAccess={hasPremiumAccess}
              celebratingTaskId={celebratingTaskId}
            />
          ))}
        </AnimatePresence>
        
        {isHovered && draggedTask && draggedTask.status !== column.id && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="h-40 border-2 border-dashed border-indigo-500/30 rounded-[2.5rem] bg-indigo-500/5 flex flex-col items-center justify-center gap-4"
          >
            <div className="p-4 bg-indigo-500/20 rounded-full">
              <Download className="w-6 h-6 text-indigo-400 rotate-180 animate-bounce" />
            </div>
            <p className="text-indigo-400 font-black text-xs uppercase tracking-[0.3em] animate-pulse text-center">
              Deploy to<br/>{column.title}
            </p>
          </motion.div>
        )}
      </div>
    </div>


  );
};

interface DraggableTaskCardProps {
  task: Task;
  index: number;
  setDraggedTask: React.Dispatch<React.SetStateAction<Task | null>>;
  onEdit: (task: Task) => void;
  onDelete: (id: string, name: string) => void;
  onToggleTimer: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  onToggleFavorite: (task: Task) => void;
  hasPremiumAccess: boolean;
  currentUser: SecureUser | null;
  celebratingTaskId: string | null;
}

const DraggableTaskCard = React.forwardRef<HTMLDivElement, DraggableTaskCardProps>(({ 
  task, 
  index, 
  setDraggedTask, 
  onEdit, 
  onDelete, 
  onToggleTimer, 
  onStatusChange, 
  isSelected, 
  onSelect, 
  onToggleFavorite, 
  hasPremiumAccess, 
  currentUser, 
  celebratingTaskId 
}, ref) => {
  return (
    <motion.div
      ref={ref}
      layoutId={task.id}
      draggable
      onDragStart={() => setDraggedTask(task)}
      className="cursor-grab active:cursor-grabbing"
    >
      <TaskCard 
        task={task} 
        index={index} 
        onEdit={onEdit} 
        onDelete={onDelete} 
        onToggleTimer={onToggleTimer} 
        onStatusChange={onStatusChange} 
        isSelected={isSelected} 
        onSelect={onSelect} 
        onToggleFavorite={onToggleFavorite} 
        hasPremiumAccess={hasPremiumAccess} 
        courses={[]}
        currentUser={currentUser} 
        celebratingTaskId={celebratingTaskId} 
      />
    </motion.div>
  );
});

DraggableTaskCard.displayName = 'DraggableTaskCard';

export default KanbanBoard;