import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Course } from '@/components/dashboard/course';
import CourseCard from './CourseCard';

interface CourseGridProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (id: string, name: string) => void;
  onFocus: (course: Course) => void;
}

const CourseGrid: React.FC<CourseGridProps> = ({ courses, onEdit, onDelete, onFocus }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence mode="popLayout">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ 
              duration: 0.4, 
              delay: Math.min(index * 0.05, 0.5), 
              type: 'spring', 
              stiffness: 100 
            }}
          >
            <CourseCard
              course={course}
              onEdit={() => onEdit(course)}
              onDelete={() => onDelete(course.id, course.name)}
              onFocus={() => onFocus(course)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CourseGrid;
