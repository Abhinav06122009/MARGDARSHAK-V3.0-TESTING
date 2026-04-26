import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Edit, Trash2, Plus, Calendar, Clock, Flag, Trophy, Target, AlertCircle, CheckCircle, PlayCircle, PauseCircle, X, Flame, Maximize } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MountainClimbVisualization from './MountainClimbVisualization';
import CompletionCelebration from './CompletionCelebration';
import { Card, CardContent } from '@/components/ui/card';

interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  target_date: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
  updated_at?: string;
  study_streak?: number;
  streak_insurance?: number;
}

interface ProgressCardProps {
  goal: Goal;
  index: number;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onAddProgress: (goal: Goal) => void;
  onManageStreak: (goal: Goal) => void;
  deletingGoalId: string | null;
  onFocus: (goalId: string) => void;
  viewMode: 'grid' | 'list';
  celebratingGoalId: string | null;
}

// Enhanced Custom Styles for Progress Card
const progressCardStyles = `
  .progress-card-container {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .progress-card-container:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  }

  .progress-bar-container {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
    position: relative;
  }

  .progress-bar-fill {
    height: 12px;
    border-radius: 12px;
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .progress-bar-fill::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }

  .priority-high {
    border-left: 4px solid #ff416c;
    background: linear-gradient(135deg, rgba(255, 65, 108, 0.1), rgba(255, 75, 43, 0.1));
  }

  .priority-medium {
    border-left: 4px solid #f093fb;
    background: linear-gradient(135deg, rgba(240, 147, 251, 0.1), rgba(245, 87, 108, 0.1));
  }

  .priority-low {
    border-left: 4px solid #11998e;
    background: linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.1));
  }

  .goal-status-active {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  }

  .goal-status-completed {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .goal-status-paused {
    background: linear-gradient(135deg, #FFB347 0%, #FFCC00 100%);
  }

  .goal-status-cancelled {
    background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  }

  .progress-excellent {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 50%, #50C878 100%);
    box-shadow: 0 4px 15px rgba(56, 239, 125, 0.4);
  }

  .progress-good {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #87CEEB 100%);
    box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
  }

  .progress-average {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #FFB347 100%);
    box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
  }

  .progress-poor {
    background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 50%, #E0115F 100%);
    box-shadow: 0 4px 15px rgba(255, 65, 108, 0.4);
  }

  .bg-gradient-button-outline {
    background: rgba(255, 255, 255, 0.12);
    border: 2px solid rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(15px);
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
  }

  .bg-gradient-button-outline:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.6);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
  }

  .bg-gradient-button-success {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 50%, #50C878 100%);
    box-shadow: 0 6px 20px rgba(56, 239, 125, 0.3);
  }

  .bg-gradient-button-success:hover {
    background: linear-gradient(135deg, #0f8a80 0%, #32d170 50%, #45B76B 100%);
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(56, 239, 125, 0.5);
  }

  .bg-gradient-button-danger {
    background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 50%, #E0115F 100%);
    box-shadow: 0 6px 20px rgba(255, 65, 108, 0.3);
  }

  .bg-gradient-button-danger:hover {
    background: linear-gradient(135deg, #e63946 0%, #e6371f 50%, #CC0E52 100%);
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(255, 65, 108, 0.5);
  }
`;

// Add styles to document head
const addProgressCardStyles = () => {
  if (document.getElementById('progress-card-styles')) {
    return;
  }

  const styleSheet = document.createElement("style");
  styleSheet.id = 'progress-card-styles';
  styleSheet.type = "text/css";
  styleSheet.innerText = progressCardStyles;
  document.head.appendChild(styleSheet);
};

const ProgressCard: React.FC<ProgressCardProps> = ({
  goal,
  index,
  onEdit,
  onDelete,
  onAddProgress,
  onManageStreak,
  deletingGoalId,
  onFocus,
  viewMode,
  celebratingGoalId,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12.5deg", "-12.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12.5deg", "12.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    x.set(cursorX / rect.width - 0.5);
    y.set(cursorY / rect.height - 0.5);

    // Set CSS variables for cursor-following glow
    e.currentTarget.style.setProperty('--mouse-x', `${cursorX}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${cursorY}px`);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  React.useEffect(() => {
    addProgressCardStyles();
  }, []);

  const progressPercentage = Math.min((goal.current_value / goal.target_value) * 100, 100);

  // For circular progress ring
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercentage / 100) * circumference;

  const getProgressIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'paused': return PauseCircle;
      case 'cancelled': return X;
      default: return PlayCircle;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'progress-excellent';
    if (percentage >= 70) return 'progress-good';
    if (percentage >= 40) return 'progress-average';
    return 'progress-poor';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'medium': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'low': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  const StatusIcon = getProgressIcon(goal.status);
  const daysLeft = Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -2 }}
        className={`relative bg-zinc-950/60 backdrop-blur-3xl p-6 rounded-[2rem] border border-white/10 transition-all duration-300 hover:shadow-2xl priority-${goal.priority} flex items-center gap-6`}
      >
        {celebratingGoalId === goal.id && <CompletionCelebration />}
        {/* Status Icon */}
        <motion.div
          className={`flex items-center justify-center w-12 h-12 rounded-xl goal-status-${goal.status} shadow-md flex-shrink-0`}
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ duration: 0.8 }}
        >
          <StatusIcon className="w-6 h-6 text-white" />
        </motion.div>

        {/* Goal Info */}
        <div className="flex-grow overflow-hidden">
          <h3 className="font-bold text-white text-lg truncate">{goal.title}</h3>
          <div className="flex items-center gap-3 mt-1">
            <Badge className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md text-xs">
              {goal.category}
            </Badge>
            <Badge className={`px-2 py-0.5 rounded-md text-xs ${getPriorityColor(goal.priority)} bg-white/10`}>
              {goal.priority}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-1/4 flex-shrink-0">
          <div className="flex justify-between text-white/80 text-xs mb-1">
            <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
            <span>{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="progress-bar-container h-2">
            <motion.div
              className={`progress-bar-fill h-2 ${getProgressColor(progressPercentage)}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
            />
          </div>
        </div>

        {/* Streak & Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={() => onManageStreak(goal)}
            className="flex items-center gap-1 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 rounded-xl px-2 py-1 h-auto"
          >
            <Flame className="w-4 h-4" />
            <span className="font-bold text-base">{goal.study_streak || 0}</span>
          </Button>
          <div className="w-px h-6 bg-white/20" />
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              onClick={() => onFocus(goal.id)}
              className="bg-gradient-button-outline text-white rounded-lg w-8 h-8"
              title="Focus on Goal"
            >
              <Maximize className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              onClick={() => onEdit(goal)}
              className="bg-gradient-button-outline text-white rounded-lg w-8 h-8"
              title="Edit Goal"
            >
              <Edit className="w-4 h-4" />
            </Button>
            {goal.status === 'active' && (
              <Button
                size="icon"
                onClick={() => onAddProgress(goal)}
                className="bg-gradient-button-success text-white rounded-lg w-8 h-8"
                title="Add Progress"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="icon"
              onClick={() => onDelete(goal.id)}
              disabled={deletingGoalId === goal.id}
              className="bg-gradient-button-danger text-white rounded-lg w-8 h-8"
              title="Delete Goal"
            >
              {deletingGoalId === goal.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        className={`relative bg-zinc-950/80 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 transition-all duration-700 hover:border-indigo-500/30 priority-${goal.priority} group overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.6)]`}
      >
        {/* Dynamic Cursor Glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(99, 102, 241, 0.15), transparent 40%)`,
          }}
        />

        {/* Parallax Substrate */}
        <motion.div
          style={{ translateZ: 50 }}
          className="absolute -right-24 -top-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-1000"
        />
        {celebratingGoalId === goal.id && <CompletionCelebration />}
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              style={{ translateZ: 80 }}
              className={`flex items-center justify-center w-24 h-24 rounded-[2rem] goal-status-${goal.status} shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden group/icon`}
              whileHover={{ scale: 1.1, rotate: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <div className="absolute inset-0 bg-white/20 backdrop-blur-md opacity-0 group-hover/icon:opacity-100 transition-opacity" />
              <StatusIcon className="w-12 h-12 text-white relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
            </motion.div>
            <div>
              <motion.h3
                className="font-black text-white text-2xl mb-2 tracking-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                {goal.title}
              </motion.h3>
              {goal.description && (
                <motion.p
                  className="text-zinc-400 text-lg font-medium mb-4 max-w-xl leading-relaxed"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  {goal.description}
                </motion.p>
              )}
              <div className="flex items-center gap-4 flex-wrap">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  style={{ translateZ: 40 }}
                >
                  <Badge className="bg-white/5 text-indigo-400 px-5 py-2.5 rounded-2xl border border-indigo-500/20 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl backdrop-blur-md">
                    {goal.category}
                  </Badge>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  style={{ translateZ: 40 }}
                >
                  <Badge className={`px-5 py-2.5 rounded-2xl border font-black uppercase tracking-[0.2em] text-[10px] shadow-xl backdrop-blur-md ${getPriorityColor(goal.priority)}`}>
                    {goal.priority}
                  </Badge>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              onClick={() => onFocus(goal.id)}
              className="w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all"
              title="Focus on Goal"
            >
              <Maximize className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              onClick={() => onEdit(goal)}
              className="w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all"
              title="Edit Goal"
            >
              <Edit className="w-5 h-5" />
            </Button>

            {goal.status === 'active' && (
              <Button
                size="icon"
                onClick={() => onAddProgress(goal)}
                className="w-12 h-12 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-2xl border border-emerald-500/30 transition-all"
                title="Add Progress"
              >
                <Plus className="w-6 h-6" />
              </Button>
            )}

            <Button
              size="icon"
              onClick={() => onDelete(goal.id)}
              disabled={deletingGoalId === goal.id}
              className="w-12 h-12 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-2xl border border-rose-500/30 transition-all"
              title="Delete Goal"
            >
              {deletingGoalId === goal.id ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress Section */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + index * 0.05 }}
        >
          <div className="flex justify-between items-end text-white/80 text-sm mb-2">
            <span className="font-medium">
              {goal.current_value} / {goal.target_value} {goal.unit}
            </span>
          </div>
          <MountainClimbVisualization progress={progressPercentage} />
        </motion.div>

        {/* Goal Details Section */}
        <motion.div
          className="grid grid-cols-3 gap-6 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 + index * 0.05 }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-zinc-500 font-black uppercase tracking-widest text-[10px]">
              <Calendar className="w-3 h-3" /> Started Date
            </div>
            <div className="text-white font-bold">{new Date(goal.start_date).toLocaleDateString()}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-zinc-500 font-black uppercase tracking-widest text-[10px]">
              <Flag className="w-3 h-3" /> Target Date
            </div>
            <div className="text-white font-bold">{new Date(goal.target_date).toLocaleDateString()}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-zinc-500 font-black uppercase tracking-widest text-[10px]">
              <Clock className="w-3 h-3" /> Days Remaining
            </div>
            <div className={`font-black ${daysLeft < 0 ? 'text-rose-400' : daysLeft < 7 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {daysLeft > 0 ? `${daysLeft} DAYS` :
                daysLeft === 0 ? 'DUE TODAY' :
                  `${Math.abs(daysLeft)} OVERDUE`}
            </div>
          </div>
        </motion.div>

        {/* New Progress & Streak Section */}
        <motion.div
          className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 + index * 0.05 }}
        >
          {/* Circular Progress */}
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full" viewBox="0 0 70 70">
                <circle cx="35" cy="35" r={radius} fill="transparent" stroke="#ffffff20" strokeWidth="6" />
                <motion.circle
                  cx="35" cy="35" r={radius}
                  fill="transparent"
                  stroke="url(#progressGradient)"
                  strokeLinecap="round" strokeWidth="6"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.5, ease: 'circOut', delay: 1.2 + index * 0.05 }}
                  transform="rotate(-90 35 35)"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38ef7d" />
                    <stop offset="100%" stopColor="#11998e" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                {progressPercentage.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Streak Button */}
          <Button
            variant="ghost"
            onClick={() => onManageStreak(goal)}
            className="flex items-center gap-2 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 rounded-xl px-4 py-2"
          >
            <Flame className="w-5 h-5" />
            <span className="font-bold text-lg">{goal.study_streak || 0}</span>
          </Button>
        </motion.div>

        {/* Achievement Badge for Completed Goals */}
        {goal.status === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.0 + index * 0.05, type: "spring", bounce: 0.5 }}
            className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/40 rounded-xl text-center"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-2"
            >
              <Trophy className="w-8 h-8 text-yellow-400" />
            </motion.div>
            <div className="text-green-300 font-bold text-lg">🎉 Goal Achieved!</div>
            <div className="text-white/80 text-sm">Congratulations on reaching your target!</div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProgressCard;
