import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  SecureUser, 
  RealDashboardStats, 
  RealTask, 
  RealStudySession, 
  RealGrade, 
  RealNote, 
  RealCourse, 
  RealTimetableEntry, 
  RealAnalytics 
} from './types';
import { secureDataHelpers } from './secureDataHelpers';

export const useDashboardData = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [stats, setStats] = useState<RealDashboardStats>({
    totalTasks: 0, completedTasks: 0, pendingTasks: 0, inProgressTasks: 0, overdueTasks: 0,
    totalStudyTime: 0, todayStudyTime: 0, weeklyStudyTime: 0, monthlyStudyTime: 0,
    averageGrade: 0, totalGrades: 0, upcomingClasses: 0, totalNotes: 0, favoritedNotes: 0,
    totalCourses: 0, activeCourses: 0, completionRate: 0, studyStreak: 0, highPriorityTasks: 0,
    completedToday: 0, averageSessionLength: 0, bestPerformingSubject: 'None', worstPerformingSubject: 'None',
    totalStudySessions: 0, productivityScore: 0, incompleteTasksCount: 0, topGradePercentage: 0, totalClassesCount: 0
  });
  const [recentTasks, setRecentTasks] = useState<RealTask[]>([]);
  const [recentSessions, setRecentSessions] = useState<RealStudySession[]>([]);
  const [recentGrades, setRecentGrades] = useState<RealGrade[]>([]);
  const [recentNotes, setRecentNotes] = useState<RealNote[]>([]);
  const [courses, setCourses] = useState<RealCourse[]>([]);
  const [timetable, setTimetable] = useState<RealTimetableEntry[]>([]);
  const [analytics, setAnalytics] = useState<RealAnalytics>({
    dailyStudyTime: [], subjectBreakdown: [], weeklyProgress: [], monthlyTrends: [],
    gradeDistribution: [], sessionTypes: [], incompleteTasksCount: 0, topGrades: [], totalClasses: 0
  });
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [refreshing, setRefreshing] = useState(false);

  const { toast } = useToast();
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleSecureTaskUpdate = useCallback((data: any) => {
    const { eventType, new: newData, old: oldData } = data;
    setRecentTasks(prev => {
      let updated = [...prev];
      const index = updated.findIndex(task => task.id === (newData?.id || oldData?.id));
      const mappedNewData = newData ? {
        ...newData,
        priority: newData.priority || 'medium',
        status: newData.status || 'pending'
      } : null;

      switch (eventType) {
        case 'INSERT': if (mappedNewData && index === -1) updated.unshift(mappedNewData); break;
        case 'UPDATE': if (index !== -1 && mappedNewData) updated[index] = mappedNewData; break;
        case 'DELETE': if (index !== -1) updated.splice(index, 1); break;
      }
      return updated.slice(0, 20);
    });
  }, []);

  const handleSecureSessionUpdate = useCallback((data: any) => {
    const { eventType, new: newData } = data;
    if (eventType === 'INSERT' && newData) {
      const mapped = {
        ...newData,
        session_type: ['study', 'review', 'practice', 'exam'].includes(newData.session_type) ? newData.session_type : 'study'
      };
      setRecentSessions(prev => [mapped, ...prev].slice(0, 10));
    }
  }, []);

  const handleSecureGradeUpdate = useCallback((data: any) => {
    const { eventType, new: newData } = data;
    if (eventType === 'INSERT' && newData) {
      const mapped = {
        ...newData,
        percentage: newData.percentage || (newData.total_points ? (newData.grade / newData.total_points) * 100 : 0)
      };
      setRecentGrades(prev => [mapped, ...prev].slice(0, 10));
    }
  }, []);

  const handleSecureNoteUpdate = useCallback((data: any) => {
    const { eventType, new: newData } = data;
    if (eventType === 'INSERT' && newData) {
      const mapped = {
        ...newData,
        is_favorite: newData.is_favorite || false
      };
      setRecentNotes(prev => [mapped, ...prev].slice(0, 10));
    }
  }, []);

  const initializeDashboard = useCallback(async () => {
    if (authLoading) return;
    
    try {
      setLoading(true);
      if (!authUser) {
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      const secureUser: SecureUser = {
        id: authUser.id,
        email: authUser.email || '',
        profile: authUser.profile ? {
          full_name: authUser.profile.full_name || 'User',
          user_type: authUser.profile.user_type || 'student',
          student_id: authUser.profile.student_id
        } : undefined
      };

      setCurrentUser(secureUser);
      setSecurityVerified(true);
      
      const userData = await secureDataHelpers.fetchAllUserData(authUser.id);
      const analyticsData = await secureDataHelpers.calculateSecureAnalytics(authUser.id);
      const secureStats = secureDataHelpers.calculateSecureStats(userData);
      
      setStats(secureStats);
      setRecentTasks(Array.isArray(userData.tasks) ? (userData.tasks as any[]).map(t => ({
        ...t,
        priority: t.priority || 'medium',
        status: t.status || 'pending'
      })) : []);
      
      setRecentSessions(Array.isArray(userData.studySessions) ? (userData.studySessions as any[]).map(s => ({
        ...s,
        session_type: ['study', 'review', 'practice', 'exam'].includes(s.session_type) ? s.session_type : 'study'
      })) : []);
      
      setRecentGrades(Array.isArray(userData.grades) ? (userData.grades as any[]).map(g => ({
        ...g,
        percentage: g.percentage || (g.total_points ? (g.grade / g.total_points) * 100 : 0)
      })) : []);
      
      setRecentNotes(Array.isArray(userData.notes) ? (userData.notes as any[]).map(n => ({
        ...n,
        is_favorite: n.is_favorite || false
      })) : []);

      setCourses(Array.isArray(userData.courses) ? userData.courses : []);
      setTimetable(Array.isArray(userData.timetable) ? userData.timetable : []);
      setAnalytics(analyticsData);

      if (unsubscribeRef.current) unsubscribeRef.current();
      unsubscribeRef.current = secureDataHelpers.setupSecureRealTimeSubscription(authUser.id, {
        onTaskUpdate: handleSecureTaskUpdate,
        onSessionUpdate: handleSecureSessionUpdate,
        onGradeUpdate: handleSecureGradeUpdate,
        onNoteUpdate: handleSecureNoteUpdate
      });
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(initializeDashboard, 2000 * retryCountRef.current);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authUser, authLoading, handleSecureTaskUpdate, handleSecureSessionUpdate, handleSecureGradeUpdate, handleSecureNoteUpdate]);

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(true);
    const handleOfflineStatus = () => setIsOnline(false);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    initializeDashboard();
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, [initializeDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await initializeDashboard();
  };

  const handleCreateQuickTask = async () => {
    if (!currentUser) return;
    try {
      const newTask = await secureDataHelpers.createQuickTask(currentUser.id) as any;
      const mappedTask: RealTask = {
        ...newTask,
        priority: newTask.priority || 'medium',
        status: (['pending', 'in_progress', 'completed'].includes(newTask.status) ? newTask.status : 'pending') as any
      };
      setRecentTasks(prev => [mappedTask, ...prev]);
      toast({ title: "Task Created ✅", description: "New task added." });
    } catch (error) {
      toast({ title: "Creation Failed", variant: "destructive" });
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    if (!currentUser) return;
    setRecentTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: newStatus as any } : task));
    try {
      await secureDataHelpers.updateTaskStatus(taskId, newStatus, currentUser.id);
    } catch (error) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  return {
    currentUser, stats, recentTasks, setRecentTasks, recentSessions, recentGrades, recentNotes, courses, timetable, analytics,
    loading, securityVerified, isOnline, refreshing, handleRefresh, handleCreateQuickTask, handleTaskStatusUpdate,
  };
};
