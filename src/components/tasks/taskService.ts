import { Briefcase, Heart, GraduationCap, PiggyBank, Home, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { translateClerkIdToUUID } from '@/lib/id-translator';
import type { Task, TaskFormData, SecureUser, TaskStats, TaskTemplate, TaskTemplateFormData } from './types';

export const taskService = {
  async getCurrentUser(): Promise<SecureUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: user.email || '',
      profile: profile || undefined,
    };
  },

  async fetchUserTasks(userId: string): Promise<Task[]> {
    const translatedId = await translateClerkIdToUUID(userId);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', translatedId)
      .eq('is_deleted', false);

    if (error) throw new Error(error.message);
    return data || [];
  },

  async getTaskStatistics(userId: string): Promise<TaskStats> {
    const tasks = await this.fetchUserTasks(userId);
    return {
      total_tasks: tasks.length,
      pending_tasks: tasks.filter(t => t.status === 'pending').length,
      in_progress_tasks: tasks.filter(t => t.status === 'in_progress').length,
      completed_tasks: tasks.filter(t => t.status === 'completed').length,
      review_tasks: tasks.filter(t => t.status === 'review').length,
    };
  },

  async createTask(taskData: TaskFormData, userId: string): Promise<Task> {
    const translatedId = await translateClerkIdToUUID(userId);
    
    // Ensure profile exists before creating task (fixes 23503 foreign key violation)
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      await supabase.from('profiles').upsert({
        id: translatedId,
        clerk_id: (authData.user as any).clerk_id || (authData.user as any).id,
        email: authData.user.email || '',
        full_name: (authData.user as any).user_metadata?.full_name || 'Scholar',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    }

    const newTask = {
      ...taskData,
      id: crypto.randomUUID(),
      user_id: translatedId,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(newTask)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Task;
  },

  async updateTask(taskId: string, taskData: Partial<TaskFormData>, userId: string): Promise<Task> {
    const translatedId = await translateClerkIdToUUID(userId);
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...taskData, updated_at: new Date().toISOString() })
      .match({ id: taskId, user_id: translatedId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Task;
  },

  async deleteTask(taskId: string, userId: string): Promise<void> {
    const translatedId = await translateClerkIdToUUID(userId);
    const { error } = await supabase
      .from('tasks')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .match({ id: taskId, user_id: translatedId });

    if (error) throw new Error(error.message);
  },
  
  async toggleFavoriteStatus(taskId: string, currentStatus: boolean, userId: string): Promise<Task> {
    const translatedId = await translateClerkIdToUUID(userId);
    const { data, error } = await supabase
      .from('tasks')
      .update({ is_favorited: !currentStatus })
      .match({ id: taskId, user_id: translatedId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Task;
  },

  async bulkUpdateTasks(taskIds: string[], updates: Partial<TaskFormData>, userId: string): Promise<Task[]> {
    const translatedId = await translateClerkIdToUUID(userId);
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .in('id', taskIds)
      .eq('user_id', translatedId)
      .select();

    if (error) throw new Error(error.message);
    return data || [];
  },

  async bulkDeleteTasks(taskIds: string[], userId: string): Promise<void> {
    const translatedId = await translateClerkIdToUUID(userId);
    const { error } = await supabase
      .from('tasks')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .in('id', taskIds)
      .eq('user_id', translatedId);

    if (error) throw new Error(error.message);
  },

  async fetchTaskTemplates(): Promise<TaskTemplate[]> {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*');

    if (error) throw new Error(error.message);
    return data || [];
  },

  async createTaskTemplate(templateData: TaskTemplateFormData, userId: string): Promise<TaskTemplate> {
    const newTemplate = {
      ...templateData,
      id: crypto.randomUUID(),
      user_id: userId,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('task_templates')
      .insert(newTemplate)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as TaskTemplate;
  },

  getTaskCategories: () => {
    return [
      { id: 'personal', name: 'Personal', color: '#3B82F6', icon: Home },
      { id: 'work', name: 'Work', color: '#10B981', icon: Briefcase },
      { id: 'study', name: 'Study', color: '#8B5CF6', icon: GraduationCap },
      { id: 'health', name: 'Health', color: '#F59E0B', icon: Heart },
      { id: 'finance', name: 'Finance', color: '#EF4444', icon: PiggyBank },
      { id: 'general', name: 'General', color: '#6B7280', icon: Settings },
    ];
  },

  getCategoryIcon: (category: string) => {
    const categories = taskService.getTaskCategories();
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : Settings;
  },

  getPriorityColor: (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    switch (priority) {
      case 'urgent': return '#F87171';
      case 'high': return '#FBBF24';
      case 'medium': return '#60A5FA';
      case 'low': return '#4ADE80';
      default: return '#9CA3AF';
    }
  },

  getCategoryColor: (category: string, categories: any[]) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : '#6B7280';
  }
};