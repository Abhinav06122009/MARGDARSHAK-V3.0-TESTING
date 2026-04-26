import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Course } from '@/components/dashboard/course';
import { courseService } from '@/components/dashboard/courseService';

interface CourseTableProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (id: string, name: string) => void;
}

const CourseTable: React.FC<CourseTableProps> = ({ courses, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
      <table className="w-full min-w-[640px] text-sm text-left text-white/80">
        <thead className="text-xs text-white/60 uppercase bg-white/5 tracking-wider">
          <tr>
            <th scope="col" className="px-6 py-4">Course Name</th>
            <th scope="col" className="px-6 py-4">Code</th>
            <th scope="col" className="px-6 py-4 text-center">Credits</th>
            <th scope="col" className="px-6 py-4">Difficulty</th>
            <th scope="col" className="px-6 py-4">Priority</th>
            <th scope="col" className="px-6 py-4 text-right"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <motion.tbody layout>
          <AnimatePresence>
            {courses.map((course, index) => (
              <motion.tr
                key={`${course.id}-${index}`}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.03 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200 group"
              >
                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap flex items-center gap-3">
                  <div 
                    className="w-1.5 h-6 rounded-full shadow-lg shadow-current" 
                    style={{ backgroundColor: courseService.getCourseBackgroundColor(course) }}
                  ></div>
                  <span className="group-hover:text-indigo-400 transition-colors">{course.name}</span>
                </th>
                <td className="px-6 py-4 font-mono text-xs text-white/50">{course.code}</td>
                <td className="px-6 py-4 text-center font-bold text-white/70">{course.credits}</td>
                <td className="px-6 py-4">
                  <span 
                    className="flex items-center gap-2 capitalize text-xs font-bold" 
                    style={{ color: courseService.getDifficultyColor(course.difficulty) }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse" 
                      style={{ backgroundColor: courseService.getDifficultyColor(course.difficulty) }}
                    ></div>
                    {course.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 capitalize text-xs font-medium text-white/60">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                    {course.priority}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(course)}
                      className="h-8 w-8 p-0 hover:bg-indigo-500/20 text-white/60 hover:text-indigo-400 transition-all"
                      title="Edit Course"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(course.id, course.name)}
                      className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-all"
                      title="Delete Course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </motion.tbody>
      </table>
    </div>
  );
};

export default CourseTable;
