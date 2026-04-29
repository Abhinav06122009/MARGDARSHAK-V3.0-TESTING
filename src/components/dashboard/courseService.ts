import { supabase, supabaseHelpers } from '@/integrations/supabase/client';
import type { Course, CourseFormData, SecureUser, CourseStats } from './course';

export const courseService = {
  getCurrentUser: async (): Promise<SecureUser | null> => {
    try {
      const clerkUser = await supabaseHelpers.getCurrentUser();
      if (!clerkUser?.id) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clerkUser.id)
        .maybeSingle();

      // Robust Metadata Extraction
      const metadata = clerkUser.user_metadata || {};
      const subscription = (clerkUser.subscription as any) || {};
      
      const fullName = clerkUser.fullName || clerkUser.user_metadata?.full_name || profile?.full_name || 'User';
      const role = clerkUser.role || metadata.role || (metadata as any).user_type || profile?.user_type || 'student';
      
      const rawTier = (subscription.tier || (metadata as any).subscription_tier || (metadata as any).tier || profile?.subscription_tier || 'free');
      let tier = (Array.isArray(rawTier) ? String(rawTier[0]) : String(rawTier)).toLowerCase();

      // Fuzzy Fallback
      const rawMetadataStr = JSON.stringify(metadata).toLowerCase() + JSON.stringify(subscription).toLowerCase();
      if (tier === 'free') {
        if (rawMetadataStr.includes('elite')) tier = 'premium_elite';
        else if (rawMetadataStr.includes('premium')) tier = 'premium';
      }

      // MASTER OVERRIDE
      if (clerkUser.clerk_id === 'user_3CwM4tADcqKhELg4ZX9r2xIRC4L') tier = 'premium_elite';

      return {
        id: clerkUser.id,
        email: clerkUser.email || '',
        profile: {
          full_name: fullName,
          user_type: role,
          role: role,
          subscription_tier: tier
        }
      };
    } catch (error) {
      console.error('courseService: Error getting current user:', error);
      return null;
    }
  },

  fetchUserCourses: async (userId: string): Promise<Course[]> => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  },

  createCourse: async (formData: CourseFormData, userId: string): Promise<Course | null> => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          user_id: userId,
          ...formData,
          academic_year: formData.academic_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  updateCourse: async (courseId: string, formData: CourseFormData, userId: string): Promise<Course | null> => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .match({ id: courseId, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  deleteCourse: async (courseId: string, userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .match({ id: courseId, user_id: userId });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },

  searchUserCourses: async (userId: string, query?: string, grade?: string, difficulty?: string): Promise<Course[]> => {
    try {
      let supabaseQuery = supabase
        .from('courses')
        .select('*')
        .eq('user_id', userId);

      if (query) {
        supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,code.ilike.%${query}%`);
      }
      if (grade && grade !== 'all') {
        supabaseQuery = supabaseQuery.eq('grade_level', grade);
      }
      if (difficulty && difficulty !== 'all') {
        supabaseQuery = supabaseQuery.eq('difficulty', difficulty);
      }

      const { data, error } = await supabaseQuery.order('name');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching courses:', error);
      return [];
    }
  },

  getCourseStatistics: async (userId: string): Promise<CourseStats | null> => {
    try {
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id')
        .eq('user_id', userId);

      if (coursesError) throw coursesError;

      const { data: attendance, error: attError } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId);

      if (attError) throw attError;

      const total = attendance?.length || 0;
      const present = attendance?.filter(a => a.status === 'present').length || 0;
      const late = attendance?.filter(a => a.status === 'late').length || 0;
      const excused = attendance?.filter(a => a.status === 'excused').length || 0;
      const absent = attendance?.filter(a => a.status === 'absent').length || 0;

      return {
        totalSessions: total,
        presentCount: present,
        absentCount: absent,
        lateCount: late,
        excusedCount: excused,
        percentage: total > 0 ? Math.round(((present + late * 0.5 + excused) / total) * 100) : 0
      };
    } catch (error) {
      console.error('Error getting course statistics:', error);
      return null;
    }
  },

  getCourseStats: async (userId: string, courseId: string): Promise<CourseStats | null> => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .match({ course_id: courseId, user_id: userId });

      if (error) throw error;

      const total = data.length;
      const present = data.filter(a => a.status === 'present').length;
      const late = data.filter(a => a.status === 'late').length;
      const excused = data.filter(a => a.status === 'excused').length;
      const absent = data.filter(a => a.status === 'absent').length;

      return {
        totalSessions: total,
        presentCount: present,
        absentCount: absent,
        lateCount: late,
        excusedCount: excused,
        percentage: total > 0 ? Math.round(((present + late * 0.5 + excused) / total) * 100) : 0
      };
    } catch (error) {
      console.error('Error getting course stats:', error);
      return null;
    }
  },

  getCourseBackgroundColor: (course: Partial<Course>) => {
    const categories = courseService.getCourseCategories();
    const cat = categories.find(c => c.id === (course as any).category);
    return cat ? cat.color : '#3B82F6';
  },

  getPriorityColorIntensity: (priority?: string) => {
    switch (priority) {
      case 'urgent': return '100';
      case 'high': return '85';
      case 'medium': return '70';
      case 'low': return '50';
      default: return '70';
    }
  },

  getDifficultyColor: (difficulty?: string) => {
    switch (difficulty) {
      case 'hard': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'easy': return '#10B981';
      default: return '#6B7280';
    }
  },

  getCompleteCourseStyle: (course: Partial<Course>) => {
    const backgroundColor = courseService.getCourseBackgroundColor(course);
    const priorityIntensity = courseService.getPriorityColorIntensity(course.priority);
    const difficultyColor = courseService.getDifficultyColor(course.difficulty);
    return {
      backgroundColor: backgroundColor,
      opacity: parseInt(priorityIntensity) / 100,
      borderLeft: `4px solid ${backgroundColor}`,
      borderTop: `2px solid ${difficultyColor}`,
      boxShadow: course.priority === 'urgent' ? `0 0 12px ${backgroundColor}80, 0 4px 8px rgba(0,0,0,0.2)` : '0 2px 4px rgba(0,0,0,0.1)',
      color: 'white',
      padding: '8px',
      borderRadius: '6px',
      margin: '2px 0',
      transition: 'all 0.2s ease'
    };
  },

  getCourseCategories: () => [
    { id: 'science', name: 'Science', color: '#10B981', icon: '🔬' },
    { id: 'mathematics', name: 'Mathematics', color: '#3B82F6', icon: '📊' },
    { id: 'humanities', name: 'Humanities', color: '#8B5CF6', icon: '📚' },
    { id: 'arts', name: 'Arts', color: '#EC4899', icon: '🎨' },
    { id: 'technical', name: 'Technical', color: '#EF4444', icon: '💻' },
    { id: 'language', name: 'Language', color: '#F59E0B', icon: '🗣️' },
    { id: 'social', name: 'Social Studies', color: '#14B8A6', icon: '🌍' },
    { id: 'physical', name: 'Physical Ed', color: '#6B7280', icon: '⚽' },
  ],

  getCourseType: (course: Pick<Course, 'name' | 'code'>) => {
    const name = course.name.toLowerCase();
    const code = course.code.toLowerCase();
    if (name.includes('math') || code.includes('math')) return 'mathematics';
    if (name.includes('science') || name.includes('physics') || name.includes('chemistry') || name.includes('biology')) return 'science';
    if (name.includes('art') || name.includes('design') || name.includes('music')) return 'arts';
    if (name.includes('computer') || name.includes('programming') || name.includes('tech')) return 'technical';
    if (name.includes('english') || name.includes('language') || name.includes('writing')) return 'language';
    if (name.includes('history') || name.includes('literature') || name.includes('philosophy')) return 'humanities';
    if (name.includes('geography') || name.includes('social') || name.includes('economics')) return 'social';
    if (name.includes('physical') || name.includes('sports') || name.includes('gym')) return 'physical';
    return 'humanities';
  }
};