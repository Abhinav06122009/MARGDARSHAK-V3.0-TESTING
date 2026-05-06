import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, Search, Filter, X, LayoutGrid, List, Award, TrendingUp, CheckCircle, Shield, AlertCircle, Palette, BookOpen
} from 'lucide-react';
import GradeInsights from './ai/GradeInsights';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { TiltCard } from '@/components/ui/TiltCard';
import { gradeService } from './gradeService';
import type { Grade, GradeFormData, SecureUser, GradeStats } from './types';
import ParallaxBackground from '@/components/ui/ParallaxBackground';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import GradeCard from './GradeCard';
import GradeHeader from './GradeHeader';
import Achievements from './Achievements.tsx';
import { achievementService } from './achievements';
import type { Achievement } from './achievements';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';

// Social Icons
const linkedinLogo = () => (
  <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const TwitterLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z" />
  </svg>
);



const Grades: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [filteredGrades, setFilteredGrades] = useState<Grade[]>([]);
  const [gradeStats, setGradeStats] = useState<GradeStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });
  const [formData, setFormData] = useState<GradeFormData>({
    subject: '',
    assignment_name: '',
    grade: 0,
    total_points: 100,
    date_recorded: new Date().toISOString().split('T')[0],
    semester: '',
    grade_type: 'assignment',
    notes: '',
    is_extra_credit: false,
    weight: 1.0,
  });
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);

  const { toast } = useToast();

  const { user: authUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      initializeSecureGrades();
    }
  }, [authLoading, authUser]);

  useEffect(() => {
    setSelectedGrades([]);
  }, [viewMode, searchTerm, filterSubject, filterSemester, grades]);

  useEffect(() => {
    let results = grades;
    if (searchTerm) {
      results = results.filter(g =>
        g.assignment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterSubject !== 'all') {
      results = results.filter(g => g.subject === filterSubject);
    }
    if (filterSemester !== 'all') {
      results = results.filter(g => g.semester === filterSemester);
    }
    setFilteredGrades(results);
  }, [grades, searchTerm, filterSubject, filterSemester]);

  const handleSelectGrade = (gradeId: string) => {
    setSelectedGrades(prev =>
      prev.includes(gradeId)
        ? prev.filter(id => id !== gradeId)
        : [...prev, gradeId]
    );
  };

  const handleSelectAllGrades = () => {
    if (selectedGrades.length === filteredGrades.length) {
      setSelectedGrades([]);
    } else {
      setSelectedGrades(filteredGrades.map(grade => grade.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGrades.length === 0) {
      toast({ title: "No Grades Selected", description: "Please select grades to delete.", variant: "warning" });
      return;
    }

    setModalState({
      isOpen: true,
      title: `Delete ${selectedGrades.length} Grades`,
      message: `Are you sure you want to permanently delete ${selectedGrades.length} selected grades? This action cannot be undone.`,
      onConfirm: async () => {
        if (!currentUser) return;
        try {
          await gradeService.bulkDeleteGrades(selectedGrades, currentUser.id);
          toast({ title: "Bulk Delete Successful", description: `${selectedGrades.length} grades have been removed.` });
          setSelectedGrades([]);
          const userGrades = await gradeService.fetchUserGrades(currentUser.id);
          setGrades(userGrades);
          const stats = gradeService.calculateStats(userGrades);
          setGradeStats(stats);
        } catch (error: any) {
          toast({ title: 'Error Bulk Deleting Grades', description: error.message, variant: 'destructive' });
        } finally {
          setModalState({ ...modalState, isOpen: false });
        }
      },
    });
  };

  const handleExportCsv = () => {
    if (filteredGrades.length === 0) {
      toast({ title: "No Grades to Export", description: "There are no grades to export to CSV.", variant: "warning" });
      return;
    }

    const gradesToExport = selectedGrades.length > 0
      ? filteredGrades.filter(grade => selectedGrades.includes(grade.id))
      : filteredGrades;

    const csv = gradeService.exportGradesToCsv(gradesToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'grades.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export Successful", description: `${gradesToExport.length} grades exported to grades.csv.` });
  };

  const initializeSecureGrades = async () => {
    try {
      if (authLoading) return;
      setLoading(true);

      if (!authUser) {
        toast({ title: "Authentication Required", description: "Please log in to manage your grades.", variant: "destructive" });
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      const user = {
        id: authUser.id,
        email: authUser.primaryEmailAddress?.emailAddress || '',
        profile: {
          full_name: authUser.fullName || 'User',
          role: authUser.profile?.role || 'student',
          subscription_tier: authUser.profile?.subscription_tier || 'free'
        }
      } as any;

      setCurrentUser(user);
      setSecurityVerified(true);

      const userGrades = await gradeService.fetchUserGrades(user.id);
      setGrades(userGrades);

      const stats = gradeService.calculateStats(userGrades);
      setGradeStats(stats);

      const achievementResult = achievementService.checkAchievements(userGrades);
      setAchievements(achievementResult.all);

      toast({
        title: "Grades Loaded!",
        description: `Welcome back ${user.profile?.full_name}! Your grades are loaded.`,
        icon: <Shield className="text-emerald-400" />
      });

    } catch (error) {
      console.error('Error initializing grades:', error);
      toast({ title: "Initialization Error", description: "Failed to initialize grade management.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !currentUser) return;
    setIsSubmitting(true);

    try {
      const updatableFormData: Partial<GradeFormData> = {
        subject: formData.subject,
        assignment_name: formData.assignment_name,
        grade: formData.grade,
        total_points: formData.total_points,
        date_recorded: formData.date_recorded,
        semester: formData.semester,
        grade_type: formData.grade_type,
        notes: formData.notes,
        weight: formData.weight,
        is_extra_credit: formData.is_extra_credit,
      };

      if (editingGrade) {
        await gradeService.updateGrade(editingGrade.id, updatableFormData as GradeFormData, currentUser.id);
        toast({ title: "Grade Updated!", description: `${formData.assignment_name} has been updated.` });
      } else {
        await gradeService.createGrade(updatableFormData as GradeFormData, currentUser.id);
        toast({ title: "Grade Created!", description: `${formData.assignment_name} has been added.` });
      }

      setIsSheetOpen(false);
      setEditingGrade(null);
      resetForm();

      const userGrades = await gradeService.fetchUserGrades(currentUser.id);
      setGrades(userGrades);
      const stats = gradeService.calculateStats(userGrades);
      setGradeStats(stats);

      const achievementResult = achievementService.checkAchievements(userGrades);
      setAchievements(achievementResult.all);

      if (achievementResult.unlocked.length > 0) {
        achievementResult.unlocked.forEach(achievement => {
          toast({
            title: "Achievement Unlocked!",
            description: `${achievement.name}: ${achievement.description}`,
            icon: <Award className="text-yellow-400" />
          });
        });
      }

    } catch (error: any) {
      toast({ title: 'Error Saving Grade', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setFormData({
      ...grade,
      grade: Number(grade.grade),
      total_points: Number(grade.total_points),
      weight: grade.weight ? Number(grade.weight) : 1.0,
      date_recorded: new Date(grade.date_recorded).toISOString().split('T')[0],
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (gradeId: string, gradeName: string) => {
    setModalState({
      isOpen: true,
      title: `Delete Grade: ${gradeName}`,
      message: `Are you sure you want to permanently delete "${gradeName}"? This action cannot be undone.`,
      onConfirm: async () => {
        if (!currentUser) return;
        try {
          await gradeService.deleteGrade(gradeId, currentUser.id);
          toast({ title: "Grade Deleted", description: `${gradeName} has been removed.` });
          const userGrades = await gradeService.fetchUserGrades(currentUser.id);
          setGrades(userGrades);
          const stats = gradeService.calculateStats(userGrades);
          setGradeStats(stats);
        } catch (error: any) {
          toast({ title: 'Error Deleting Grade', description: error.message, variant: 'destructive' });
        } finally {
          setModalState({ ...modalState, isOpen: false });
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      assignment_name: '',
      grade: 0,
      total_points: 100,
      date_recorded: new Date().toISOString().split('T')[0],
      semester: '',
      grade_type: 'assignment',
      notes: '',
      weight: 1.0,
      is_extra_credit: false,
    });
  };

  const openCreateDialog = () => {
    setEditingGrade(null);
    resetForm();
    setIsSheetOpen(true);
  };

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Dynamic Loading Substrate */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 p-12 rounded-[3rem] bg-zinc-950/50 backdrop-blur-3xl border border-white/10 text-center shadow-2xl"
        >
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-t-indigo-500 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)]"
            />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Loading Grades</h2>
          <p className="text-zinc-500 font-medium tracking-tight uppercase text-[10px] mb-8">Loading Academic Performance Data...</p>

        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white max-w-md p-12 bg-zinc-950/50 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-8 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          <h2 className="text-3xl font-black tracking-tighter uppercase mb-4">Identity Unverified</h2>
          <p className="text-zinc-500 font-medium tracking-tight uppercase text-xs mb-8 leading-relaxed">Authentication is required to access the encrypted neural gradebook repository.</p>
          <Button asChild className="w-full h-14 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl font-black uppercase tracking-widest text-xs">
            <Link to="/auth">Initialize Link</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <ParallaxBackground />
      <ConfirmationModal {...modalState} onClose={() => setModalState({ ...modalState, isOpen: false })} />
      <div className="w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 z-10">
        <GradeHeader
          onBack={onBack}
          openCreateDialog={openCreateDialog}
          userName={currentUser.profile?.full_name || 'Student'}
        />

        {gradeStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-10 border-b border-white/5 bg-zinc-950/20 rounded-[3rem] mt-8"
          >
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Award, value: `${gradeStats.average_grade.toFixed(1)}%`, label: 'Performance GPA', gradient: 'from-blue-600 to-indigo-600', shadow: 'rgba(79,70,229,0.3)' },
                { icon: TrendingUp, value: `${gradeStats.highest_grade.toFixed(1)}%`, label: '% Grade', gradient: 'from-emerald-600 to-teal-600', shadow: 'rgba(16,185,129,0.3)' },
                { icon: CheckCircle, value: gradeStats.total_grades, label: 'Total Grades', gradient: 'from-purple-600 to-pink-600', shadow: 'rgba(168,85,247,0.3)' },
                { icon: BookOpen, value: gradeStats.subjects.length, label: 'total Subject', gradient: 'from-orange-600 to-rose-600', shadow: 'rgba(244,63,94,0.3)' },
              ].map((stat, index) => (
                <TiltCard key={stat.label} className="w-full h-full">
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0 } }}
                    transition={{ delay: 0.1 * index, type: 'spring', stiffness: 100 }}
                    className="relative bg-zinc-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/5 h-full group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between mb-6">
                        <div 
                          className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}
                          style={{ boxShadow: `0 10px 30px ${stat.shadow}` }}
                        >
                          <stat.icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-4xl font-black text-white tracking-tighter drop-shadow-2xl">{stat.value}</span>
                          <div className="h-1 w-12 bg-white/10 rounded-full mt-2" />
                        </div>
                      </div>
                      <h3 className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">{stat.label}</h3>
                    </div>
                  </motion.div>
                </TiltCard>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="lg:hidden mb-6">
              <Button 
                variant="outline" 
                onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
                className="w-full h-14 bg-zinc-950/20 border-white/5 text-zinc-400 hover:text-white rounded-2xl flex items-center justify-between px-8"
              >
                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4" />
                  <span className="font-black text-[10px] uppercase tracking-widest">Toggle Filters</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${isFilterCollapsed ? 'bg-zinc-800' : 'bg-indigo-500 animate-pulse'}`} />
              </Button>
            </div>
            <motion.div 
              initial={false}
              animate={{ 
                height: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'auto' : (isFilterCollapsed ? 0 : 'auto'),
                opacity: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 1 : (isFilterCollapsed ? 0 : 1),
                marginBottom: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : (isFilterCollapsed ? 0 : 24)
              }}
              className="sticky top-6 space-y-8 overflow-hidden lg:overflow-visible"
            >
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Card className="bg-zinc-950/40 backdrop-blur-3xl border-2 border-white/5 rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="bg-white/5 border-b border-white/5">
                    <CardTitle className="text-xs font-black text-white flex items-center gap-3 uppercase tracking-widest">
                      <Filter className="w-4 h-4 text-indigo-400" /> Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Search Grades</Label>
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors h-4 w-4" />
                        <Input placeholder="Search Grades..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-12 pl-12 bg-black/40 border-2 border-white/5 focus:border-indigo-500/50 rounded-2xl text-white transition-all" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Subject</Label>
                      <Select value={filterSubject} onValueChange={setFilterSubject}>
                        <SelectTrigger className="h-12 bg-black/40 border-2 border-white/5 text-white rounded-2xl focus:ring-indigo-500/30"><SelectValue placeholder="Subject" /></SelectTrigger>
                        <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl">
                          <SelectItem value="all">ALL</SelectItem>
                          {gradeStats?.subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Semester</Label>
                      <Select value={filterSemester} onValueChange={setFilterSemester}>
                        <SelectTrigger className="h-12 bg-black/40 border-2 border-white/5 text-white rounded-2xl focus:ring-indigo-500/30"><SelectValue placeholder="Cycle" /></SelectTrigger>
                        <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl">
                          <SelectItem value="all">All Semesters</SelectItem>
                          {gradeStats?.semesters.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <GradeInsights grades={grades} />
              </motion.div>
            </motion.div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6 bg-zinc-950/20 p-6 rounded-[2rem] border border-white/5 backdrop-blur-xl">
              <div className="flex items-center space-x-4">
                <div className="relative flex items-center justify-center">
                  <Checkbox
                    id="selectAllGrades"
                    className="h-6 w-6 bg-black/40 border-white/10 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-400 rounded-lg transition-all"
                    checked={selectedGrades.length === filteredGrades.length && filteredGrades.length > 0}
                    onCheckedChange={handleSelectAllGrades}
                  />
                </div>
                <label htmlFor="selectAllGrades" className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors">
                  Select Grades ({selectedGrades.length})
                </label>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={selectedGrades.length === 0}
                  className="h-12 px-6 bg-red-500/5 hover:bg-red-500/10 text-red-400 border-red-500/20 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCsv}
                  disabled={filteredGrades.length === 0}
                  className="h-12 px-6 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-30"
                >
                  <List className="w-4 h-4 mr-2" /> Export Grades
                </Button>
                <div className="h-12 bg-black/40 border-2 border-white/5 rounded-xl p-1 flex items-center gap-1">
                  <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="w-10 h-10 rounded-lg" onClick={() => setViewMode('grid')}><LayoutGrid className="w-4 h-4" /></Button>
                  <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" className="w-10 h-10 rounded-lg" onClick={() => setViewMode('table')}><List className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {viewMode === 'grid' && (
                <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredGrades.map((grade, index) => (
                    <GradeCard key={grade.id} grade={grade} index={index} onEdit={handleEdit} onDelete={handleDelete} isSelected={selectedGrades.includes(grade.id)} onSelect={handleSelectGrade} />
                  ))}
                </motion.div>
              )}
              {viewMode === 'table' && (
                <motion.div 
                  key="table" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="bg-zinc-950/20 rounded-[2.5rem] border border-white/5 overflow-hidden"
                >
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5">
                          <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                            <Checkbox 
                              checked={selectedGrades.length === filteredGrades.length && filteredGrades.length > 0} 
                              onCheckedChange={handleSelectAllGrades}
                              className="h-5 w-5 bg-black/40 border-white/10"
                            />
                          </th>
                          <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Assignment</th>
                          <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Subject</th>
                          <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Grade</th>
                          <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Date</th>
                          <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredGrades.map((grade) => {
                          const percentage = (grade.grade / grade.total_points) * 100;
                          const letterGrade = gradeService.getLetterGrade(percentage);
                          const gradeColor = gradeService.getGradeColor(percentage);
                          return (
                            <tr key={grade.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="p-6">
                                <Checkbox 
                                  checked={selectedGrades.includes(grade.id)} 
                                  onCheckedChange={() => handleSelectGrade(grade.id)}
                                  className="h-5 w-5 bg-black/40 border-white/10"
                                />
                              </td>
                              <td className="p-6">
                                <div className="font-bold text-white text-sm">{grade.assignment_name}</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{grade.grade_type}</div>
                              </td>
                              <td className="p-6">
                                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-white/5 text-zinc-400 border-white/5 px-3 py-1">
                                  {grade.subject}
                                </Badge>
                              </td>
                              <td className="p-6">
                                <div className="flex items-center gap-3">
                                  <div className={`text-lg font-black bg-clip-text text-transparent bg-gradient-to-r ${gradeColor}`}>
                                    {letterGrade}
                                  </div>
                                  <div className="text-xs text-zinc-500 font-medium">({percentage.toFixed(0)}%)</div>
                                </div>
                              </td>
                              <td className="p-6 text-sm text-zinc-500 font-medium">
                                {new Date(grade.date_recorded).toLocaleDateString()}
                              </td>
                              <td className="p-6">
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(grade)} className="h-8 w-8 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(grade.id, grade.assignment_name)} className="h-8 w-8 rounded-lg text-red-500/50 hover:text-red-400 hover:bg-red-500/10">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {filteredGrades.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <div className="bg-zinc-950/40 backdrop-blur-3xl rounded-[3rem] p-16 border-2 border-white/5 max-w-xl mx-auto shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_70%)]" />
                  <div className="relative z-10">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
                      <BookOpen className="h-10 w-10 text-zinc-500" />
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase mb-4">Repository Empty</h3>
                    <p className="text-zinc-500 font-medium tracking-tight uppercase text-xs mb-10 leading-relaxed">Your gradebook currently contains no records. Add your first Grade to begin performance tracking.</p>
                    <Button onClick={openCreateDialog} className="h-16 px-10 bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                      <Plus className="h-5 w-5 mr-3" /> Add Grade
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <Achievements achievements={achievements} />

        <AnimatePresence>
          {isSheetOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSheetOpen(false)} className="gold-sidebar-backdrop" />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                className="gold-sidebar"
              >
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 opacity-50" />

                <div className="flex items-center justify-between p-10 border-b border-white/5 bg-zinc-900/20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 text-white">
                      <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Palette className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h2 className="text-3xl font-black tracking-tighter uppercase">{editingGrade ? 'Update Grade' : 'Add Grade'}</h2>
                    </div>
                    <p className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] ml-1">Grade Performance</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all" onClick={() => setIsSheetOpen(false)}>
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar p-10">
                  <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Section 1: Identity */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="h-[1px] flex-grow bg-white/5" />
                        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] whitespace-nowrap">Grade Details</h3>
                        <div className="h-[1px] flex-grow bg-white/5" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label htmlFor="assignment_name" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Assignment Name</Label>
                          <Input id="assignment_name" value={formData.assignment_name} onChange={(e) => setFormData({ ...formData, assignment_name: e.target.value })} required className="h-14 bg-black/40 border-2 border-white/5 focus:border-indigo-500/50 rounded-2xl text-white transition-all text-base placeholder:text-zinc-700" placeholder="e.g. Final Synthesis" />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="subject" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Subject</Label>
                          <Input id="subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required className="h-14 bg-black/40 border-2 border-white/5 focus:border-indigo-500/50 rounded-2xl text-white transition-all text-base placeholder:text-zinc-700" placeholder="e.g. Theoretical Physics" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="notes" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Description</Label>
                        <Textarea id="notes" value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="min-h-[160px] bg-black/40 border-2 border-white/5 focus:border-indigo-500/50 rounded-[2rem] text-white transition-all text-base placeholder:text-zinc-700 p-6 leading-relaxed" placeholder="Detailed performance metrics and qualitative insights..." />
                      </div>
                    </div>

                    {/* Section 2: Metrics */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="h-[1px] flex-grow bg-white/5" />
                        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] whitespace-nowrap">Performance</h3>
                        <div className="h-[1px] flex-grow bg-white/5" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label htmlFor="grade" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Achieved Score</Label>
                          <div className="relative group">
                            <Input id="grade" type="number" value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })} required className="h-14 bg-black/40 border-2 border-white/5 focus:border-emerald-500/50 rounded-2xl text-white transition-all text-xl font-black tracking-tighter" />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 font-black text-[10px] uppercase">Points</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="total_points" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Maximum Score</Label>
                          <div className="relative group">
                            <Input id="total_points" type="number" value={formData.total_points} onChange={(e) => setFormData({ ...formData, total_points: Number(e.target.value) })} required className="h-14 bg-black/40 border-2 border-white/5 focus:border-indigo-500/50 rounded-2xl text-white transition-all text-xl font-black tracking-tighter" />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 font-black text-[10px] uppercase">Cap</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label htmlFor="date_recorded" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Date</Label>
                          <Input id="date_recorded" type="date" value={formData.date_recorded} onChange={(e) => setFormData({ ...formData, date_recorded: e.target.value })} className="h-14 bg-black/40 border-2 border-white/5 focus:border-indigo-500/50 rounded-2xl text-white transition-all text-sm font-black uppercase tracking-widest px-6" />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="grade_type" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Classification</Label>
                          <Select value={formData.grade_type} onValueChange={(v) => setFormData({ ...formData, grade_type: v })}>
                            <SelectTrigger className="h-14 bg-black/40 border-2 border-white/5 text-white rounded-2xl focus:ring-indigo-500/30 font-black text-[10px] uppercase tracking-widest px-6 transition-all">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900/90 backdrop-blur-3xl border-white/10 text-white rounded-2xl overflow-hidden shadow-2xl">
                              {gradeService.getGradeCategories().map(c => (
                                <SelectItem key={c.id} value={c.id} className="h-12 font-black text-[10px] uppercase tracking-widest focus:bg-white/10 cursor-pointer">
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-6 pt-10 border-t border-white/5 mt-10">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsSheetOpen(false)}
                        className="h-16 flex-grow bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                      >
                        Abort
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-16 flex-[2] bg-white text-black hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                        {isSubmitting ? (
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 relative z-10">
                            <TrendingUp className="w-4 h-4" />
                            <span>{editingGrade ? 'Update Grade' : 'Add Grade'}</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      {/* Removed Redundant Footer */}
    </div>
  );
};

export default Grades;