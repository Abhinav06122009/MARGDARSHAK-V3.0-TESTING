import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { dashboardService } from '@/lib/dashboardService';
import { handleDeleteTask as deleteUtil, handleBulkDeleteTasks as bulkDeleteUtil } from '@/lib/dashboardUtils';
import type {
  SecureUser,
  RealDashboardStats,
  RealTask,
  RealStudySession,
  RealGrade,
  RealNote,
  RealCourse,
  RealTimetableEntry,
  RealAnalytics,
} from '@/lib/dashboard';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
      
      switch (eventType) {
        case 'INSERT':
          if (newData && index === -1) updated.unshift(newData);
          break;
        case 'UPDATE':
          if (index !== -1 && newData) {
            if (newData.is_deleted) updated.splice(index, 1);
            else updated[index] = newData;
          }
          break;
        case 'DELETE':
          if (index !== -1) updated.splice(index, 1);
          break;
      }
      return updated.slice(0, 20);
    });
  }, []);

  const handleSecureSessionUpdate = useCallback((data: any) => {
    const { eventType, new: newData } = data;
    if (eventType === 'INSERT' && newData) {
      setRecentSessions(prev => [newData, ...prev].slice(0, 10));
    }
  }, []);

  const handleSecureGradeUpdate = useCallback((data: any) => {
    const { eventType, new: newData } = data;
    if (eventType === 'INSERT' && newData) {
      setRecentGrades(prev => [newData, ...prev].slice(0, 10));
    }
  }, []);

  const handleSecureNoteUpdate = useCallback((data: any) => {
    const { eventType, new: newData } = data;
    if (eventType === 'INSERT' && newData) {
      setRecentNotes(prev => [newData, ...prev].slice(0, 10));
    }
  }, []);

  const initializeDashboard = useCallback(async () => {
    // Prevent multiple simultaneous initializations or initializing while auth is loading
    if (retryCountRef.current > 0 || authLoading) return;
    
    try {
      setLoading(true);
      
      if (!authUser) {
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      // If we already have this user and we're not refreshing, skip expensive fetch
      if (currentUser?.clerk_id === authUser.id && !refreshing) {
        setLoading(false);
        return;
      }

      // We still use dashboardService.getCurrentUser() to get the translated UUID and full profile
      // but we could also just use fetchAllUserData directly if we had the UUID.
      const user = await dashboardService.getCurrentUser();
      if (!user) {
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      setSecurityVerified(true);
      
      // Consolidated data fetching
      const userData = await dashboardService.fetchAllUserData(user.id, refreshing);
      const analyticsData = dashboardService.calculateSecureAnalytics(userData);
      const secureStats = dashboardService.calculateSecureStats(userData);
      
      if (userData.profile) {
        setCurrentUser(prev => prev ? {
          ...prev,
          profile: { ...prev.profile, ...userData.profile }
        } : prev);
      }

      setStats(secureStats);
      setRecentTasks(Array.isArray(userData.tasks) ? userData.tasks.slice(0, 20) : []);
      setRecentSessions(Array.isArray(userData.studySessions) ? userData.studySessions.slice(0, 10) : []);
      setRecentGrades(Array.isArray(userData.grades) ? userData.grades.slice(0, 10) : []);
      setRecentNotes(Array.isArray(userData.notes) ? userData.notes.slice(0, 10) : []);
      setCourses(Array.isArray(userData.courses) ? userData.courses : []);
      setTimetable(Array.isArray(userData.timetable) ? userData.timetable : []);
      setAnalytics(analyticsData);

      // Clean up previous subscription before setting up new one
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      
      const unsubscribeFn = await dashboardService.setupSecureRealTimeSubscription(
        user.id,
        (payload: any) => {
          // Dispatch to appropriate handler based on table
          const table = payload.table;
          if (table === 'tasks') handleSecureTaskUpdate(payload);
          else if (table === 'study_sessions') handleSecureSessionUpdate(payload);
          else if (table === 'grades') handleSecureGradeUpdate(payload);
          else if (table === 'notes') handleSecureNoteUpdate(payload);
        }
      );
      unsubscribeRef.current = unsubscribeFn;
      
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      retryCountRef.current++;
      if (retryCountRef.current < maxRetries) {
        setTimeout(initializeDashboard, 2000);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      retryCountRef.current = 0;
    }
  }, [authUser, authLoading, currentUser?.clerk_id, refreshing, handleSecureTaskUpdate, handleSecureSessionUpdate, handleSecureGradeUpdate, handleSecureNoteUpdate]);

  useEffect(() => {
    let isMounted = true;
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    const handleOfflineStatus = () => setIsOnline(false);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    
    if (isMounted && !authLoading) {
      initializeDashboard();
    }

    return () => {
      isMounted = false;
      if (unsubscribeRef.current) unsubscribeRef.current();
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, [initializeDashboard, authLoading]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await initializeDashboard();
  }, [initializeDashboard]);

  const handleCreateQuickTask = useCallback(async () => {
    if (!currentUser) return;
    try {
      const newTask = await dashboardService.createQuickTask(currentUser.id) as RealTask;
      setRecentTasks(prev => [newTask, ...prev]);
      toast({ title: "Task Created ✅", description: "New task added." });
    } catch (error) {
      toast({ title: "Creation Failed", variant: "destructive" });
    }
  }, [currentUser, toast]);

  const handleTaskStatusUpdate = useCallback(async (taskId: string, newStatus: string) => {
    if (!currentUser) return;
    setRecentTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
    try {
      await dashboardService.updateTaskStatus(taskId, newStatus, currentUser.id);
    } catch (error) {
      console.error(error);
    }
  }, [currentUser]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    setRecentTasks(prev => prev.filter(t => t.id !== taskId));
    
    const success = await deleteUtil(taskId);
    if (success) {
      toast({
        title: "Task Deleted",
        description: "Task removed from your dashboard.",
        className: "bg-red-500/10 text-red-400 border-red-500/20"
      });
    } else {
      toast({ title: "Error", description: "Could not delete task", variant: "destructive" });
    }
  }, [toast]);

  const deleteTasks = useCallback(async (taskIds: string[]) => {
    setRecentTasks(prev => prev.filter(t => !taskIds.includes(t.id)));
    await bulkDeleteUtil(taskIds);
  }, []);

  const value = useMemo(() => ({
    currentUser,
    stats,
    recentTasks,
    setRecentTasks,
    recentSessions,
    recentGrades,
    recentNotes,
    courses,
    timetable,
    analytics,
    loading,
    securityVerified,
    isOnline,
    refreshing,
    handleRefresh,
    handleCreateQuickTask,
    handleTaskStatusUpdate,
    handleDeleteTask,
    handleBulkDelete: deleteTasks,
    ultimateSecurityData: null,
    activeThreats: [] 
  }), [
    currentUser, stats, recentTasks, recentSessions, recentGrades, 
    recentNotes, courses, timetable, analytics, loading, 
    securityVerified, isOnline, refreshing, handleRefresh, 
    handleCreateQuickTask, handleTaskStatusUpdate, handleDeleteTask, deleteTasks
  ]);

  return value;
};