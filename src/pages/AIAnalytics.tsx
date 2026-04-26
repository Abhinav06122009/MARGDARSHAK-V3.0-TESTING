import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, BrainCircuit, TrendingUp, Target, Lightbulb, ArrowLeft,
  Loader2, RefreshCw, Sparkles, X, Facebook, Twitter, Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { modelRouter } from '@/lib/ai/modelRouter';
import { useAI } from '@/contexts/AIContext';
import cacheService from '@/lib/ai/cacheService';
import { ScrollArea } from '@/components/ui/scroll-area';

// Social Icons (Unified)
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
  high: 'border-red-500/30 bg-red-500/5',
  medium: 'border-amber-500/30 bg-amber-500/5',
  low: 'border-emerald-500/30 bg-emerald-500/5',
};

const priorityBadge = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const AIAnalytics: React.FC = () => {
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const { isPremium, isAIReady } = useAI();

  const fetchAnalytics = async (): Promise<Analytics> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { taskCompletionRate: 0, totalTasks: 0, completedTasks: 0, avgGrade: 0, totalGrades: 0, studyStreak: 0, coursesEnrolled: 0 };

    const [tasksResult, gradesResult, profileResult, coursesResult] = await Promise.allSettled([
      supabase.from('tasks').select('status').eq('user_id', user.id).eq('is_deleted', false),
      supabase.from('grades').select('grade, total_points').eq('user_id', user.id),
      supabase.from('profiles').select('study_streak').eq('id', user.id).single(),
      supabase.from('courses').select('id').eq('user_id', user.id),
    ]);

    const tasks = tasksResult.status === 'fulfilled' ? tasksResult.value.data || [] : [];
    const grades = gradesResult.status === 'fulfilled' ? gradesResult.value.data || [] : [];
    const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null;
    const courses = coursesResult.status === 'fulfilled' ? coursesResult.value.data || [] : [];

    const completed = tasks.filter((t: any) => t.status === 'completed').length;
    const avgGrade = grades.length > 0
      ? grades.reduce((sum: number, g: any) => sum + (g.grade / g.total_points) * 100, 0) / grades.length
      : 0;

    return {
      taskCompletionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
      totalTasks: tasks.length,
      completedTasks: completed,
      avgGrade: Math.round(avgGrade),
      totalGrades: grades.length,
      studyStreak: profile?.study_streak || 0,
      coursesEnrolled: courses.length,
    };
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
        title: 'Keep Building Momentum',
        insight: 'Your academic data shows you are actively tracking your progress.',
        recommendation: 'Continue logging your grades and completing tasks consistently to see AI-powered trends.',
        priority: 'medium',
        icon: '📈',
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
    { label: 'Task Completion', value: `${analytics.taskCompletionRate}%`, sub: `${analytics.completedTasks}/${analytics.totalTasks} tasks`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Average Grade', value: `${analytics.avgGrade}%`, sub: `${analytics.totalGrades} grades recorded`, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Study Streak', value: `${analytics.studyStreak}d`, sub: 'consecutive days', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Courses', value: analytics.coursesEnrolled, sub: 'enrolled', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ] : [];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-purple-500/30 overflow-x-hidden relative">
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,10,25,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Animated Neural Orbs */}
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
          {/* HEADER */}
          <header className="flex flex-col md:flex-row items-center justify-between p-6 glass-card rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative z-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.05] to-transparent pointer-events-none" />

            <div className="flex items-center gap-6">
              <Link to="/dashboard">
                <motion.div whileHover={{ scale: 1.1, x: -4 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="ghost" size="icon" className="h-12 w-12 text-zinc-400 hover:text-white hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                </motion.div>
              </Link>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-purple-500/20 rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-purple-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <BarChart3 className="w-8 h-8 text-purple-400 relative z-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">AI<span className="text-purple-400">Analyst</span></h1>
                  <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-0.5">AI POWERED Performance Tracker</p>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex items-center gap-3">
              {analytics && (
                <Button
                  onClick={() => generateInsights(analytics, true)}
                  disabled={generatingInsights}
                  className="h-12 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all group"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${generatingInsights ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                  Recalibrate
                </Button>
              )}

            </div>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
              <p className="text-zinc-400 text-sm">Analyzing your academic data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    whileHover={{ y: -8, scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5, ease: "circOut" }}
                    className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    <div className={`inline-flex p-4 rounded-2xl ${card.bg} mb-6 border border-white/5 relative z-10`}>
                      <TrendingUp className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <p className={`text-4xl font-black ${card.color} tracking-tighter mb-1 relative z-10 italic`}>{card.value}</p>
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1 relative z-10">{card.label}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest relative z-10">{card.sub}</p>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                    <div className="flex items-center gap-3">
                      <BrainCircuit className="w-6 h-6 text-purple-400" />
                      <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">AI-Generated Diagnostics</h2>
                    </div>
                  </div>
                  {generatingInsights && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20">
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Processing Data...</span>
                    </div>
                  )}
                </div>

                {insights.length === 0 && !generatingInsights && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-24 bg-white/[0.02] border border-white/5 rounded-[3rem] text-center"
                  >
                    <div className="p-8 bg-white/5 rounded-full mb-6">
                      <Sparkles className="w-12 h-12 text-zinc-700" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">Insufficient Data Stream</h3>
                    <p className="text-zinc-500 text-xs max-w-xs leading-relaxed font-medium uppercase tracking-widest">Aggregate more academic markers to unlock high-fidelity AI diagnostics.</p>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {insights.map((insight, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15, duration: 0.6, ease: "circOut" }}
                      className={`rounded-[2.5rem] p-8 border backdrop-blur-3xl shadow-2xl relative overflow-hidden group ${priorityColors[insight.priority]}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                      <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-inner">
                            {insight.icon}
                          </div>
                          <div>
                            <h3 className="text-base font-black text-white tracking-tight leading-tight">{insight.title}</h3>
                            <div className={`mt-2 inline-flex text-[8px] font-black px-3 py-1 rounded-full border uppercase tracking-[0.2em] ${priorityBadge[insight.priority]}`}>
                              {insight.priority} Priority
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-zinc-300 leading-relaxed mb-8 font-medium italic relative z-10">
                        "{insight.insight}"
                      </p>

                      <div className="flex items-start gap-4 p-5 rounded-[1.5rem] bg-black/40 border border-white/5 relative z-10 group-hover:border-purple-500/30 transition-colors">
                        <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/30">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">Recommendation</p>
                          <p className="text-xs text-zinc-400 leading-relaxed font-bold">{insight.recommendation}</p>
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
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-br from-purple-500/[0.08] via-indigo-500/[0.05] to-transparent border border-purple-500/20 rounded-[3rem] p-12 text-center relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                  <div className="relative z-10 space-y-8">
                    <div className="w-20 h-20 bg-purple-500/20 rounded-[2rem] border border-purple-500/30 flex items-center justify-center mx-auto shadow-2xl">
                      <Sparkles className="w-10 h-10 text-purple-400" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Unlock Deep <span className="text-purple-400">Cognitive Metrics</span></h3>
                      <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed font-bold uppercase tracking-widest">Upgrade to Premium for predictive performance modeling and high-fidelity study pattern analytics.</p>
                    </div>
                    <Link to="/upgrade">
                      <Button className="bg-purple-500 hover:bg-purple-400 text-black font-black h-16 px-10 rounded-[2rem] shadow-xl shadow-purple-500/20 uppercase tracking-[0.3em] text-[10px] transition-all hover:translate-y-[-4px] group/btn overflow-hidden relative">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                        <span className="relative z-10">Ascend to Premium</span>
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          )}
          {/* ── Footer ── */}
          <footer className="relative mt-32 border-t border-white/5 bg-black/40 backdrop-blur-3xl overflow-hidden rounded-[2.5rem]">
            {/* Footer Glows */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
                className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"
              />
              <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"
              />
            </div>

            <div className="relative max-w-7xl mx-auto px-10 py-20 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {/* Branding Column */}
                <div className="space-y-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-block"
                  >
                    <h3 className="text-4xl font-black tracking-tighter text-white flex items-center gap-2">
                      <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent uppercase italic">Margdarshak</span>
                    </h3>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2 ml-1">by VSAV GYANTAPA</p>
                  </motion.div>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-medium">
                    Empowering students with AI-driven insights and intelligent academic orchestration. Built for the next generation of learners.
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
                        whileHover={{ scale: 1.2, y: -4, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        className="p-4 bg-white/5 rounded-2xl border border-white/10 transition-all text-zinc-400 hover:text-white"
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
                  <div key={i} className="space-y-8">
                    <h4 className="text-white font-black text-[10px] uppercase tracking-[0.4em]">{section.title}</h4>
                    <ul className="space-y-5">
                      {section.links.map((link, j) => (
                        <li key={j}>
                          <Link
                            to={link.href}
                            className="text-zinc-500 hover:text-white transition-colors text-sm font-bold flex items-center group"
                          >
                            <motion.span
                              whileHover={{ x: 6 }}
                              className="flex items-center gap-3"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] opacity-0 group-hover:opacity-100 transition-all" />
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
              <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  © 2025 <span className="text-white">VSAV GYANTAPA</span>. ALL RIGHTS RESERVED.
                </p>
                <div className="flex items-center gap-8">

                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest italic">V3.0</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AIAnalytics;
