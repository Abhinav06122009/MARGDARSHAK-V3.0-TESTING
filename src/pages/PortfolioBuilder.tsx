import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, Download, Trophy, GraduationCap, Target, ArrowLeft, Star,
  BookOpen, TrendingUp, Award, Loader2, Mail, ExternalLink, Printer,
  Activity, Zap, Shield, Sparkles, Cpu, Layers
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useDashboardData } from '@/hooks/useDashboardData';
import { dashboardService } from '@/lib/dashboardService';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { translateClerkIdToUUID } from '@/lib/id-translator';

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
  const userName = (currentUser as any)?.profile?.full_name ?? currentUser?.email ?? 'SCHOLAR_UNIT';

  useEffect(() => {
    const fetchData = async () => {
      const secureUser = await dashboardService.getCurrentUser();
      if (!secureUser) { setLoading(false); return; }

      const translatedId = await translateClerkIdToUUID(secureUser.id);

      const [gradesRes, coursesRes] = await Promise.all([
        supabase.from('grades').select('*').eq('user_id', translatedId),
        supabase.from('courses').select('*').eq('user_id', translatedId),
      ]);

      if (gradesRes.data) {
        setAllGrades(gradesRes.data.sort((a: any, b: any) => 
          new Date(b.date_recorded).getTime() - new Date(a.date_recorded).getTime()
        ));
      }
      if (coursesRes.data) setAllCourses(coursesRes.data as Course[]);
      setLoading(false);
    };
    fetchData();
  }, []);

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
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-8 text-zinc-500">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 flex items-center justify-center shadow-2xl">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        </div>
        <p className="animate-pulse uppercase tracking-[0.5em] font-black text-[10px] italic">Synchronizing Neural Portfolio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 overflow-x-hidden font-sans selection:bg-emerald-500/30 relative">
      <AmbientBackground />

      <ScrollArea className="h-screen w-full relative z-10 print:h-auto print:overflow-visible">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 print:p-0 print:m-0 space-y-16">

          {/* Page Controls */}
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-8 print:hidden bg-white/[0.01] backdrop-blur-3xl border border-white/5 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-8 relative z-10">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="p-4 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] rounded-2xl transition-all shadow-2xl group/back active:scale-95"
              >
                <ArrowLeft className="w-6 h-6 text-zinc-400 group-hover/back:text-emerald-500 transition-colors" />
              </button>
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-3"
                >
                  <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">Live Architecture Generation</span>
                </motion.div>
                <h1 className="text-3xl md:text-5xl font-black flex items-center gap-6 tracking-tighter uppercase italic text-white leading-none">
                  Neural <span className="text-emerald-500">Portfolio</span>
                </h1>
                <p className="text-zinc-600 text-[10px] uppercase tracking-[0.4em] font-black mt-3 italic opacity-60">
                  Autonomous academic resume synthesis for global career navigation.
                </p>
              </div>
            </div>
            
            <button
              onClick={handlePrint}
              className="flex items-center gap-4 px-10 py-5 bg-emerald-500 text-black rounded-[2rem] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all font-black text-xs uppercase tracking-[0.2em] italic active:scale-95 relative z-10 group/btn"
            >
              <Printer className="w-5 h-5 group-hover/btn:scale-125 transition-transform" /> 
              Generate Artifact
            </button>
          </motion.div>

          {/* Stats Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 print:hidden"
          >
            {[
              { label: 'Neural Records', value: grades.length, icon: <Award className="w-6 h-6 text-amber-500" />, color: 'border-amber-500/20 bg-amber-500/5' },
              { label: 'Learning Velocity', value: `${avgGrade}%`, icon: <TrendingUp className="w-6 h-6 text-emerald-500" />, color: 'border-emerald-500/20 bg-emerald-500/5' },
              { label: 'Active Sectors', value: courses.length, icon: <BookOpen className="w-6 h-6 text-blue-500" />, color: 'border-blue-500/20 bg-blue-500/5' },
              { label: 'Mission Success', value: completedTasks.length, icon: <Trophy className="w-6 h-6 text-indigo-500" />, color: 'border-indigo-500/20 bg-indigo-500/5' },
            ].map((s, i) => (
              <motion.div 
                whileHover={{ y: -8, scale: 1.02 }} 
                key={s.label} 
                className={`bg-white/[0.01] backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 flex items-center gap-6 shadow-2xl transition-all duration-700 group ${s.color.replace('border', 'hover:border')}`}
              >
                <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 group-hover:scale-110 transition-transform shadow-inner">
                   {s.icon}
                </div>
                <div>
                  <p className="text-4xl font-black text-white tracking-tighter italic leading-none">{s.value}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 mt-3 italic group-hover:text-zinc-400 transition-colors">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── RESUME DOCUMENT ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white text-zinc-900 rounded-[4rem] shadow-[0_80px_150px_-50px_rgba(0,0,0,0.8)] overflow-hidden print:shadow-none print:rounded-none relative z-10"
            ref={resumeRef}
          >
            <div className="p-16 md:p-24 min-h-[1120px] bg-white print:min-h-full font-serif">

              {/* ── Header ── */}
              <div className="flex justify-between items-start pb-12 mb-12 border-b-[5px] border-emerald-500">
                <div>
                  <h1 className="text-6xl font-black text-zinc-900 tracking-tighter font-sans uppercase italic">
                    {userName}
                  </h1>
                  <p className="text-2xl text-emerald-600 font-black mt-3 font-sans uppercase italic tracking-tight">{title}</p>
                  <div className="flex items-center gap-8 mt-6 text-sm text-zinc-500 font-sans font-black uppercase tracking-widest italic opacity-60">
                    <span className="flex items-center gap-2.5"><Mail className="w-5 h-5 text-emerald-500" />{userEmail}</span>
                    <span className="flex items-center gap-2.5"><Activity className="w-5 h-5 text-emerald-500" />{dashboardStats?.studyStreak ?? 0}-DAY STREAK</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-zinc-900 text-emerald-500 text-5xl font-black px-10 py-5 rounded-[2.5rem] font-sans shadow-2xl italic tracking-tighter">
                    {avgGrade}<span className="text-2xl opacity-60 tracking-normal">%</span>
                  </div>
                  <p className="text-[10px] font-black text-zinc-400 mt-4 uppercase tracking-[0.4em] font-sans italic">ACADEMIC_VELOCITY</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-24 font-sans">

                {/* ── LEFT COLUMN ── */}
                <div className="col-span-1 space-y-12">

                  {/* Academic Performance */}
                  <section>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-6 italic border-b border-zinc-100 pb-2">Diagnostic_Metrics</h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-[11px] mb-2 font-black uppercase tracking-widest text-zinc-500 italic">
                          <span>Sync Velocity</span>
                          <span className="text-emerald-600">{avgGrade}%</span>
                        </div>
                        <div className="h-3 bg-zinc-50 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${avgGrade}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-2 font-black uppercase tracking-widest text-zinc-500 italic">
                          <span>Mission Completion</span>
                          <span className="text-emerald-600">{dashboardStats?.completionRate ?? 0}%</span>
                        </div>
                        <div className="h-3 bg-zinc-50 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${dashboardStats?.completionRate ?? 0}%` }} />
                        </div>
                      </div>
                      {Object.entries(gradeLetterDistribution).length > 0 && (
                        <div className="mt-8">
                          <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em] mb-4 italic">Neural Distribution</p>
                          <div className="flex gap-3 flex-wrap">
                            {Object.entries(gradeLetterDistribution).sort().map(([letter, count]) => (
                              <div key={letter} className="text-center">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black italic shadow-xl ${letter === 'A' ? 'bg-emerald-50 text-emerald-600' : letter === 'B' ? 'bg-zinc-50 text-zinc-600' : 'bg-zinc-50 text-zinc-400'}`}>
                                  {letter}
                                </div>
                                <p className="text-[10px] font-black text-zinc-400 mt-2 italic">{count}</p>
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
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-6 italic border-b border-zinc-100 pb-2">Active_Sectors</h3>
                      <ul className="space-y-4">
                        {uniqueSubjects.slice(0, 8).map((subj, i) => {
                          const subjectGrades = grades.filter(g => g.subject === subj);
                          const subjectAvg = Math.round(subjectGrades.reduce((a, g) => a + (g.grade / g.total_points) * 100, 0) / subjectGrades.length);
                          return (
                            <li key={i} className="flex items-center justify-between group">
                              <span className="text-[11px] text-zinc-700 font-black uppercase tracking-widest italic group-hover:text-emerald-500 transition-colors">{subj}</span>
                              <span className={`text-[10px] font-black px-3 py-1 rounded-xl italic tracking-tighter ${subjectAvg >= 90 ? 'text-emerald-600 bg-emerald-50' : 'text-zinc-500 bg-zinc-50'}`}>
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
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-6 italic border-b border-zinc-100 pb-2">System_Integrity</h3>
                    <div className="space-y-4 text-[11px] text-zinc-600 font-black uppercase tracking-widest italic">
                      <div className="flex items-center gap-3"><CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" /><span>{dashboardStats?.studyStreak ?? 0}-Day Continuity</span></div>
                      <div className="flex items-center gap-3"><CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" /><span>{completedTasks.length} Operations Resolved</span></div>
                      <div className="flex items-center gap-3"><CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" /><span>{courses.length} Sectors Activated</span></div>
                    </div>
                  </section>

                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="col-span-2 space-y-12">

                  {/* Courses Section */}
                  {courses.length > 0 && (
                    <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-8 italic flex items-center gap-4">
                        <BookOpen className="w-5 h-5 text-emerald-500" /> Sector Enrolment Matrix
                      </h3>
                      <div className="grid gap-6">
                        {courses.slice(0, 5).map(course => (
                          <div key={course.id} className="flex items-start justify-between border-l-[3px] border-emerald-500 pl-8 py-3 bg-zinc-50/50 rounded-r-[1.5rem] group hover:bg-zinc-50 transition-colors">
                            <div>
                              <p className="text-lg font-black text-zinc-800 uppercase italic tracking-tight group-hover:text-emerald-600 transition-colors">{course.name}</p>
                              {course.description && <p className="text-[10px] text-zinc-400 mt-2 italic font-medium uppercase tracking-widest line-clamp-1">{course.description}</p>}
                            </div>
                            <span className={`ml-4 flex-shrink-0 text-[10px] font-black px-4 py-2 rounded-2xl italic tracking-widest shadow-sm ${(course.progress ?? 0) >= 100 || course.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-zinc-400 border border-zinc-100'}`}>
                              {(course.progress ?? 0) >= 100 || course.status === 'completed' ? 'STABLE' : `${course.progress ?? 0}%_SYNC`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Recent Grades / Assessments */}
                  {grades.length > 0 && (
                    <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-8 italic flex items-center gap-4">
                        <Award className="w-5 h-5 text-emerald-500" /> Assessment Diagnostics
                      </h3>
                      <div className="space-y-4">
                        {grades.slice(0, 6).map(g => {
                          const pct = Math.round((g.grade / g.total_points) * 100);
                          return (
                            <div key={g.id} className="flex items-center justify-between py-4 border-b border-zinc-50 last:border-0 group">
                              <div className="flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
                                   <Zap className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-black text-zinc-800 text-[11px] uppercase italic tracking-widest">{g.assignment_name}</p>
                                  <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.2em] italic mt-1">{g.subject} · {new Date(g.date_recorded).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-zinc-800 italic tracking-tighter">{g.grade}/{g.total_points}</p>
                                <p className={`text-[10px] font-black italic tracking-widest mt-1 ${pct >= 90 ? 'text-emerald-600' : 'text-zinc-400'}`}>{pct}%_VAL</p>
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
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-8 italic flex items-center gap-4">
                        <Target className="w-5 h-5 text-emerald-500" /> Operational Achievements
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {completedTasks.slice(0, 6).map(task => (
                          <div key={task.id} className="p-5 bg-zinc-50/50 rounded-[1.5rem] border border-zinc-100 group hover:border-emerald-500/20 transition-all flex items-start gap-4">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform">
                               <Shield className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-black text-zinc-800 text-[10px] uppercase italic tracking-widest leading-relaxed line-clamp-2">{task.title}</p>
                              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest italic mt-2">RESOLVED · {new Date(task.updated_at || task.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Footer note */}
                  <div className="mt-20 pt-10 border-t-[3px] border-zinc-100 text-[9px] text-zinc-300 flex justify-between items-center font-black uppercase tracking-[0.5em] italic">
                    <span className="flex items-center gap-4">
                       <Sparkles className="w-4 h-4 text-emerald-500" />
                       MARGDARSHAK_GENERATIVE_ARTIFACT
                    </span>
                    <span>{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>

                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </ScrollArea>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
          @page { margin: 0; size: A4; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:m-0 { margin: 0 !important; }
        }
      ` }} />
    </div>
  );
};

export default PortfolioBuilder;
