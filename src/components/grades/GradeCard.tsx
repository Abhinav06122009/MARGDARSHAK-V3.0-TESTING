import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, MoreVertical, BookOpen, Award, TrendingUp, Percent } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { gradeService } from './gradeService';
import type { Grade } from './types';

const GlareEffect = () => (
  <motion.div
    className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-[2.5rem] pointer-events-none z-30"
    style={{ transform: "translateZ(80px)" }}
  >
    <motion.div
      className="absolute w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent -top-1/2 -left-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
      animate={{
        rotate: [0, 15, 0],
        x: ['-10%', '10%', '-10%'],
        y: ['-10%', '10%', '-10%']
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      style={{
        filter: 'blur(80px)',
        mixBlendMode: 'overlay'
      }}
    />
  </motion.div>
);

interface GradeCardProps {
  grade: Grade;
  index: number;
  onEdit: (grade: Grade) => void;
  onDelete: (id: string, name: string) => void;
  isSelected: boolean;
  onSelect: (gradeId: string) => void;
}

const GradeCard: React.FC<GradeCardProps> = ({ grade, index, onEdit, onDelete, isSelected, onSelect }) => {
  const percentage = (grade.grade / grade.total_points) * 100;
  const letterGrade = gradeService.getLetterGrade(percentage);
  const gradeColor = gradeService.getGradeColor(percentage);

  const [isInteractionHovered, setIsInteractionHovered] = useState(false);

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

  const handleInteractionEnter = () => setIsInteractionHovered(true);
  const handleInteractionLeave = () => setIsInteractionHovered(false);

  return (
    <motion.div
      key={grade.id}
      initial={{ opacity: 0, y: 50, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, y: -20, rotateX: -10 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 100, damping: 10 }}
      className="group h-full"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98, rotateX: 2 }}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} whileHover={{ scale: 1.03 }}>
        <Card
          className={`relative bg-zinc-950/20 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] transition-all duration-700 shadow-2xl group-hover:shadow-[0_20px_60px_rgba(79,70,229,0.2)] h-full overflow-hidden flex flex-col transform-gpu`}
          style={{ transform: "translateZ(20px)" }}
        >
          <GlareEffect />
          <div
            className="absolute top-6 right-6 z-40"
            onMouseEnter={handleInteractionEnter}
            onMouseLeave={handleInteractionLeave}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(grade.id)}
              className="h-7 w-7 bg-black/60 border-white/10 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-400 rounded-lg transition-all shadow-xl"
            />
          </div>
          <div className={`h-2 w-full flex-shrink-0 bg-gradient-to-r ${gradeColor} opacity-50 group-hover:opacity-100 transition-opacity duration-700`} />

          <CardHeader className="p-8 pb-4 relative z-20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center space-x-5 flex-grow min-w-0">
                <motion.div
                  className={`p-4 rounded-2xl bg-gradient-to-br ${gradeColor} shadow-2xl relative overflow-hidden`}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Award className="h-7 w-7 text-white relative z-10" />
                </motion.div>
                <div className="min-w-0">
                  <h3 className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Assignment</h3>
                  <CardTitle className="text-2xl font-black text-white tracking-tighter group-hover:text-indigo-300 transition-colors duration-500 truncate drop-shadow-2xl">
                    {grade.assignment_name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-black uppercase tracking-widest text-white border-white/5 px-4 py-1.5 rounded-xl bg-gradient-to-r ${gradeColor} shadow-lg`}
                    >
                      {grade.subject}
                    </Badge>
                  </div>
                </div>
              </div>

              <div
                className="flex items-center gap-1 flex-shrink-0"
                onMouseEnter={handleInteractionEnter}
                onMouseLeave={handleInteractionLeave}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-12 w-12 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <MoreVertical className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl p-2 min-w-[160px]">
                    <DropdownMenuItem onSelect={() => onEdit(grade)} className="rounded-xl h-12 gap-3 focus:bg-white/10 transition-all">
                      <div className="p-2 bg-white/5 rounded-lg"><Edit className="h-4 w-4" /></div>
                      <span className="font-black text-[10px] uppercase tracking-widest">Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onDelete(grade.id, grade.assignment_name)} className="rounded-xl h-12 gap-3 text-red-400 focus:bg-red-500/10 focus:text-red-300 transition-all">
                      <div className="p-2 bg-red-500/10 rounded-lg"><Trash2 className="h-4 w-4" /></div>
                      <span className="font-black text-[10px] uppercase tracking-widest">Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 pt-0 space-y-6 flex-grow flex flex-col justify-between relative z-20">
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-white/5 text-zinc-400 bg-white/5 px-4 py-1.5 rounded-xl">
                <Calendar className="h-3.5 w-3.5 mr-2 text-indigo-400" />
                {new Date(grade.date_recorded).toLocaleDateString()}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-white/5 text-zinc-400 bg-white/5 px-4 py-1.5 rounded-xl">
                <BookOpen className="h-3.5 w-3.5 mr-2 text-emerald-400" />
                {grade.grade_type}
              </Badge>
            </div>

            {grade.notes && (
              <div className="relative group/notes">
                <div className="absolute -left-4 top-0 w-1 h-full bg-indigo-500/20 rounded-full group-hover/notes:bg-indigo-500/50 transition-colors" />
                <p className="text-sm text-zinc-400 leading-relaxed italic line-clamp-3">
                  "{grade.notes}"
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Score</span>
                <span className="text-lg font-black text-white tracking-tighter">{grade.grade} <span className="text-zinc-600 text-xs font-medium">/ {grade.total_points}</span></span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2 mt-1 overflow-hidden border border-white/5">
                <motion.div
                  className={`bg-gradient-to-r ${gradeColor} h-full rounded-full relative shadow-[0_0_15px_rgba(79,70,229,0.3)]`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: 'circOut' }}
                />
              </div>
            </div>

            <div
              className="pt-6 border-t border-white/5 mt-auto"
              onMouseEnter={handleInteractionEnter}
              onMouseLeave={handleInteractionLeave}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className={`text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r ${gradeColor} tracking-tighter drop-shadow-2xl`}>
                    {letterGrade}
                  </div>
                  <div className="flex flex-col">
                    <div className="text-white font-black text-xl tracking-tighter">{percentage.toFixed(1)}%</div>
                    <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Efficiency</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center h-14 w-14 rounded-2xl bg-zinc-950/40 border border-white/10 group-hover:border-indigo-500/30 transition-all duration-700 overflow-hidden relative`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradeColor} opacity-10`} />
                    <span className={`text-xl font-black bg-clip-text text-transparent bg-gradient-to-br ${gradeColor}`}>{letterGrade}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default GradeCard;