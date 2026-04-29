import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, BrainCircuit, TrendingUp, Target, Lightbulb, ArrowLeft,
  Loader2, RefreshCw, Sparkles, Database, Lock, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { modelRouter } from '@/lib/ai/modelRouter';
import { useAI } from '@/contexts/AIContext';
import cacheService from '@/lib/ai/cacheService';
import { ScrollArea } from '@/components/ui/scroll-area';
import logo from "@/components/logo/logo.png";

interface InsightCard {
  title: string;
  insight: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

interface Analytics {
  taskCompletionRate: number;
  totalTasks: number;
  completedTasks: number;
  avgGrade: number;
  totalGrades: number;
  studyStreak: number;
  coursesEnrolled: number;
}

const priorityColors = {
  high: 'border-red-500/20 bg-red-500/[0.02]',
  medium: 'border-emerald-500/20 bg-emerald-500/[0.02]',
  low: 'border-blue-500/20 bg-blue-500/[0.02]',
};

const priorityBadge = {
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
  medium: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

const AIAnalytics: React.FC = () => {
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const { isPremium, isAIReady } = useAI();

  const fetchAnalytics = async (): Promise<Analytics> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { taskCompletionRate: 0, totalTasks: 0, completedTasks: 0, avgGrade: 0, totalGrades: 0, studyStreak: 0, coursesEnrolled: 0 };

      const [tasksRes, gradesRes, coursesRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('grades').select('*').eq('user_id', user.id),
        supabase.from('courses').select('*').eq('user_id', user.id),
      ]);

      const tasks = tasksRes.data || [];
      const grades = gradesRes.data || [];
      const courses = coursesRes.data || [];

      const completed = tasks.filter((t: any) => t.status === 'completed').length;
      const avgGrade = grades.length > 0
        ? grades.reduce((sum: number, g: any) => sum + (Number(g.grade) / Number(g.total_points)) * 100, 0) / grades.length
        : 0;

      return {
        taskCompletionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
        totalTasks: tasks.length,
        completedTasks: completed,
        avgGrade: Math.round(avgGrade),
        totalGrades: grades.length,
        studyStreak: 0,
        coursesEnrolled: courses.length,
      };
    } catch (err) {
      console.error("Error fetching analytics:", err);
      return { taskCompletionRate: 0, totalTasks: 0, completedTasks: 0, avgGrade: 0, totalGrades: 0, studyStreak: 0, coursesEnrolled: 0 };
    }
  };

  const generateInsights = async (data: Analytics, force = false) => {
    const cacheKey = cacheService.buildKey('analytics_insights', JSON.stringify(data));
    if (!force) {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setInsights(parsed);
          return;
        } catch { /* ignore */ }
      }
    }

    if (!isAIReady) return;

    setGeneratingInsights(true);

    const prompt = `Analyze this student's academic data and generate 4 actionable insights:

Data:
- Task Completion Rate: ${data.taskCompletionRate}%
- Total Tasks: ${data.totalTasks} (${data.completedTasks} completed)
- Average Grade: ${data.avgGrade}%
- Total Grades Recorded: ${data.totalGrades}
- Study Streak: ${data.studyStreak} days
- Courses Enrolled: ${data.coursesEnrolled}

Generate 4 insights. Return ONLY valid JSON array:
[
  {
    "title": "Insight Title",
    "insight": "What this data tells us (1-2 sentences)",
    "recommendation": "Specific actionable advice (1-2 sentences)",
    "priority": "high|medium|low",
    "icon": "📊"
  }
]

Make insights specific, encouraging, and actionable. Use emojis for icons.`;

    try {
      const result = await modelRouter.generateJSON<InsightCard[]>(prompt);
      if (result && Array.isArray(result)) {
        setInsights(result);
        cacheService.set(cacheKey, JSON.stringify(result), 60 * 60 * 1000);
      }
    } catch {
      setInsights([{
        title: 'Initialize Neural Stream',
        insight: 'Your academic data stream is currently being aggregated.',
        recommendation: 'Log more grades and complete tasks to unlock high-fidelity predictive modeling.',
        priority: 'medium',
        icon: '📡',
      }]);
    } finally {
      setGeneratingInsights(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const data = await fetchAnalytics();
        setAnalytics(data);
        await generateInsights(data);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const statCards = analytics ? [
    { label: 'Completion Rate', value: `${analytics.taskCompletionRate}%`, sub: `${analytics.completedTasks}/${analytics.totalTasks} UNITS`, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Performance Metric', value: `${analytics.avgGrade}%`, sub: `${analytics.totalGrades} DATA POINTS`, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Neural Streak', value: `${analytics.studyStreak}d`, sub: 'CONSECUTIVE DAYS', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Active Courses', value: analytics.coursesEnrolled, sub: 'REGISTERED', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ] : [];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Zenith Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,20,15,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        {/* Animated Neural Orbs */}
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]"
        />

        {/* Neural Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
          {/* HEADER */}
          <header className="flex flex-col md:flex-row items-center justify-between p-6 rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative z-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.05] to-transparent pointer-events-none" />

            <div className="flex items-center gap-6">
              <Link to="/dashboard">
                <motion.div whileHover={{ scale: 1.1, x: -4 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="ghost" size="icon" className="h-12 w-12 text-zinc-400 hover:text-white hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                </motion.div>
              </Link>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <img src={logo} alt="Margdarshak" className="h-6 w-6 object-contain" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">AI<span className="text-emerald-500 not-italic font-light">Analytics</span></h1>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1.5 opacity-60">High-Fidelity Neural Diagnostics</p>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex items-center gap-3">
              {analytics && (
                <Button
                  onClick={() => generateInsights(analytics, true)}
                  disabled={generatingInsights}
                  className="h-12 px-8 bg-white/[0.02] hover:bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] transition-all group shadow-xl"
                >
                  <RefreshCw className={`w-4 h-4 mr-3 text-emerald-500 ${generatingInsights ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                  Recalibrate
                </Button>
              )}
            </div>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 animate-pulse" />
              </div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em]">Establishing Neural Connection...</p>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {statCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    whileHover={{ y: -10, scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white/[0.01] border border-white/5 backdrop-blur-3xl rounded-[2.8rem] p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    <div className={`inline-flex p-4 rounded-2xl ${card.bg} mb-8 border border-white/5 relative z-10 shadow-lg`}>
                      <TrendingUp className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <p className={`text-5xl font-black ${card.color} tracking-tighter mb-2 relative z-10 italic leading-none`}>{card.value}</p>
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1 relative z-10">{card.label}</p>
                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em] relative z-10 opacity-60">{card.sub}</p>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-10">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <div className="flex items-center gap-3">
                      <BrainCircuit className="w-6 h-6 text-emerald-400" />
                      <h2 className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic">Predictive Diagnostics</h2>
                    </div>
                  </div>
                  {generatingInsights && (
                    <div className="flex items-center gap-3 px-5 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-lg">
                      <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Synthesizing Signals...</span>
                    </div>
                  )}
                </div>

                {insights.length === 0 && !generatingInsights && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-32 bg-white/[0.01] border border-white/5 rounded-[3.5rem] text-center shadow-2xl"
                  >
                    <div className="p-10 bg-white/[0.02] rounded-[2.5rem] border border-white/5 mb-8 shadow-inner">
                      <Database className="w-12 h-12 text-zinc-800" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-widest mb-3">Signal Interruption</h3>
                    <p className="text-zinc-600 text-[10px] max-w-sm leading-relaxed font-black uppercase tracking-widest opacity-60">Aggregate more academic markers to unlock high-fidelity AI diagnostics and predictive study modeling.</p>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {insights.map((insight, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5, scale: 1.01 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className={`rounded-[3rem] p-10 border backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden group transition-all duration-700 ${priorityColors[insight.priority]}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                      <div className="flex items-start justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-[1.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-700">
                            {insight.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-white tracking-tighter leading-tight uppercase italic">{insight.title}</h3>
                            <div className={`mt-3 inline-flex text-[8px] font-black px-4 py-1.5 rounded-full border uppercase tracking-[0.3em] ${priorityBadge[insight.priority]}`}>
                              {insight.priority} Priority Signal
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-base text-zinc-500 leading-relaxed mb-10 font-medium italic relative z-10">
                        "{insight.insight}"
                      </p>

                      <div className="flex items-start gap-5 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 relative z-10 group-hover:border-emerald-500/20 transition-all duration-500 shadow-xl">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] italic">Tactical Directive</p>
                          <p className="text-[11px] text-zinc-400 leading-relaxed font-black uppercase tracking-widest opacity-80">{insight.recommendation}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {!isPremium && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 1 }}
                  className="bg-white/[0.01] border border-white/5 rounded-[4rem] p-16 text-center relative overflow-hidden group shadow-[0_60px_100px_-30px_rgba(0,0,0,0.9)]"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:30px_30px] opacity-20" />
                  <div className="relative z-10 space-y-10">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 flex items-center justify-center mx-auto shadow-2xl relative">
                      <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20" />
                      <Sparkles className="w-12 h-12 text-emerald-400 relative z-10" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Ascend to <span className="text-emerald-500">Elite Protocol</span></h3>
                      <p className="text-zinc-600 text-[10px] max-w-lg mx-auto leading-relaxed font-black uppercase tracking-[0.4em] opacity-60">Unlock predictive performance modeling, high-fidelity neural analytics, and autonomous study optimization.</p>
                    </div>
                    <Link to="/upgrade">
                      <Button className="bg-white text-black font-black h-16 px-12 rounded-2xl shadow-2xl shadow-emerald-500/10 uppercase tracking-[0.3em] text-[10px] transition-all hover:translate-y-[-4px] active:scale-95 group/btn overflow-hidden relative">
                        <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-700" />
                        <span className="relative z-10 group-hover/btn:text-black transition-colors">Initialize Upgrade</span>
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          )}
          </div>
        </ScrollArea>
      </div>
    );
  };

export default AIAnalytics;
