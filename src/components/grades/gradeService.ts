import { supabase } from '@/integrations/supabase/client';
import { translateClerkIdToUUID } from '@/lib/id-translator';
import type { Grade, GradeStats, SecureUser, GradeFormData } from './types';

export const gradeService = {
  async getCurrentUser(): Promise<SecureUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      return {
        id: user.id,
        email: user.email || '',
        profile: profile ? {
          full_name: profile.full_name || 'User',
          user_type: profile.user_type || 'student',
          student_id: profile.student_id,
        } : undefined,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async fetchUserGrades(userId: string): Promise<Grade[]> {
    const translatedId = await translateClerkIdToUUID(userId);
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('user_id', translatedId)
        .order('date_recorded', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      console.error('Error fetching user grades from Supabase:', error);
      return [];
    }
  },

  calculateStats(grades: Grade[]): GradeStats {
    if (grades.length === 0) {
      return {
        total_grades: 0,
        average_grade: 0,
        highest_grade: 0,
        lowest_grade: 0,
        grade_distribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        subjects: [],
        semesters: [],
      };
    }

    const percentages = grades.map(g => (g.grade / g.total_points) * 100);
    const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    const highest = Math.max(...percentages);
    const lowest = Math.min(...percentages);

    const distribution = grades.reduce(
      (acc, grade) => {
        const percentage = (grade.grade / grade.total_points) * 100;
        if (percentage >= 90) acc.A++;
        else if (percentage >= 80) acc.B++;
        else if (percentage >= 70) acc.C++;
        else if (percentage >= 60) acc.D++;
        else acc.F++;
        return acc;
      },
      { A: 0, B: 0, C: 0, D: 0, F: 0 }
    );

    const subjects = [...new Set(grades.map(g => g.subject))];
    const semesters = [...new Set(grades.map(g => g.semester).filter(Boolean)) as string[]];

    return {
      total_grades: grades.length,
      average_grade: average,
      highest_grade: highest,
      lowest_grade: lowest,
      grade_distribution: distribution,
      subjects,
      semesters,
    };
  },

  async createGrade(gradeData: GradeFormData, userId: string): Promise<Grade> {
    const translatedId = await translateClerkIdToUUID(userId);
    try {
      const newGrade = {
        ...gradeData,
        id: crypto.randomUUID(),
        user_id: translatedId,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('grades')
        .insert(newGrade)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Grade;
    } catch (error) {
      console.error('Error creating grade in Supabase:', error);
      throw error;
    }
  },

  async updateGrade(gradeId: string, gradeData: Partial<GradeFormData>, userId: string): Promise<Grade> {
    const translatedId = await translateClerkIdToUUID(userId);
    try {
      const { data, error } = await supabase
        .from('grades')
        .update({ ...gradeData, updated_at: new Date().toISOString() })
        .match({ id: gradeId, user_id: translatedId })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Grade;
    } catch (error) {
      console.error('Error updating grade in Supabase:', error);
      throw error;
    }
  },

  async deleteGrade(gradeId: string, userId: string): Promise<boolean> {
    const translatedId = await translateClerkIdToUUID(userId);
    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .match({ id: gradeId, user_id: translatedId });

      if (error) throw new Error(error.message);
      return true;
    } catch (error) {
      console.error('Error deleting grade from Supabase:', error);
      throw error;
    }
  },

  async bulkDeleteGrades(gradeIds: string[], userId: string): Promise<boolean> {
    const translatedId = await translateClerkIdToUUID(userId);
    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .in('id', gradeIds)
        .eq('user_id', translatedId);

      if (error) throw new Error(error.message);
      return true;
    } catch (error) {
      console.error('Error bulk deleting grades from Supabase:', error);
      throw error;
    }
  },

  getGradeCategories() {
    return [
      { id: 'assignment', name: 'Assignment' },
      { id: 'quiz', name: 'Quiz' },
      { id: 'exam', name: 'Exam' },
      { id: 'project', name: 'Project' },
      { id: 'homework', name: 'Homework' },
      { id: 'midterm', name: 'Midterm' },
      { id: 'final', name: 'Final' },
    ];
  },
  
  getLetterGrade(percentage: number) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  },

  getGradeColor(percentage: number) {
    if (percentage >= 90) return 'from-green-500 to-emerald-500';
    if (percentage >= 80) return 'from-blue-500 to-cyan-500';
    if (percentage >= 70) return 'from-yellow-500 to-amber-500';
    if (percentage >= 60) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-rose-500';
  },

  exportGradesToCsv(grades: Grade[]): string {
    if (grades.length === 0) {
      return "";
    }

    const headers = [
      "ID", "Subject", "Assignment Name", "Grade", "Total Points",
      "Percentage", "Date Recorded", "Semester", "Grade Type",
      "Academic Year", "Weight", "Notes", "Extra Credit"
    ];

    const csvRows = [];
    csvRows.push(headers.join(","));

    grades.forEach(grade => {
      const percentage = ((grade.grade / grade.total_points) * 100).toFixed(2);
      const row = [
        `"${grade.id}"`, 
        `"${grade.subject}"`, 
        `"${grade.assignment_name}"`, 
        grade.grade,
        grade.total_points,
        percentage,
        `"${grade.date_recorded}"`, 
        `"${grade.semester || ''}"`, 
        `"${grade.grade_type}"`, 
        `"${grade.academic_year || ''}"`, 
        grade.weight || 1.0,
        `"${(grade.notes || '').replace(/"/g, '""')}"`, 
        grade.is_extra_credit ? 'Yes' : 'No'
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  },
};
