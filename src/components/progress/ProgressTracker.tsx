import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Download, Upload, Filter, Search, Star, TrendingUp, Trophy, Target, AlertCircle, Eye, Shield, BookOpen, Calculator, Calendar, Clock, Award, BarChart3, PieChart, LineChart, Activity, PlayCircle, PauseCircle, CheckCircle, Circle, Flag, Zap, Sparkles, Timer, RefreshCw, BrainCircuit, Lightbulb, Repeat, LayoutGrid, List, Flame, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from "@/components/logo/logo.png";
import ParallaxBackground from '@/components/ui/ParallaxBackground';
import ProgressCard from './ProgressCard';
import GoalFocusView from './GoalFocusView';
import CompletionCelebration from './CompletionCelebration';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { streakService, StreakInfo } from './streakService';
import { smartCoachService, GoalRecommendation, GoalAdjustment, MotivationalTip } from './smartCoachService';

interface ProgressTrackerProps {
  onBack: () => void;
}

interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  target_date: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
  updated_at?: string;
  study_streak?: number;
  streak_insurance?: number;
}

interface ProgressEntry {
  id: string;
  goal_id: string;
  user_id: string;
  value: number;
  notes?: string;
  date_recorded: string;
  created_at?: string;
}

interface ProgressStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  overallProgress: number;
  weeklyProgress: number;
  monthlyProgress: number;
  averageCompletion: number;
  streakDays: number;
  highestStreak?: number;
}

interface SecureUser {
  id: string;
  email: string;
  profile?: {
    full_name: string;
    role: string;
    student_id?: string;
  };
}

export type { Goal, ProgressStats };

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

const customStyles = `
  .bg-black
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
  }

  .glass-morphism {
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(25px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(22px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 10px 35px rgba(0, 0, 0, 0.12);
  }

  .bg-gradient-button-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #B24BF3 100%);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  }

  .bg-gradient-button-primary:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 50%, #9F3EE8 100%);
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(102, 126, 234, 0.5);
  }

  .bg-gradient-button-success {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 50%, #50C878 100%);
    box-shadow: 0 6px 20px rgba(56, 239, 125, 0.3);
  }

  .bg-gradient-button-success:hover {
    background: linear-gradient(135deg, #0f8a80 0%, #32d170 50%, #45B76B 100%);
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(56, 239, 125, 0.5);
  }

  .bg-gradient-button-danger {
    background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 50%, #E0115F 100%);
    box-shadow: 0 6px 20px rgba(255, 65, 108, 0.3);
  }

  .bg-gradient-button-danger:hover {
    background: linear-gradient(135deg, #e63946 0%, #e6371f 50%, #CC0E52 100%);
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(255, 65, 108, 0.5);
  }

  .bg-gradient-button-outline {
    background: rgba(255, 255, 255, 0.12);
    border: 2px solid rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(15px);
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
  }

  .bg-gradient-button-outline:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.6);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    25% { background-position: 100% 0%; }
    50% { background-position: 100% 50%; }
    75% { background-position: 0% 100%; }
    100% { background-position: 0% 50%; }
  }

  .progress-excellent {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 50%, #50C878 100%);
    box-shadow: 0 4px 15px rgba(56, 239, 125, 0.4);
  }

  .progress-good {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #87CEEB 100%);
    box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
  }

  .progress-average {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #FFB347 100%);
    box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
  }

  .progress-poor {
    background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 50%, #E0115F 100%);
    box-shadow: 0 4px 15px rgba(255, 65, 108, 0.4);
  }

  .bg-gradient-warning {
    background: linear-gradient(135deg, #FFB347 0%, #FFCC00 50%, #DAA520 100%);
    box-shadow: 0 4px 15px rgba(255, 179, 71, 0.4);
  }

  .bg-gradient-info {
    background: linear-gradient(135deg, #87CEEB 0%, #4A90E2 50%, #0F52BA 100%);
    box-shadow: 0 4px 15px rgba(135, 206, 235, 0.4);
  }

  .bg-gradient-accent {
    background: linear-gradient(135deg, #00FFE1 0%, #B24BF3 50%, #FF10F0 100%);
    box-shadow: 0 4px 15px rgba(0, 255, 225, 0.4);
  }

  .progress-card {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .progress-card:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  }

  .priority-high {
    border-left: 4px solid #ff416c;
    background: linear-gradient(135deg, rgba(255, 65, 108, 0.1), rgba(255, 75, 43, 0.1));
  }

  .priority-medium {
    border-left: 4px solid #f093fb;
    background: linear-gradient(135deg, rgba(240, 147, 251, 0.1), rgba(245, 87, 108, 0.1));
  }

  .priority-low {
    border-left: 4px solid #11998e;
    background: linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.1));
  }

  .goal-status-active {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  }

  .goal-status-completed {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .goal-status-paused {
    background: linear-gradient(135deg, #FFB347 0%, #FFCC00 100%);
  }

  .goal-status-cancelled {
    background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  }

  .progress-bar-container {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
    position: relative;
  }

  .progress-bar-fill {
    height: 12px;
    border-radius: 12px;
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .progress-bar-fill::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

const addCustomStyles = () => {
  if (document.getElementById('progress-tracker-custom-styles')) {
    return;
  }

  const styleSheet = document.createElement("style");
  styleSheet.id = 'progress-tracker-custom-styles';
  styleSheet.type = "text/css";
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
};
const progressHelpers = {
  getCurrentUser: async (): Promise<SecureUser | null> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Auth error:', error);
        return null;
      }
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email || '',
        profile: profile ? {
          full_name: profile.full_name || 'User',
          role: profile.role || 'student',
          student_id: profile.student_id
        } : undefined
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  ensureTablesExist: async () => {
    try {
      const { data: goalsTest, error: goalsError } = await supabase
        .from('progress_goals')
        .select('id')
        .limit(1);

      if (goalsError) {
        console.error('Error checking progress_goals table:', goalsError);
      }

      const { data: entriesTest, error: entriesError } = await supabase
        .from('progress_entries')
        .select('id')
        .limit(1);

      if (entriesError) {
        console.error('Error checking progress_entries table:', entriesError);
      }

      console.log('Tables test:', { goalsError, entriesError });
      return !goalsError && !entriesError;
    } catch (error) {
      console.log('Tables do not exist:', error);
      return false;
    }
  },


  fetchUserGoals: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('progress_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  },

  fetchProgressEntries: async (userId: string, goalId?: string) => {
    try {
      let query = supabase
        .from('progress_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date_recorded', { ascending: false });

      if (goalId) {
        query = query.eq('goal_id', goalId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching progress entries:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching progress entries:', error);
      return [];
    }
  },

  createGoal: async (userId: string, goalData: Partial<Goal>) => {
    try {
      if (!goalData.title || !goalData.category || !goalData.target_value || !goalData.unit) {
        throw new Error('Missing required fields');
      }

      const goalToInsert = {
        user_id: userId,
        title: goalData.title,
        description: goalData.description || null,
        category: goalData.category,
        target_value: goalData.target_value,
        unit: goalData.unit,
        start_date: goalData.start_date,
        target_date: goalData.target_date,
        priority: goalData.priority || 'medium',
        current_value: 0,
        status: 'active'
      };

      console.log('Creating goal with data:', goalToInsert);

      const { data, error } = await supabase
        .from('progress_goals')
        .insert([goalToInsert])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Goal created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  fetchGoalById: async (goalId: string): Promise<Goal | null> => {
    try {
      const { data, error } = await supabase
        .from('progress_goals')
        .select('*')
        .eq('id', goalId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching goal by ID:', error);
      return null;
    }
  },

  updateGoal: async (goalId: string, userId: string, goalData: Partial<Goal>) => {
    try {
      const { data, error } = await supabase
        .from('progress_goals')
        .update({
          ...goalData,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  deleteGoal: async (goalId: string, userId: string) => {
    try {
      await supabase
        .from('progress_entries')
        .delete()
        .eq('goal_id', goalId)
        .eq('user_id', userId);

      const { error } = await supabase
        .from('progress_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  addProgressEntry: async (userId: string, goalId: string, value: number, notes?: string) => {
    try {
      const { data, error } = await supabase
        .from('progress_entries')
        .insert([{
          user_id: userId,
          goal_id: goalId,
          value,
          notes,
          date_recorded: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (error) throw error;

      const { data: goal } = await supabase
        .from('progress_goals')
        .select('current_value, target_value')
        .eq('id', goalId)
        .single();

      if (goal) {
        const newCurrentValue = goal.current_value + value;
        const status = newCurrentValue >= goal.target_value ? 'completed' : 'active';

        await supabase
          .from('progress_goals')
          .update({
            current_value: newCurrentValue,
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('id', goalId);
      }

      return data;
    } catch (error) {
      console.error('Error adding progress entry:', error);
      throw error;
    }
  },

  calculateStats: (goals: Goal[], entries: ProgressEntry[]): ProgressStats => {
    const totalGoals = goals.length;
    const activeGoals = goals.filter(g => g.status === 'active').length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;

    const overallProgress = totalGoals > 0
      ? (completedGoals / totalGoals) * 100
      : 0;

    const averageCompletion = goals.length > 0
      ? goals.reduce((sum, goal) => sum + Math.min((goal.current_value / goal.target_value) * 100, 100), 0) / goals.length
      : 0;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weeklyEntries = entries.filter(entry => entry.date_recorded >= weekAgo);
    const weeklyProgress = weeklyEntries.reduce((sum, entry) => sum + entry.value, 0);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthlyEntries = entries.filter(entry => entry.date_recorded >= monthAgo);
    const monthlyProgress = monthlyEntries.reduce((sum, entry) => sum + entry.value, 0);
    const streakDays = Math.min(7, weeklyEntries.length);

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      overallProgress: Math.round(overallProgress * 100) / 100,
      weeklyProgress,
      monthlyProgress,
      averageCompletion: Math.round(averageCompletion * 100) / 100,
      streakDays
    };
  }
};

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ onBack }) => {
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [stats, setStats] = useState<ProgressStats>({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    overallProgress: 0,
    weeklyProgress: 0,
    monthlyProgress: 0,
    averageCompletion: 0,
    streakDays: 0
  });

  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'progress' | 'priority'>('date');
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isAddProgressModalOpen, setIsAddProgressModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoalForProgress, setSelectedGoalForProgress] = useState<Goal | null>(null);

  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: '',
    target_value: '',
    unit: '',
    start_date: new Date().toISOString().split('T')[0],
    target_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const [progressForm, setProgressForm] = useState({
    value: '',
    notes: ''
  });

  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [dbTablesExist, setDbTablesExist] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [focusedGoal, setFocusedGoal] = useState<Goal | null>(null);
  const [celebratingGoalId, setCelebratingGoalId] = useState<string | null>(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });
  const [streakModalState, setStreakModalState] = useState<{
    isOpen: boolean;
    goal: Goal | null;
    streakInfo: StreakInfo | null;
  }>({ isOpen: false, goal: null, streakInfo: null });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [recommendations, setRecommendations] = useState<GoalRecommendation[]>([]);
  const [adjustment, setAdjustment] = useState<GoalAdjustment | null>(null);
  const [tip, setTip] = useState<MotivationalTip | null>(null);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    addCustomStyles();
    initializeProgressTracker();
  }, []);

  const initializeProgressTracker = async () => {
    try {
      setLoading(true);

      const user = await progressHelpers.getCurrentUser();

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access your progress tracker.",
          variant: "destructive",
        });
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      const allowedRoles = ['premium', 'bdo', 'admin', 'superadmin'];
      const userRole = user.profile?.role || 'student';

      if (!allowedRoles.includes(userRole)) {
        toast({
          title: "Access Denied",
          description: "You do not have permission to access the Progress Tracker. Please upgrade your plan.",
          variant: "destructive",
        });
        setAccessDenied(true);
        setLoading(false);
        setSecurityVerified(true);
        return;
      }

      console.log('Current user:', user);
      setCurrentUser(user);
      setSecurityVerified(true);

      const tablesExist = await progressHelpers.ensureTablesExist();
      console.log('Tables exist:', tablesExist);
      setDbTablesExist(tablesExist);

      if (!tablesExist) {
        setLoading(false);
        return;
      }

      const [userGoals, userEntries] = await Promise.all([
        progressHelpers.fetchUserGoals(user.id),
        progressHelpers.fetchProgressEntries(user.id)
      ]);

      console.log('Loaded goals:', userGoals);
      console.log('Loaded entries:', userEntries);

      setGoals(userGoals);
      setProgressEntries(userEntries);

      const calculatedStats = progressHelpers.calculateStats(userGoals, userEntries);
      setStats(calculatedStats);
      const [aiRecommendations, aiAdjustment, aiTip] = await Promise.all([
        smartCoachService.getPersonalizedRecommendations(userGoals, calculatedStats),
        smartCoachService.getSmartAdjustments(userGoals),
        smartCoachService.getMotivationalTip(calculatedStats),
      ]);
      setRecommendations(aiRecommendations);
      setAdjustment(aiAdjustment.length > 0 ? aiAdjustment[0] : null);
      setTip(aiTip);


      toast({
        title: (
          <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent font-bold">
            Progress Tracker Loaded!
          </span>
        ),
        description: (
          <span className="text-white font-medium">
            Loaded <span className="text-emerald-400 font-semibold">{userGoals.length} goals</span> and <span className="text-cyan-400 font-semibold">{userEntries.length} progress entries</span>.
          </span>
        ),
        className: "bg-black border border-emerald-400/50 shadow-xl",
        icon: <CheckCircle2 className="text-emerald-400" />,
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });


    } catch (error) {
      console.error('Error initializing progress tracker:', error);
      toast({
        title: "Load Error",
        description: "Failed to load your progress data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || submitting) return;

    try {
      setSubmitting(true);

      if (!goalForm.title.trim() || !goalForm.category.trim() || !goalForm.target_value || !goalForm.unit.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const goalData = {
        title: goalForm.title.trim(),
        description: goalForm.description.trim() || null,
        category: goalForm.category.trim(),
        target_value: parseFloat(goalForm.target_value),
        unit: goalForm.unit.trim(),
        start_date: goalForm.start_date,
        target_date: goalForm.target_date,
        priority: goalForm.priority
      };

      console.log('Submitting goal data:', goalData);

      if (editingGoal) {
        await progressHelpers.updateGoal(editingGoal.id, currentUser.id, goalData);
        toast({
          title: (
            <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
              Goal Updated
            </span>
          ),
          description: (
            <span className="text-white font-medium">
              Your goal has been <span className="font-semibold text-green-400">updated successfully</span>.
            </span>
          ),
          className: "bg-black border border-green-400/50 shadow-xl",
          icon: <CheckCircle2 className="text-green-400" />,
          duration: 5000,
          isClosable: true,
          position: "top-right"
        });

      } else {
        await progressHelpers.createGoal(currentUser.id, goalData);
        toast({
          title: (
            <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
              Goal Created
            </span>
          ),
          description: (
            <span className="text-white font-medium">
              New goal has been <span className="font-semibold text-cyan-400">added to your tracker</span>.
            </span>
          ),
          className: "bg-black border border-cyan-400/50 shadow-xl",
          icon: <PlusCircle className="text-cyan-400" />,
          duration: 5000,
          isClosable: true,
          position: "top-right"
        });

      }

      setIsAddGoalModalOpen(false);
      setEditingGoal(null);
      resetGoalForm();
      await initializeProgressTracker();

    } catch (error: any) {
      console.error('Error saving goal:', error);

      let errorMessage = "Failed to save goal. Please try again.";

      if (error.message?.includes('JWT')) {
        errorMessage = "Session expired. Please log in again.";
      } else if (error.message?.includes('permission')) {
        errorMessage = "Permission denied. Please check your account status.";
      } else if (error.details) {
        errorMessage = `Database error: ${error.details}`;
      }

      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedGoalForProgress || submitting) return;

    try {
      setSubmitting(true);

      await progressHelpers.addProgressEntry(
        currentUser.id,
        selectedGoalForProgress.id,
        parseFloat(progressForm.value),
        progressForm.notes || undefined
      );

      toast({
        title: (
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
            Progress Added
          </span>
        ),
        description: (
          <span className="text-white font-medium">
            Added <span className="text-emerald-400 font-semibold">{progressForm.value}</span> <span className="text-cyan-400 font-semibold">{selectedGoalForProgress.unit}</span> to your goal!
          </span>
        ),
        className: "bg-black border border-emerald-400/50 shadow-xl",
        icon: <CheckCircle2 className="text-emerald-400" />,
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });


      setIsAddProgressModalOpen(false);
      setSelectedGoalForProgress(null);
      setProgressForm({ value: '', notes: '' });
      await initializeProgressTracker();

    } catch (error) {
      console.error('Error adding progress:', error);
      toast({
        title: "Add Failed",
        description: "Failed to add progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    if (!currentUser) return;

    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    setModalState({
      isOpen: true,
      title: `Delete Goal: ${goal.title}`,
      message: `Are you sure you want to permanently delete "${goal.title}"? This will also delete all related progress entries. This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setDeletingGoalId(goalId);
          await progressHelpers.deleteGoal(goalId, currentUser.id);

          toast({
            title: (
              <span className="bg-gradient-to-r from-red-500 via-pink-600 to-rose-400 bg-clip-text text-transparent font-bold">
                Goal Deleted
              </span>
            ),
            description: (
              <span className="text-white font-medium">
                Goal and all <span className="text-rose-400 font-semibold">related progress</span> have been deleted.
              </span>
            ),
            className: "bg-black border border-red-500/50 shadow-2xl",
            icon: <Trash2 className="text-rose-400" />,
          });

          await initializeProgressTracker();
        } catch (error) {
          console.error('Error deleting goal:', error);
          toast({ title: "Delete Failed", description: "Failed to delete goal. Please try again.", variant: "destructive" });
        } finally {
          setDeletingGoalId(null);
          setModalState({ ...modalState, isOpen: false });
        }
      },
    });
  };

  const handleFocusGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) setFocusedGoal(goal);
  };

  const handleAcceptAdjustment = async () => {
    if (!adjustment || !currentUser) return;
    try {
      await progressHelpers.updateGoal(adjustment.goal.id, currentUser.id, {
        target_value: adjustment.new_target_value,
      });
      toast({
        title: "Goal Adjusted!",
        description: `Your goal "${adjustment.goal.title}" has been updated.`,
        icon: <Zap className="text-yellow-400" />,
      });
      setIsAdjustmentModalOpen(false);
      setAdjustment(null);
      await initializeProgressTracker();
    } catch (error) {
      console.error('Error accepting adjustment:', error);
      toast({ title: "Adjustment Failed", description: "Could not update the goal.", variant: "destructive" });
    }
  };

  const handleOpenStreakModal = async (goal: Goal) => {
    if (!currentUser) return;
    const streakInfo = await streakService.getStreakInfoForGoal(goal, currentUser.id);
    setStreakModalState({
      isOpen: true,
      goal,
      streakInfo,
    });
  };

  const handleUseInsurance = async () => {
    if (!streakModalState.goal || !currentUser) return;
    const { success, message } = await streakService.useStreakInsurance(streakModalState.goal.id, currentUser.id);
    if (success) {
      toast({
        title: "Success",
        description: message,
        icon: <ShieldCheck className="text-green-400" />,
      });
      setStreakModalState({ isOpen: false, goal: null, streakInfo: null });
      await initializeProgressTracker();
    } else {
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const resetGoalForm = () => {
    setGoalForm({
      title: '',
      description: '',
      category: '',
      target_value: '',
      unit: '',
      start_date: new Date().toISOString().split('T')[0],
      target_date: '',
      priority: 'medium'
    });
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalForm({
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      target_value: goal.target_value.toString(),
      unit: goal.unit,
      start_date: goal.start_date,
      target_date: goal.target_date,
      priority: goal.priority
    });
    setIsAddGoalModalOpen(true);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'progress-excellent';
    if (percentage >= 70) return 'progress-good';
    if (percentage >= 40) return 'progress-average';
    return 'progress-poor';
  };

  const getProgressIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'paused': return PauseCircle;
      case 'cancelled': return X;
      default: return PlayCircle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const filteredGoals = goals
    .filter(goal => {
      const matchesSearch = !searchQuery ||
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = filterCategory === 'all' || goal.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return (b.current_value / b.target_value) - (a.current_value / a.target_value);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'date':
        default:
          return new Date(b.created_at || b.start_date).getTime() - new Date(a.created_at || a.start_date).getTime();
      }
    });

  const uniqueCategories = [...new Set(goals.map(g => g.category))];

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-morphism rounded-3xl p-10 text-center max-w-md mx-4"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400 animate-ping mx-auto"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Loading Progress Tracker</h3>

        </motion.div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism rounded-3xl p-10 text-center max-w-md mx-4"
        >
          <Shield className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-white/80 mb-8">This feature is available for premium users only. Please upgrade your plan to track your progress.</p>
          <Button
            onClick={onBack}
            className="bg-gradient-button-primary text-white font-semibold px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism rounded-3xl p-10 text-center max-w-md mx-4"
        >
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-white/80 mb-8">Please log in to access your progress tracker.</p>
          <Button
            onClick={onBack}
            className="bg-gradient-button-primary text-white font-semibold px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  // Show database setup message if tables don't exist
  if (!dbTablesExist) {
    return (
      <div className="min-h-screen bg-black p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-6 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="bg-gradient-button-outline text-white hover:shadow-lg rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-3xl font-bold text-white">Progress Tracker Setup</h1>
          </div>

          <Card className="glass-morphism border-white/20">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Database Setup Required</h2>
              <p className="text-white/80 mb-6">
                The Progress Tracker requires database tables to be created. Please run the following SQL in your Supabase dashboard:
              </p>

              <div className="bg-black/30 p-4 rounded-xl text-left mb-6 overflow-auto max-h-96">
                <pre className="text-green-400 text-sm whitespace-pre-wrap">
                  {`-- Copy and paste this SQL into Supabase SQL Editor

-- Create progress_goals table
CREATE TABLE IF NOT EXISTS progress_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  target_value DECIMAL NOT NULL,
  current_value DECIMAL DEFAULT 0,
  unit TEXT NOT NULL,
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progress_entries table
CREATE TABLE IF NOT EXISTS progress_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES progress_goals(id) ON DELETE CASCADE,
  value DECIMAL NOT NULL,
  notes TEXT,
  date_recorded DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE progress_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;

-- Create enhanced policies for progress_goals
CREATE POLICY "Enable read access for authenticated users on progress_goals" 
ON progress_goals FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for authenticated users on progress_goals" 
ON progress_goals FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for authenticated users on progress_goals" 
ON progress_goals FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for authenticated users on progress_goals" 
ON progress_goals FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create enhanced policies for progress_entries
CREATE POLICY "Enable read access for authenticated users on progress_entries" 
ON progress_entries FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for authenticated users on progress_entries" 
ON progress_entries FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for authenticated users on progress_entries" 
ON progress_entries FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for authenticated users on progress_entries" 
ON progress_entries FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_progress_goals_user_id ON progress_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_goals_status ON progress_goals(status);
CREATE INDEX IF NOT EXISTS idx_progress_entries_user_id ON progress_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_goal_id ON progress_entries(goal_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_date ON progress_entries(date_recorded);`}
                </pre>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={initializeProgressTracker}
                  className="bg-gradient-button-success text-white px-6 py-3 rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
                <Button
                  onClick={onBack}
                  className="bg-gradient-button-outline text-white px-6 py-3 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center relative overflow-hidden p-4 md:p-8 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Dynamic Neural Substrate */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>
      <ParallaxBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Enhanced Header */}
        <div className="flex flex-row justify-between items-center gap-6 mb-10">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="bg-gradient-button-outline text-white hover:shadow-lg rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                className="text-3xl md:text-5xl font-black text-white mb-4 flex flex-wrap items-center tracking-tighter cursor-default"
              >
                <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(255,255,255,0.2)]">Progress</span>
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent italic px-2 drop-shadow-[0_10px_30px_rgba(52,211,153,0.3)]">Hub</span>
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                    filter: ["blur(0px)", "blur(2px)", "blur(0px)"]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full animate-pulse" />
                  <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] relative z-10" />
                </motion.div>
              </motion.h1>
              <p className="text-white/90 text-lg mb-4">
                Welcome back, <span className="font-semibold text-purple-200">{currentUser.profile?.full_name}</span> - Track your journey to success
              </p>
              <div className="flex items-center space-x-4">

                <Badge className="bg-white/5 text-blue-400 border border-blue-500/20 px-5 py-2.5 rounded-2xl backdrop-blur-xl font-black uppercase tracking-widest text-[10px] shadow-2xl">
                  🎯 {stats.totalGoals} Objectives
                </Badge>

              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                setEditingGoal(null);
                resetGoalForm();
                setIsAddGoalModalOpen(true);
              }}
              className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 px-10 py-4 font-black text-lg text-white shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all duration-700 ease-out hover:from-emerald-700 hover:to-cyan-700 hover:shadow-[0_25px_70px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:scale-95"
              whilehover={{ scale: 1.05 }}
              whiletap={{ scale: 0.98 }}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Plus className="w-5 h-5 transition-transform duration-700 group-hover:rotate-180" />
                </div>
                <span className="text-base tracking-tight uppercase">Add Goal</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-16 px-2">
          {[
            { icon: Target, value: stats.totalGoals, label: 'Total Goals', grad: 'from-blue-600 to-indigo-600', ring: '#4f46e5' },
            { icon: CheckCircle, value: stats.completedGoals, label: 'Completed Goals', grad: 'from-emerald-600 to-teal-600', ring: '#059669' },
            { icon: TrendingUp, value: `${stats.averageCompletion}%`, label: 'Average Completion', grad: 'from-amber-600 to-orange-600', ring: '#d97706' },
            { icon: Zap, value: stats.streakDays, label: 'Streak Days', grad: 'from-violet-600 to-purple-600', ring: '#7c3aed' },
            { icon: Flame, value: stats.highestStreak || 0, label: 'Highest Streak', grad: 'from-rose-600 to-orange-600', ring: '#e11d48' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1), type: 'spring' }}
              className="relative p-8 rounded-[2.5rem] bg-zinc-950/40 backdrop-blur-3xl border border-white/10 group overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-700" style={{ background: stat.ring }} />
              <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.grad} shadow-[0_10px_30px_rgba(0,0,0,0.3)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">Total Goals</div>
              </div>
              <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* AI Coach Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-[3rem] mb-12 shadow-2xl border border-white/10"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.05))',
            backdropFilter: 'blur(40px)'
          }}
        >
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="p-10 relative z-10">
            <h2 className="text-3xl font-black text-white flex items-center gap-4 mb-10 tracking-tight">
              <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30">
                <BrainCircuit className="w-8 h-8 text-purple-400" />
              </div>
              AI Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Motivational Tip */}
              {tip && (
                <motion.div whileHover={{ y: -5 }} className="glass-card p-6 rounded-2xl col-span-1 md:col-span-3">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-yellow-500/20 rounded-xl"><Lightbulb className="w-6 h-6 text-yellow-400" /></div>
                    <div>
                      <h4 className="font-semibold text-yellow-300 mb-1">Today's Tip</h4>
                      <p className="text-white/90">{tip.tip}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Recommendations */}
              {recommendations.map((rec, i) => (
                <motion.div key={i} whileHover={{ y: -5 }} className="glass-card p-6 rounded-2xl">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl"><Sparkles className="w-6 h-6 text-blue-400" /></div>
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-1">New Goal Idea</h4>
                      <p className="text-white font-bold">{rec.title}</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/80 mb-4">{rec.reason}</p>
                  <Button
                    onClick={() => {
                      resetGoalForm();
                      setEditingGoal(null);
                      setGoalForm(prev => ({ ...prev, title: rec.title, category: rec.category, description: rec.description }));
                      setIsAddGoalModalOpen(true);
                    }}
                    className="w-full bg-gradient-button-outline text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add this Goal
                  </Button>
                </motion.div>
              ))}

              {/* Smart Adjustment */}
              {adjustment && (
                <motion.div whileHover={{ y: -5 }} className="glass-card p-6 rounded-2xl">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-green-500/20 rounded-xl"><Repeat className="w-6 h-6 text-green-400" /></div>
                    <div>
                      <h4 className="font-semibold text-green-300 mb-1">Smart Adjustment</h4>
                      <p className="text-white font-bold">For "{adjustment.goal.title}"</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/80 mb-4">{adjustment.suggestion}</p>
                  <Button onClick={() => setIsAdjustmentModalOpen(true)} className="w-full bg-gradient-button-success text-white">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Review Suggestion
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Left Sticky Column for Filters */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-6 space-y-8">
              <Card className="bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center gap-3 text-xl font-black uppercase tracking-widest">
                    <div className="p-2 bg-blue-500/20 rounded-xl">
                      <Filter className="w-5 h-5 text-blue-400" />
                    </div>
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      type="text"
                      placeholder="Query goals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 bg-black/40 border-2 border-white/5 focus:border-blue-500/50 text-white placeholder:text-zinc-600 rounded-2xl h-14 transition-all"
                    />
                  </div>
                  <div className="space-y-4">
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="bg-black/40 border-2 border-white/5 text-white rounded-2xl h-14 focus:ring-2 focus:ring-blue-500/20"><SelectValue placeholder="Domain" /></SelectTrigger>
                      <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl">
                        <SelectItem value="all">All Goals</SelectItem>
                        {uniqueCategories.map(category => (<SelectItem key={`category-${category}`} value={category}>{category}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="bg-black/40 border-2 border-white/5 text-white rounded-2xl h-14 focus:ring-2 focus:ring-blue-500/20"><SelectValue placeholder="Execution Status" /></SelectTrigger>
                      <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active Process</SelectItem>
                        <SelectItem value="completed">Success Nodes</SelectItem>
                        <SelectItem value="paused">On Hold</SelectItem>
                        <SelectItem value="cancelled">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                      <SelectTrigger className="bg-black/40 border-2 border-white/5 text-white rounded-2xl h-14 focus:ring-2 focus:ring-blue-500/20"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl">
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="progress">Progress</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Scrolling Column for Goals */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="flex justify-end mb-4">
              <div className="bg-black/20 border border-white/10 rounded-xl p-1 flex items-center space-x-1">
                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className={`transition-all ${viewMode === 'grid' ? 'bg-white/10' : ''}`}>
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className={`transition-all ${viewMode === 'list' ? 'bg-white/10' : ''}`}>
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <AnimatePresence>
              {filteredGoals.length > 0 ? (
                <motion.div
                  key={viewMode}
                  className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-4'}
                >
                  {filteredGoals.map((goal, index) => (
                    <ProgressCard
                      key={goal.id}
                      goal={goal}
                      index={index}
                      onEdit={openEditModal}
                      onDelete={handleDeleteGoal}
                      onAddProgress={(g) => {
                        setSelectedGoalForProgress(g);
                        setIsAddProgressModalOpen(true);
                      }}
                      deletingGoalId={deletingGoalId}
                      onManageStreak={handleOpenStreakModal}
                      viewMode={viewMode}
                      onFocus={handleFocusGoal}
                      celebratingGoalId={celebratingGoalId}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 text-white/70"
                >
                  <Target className="w-24 h-24 mx-auto mb-6 opacity-50" />
                  <h3 className="text-2xl font-semibold text-white mb-4">No Goals Found</h3>
                  <p className="text-lg mb-6">
                    {goals.length === 0
                      ? "Start your journey by creating your first goal."
                      : "No goals match your current filters."
                    }
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {focusedGoal && (
            <GoalFocusView
              goal={focusedGoal}
              entries={progressEntries.filter(e => e.goal_id === focusedGoal.id)}
              onClose={() => setFocusedGoal(null)}
            />
          )}
        </AnimatePresence>

        <ConfirmationModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          onConfirm={modalState.onConfirm}
          title={modalState.title}
          message={modalState.message}
        />
        <Dialog open={isAdjustmentModalOpen} onOpenChange={setIsAdjustmentModalOpen}>
          <DialogContent className="glass-morphism border-white/20 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-yellow-400 text-2xl flex items-center gap-2"><Zap className="w-6 h-6" /> Smart Adjustment</DialogTitle>
              <DialogDescription className="text-white/80">{adjustment?.suggestion}</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-4 pt-4">
              <Button onClick={() => setIsAdjustmentModalOpen(false)} className="bg-gradient-button-outline text-white rounded-xl px-6 py-3">Decline</Button>
              <Button onClick={handleAcceptAdjustment} className="bg-gradient-button-success text-white rounded-xl px-6 py-3 font-semibold">Accept</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Streak Management Modal */}
        <Dialog open={streakModalState.isOpen} onOpenChange={() => setStreakModalState({ isOpen: false, goal: null, streakInfo: null })}>
          <DialogContent className="glass-morphism border-white/20 rounded-2xl max-w-lg">
            <DialogHeader className="pb-4 text-center">
              <DialogTitle className="text-3xl font-bold flex items-center justify-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                <Flame className="w-8 h-8" /> Streak Management
              </DialogTitle>
              <DialogDescription className="text-white/80 pt-2">
                Manage your consistency streak for <span className="font-bold text-white">{streakModalState.goal?.title}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-4xl font-bold text-orange-400">{streakModalState.streakInfo?.currentStreak}</p>
                  <p className="text-sm text-white/70">Current Streak</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-white">{streakModalState.streakInfo?.longestStreak}</p>
                  <p className="text-sm text-white/70">Longest Streak</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-green-400">{streakModalState.streakInfo?.insuranceAvailable}</p>
                  <p className="text-sm text-white/70">Insurance</p>
                </div>
              </div>
              {streakModalState.streakInfo?.canUseInsurance && (
                <Button onClick={handleUseInsurance} className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-6 text-base rounded-xl">
                  <ShieldCheck className="w-5 h-5 mr-2" /> Use 1 Streak Insurance
                </Button>
              )}
              <p className="text-xs text-center text-white/60">Earn one Streak Insurance for every 7 days of your longest streak. Use it to protect your streak if you miss a day.</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Slide-over Panel for Goal Creation/Edit */}
        <AnimatePresence>
          {isAddGoalModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddGoalModalOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-full w-full max-w-2xl bg-black/80 backdrop-blur-2xl border-l border-white/20 shadow-2xl z-50 flex flex-col"
              >
                <div className="flex items-center justify-between p-10 border-b border-white/5 bg-zinc-950/20">
                  <div className="flex items-center gap-4 text-2xl text-white font-black tracking-tighter uppercase">
                    <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    {editingGoal ? 'Update Goal' : 'Add Goal'}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsAddGoalModalOpen(false)} className="w-12 h-12 text-white/50 hover:text-white hover:bg-white/10 rounded-2xl transition-all">
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <div className="flex-grow overflow-y-auto p-6">
                  <form onSubmit={handleSubmitGoal} className="space-y-8 p-1">
                    <div className="space-y-6 p-6 bg-black/20 rounded-2xl border border-white/10">
                      <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3">
                        <BookOpen className="w-7 h-7" /> Goal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-base font-semibold text-white/90">Goal Title *</Label>
                          <Input id="title" value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} placeholder="e.g., Read 50 Books" required className="text-base bg-black/30 border-2 border-white/15 text-white" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-base font-semibold text-white/90">Category *</Label>
                          <Input id="category" value={goalForm.category} onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })} placeholder="e.g., Education, Fitness" required className="text-base bg-black/30 border-2 border-white/15 text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-base font-semibold text-white/90">Description</Label>
                        <Textarea id="description" value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} placeholder="Why is this goal important to you?" className="min-h-[120px] text-base bg-black/30 border-2 border-white/15 text-white" />
                      </div>
                    </div>

                    <div className="space-y-6 p-6 bg-black/20 rounded-2xl border border-white/10">
                      <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3">
                        <TrendingUp className="w-7 h-7" /> Goal Metrics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="targetValue" className="text-base font-semibold text-white/90">Target *</Label>
                          <Input id="targetValue" type="number" value={goalForm.target_value} onChange={(e) => setGoalForm({ ...goalForm, target_value: e.target.value })} required placeholder="50" min="0" step="0.1" className="text-base bg-black/30 border-2 border-white/15 text-white" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unit" className="text-base font-semibold text-white/90">Unit *</Label>
                          <Input id="unit" value={goalForm.unit} onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })} required placeholder="books, hours, kg" className="text-base bg-black/30 border-2 border-white/15 text-white" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority" className="text-base font-semibold text-white/90">Priority</Label>
                          <Select value={goalForm.priority} onValueChange={(value) => setGoalForm({ ...goalForm, priority: value as any })}>
                            <SelectTrigger className="text-base bg-black/30 border-2 border-white/15 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white">
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 p-6 bg-black/20 rounded-2xl border border-white/10">
                      <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3">
                        <Calendar className="w-7 h-7" /> Timeline
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="startDate" className="text-base font-semibold text-white/90">Start Date *</Label>
                          <Input id="startDate" type="date" value={goalForm.start_date} onChange={(e) => setGoalForm({ ...goalForm, start_date: e.target.value })} required className="text-base bg-black/30 border-2 border-white/15 text-white" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="targetDate" className="text-base font-semibold text-white/90">Target Date *</Label>
                          <Input id="targetDate" type="date" value={goalForm.target_date} onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })} required min={goalForm.start_date} className="text-base bg-black/30 border-2 border-white/15 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-white/10">
                      <Button type="button" variant="ghost" onClick={() => setIsAddGoalModalOpen(false)} className="px-8 py-3 text-base text-white/80 hover:bg-white/10">Cancel</Button>
                      <Button type="submit" disabled={submitting} className="px-8 py-3 text-base bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl disabled:opacity-50">
                        {submitting ? 'Saving...' : (editingGoal ? 'Update Goal' : 'Create Goal')}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Slide-over Panel for Logging Progress */}
        <AnimatePresence>
          {isAddProgressModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddProgressModalOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-full w-full max-w-2xl bg-black/80 backdrop-blur-2xl border-l border-white/20 shadow-2xl z-50 flex flex-col"
              >
                <div className="flex items-center justify-between p-10 border-b border-white/5 bg-zinc-950/20">
                  <div className="flex items-center gap-4 text-2xl text-white font-black tracking-tighter uppercase">
                    <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/20">
                      <Activity className="w-6 h-6 text-emerald-400" />
                    </div>
                    Log Neural Progress
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsAddProgressModalOpen(false)} className="w-12 h-12 text-white/50 hover:text-white hover:bg-white/10 rounded-2xl transition-all">
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <div className="flex-grow overflow-y-auto p-6">
                  <form onSubmit={handleAddProgress} className="space-y-8 p-1">
                    <div className="space-y-6 p-6 bg-black/20 rounded-2xl border border-white/10">
                      <h3 className="text-2xl font-extrabold text-white mb-4 flex items-center gap-3">
                        <TrendingUp className="w-7 h-7" /> Log Details
                      </h3>
                      <div className="space-y-2">
                        <Label className="text-base font-semibold text-white/90">Select Goal *</Label>
                        <Select value={selectedGoalForProgress?.id || ''} onValueChange={(value) => setSelectedGoalForProgress(goals.find(g => g.id === value) || null)}>
                          <SelectTrigger className="text-base bg-black/30 border-2 border-white/15 text-white"><SelectValue placeholder="Choose a goal" /></SelectTrigger>
                          <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white">
                            {goals.filter(g => g.status === 'active').map(goal => (<SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedGoalForProgress && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="progressValue" className="text-base font-semibold text-white/90">Progress Value ({selectedGoalForProgress.unit}) *</Label>
                            <Input id="progressValue" type="number" value={progressForm.value} onChange={(e) => setProgressForm({ ...progressForm, value: e.target.value })} required placeholder="How much progress?" min="0" step="0.1" className="text-base bg-black/30 border-2 border-white/15 text-white" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="progressNotes" className="text-base font-semibold text-white/90">Notes (Optional)</Label>
                            <Textarea id="progressNotes" value={progressForm.notes} onChange={(e) => setProgressForm({ ...progressForm, notes: e.target.value })} placeholder="Add notes about this progress..." rows={3} className="min-h-[120px] text-base bg-black/30 border-2 border-white/15 text-white" />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-white/10">
                      <Button type="button" variant="ghost" onClick={() => setIsAddProgressModalOpen(false)} className="px-8 py-3 text-base text-white/80 hover:bg-white/10">Cancel</Button>
                      <Button type="submit" disabled={!selectedGoalForProgress || submitting} className="px-8 py-3 text-base bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl disabled:opacity-50">
                        {submitting ? 'Logging...' : 'Log Progress'}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <footer className="w-full mt-32 border-t border-white/5 relative overflow-hidden">
          {/* Subtle aurora background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {/* Branding Column */}
              <div className="space-y-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-block"
                >
                  <h3 className="text-3xl font-black tracking-tighter text-white flex items-center gap-2">
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">MARGDARSHAK</span>
                  </h3>
                  <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.3em] mt-1">by VSAV GYANTAPA</p>
                </motion.div>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                  Empowering students with AI-driven scheduling and intelligent academic orchestration. Built for the next generation of learners.
                </p>
                <div className="flex items-center gap-4">
                  {[
                    { icon: TwitterLogo, href: "https://x.com/gyantappas", label: "Twitter" },
                    { icon: FacebookLogo, href: "https://www.facebook.com/profile.php?id=61584618795158", label: "Facebook" },
                    { icon: linkedinLogo, href: "https://www.linkedin.com/in/vsav-gyantapa-33893a399/", label: "LinkedIn" }
                  ].map((social, i) => (
                    <motion.a
                      key={i}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, y: -4 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-zinc-400 hover:text-white"
                    >
                      <social.icon />
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Links Columns */}
              {[
                {
                  title: "Platform",
                  links: [
                    { name: "Scheduler", href: "/timetable" },
                    { name: "AI Assistant", href: "/ai-assistant" },
                    { name: "Quiz Gen", href: "/quiz" },
                    { name: "Wellness", href: "/wellness" }
                  ]
                },
                {
                  title: "Legal",
                  links: [
                    { name: "Terms of Service", href: "/terms" },
                    { name: "Privacy Policy", href: "/privacy" },
                    { name: "Cookie Policy", href: "/cookies" },
                    { name: "GDPR Compliance", href: "/gdpr" }
                  ]
                },
                {
                  title: "Support",
                  links: [
                    { name: "Help Center", href: "/help" },
                    { name: "Contact Us", href: "mailto:support@margdarshan.tech" }
                  ]
                }
              ].map((section, i) => (
                <div key={i} className="space-y-6">
                  <h4 className="text-white font-black text-sm uppercase tracking-widest">{section.title}</h4>
                  <ul className="space-y-4">
                    {section.links.map((link, j) => (
                      <li key={j}>
                        <Link
                          to={link.href}
                          className="text-zinc-500 hover:text-white transition-colors text-sm font-medium flex items-center group"
                        >
                          <motion.span
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-2"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 group-hover:bg-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                            {link.name}
                          </motion.span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Bar */}
            <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-zinc-500 text-sm">
                © 2025 <span className="text-white font-bold">VSAV GYANTAPA</span>. All rights reserved.
              </p>
              <div className="flex items-center gap-6">

                <p className="text-zinc-600 text-xs font-medium">Version 3.0</p>
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};

export default ProgressTracker;
