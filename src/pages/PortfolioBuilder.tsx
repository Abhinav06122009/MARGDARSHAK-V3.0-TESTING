import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, Download, Trophy, GraduationCap, Target, ArrowLeft, Star,
  BookOpen, TrendingUp, Award, Loader2, Mail, ExternalLink, Printer
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

// Social Icons
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
import { supabase } from '@/integrations/supabase/client';
import { useDashboardData } from '@/hooks/useDashboardData';

interface Grade {
  id: string;
  subject: string;
  assignment_name: string;
  grade: number;
  total_points: number;
  date_recorded: string;
  semester?: string;
  grade_type: string;
}

interface Course {
  id: string;
  name: string;
  description?: string;
  status?: string;
  progress?: number;
}

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PortfolioBuilder = () => {
  const navigate = useNavigate();
  const { stats: dashboardStats, currentUser, recentTasks, recentGrades, courses: dashCourses, loading: dashLoading } = useDashboardData();
  const resumeRef = useRef<HTMLDivElement>(null);

  const [allGrades, setAllGrades] = useState<Grade[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const userEmail = currentUser?.email ?? '';
  const userName = (currentUser as any)?.profile?.full_name ?? currentUser?.email ?? 'Student Name';

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [gradesRes, coursesRes] = await Promise.all([
        supabase.from('grades').select('*').eq('user_id', user.id).order('date_recorded', { ascending: false }),
        supabase.from('courses').select('*').eq('user_id', user.id),
      ]);

      if (gradesRes.data) setAllGrades(gradesRes.data);
      if (coursesRes.data) setAllCourses(coursesRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Use either fresh DB data or what the hook already has
  const grades = allGrades.length > 0 ? allGrades : (recentGrades as unknown as Grade[]);
  const courses = allCourses.length > 0 ? allCourses : (dashCourses as unknown as Course[]);

  const handlePrint = () => window.print();

  const avgGrade = grades.length > 0
    ? Math.round(grades.reduce((acc, g) => acc + (g.grade / g.total_points) * 100, 0) / grades.length)
    : 0;

  const uniqueSubjects = [...new Set(grades.map(g => g.subject))];
  const completedCourses = courses.filter(c => c.status === 'completed' || (c.progress ?? 0) >= 100);
  const completedTasks = recentTasks?.filter(t => t.status === 'completed') ?? [];

  const title = avgGrade >= 90 ? 'Distinguished Scholar'
    : avgGrade >= 80 ? 'Honor Roll Achiever'
      : (dashboardStats?.completionRate ?? 0) > 75 ? 'Consistent Achiever'
        : 'Dedicated Learner';

  const gradeLetterDistribution = grades.reduce((acc: Record<string, number>, g) => {
    const pct = (g.grade / g.total_points) * 100;
    const letter = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
    acc[letter] = (acc[letter] || 0) + 1;
    return acc;
  }, {});

  if (loading || dashLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4 text-white/50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="animate-pulse uppercase tracking-[0.2em] font-black text-[10px]">Data Syncing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 overflow-x-hidden font-sans selection:bg-indigo-500/30 relative">
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0 print:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,10,30,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Animated Neural Orbs */}
        <motion.div
          animate={{ opacity: [0.1, 0.15, 0.1], scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'easeInOut' }}
          className="absolute top-0 -left-40 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.1, 0.05], scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 -right-40 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[150px]"
        />

        {/* Sub-pixel Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10 print:h-auto print:overflow-visible">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 print:p-0 print:m-0">

          {/* Page Controls */}
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8 print:hidden bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-4 rounded-[2rem] shadow-2xl"
          >
            <div className="flex items-center gap-5">
              <button onClick={() => navigate('/dashboard')} className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all shadow-lg shadow-black/20">
                <ArrowLeft className="w-5 h-5 text-zinc-300" />
              </button>
              <div>
                <h1 className="text-xl font-black flex items-center gap-3 tracking-tighter uppercase italic text-white">
                  <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                    <Briefcase className="w-5 h-5 text-indigo-400" />
                  </div>
                  Portfolio
                </h1>
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold mt-1 ml-1">
                  Auto-generated Academic Resume
                </p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-400 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.3)] font-black text-xs uppercase tracking-widest mr-2"
            >
              <Printer className="w-4 h-4" /> Export PDF
            </button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 print:hidden"
          >
            {[
              { label: 'Grades Recorded', value: grades.length, icon: <Award className="w-5 h-5 text-amber-400" />, glow: 'shadow-[0_0_15px_rgba(251,191,36,0.15)]' },
              { label: 'Avg Score', value: `${avgGrade}%`, icon: <TrendingUp className="w-5 h-5 text-emerald-400" />, glow: 'shadow-[0_0_15px_rgba(52,211,153,0.15)]' },
              { label: 'Courses', value: courses.length, icon: <BookOpen className="w-5 h-5 text-blue-400" />, glow: 'shadow-[0_0_15px_rgba(96,165,250,0.15)]' },
              { label: 'Tasks Done', value: completedTasks.length, icon: <Trophy className="w-5 h-5 text-indigo-400" />, glow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]' },
            ].map((s, i) => (
              <motion.div whileHover={{ y: -4 }} key={s.label} className={`bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-[2rem] p-5 flex items-center gap-4 ${s.glow}`}>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">{s.icon}</div>
                <div>
                  <p className="text-3xl font-black text-white tracking-tighter tabular-nums">{s.value}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-0.5">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── RESUME DOCUMENT ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white text-zinc-900 rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none relative z-10"
            ref={resumeRef}
          >
            <div className="p-10 md:p-14 min-h-[1120px] bg-white print:min-h-full font-serif">

              {/* ── Header ── */}
              <div className="flex justify-between items-start pb-8 mb-8 border-b-[3px] border-indigo-600">
                <div>
                  <h1 className="text-5xl font-black text-zinc-900 tracking-tight font-sans">
                    {userName}
                  </h1>
                  <p className="text-xl text-indigo-600 font-semibold mt-1 font-sans">{title}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-zinc-500 font-sans">
                    <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{userEmail}</span>
                    <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" />{dashboardStats?.studyStreak ?? 0}-day streak</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-indigo-600 text-white text-4xl font-black px-6 py-3 rounded-xl font-sans shadow-lg shadow-indigo-500/20">
                    {avgGrade}<span className="text-2xl opacity-75">%</span>
                  </div>
                  <p className="text-xs font-bold text-zinc-400 mt-2 uppercase tracking-widest font-sans">Academic Average</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-16 font-sans">

                {/* ── LEFT COLUMN ── */}
                <div className="col-span-1 space-y-10">

                  {/* Academic Performance */}
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Performance</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-semibold text-zinc-700">Academic Average</span>
                          <span className="font-bold text-zinc-900">{avgGrade}%</span>
                        </div>
                        <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${avgGrade}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-semibold text-zinc-700">Task Completion</span>
                          <span className="font-bold text-zinc-900">{dashboardStats?.completionRate ?? 0}%</span>
                        </div>
                        <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${dashboardStats?.completionRate ?? 0}%` }} />
                        </div>
                      </div>
                      {Object.entries(gradeLetterDistribution).length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Grade Distribution</p>
                          <div className="flex gap-2 flex-wrap">
                            {Object.entries(gradeLetterDistribution).sort().map(([letter, count]) => (
                              <div key={letter} className="text-center">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black ${letter === 'A' ? 'bg-emerald-100 text-emerald-700' : letter === 'B' ? 'bg-blue-100 text-blue-700' : letter === 'C' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                  {letter}
                                </div>
                                <p className="text-[10px] text-zinc-400 mt-1">{count}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Subjects */}
                  {uniqueSubjects.length > 0 && (
                    <section>
                      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3">Subjects Studied</h3>
                      <ul className="space-y-2">
                        {uniqueSubjects.slice(0, 8).map((subj, i) => {
                          const subjectGrades = grades.filter(g => g.subject === subj);
                          const subjectAvg = Math.round(subjectGrades.reduce((a, g) => a + (g.grade / g.total_points) * 100, 0) / subjectGrades.length);
                          return (
                            <li key={i} className="flex items-center justify-between">
                              <span className="text-sm text-zinc-700 font-medium">{subj}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${subjectAvg >= 90 ? 'text-emerald-700 bg-emerald-50' : subjectAvg >= 70 ? 'text-blue-700 bg-blue-50' : 'text-amber-700 bg-amber-50'}`}>
                                {subjectAvg}%
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  )}

                  {/* Platform Engagement */}
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3">Platform Activity</h3>
                    <div className="space-y-2 text-sm text-zinc-600">
                      <div className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" /><span>{dashboardStats?.studyStreak ?? 0}-day study streak</span></div>
                      <div className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" /><span>{completedTasks.length} tasks completed</span></div>
                      <div className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" /><span>{courses.length} courses enrolled</span></div>
                    </div>
                  </section>

                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="col-span-2 space-y-8">

                  {/* Courses Section */}
                  {courses.length > 0 && (
                    <section>
                      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Enrolled Courses
                      </h3>
                      <div className="space-y-3">
                        {courses.slice(0, 5).map(course => (
                          <div key={course.id} className="flex items-start justify-between border-l-4 border-indigo-200 pl-4 py-1">
                            <div>
                              <p className="font-bold text-zinc-800">{course.name}</p>
                              {course.description && <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{course.description}</p>}
                            </div>
                            <span className={`ml-3 flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full ${(course.progress ?? 0) >= 100 || course.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                              {(course.progress ?? 0) >= 100 || course.status === 'completed' ? 'Completed' : `${course.progress ?? 0}%`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Recent Grades / Assessments */}
                  {grades.length > 0 && (
                    <section>
                      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                        <Award className="w-4 h-4" /> Recent Assessments
                      </h3>
                      <div className="space-y-2">
                        {grades.slice(0, 6).map(g => {
                          const pct = Math.round((g.grade / g.total_points) * 100);
                          return (
                            <div key={g.id} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                              <div>
                                <p className="font-semibold text-zinc-800 text-sm">{g.assignment_name}</p>
                                <p className="text-xs text-zinc-400">{g.subject} · {new Date(g.date_recorded).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-zinc-800">{g.grade}/{g.total_points}</p>
                                <p className={`text-xs font-bold ${pct >= 90 ? 'text-emerald-600' : pct >= 70 ? 'text-blue-600' : 'text-amber-600'}`}>{pct}%</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Completed Tasks / Projects */}
                  {completedTasks.length > 0 && (
                    <section>
                      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Completed Projects &amp; Assignments
                      </h3>
                      <div className="space-y-3">
                        {completedTasks.slice(0, 5).map(task => (
                          <div key={task.id} className="relative pl-5 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-indigo-400">
                            <p className="font-semibold text-zinc-800">{task.title}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">Completed · {new Date(task.updated_at || task.created_at).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Footer note */}
                  <div className="mt-12 pt-6 border-t border-zinc-200 text-xs text-zinc-400 flex justify-between items-center font-medium">
                    <span>Generated by MARGDARSHAK Platform</span>
                    <span>{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>

                </div>
              </div>

            </div>
          </motion.div>

          {/* ── Platform Footer ── */}
          <footer className="relative mt-12 border-t border-white/5 bg-black/40 backdrop-blur-3xl overflow-hidden rounded-[2.5rem] print:hidden">
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
                className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"
              />
            </div>

            <div className="relative max-w-7xl mx-auto px-10 py-12 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                <div className="space-y-6">
                  <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                    <h3 className="text-3xl font-black tracking-tighter text-white flex items-center gap-2">
                      <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 bg-clip-text text-transparent uppercase italic">Margdarshak</span>
                    </h3>
                    <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.5em] mt-1 ml-1">by VSAV GYANTAPA</p>
                  </motion.div>
                  <p className="text-zinc-400 text-xs leading-relaxed max-w-xs font-medium">
                    The ultimate AI-powered academic command center.
                  </p>
                  <div className="flex items-center gap-4">
                    {[
                      { icon: TwitterLogo, href: "https://x.com/gyantappas" },
                      { icon: FacebookLogo, href: "https://www.facebook.com/profile.php?id=61584618795158" },
                      { icon: linkedinLogo, href: "https://www.linkedin.com/in/vsav-gyantapa-33893a399/" }
                    ].map((social, i) => (
                      <motion.a
                        key={i}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.2, y: -4, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-white/5 rounded-xl border border-white/10 transition-all text-zinc-400 hover:text-white"
                      >
                        <social.icon />
                      </motion.a>
                    ))}
                  </div>
                </div>

                {[
                  { title: "Platform", links: [{ name: "Dashboard", href: "/dashboard" }, { name: "AI Assistant", href: "/ai-assistant" }] },
                  { title: "Legal", links: [{ name: "Terms", href: "/terms" }, { name: "Privacy", href: "/privacy" }] },
                  { title: "Support", links: [{ name: "Help", href: "/help" }] }
                ].map((section, i) => (
                  <div key={i} className="space-y-6">
                    <h4 className="text-white font-black text-[9px] uppercase tracking-[0.4em]">{section.title}</h4>
                    <ul className="space-y-4">
                      {section.links.map((link, j) => (
                        <li key={j}>
                          <Link to={link.href} className="text-zinc-500 hover:text-white transition-colors text-xs font-bold flex items-center group">
                            <motion.span whileHover={{ x: 6 }} className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] opacity-0 group-hover:opacity-100 transition-all" />
                              {link.name}
                            </motion.span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                  © 2026 <span className="text-white">VSAV GYANTAPA</span>. ALL RIGHTS RESERVED.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-indigo-400 text-[8px] font-black uppercase tracking-[0.2em]">AI Active</span>
                  </div>
                </div>
              </div>
            </div>
          </footer>

        </div>
      </ScrollArea>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
          @page { margin: 1cm; size: A4; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
        }
      ` }} />
    </div>
  );
};

export default PortfolioBuilder;
