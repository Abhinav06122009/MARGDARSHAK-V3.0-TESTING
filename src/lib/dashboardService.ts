import { supabase, supabaseHelpers } from '@/integrations/supabase/client';
import { translateClerkIdToUUID } from '@/lib/id-translator';
import { toast } from 'sonner';
import type {
  SecureUser,
  RealTask,
  RealStudySession,
  RealGrade,
  RealNote,
  RealCourse,
  RealTimetableEntry,
  RealDashboardStats,
  RealAnalytics,
  RealCalendarEvent,
} from '@/lib/dashboard';

export const dashboardService = {
  getCurrentUser: async (): Promise<SecureUser | null> => {
    try {
      const clerkUser = await supabaseHelpers.getCurrentUser();
      if (!clerkUser?.id) return null;

      // Translate ID for Supabase UUID lookup
      const translatedId = await translateClerkIdToUUID(clerkUser.id);

      // Fetch the actual profile from Supabase using translated ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', translatedId)
        .maybeSingle();

      if (profileError) {
        console.error('dashboardService: Error fetching profile:', profileError);
      }

      // --- UNIVERSAL TIER DETECTION (CLERK-FIRST) ---
      // The clerkUser object here is already formatted by supabaseHelpers.getCurrentUser()
      const userTier = clerkUser.profile?.subscription_tier || clerkUser.user_metadata?.subscription_tier || 'free';
      const userRole = clerkUser.profile?.role || clerkUser.user_metadata?.role || 'student';
      const subscription = clerkUser.subscription || {};

      console.log(`[dashboardService] Verified Tier: ${userTier} for ${clerkUser.id}`);

      const fullName = clerkUser.user_metadata?.full_name || clerkUser.fullName || profile?.full_name || 'Scholar';

      return {
        id: clerkUser.id,
        email: clerkUser.email || '',
        user_metadata: {
          ...clerkUser.user_metadata,
          full_name: fullName,
          subscription_tier: userTier
        },
        profile: {
          ...profile,
          id: clerkUser.id,
          full_name: fullName,
          user_type: userRole,
          role: userRole,
          subscription_tier: userTier,
          subscription_status: subscription.status || profile?.subscription_status || 'inactive'
        }
      } as SecureUser;
    } catch (error) {
      console.error('dashboardService: Critical error getting current user:', error);
      return null;
    }
  },

  fetchAllUserData: async (userId: string) => {
    const translatedId = await translateClerkIdToUUID(userId);
    console.log('Fetching all Supabase data for user:', translatedId, '(Clerk:', userId, ')');
    
    try {
      const [
        tasksResult,
        studySessionsResult,
        gradesResult,
        notesResult,
        coursesResult,
        timetableResult,
        calendarEventsResult,
        profileResult
      ] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', translatedId),
        supabase.from('study_sessions').select('*').eq('user_id', translatedId),
        supabase.from('grades').select('*').eq('user_id', translatedId),
        supabase.from('notes').select('*').eq('user_id', translatedId),
        supabase.from('courses').select('*').eq('user_id', translatedId),
        supabase.from('timetable_events').select('*').eq('user_id', translatedId),
        supabase.from('user_calendar_events').select('*').eq('user_id', translatedId),
        supabase.from('profiles').select('*').eq('id', translatedId).maybeSingle()
      ]);

      return {
        tasks: tasksResult.data || [],
        studySessions: studySessionsResult.data || [],
        grades: gradesResult.data || [],
        notes: notesResult.data || [],
        courses: coursesResult.data || [],
        timetable: timetableResult.data || [],
        calendarEvents: calendarEventsResult.data || [],
        profile: profileResult.data || null,
        errors: [
          tasksResult.error,
          studySessionsResult.error,
          gradesResult.error,
          notesResult.error,
          coursesResult.error,
          timetableResult.error,
          calendarEventsResult.error,
          profileResult.error
        ].filter(Boolean)
      };
    } catch (error) {
      console.error('Error fetching user data from Supabase:', error);
      return {
        tasks: [],
        studySessions: [],
        grades: [],
        notes: [],
        courses: [],
        timetable: [],
        calendarEvents: [],
        profile: null,
        errors: [error]
      };
    }
  },

  updateTaskStatus: async (taskId: string, status: string, userId: string) => {
    const translatedId = await translateClerkIdToUUID(userId);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .match({ id: taskId, user_id: translatedId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task status in Supabase:', error);
      throw error;
    }
  },

  updateTask: async (taskId: string, taskData: Partial<RealTask>, userId: string) => {
    const translatedId = await translateClerkIdToUUID(userId);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...taskData, updated_at: new Date().toISOString() })
        .match({ id: taskId, user_id: translatedId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task in Supabase:', error);
      throw error;
    }
  },

  deleteTask: async (taskId: string, userId: string) => {
    const translatedId = await translateClerkIdToUUID(userId);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .match({ id: taskId, user_id: translatedId });
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting task from Supabase:', error);
      throw error;
    }
  },

  createQuickTask: async (userId: string) => {
    const translatedId = await translateClerkIdToUUID(userId);
    try {
      const newTask = {
        id: crypto.randomUUID(),
        title: 'New Task',
        description: 'Add description here',
        status: 'pending',
        priority: 'medium',
        user_id: translatedId,
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating quick task in Supabase:', error);
      throw error;
    }
  },

  createTask: async (taskData: Partial<RealTask>, userId: string) => {
    const translatedId = await translateClerkIdToUUID(userId);
    try {
      const newTask = {
        ...taskData,
        id: crypto.randomUUID(),
        user_id: translatedId,
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating task in Supabase:', error);
      throw error;
    }
  },


  // --- CALENDAR EVENTS CRUD ---
  createCalendarEvent: async (eventData: Partial<RealCalendarEvent>, userId: string) => {
    const translatedId = await translateClerkIdToUUID(userId);
    try {
      const newEvent = {
        ...eventData,
        id: crypto.randomUUID(),
        user_id: translatedId,
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from('user_calendar_events')
        .insert(newEvent)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating calendar event in Supabase:', error);
      throw error;
    }
  },

  updateCalendarEvent: async (eventId: string, eventData: Partial<RealCalendarEvent>, userId: string) => {
    const translatedId = await translateClerkIdToUUID(userId);
    try {
      const { data, error } = await supabase
        .from('user_calendar_events')
        .update({ ...eventData, updated_at: new Date().toISOString() })
        .match({ id: eventId, user_id: translatedId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating calendar event in Supabase:', error);
      throw error;
    }
  },

  deleteCalendarEvent: async (eventId: string, userId: string) => {
    const translatedId = await translateClerkIdToUUID(userId);
    try {
      const { error } = await supabase
        .from('user_calendar_events')
        .delete()
        .match({ id: eventId, user_id: translatedId });
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting calendar event from Supabase:', error);
      throw error;
    }
  },


  calculateSecureStats: (data: any): RealDashboardStats => {
    const { tasks, studySessions, grades, notes, courses, timetable } = data;
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Task statistics
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter((t: any) => t.status === 'completed').length || 0;
    const pendingTasks = tasks?.filter((t: any) => t.status === 'pending').length || 0;
    const inProgressTasks = tasks?.filter((t: any) => t.status === 'in_progress').length || 0;
    const overdueTasks = tasks?.filter((t: any) => 
      t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
    ).length || 0;
    const highPriorityTasks = tasks?.filter((t: any) => 
      t.priority === 'high' && t.status !== 'completed'
    ).length || 0;
    const completedToday = tasks?.filter((t: any) => 
      t.status === 'completed' && 
      t.updated_at && 
      new Date(t.updated_at).toISOString().split('T')[0] === today
    ).length || 0;

    // Study time
    const totalStudyTime = studySessions?.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) || 0;
    const todayStudyTime = studySessions
        ?.filter((s: any) => s.start_time && s.start_time.split('T')[0] === today)
        .reduce((sum: number, s: any) => sum + (s.duration || 0), 0) || 0;

    // Study streak
    let studyStreak = 0;
    if (studySessions) {
      const studyDates = new Set(studySessions.map((s: any) => s.start_time?.split('T')[0]));
      let currentDate = new Date(now);
      for (let i = 0; i < 365; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (studyDates.has(dateStr)) {
          studyStreak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (dateStr === today) {
          currentDate.setDate(currentDate.getDate() - 1);
        } else break;
      }
    }

    const totalGrades = grades?.length || 0;
    const averageGrade = totalGrades > 0 
      ? grades.reduce((sum: number, g: any) => sum + (g.percentage || 0), 0) / totalGrades 
      : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      totalStudyTime,
      todayStudyTime,
      weeklyStudyTime: 0,
      monthlyStudyTime: 0,
      averageGrade: Math.round(averageGrade * 10) / 10,
      totalGrades,
      upcomingClasses: 0,
      totalNotes: notes?.length || 0,
      favoritedNotes: notes?.filter((n: any) => n.is_favorite).length || 0,
      totalCourses: courses?.length || 0,
      activeCourses: courses?.filter((c: any) => c.is_active).length || 0,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      studyStreak,
      highPriorityTasks,
      completedToday,
      averageSessionLength: totalStudyTime > 0 ? Math.round(totalStudyTime / (studySessions?.length || 1)) : 0,
      bestPerformingSubject: 'N/A',
      worstPerformingSubject: 'N/A',
      totalStudySessions: studySessions?.length || 0,
      productivityScore: 0,
      incompleteTasksCount: totalTasks - completedTasks,
      topGradePercentage: 0,
      totalClassesCount: timetable?.length || 0
    };
  },

  calculateSecureAnalytics: async (userId: string): Promise<RealAnalytics> => {
    const translatedId = await translateClerkIdToUUID(userId);
    const { data: sessions } = await supabase.from('study_sessions').select('*').eq('user_id', translatedId);
    const { data: grades } = await supabase.from('grades').select('*').eq('user_id', translatedId);

    return {
      dailyStudyTime: [],
      subjectBreakdown: [],
      weeklyProgress: [],
      monthlyTrends: [],
      gradeDistribution: [],
      sessionTypes: [],
      incompleteTasksCount: 0,
      topGrades: [],
      totalClasses: 0
    };
  },

  setupSecureRealTimeSubscription: async (userId: string, callback: (payload: any) => void) => {
    const translatedId = await translateClerkIdToUUID(userId);
    const subscription = supabase
      .channel(`public:tasks:user_id=eq.${translatedId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${translatedId}` }, callback)
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  },

  exportToCSV: (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).filter(key => 
      typeof data[0][key] !== 'object' || data[0][key] === null
    );
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + data.map(row => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(",")
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportToJSON: (data: any, filename: string) => {
    const jsonContent = "data:text/json;charset=utf-8," + JSON.stringify(data, null, 2);
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(jsonContent));
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};