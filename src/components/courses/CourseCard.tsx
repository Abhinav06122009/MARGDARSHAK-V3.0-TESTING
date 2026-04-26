import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Edit, Trash2, BookOpen, GraduationCap, Calendar, Clock, Star, Zap, Maximize2, TrendingUp } from 'lucide-react';
import { Course } from '@/components/dashboard/course';
import { courseService } from '@/components/dashboard/courseService';

interface CourseCardProps {
  course: Course;
  index: number;
  onEdit: (course: Course) => void;
  onDelete: (id: string, name: string) => void;
  onFocus: (course: Course) => void;
}

const PRIORITY_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  urgent: { emoji: '🔥', label: 'Urgent',  color: 'text-red-400 bg-red-500/10 border-red-500/25' },
  high:   { emoji: '⚡', label: 'High',    color: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
  medium: { emoji: '📋', label: 'Medium',  color: 'text-blue-400 bg-blue-500/10 border-blue-500/25' },
  low:    { emoji: '📝', label: 'Low',     color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/25' },
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bar: string }> = {
  beginner:     { label: '🌱 Beginner',     color: 'text-emerald-400', bar: 'bg-emerald-500' },
  intermediate: { label: '🚀 Intermediate', color: 'text-blue-400',    bar: 'bg-blue-500' },
  advanced:     { label: '🎯 Advanced',     color: 'text-violet-400',  bar: 'bg-violet-500' },
  expert:       { label: '💎 Expert',       color: 'text-rose-400',    bar: 'bg-rose-500' },
};

const difficultyPct: Record<string, number> = { beginner: 25, intermediate: 55, advanced: 80, expert: 100 };

const CourseCard: React.FC<CourseCardProps> = ({ course, index, onEdit, onDelete, onFocus }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 250, damping: 22, mass: 0.4 });
  const mouseYSpring = useSpring(y, { stiffness: 250, damping: 22, mass: 0.4 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['8deg', '-8deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-8deg', '8deg']);

  const bgColor = courseService.getCourseBackgroundColor(course);
  const difficultyColor = courseService.getDifficultyColor(course.difficulty);
  const courseType = courseService.getCourseType(course);
  const priority = PRIORITY_CONFIG[course.priority] ?? PRIORITY_CONFIG.medium;
  const difficulty = DIFFICULTY_CONFIG[course.difficulty] ?? DIFFICULTY_CONFIG.intermediate;
  const diffPct = difficultyPct[course.difficulty] ?? 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 120, damping: 14 }}
      className="group h-full"
      style={{ perspective: '1000px' }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="h-full">
        <div className="relative h-full rounded-2xl overflow-hidden border border-white/[0.08] group-hover:border-white/20 bg-zinc-900/70 backdrop-blur-xl shadow-xl group-hover:shadow-2xl transition-all duration-300 flex flex-col">

          {/* Top accent bar */}
          <div className="h-1 w-full flex flex-shrink-0">
            <div className="flex-1" style={{ backgroundColor: bgColor }} />
            <div className="flex-1" style={{ backgroundColor: difficultyColor }} />
          </div>

          {/* Hover glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
            style={{ background: `radial-gradient(circle at 50% 0%, ${bgColor}18 0%, transparent 60%)` }}
          />

          {/* Action buttons — appear on hover */}
          <div className="absolute top-4 right-4 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
            {[
              { Icon: Maximize2, onClick: () => onFocus(course),           title: 'Focus',  cls: 'hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30' },
              { Icon: Edit,      onClick: () => onEdit(course),            title: 'Edit',   cls: 'hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-500/30' },
              { Icon: Trash2,    onClick: () => onDelete(course.id, course.name), title: 'Delete', cls: 'hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30' },
            ].map(({ Icon, onClick, title, cls }) => (
              <motion.button key={title} onClick={onClick} title={title}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className={`w-8 h-8 rounded-xl border border-white/10 bg-zinc-950/60 text-zinc-400 flex items-center justify-center backdrop-blur-sm transition-all ${cls}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </motion.button>
            ))}
          </div>

          {/* Header */}
          <div className="p-5 pb-3 flex-shrink-0">
            <div className="flex items-start gap-3">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                className="p-2.5 rounded-xl shadow-lg flex-shrink-0"
                style={{ backgroundColor: `${bgColor}30`, border: `1px solid ${bgColor}50` }}
              >
                <BookOpen className="w-5 h-5" style={{ color: bgColor }} />
              </motion.div>
              <div className="min-w-0 flex-1 pr-20">
                <h3 className="text-base font-black text-white truncate group-hover:text-zinc-100 transition-colors">
                  {course.name}
                </h3>
                <span className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase font-mono">{course.code}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {course.description && (
            <div className="px-5 pb-3 flex-shrink-0">
              <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{course.description}</p>
            </div>
          )}

          {/* Difficulty bar */}
          <div className="px-5 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-bold ${difficulty.color}`}>{difficulty.label}</span>
              <span className="text-[10px] text-zinc-600">{diffPct}%</span>
            </div>
            <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${difficulty.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${diffPct}%` }}
                transition={{ duration: 0.8, delay: index * 0.06 + 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Meta badges */}
          <div className="px-5 pb-4 flex flex-wrap gap-1.5 flex-shrink-0">
            {course.grade_level && (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-white/[0.05] border border-white/[0.07] text-zinc-400">
                <GraduationCap className="w-3 h-3 text-blue-400" />{course.grade_level}
              </span>
            )}
            {course.semester && (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-white/[0.05] border border-white/[0.07] text-zinc-400">
                <Calendar className="w-3 h-3 text-emerald-400" />{course.semester}
              </span>
            )}
            {course.credits && (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-white/[0.05] border border-white/[0.07] text-zinc-400">
                <Star className="w-3 h-3 text-amber-400" />{course.credits} cr
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto border-t border-white/[0.06] px-5 py-3 flex items-center justify-between flex-shrink-0">
            <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${priority.color}`}>
              {priority.emoji} {priority.label}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-zinc-600 font-medium capitalize">
              <TrendingUp className="w-3 h-3" />{courseType}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CourseCard;