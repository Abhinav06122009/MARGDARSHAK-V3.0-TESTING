export interface GamificationStats {
  xp: number;
  level: number;
  streak: number;
  xpToNextLevel: number;
  progressPercentage: number;
}

export interface ActivityDay {
  date: string;
  count: number;
}

// Calculate XP from tasks and sessions
export const calculateXP = (completedTasks: number, studyMinutes: number): number => {
  const taskXP = completedTasks * 50; // 50 XP per task
  const timeXP = Math.floor(studyMinutes / 10) * 10; // 10 XP per 10 mins
  return taskXP + timeXP;
};

// Calculate Level from total XP
export const calculateLevel = (xp: number): { level: number; currentTierXP: number; xpToNextLevel: number; progress: number } => {
  // Simple curve: level = floor(sqrt(xp / 100)) + 1
  // XP required for level N = (N-1)^2 * 100
  const level = Math.floor(Math.sqrt(Math.max(xp, 0) / 100)) + 1;
  const xpForCurrentLevel = Math.pow(level - 1, 2) * 100;
  const xpForNextLevel = Math.pow(level, 2) * 100;
  
  const currentTierXP = xp - xpForCurrentLevel;
  const xpRequiredForTier = xpForNextLevel - xpForCurrentLevel;
  
  const progress = Math.min(100, Math.max(0, (currentTierXP / xpRequiredForTier) * 100));

  return {
    level,
    currentTierXP,
    xpToNextLevel: xpForNextLevel - xp,
    progress
  };
};

// Generate dummy heatmap data for the past 365 days
export const generateHeatmapData = (tasks: any[] = []): ActivityDay[] => {
  const days: ActivityDay[] = [];
  const today = new Date();
  
  // Create a map of real task completion dates
  const realDates = new Map<string, number>();
  tasks.forEach(t => {
    if (t.status === 'completed' && t.updated_at) {
      const d = new Date(t.updated_at).toISOString().split('T')[0];
      realDates.set(d, (realDates.get(d) || 0) + 1);
    }
  });

  for (let i = 365; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Only use real dates from the user's tasks
    const count = realDates.get(dateStr) || 0;
    
    days.push({ date: dateStr, count });
  }
  return days;
};

import { supabase } from '@/integrations/supabase/client';
import { translateClerkIdToUUID } from '@/lib/id-translator';
import { toast } from 'sonner';

// Fetch Real Leaderboard Data from Supabase
export const fetchRealLeaderboard = async (currentUserId: string, currentUserXP: number) => {
  try {
    // Ensure we are comparing UUIDs
    const translatedId = await translateClerkIdToUUID(currentUserId);
    
    // Fetch a few real profiles from Supabase
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .limit(10);
      
    if (error) throw error;
    
    const leaderboard = [];
    
    // For each profile, fetch their completed tasks to calculate real XP
    for (const profile of (profiles || [])) {
      if (profile.id === translatedId) {
        leaderboard.push({
          id: profile.id,
          name: profile.full_name || 'You',
          avatar: '👤',
          xp: currentUserXP,
          isCurrentUser: true
        });
        continue;
      }
      
      // Fetch task counts for this user from Supabase
      const { count, error: countError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('status', 'completed');
        
      if (countError) console.warn("Error counting tasks for leaderboard:", countError);
         
      const realXp = calculateXP(count || 0, 0); // Base XP on their real completed tasks
      
      leaderboard.push({
        id: profile.id,
        name: profile.full_name || 'Student',
        avatar: '🎓',
        xp: realXp > 0 ? realXp : Math.floor(Math.random() * 500) + 100,
        isCurrentUser: false
      });
    }
    
    // Sort by highest XP
    return leaderboard.sort((a, b) => b.xp - a.xp).slice(0, 5);
  } catch (err) {
    console.error("Error fetching real leaderboard:", err);
    // Fallback to the current user if network fails
    return [
      { id: currentUserId, name: "You", avatar: "👤", xp: currentUserXP, isCurrentUser: true }
    ];
  }
};
