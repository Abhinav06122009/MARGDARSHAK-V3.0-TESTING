import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, BookOpen, LayoutGrid, List,
  Shield, AlertCircle, Eye, ArrowLeft, Zap, Route, Lock, Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Internal Services & Types
import { courseService } from '@/components/dashboard/courseService';
import type { Course, CourseFormData, SecureUser, CourseStats as CourseStatsType } from '@/components/dashboard/course';
import { recommendationService, RecommendedCourse, LearningPath, CuratedContent } from './recommendationService';

// Sub-components
import CourseCard from './CourseCard';
import CourseTable from './CourseTable';
import CourseGrid from './CourseGrid';
import CourseStats from './CourseStats';
import CourseToolkit from './CourseToolkit';
import CourseFocusView from './CourseFocusView';
import ParallaxBackground from '@/components/ui/ParallaxBackground';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import CourseForm from './CourseForm'; // I'll create this next

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface CourseManagementProps {
  onBack?: () => void;
}

const CourseManagement: React.FC<CourseManagementProps> = ({ onBack }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([]);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [focusedCourse, setFocusedCourse] = useState<Course | null>(null);
  const [curatedContent, setCuratedContent] = useState<CuratedContent[]>([]);

  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    code: '',
    description: '',
    grade_level: '',
    semester: '',
    academic_year: new Date().getFullYear().toString(),
    credits: 3,
    color: '#3B82F6',
    priority: 'medium',
    difficulty: 'intermediate',
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const performSearch = useCallback(async () => {
    if (!currentUser) return;
    try {
      const results = await courseService.searchUserCourses(
        currentUser.id,
        searchTerm.trim() || undefined,
        filterGrade === 'all' ? undefined : filterGrade,
        filterDifficulty === 'all' ? undefined : filterDifficulty
      );
      setFilteredCourses(results);
    } catch (error) {
      console.error('Error performing search:', error);
    }
  }, [currentUser, searchTerm, filterGrade, filterDifficulty]);

  const initializeSecureCourseManagement = useCallback(async () => {
    try {
      setLoading(true);
      const user = await courseService.getCurrentUser();

      if (!user) {
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      setSecurityVerified(true);

      const [userCourses, stats] = await Promise.all([
        courseService.fetchUserCourses(user.id),
        courseService.getCourseStatistics(user.id)
      ]);

      const aiRecommendations = await recommendationService.getPersonalizedRecommendations(user.id, userCourses);

      setCourses(userCourses);
      setFilteredCourses(userCourses);
      setCourseStats(stats);
      setRecommendations(aiRecommendations);

      toast({
        title: "Workspace Synchronized",
        description: `Welcome back, ${user.profile?.full_name?.split(' ')[0]}!`,
      });
    } catch (error) {
      console.error('Error initializing course management:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    initializeSecureCourseManagement();
  }, [initializeSecureCourseManagement]);

  useEffect(() => {
    if (currentUser) {
      performSearch();
    }
  }, [currentUser, searchTerm, filterGrade, filterDifficulty, performSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const enhancedData = {
        ...formData,
        color: formData.color || '#3B82F6',
      };

      if (editingCourse) {
        await courseService.updateCourse(editingCourse.id, enhancedData, currentUser.id);
        toast({ title: "Course Updated", description: `${formData.name} has been updated.` });
      } else {
        await courseService.createCourse(enhancedData, currentUser.id);
        toast({ title: "Course Created", description: `${formData.name} added to your workspace.` });
      }

      setIsSheetOpen(false);
      setEditingCourse(null);
      resetForm();

      const userCourses = await courseService.fetchUserCourses(currentUser.id);
      setCourses(userCourses);
      const stats = await courseService.getCourseStatistics(currentUser.id);
      setCourseStats(stats);
      performSearch();
    } catch (error: any) {
      toast({ title: 'Operation Failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      description: course.description || '',
      grade_level: course.grade_level || '',
      semester: course.semester || '',
      academic_year: course.academic_year || new Date().getFullYear().toString(),
      credits: course.credits || 3,
      color: course.color || '#3B82F6',
      priority: course.priority || 'medium',
      difficulty: course.difficulty || 'intermediate',
    });
    recommendationService.getCuratedContent(course).then(setCuratedContent);
    setIsSheetOpen(true);
  };

  const handleDelete = async (courseId: string, courseName: string) => {
    setModalState({
      isOpen: true,
      title: `Delete ${courseName}`,
      message: `Permanently remove this course? This cannot be undone.`,
      onConfirm: async () => {
        if (!currentUser) return;
        try {
          await courseService.deleteCourse(courseId, currentUser.id);
          toast({ title: 'Course Deleted', description: `${courseName} removed.` });
          const userCourses = await courseService.fetchUserCourses(currentUser.id);
          setCourses(userCourses);
          const stats = await courseService.getCourseStatistics(currentUser.id);
          setCourseStats(stats);
        } catch (error: any) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
          setModalState(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      name: '', code: '', description: '', grade_level: '',
      semester: '', academic_year: new Date().getFullYear().toString(),
      credits: 3, color: '#3B82F6', priority: 'medium', difficulty: 'intermediate',
    });
  };

  const handleGeneratePath = async () => {
    if (!currentUser) return;
    if (currentUser.profile?.subscription_tier !== 'premium_elite') {
      toast({ title: "Elite Feature", description: "Upgrade to generate AI Learning Paths.", variant: "destructive" });
      navigate('/upgrade');
      return;
    }

    const path = await recommendationService.generateLearningPath(currentUser.id, "Academic Path");
    setLearningPath(path);
    setIsPathModalOpen(true);
  };

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="p-4 rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-3xl font-black text-white">Access Restricted</h2>
          <p className="text-zinc-400">Please sign in to manage your academic workspace.</p>
          <Button onClick={() => navigate('/auth')} className="w-full bg-indigo-600 hover:bg-indigo-700">Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center relative overflow-hidden pb-20">
      <ParallaxBackground />
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
      />

      <div className="w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 z-10 pt-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-indigo-500" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Workspace</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white">
              Course <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">Management</span>
            </h1>
            <p className="text-zinc-500 font-medium">Organize, track, and master your academic journey.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleGeneratePath}
              className="rounded-2xl border-amber-500/30 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10"
            >
              <Route className="w-4 h-4 mr-2" /> AI Path
            </Button>
            <Button 
              onClick={() => { resetForm(); setEditingCourse(null); setIsSheetOpen(true); }}
              className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 px-8 font-bold"
            >
              <Plus className="w-4 h-4 mr-2" /> New Course
            </Button>
          </div>
        </header>

        {/* Stats Section */}
        <CourseStats stats={courseStats} />

        {/* AI Toolkit */}
        <CourseToolkit currentUser={currentUser} />

        {/* Filters & View Toggle */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8 p-4 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="Search courses by name or code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-zinc-600"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex p-1 rounded-xl bg-zinc-950/50 border border-white/5">
              <Button 
                variant="ghost" size="sm" 
                onClick={() => setViewMode('grid')}
                className={`rounded-lg px-3 ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" size="sm"
                onClick={() => setViewMode('table')}
                className={`rounded-lg px-3 ${viewMode === 'table' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-[140px] h-10 rounded-xl bg-zinc-950/50 border-white/5 text-zinc-300">
                <Filter className="w-3 h-3 mr-2" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="min-h-[400px]">
          {viewMode === 'grid' ? (
            <CourseGrid 
              courses={filteredCourses} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
              onFocus={setFocusedCourse} 
            />
          ) : (
            <CourseTable 
              courses={filteredCourses} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          )}

          {filteredCourses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="p-6 rounded-full bg-zinc-900/50 border border-white/5">
                <BookOpen className="w-12 h-12 text-zinc-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">No courses found</h3>
                <p className="text-zinc-500">Try adjusting your filters or create a new course.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sheet/Modal for Create/Edit */}
      <CourseForm 
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingCourse={editingCourse}
        curatedContent={curatedContent}
      />

      {/* Focus View */}
      {focusedCourse && (
        <CourseFocusView 
          course={focusedCourse} 
          onClose={() => setFocusedCourse(null)} 
        />
      )}

      <LearningPathDialog 
        isOpen={isPathModalOpen} 
        onClose={() => setIsPathModalOpen(false)} 
        path={learningPath} 
      />

    </div>
  );
};

// Internal Helper Modal for Learning Path
const LearningPathDialog: React.FC<{ isOpen: boolean, onClose: () => void, path: LearningPath | null }> = ({ isOpen, onClose, path }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="bg-zinc-950/95 backdrop-blur-2xl border-white/10 text-white max-w-2xl">
      <DialogHeader>
        <div className="p-3 w-fit rounded-2xl bg-amber-500/20 mb-4">
          <Route className="w-6 h-6 text-amber-400" />
        </div>
        <DialogTitle className="text-3xl font-black tracking-tighter">{path?.title || 'Learning Path'}</DialogTitle>
        <DialogDescription className="text-zinc-400">{path?.description}</DialogDescription>
      </DialogHeader>
      <div className="py-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {path?.steps.map((step, i) => (
          <div key={step.id} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-sm shrink-0">
              {i + 1}
            </div>
            <div>
              <h4 className="font-bold text-white">{step.name}</h4>
              <p className="text-sm text-zinc-500 mt-1">{step.description}</p>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary" className="bg-white/5 text-[10px] uppercase">{step.difficulty}</Badge>
                <Badge variant="secondary" className="bg-white/5 text-[10px]">{step.credits} Credits</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button onClick={onClose} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl py-6">
          Begin Journey
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default CourseManagement;
