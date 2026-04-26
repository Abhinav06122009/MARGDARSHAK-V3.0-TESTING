import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Star, Clock, GraduationCap } from 'lucide-react';
import { CourseStats as CourseStatsType } from '@/components/dashboard/course';

interface CourseStatsProps {
  stats: CourseStatsType | null;
}

const CourseStats: React.FC<CourseStatsProps> = ({ stats }) => {
  if (!stats) return null;

  const statItems = [
    { 
      label: 'Total Courses', 
      value: stats.total_courses, 
      icon: BookOpen, 
      color: 'text-indigo-400', 
      bg: 'bg-indigo-500/10' 
    },
    { 
      label: 'Avg. Difficulty', 
      value: stats.avg_difficulty || 'Moderate', 
      icon: Star, 
      color: 'text-amber-400', 
      bg: 'bg-amber-500/10' 
    },
    { 
      label: 'Total Credits', 
      value: stats.total_credits, 
      icon: Clock, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10' 
    },
    { 
      label: 'Workload', 
      value: stats.total_courses > 5 ? 'High' : 'Balanced', 
      icon: GraduationCap, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/10' 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-5 rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-white/5 shadow-lg group hover:border-white/10 transition-all"
        >
          <div className={`p-2.5 w-fit rounded-2xl ${item.bg} mb-4 group-hover:scale-110 transition-transform`}>
            <item.icon className={`w-5 h-5 ${item.color}`} />
          </div>
          <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-1">{item.label}</p>
          <p className="text-2xl font-black text-white">{item.value}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default CourseStats;
