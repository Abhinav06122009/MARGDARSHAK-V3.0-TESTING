import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Sparkles, Clock, Target, ArrowLeft, Loader2, CheckCircle,
  Brain, Download, Volume2, VolumeX, X, Camera, Facebook, Twitter, Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { modelRouter } from '@/lib/ai/modelRouter';
import { useAI } from '@/contexts/AIContext';
import { jsPDF } from 'jspdf';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { dashboardService } from '@/lib/dashboardService';
import { translateClerkIdToUUID } from '@/lib/id-translator';

// Social Icons (Unified)

interface StudyPlan {
  overview: string;
  schedule: DaySchedule[];
  tips: string[];
  milestones: string[];
}

interface DaySchedule {
  day: string;
  sessions: StudySession[];
  totalHours: number;
}

interface StudySession {
  time: string;
  subject: string;
  activity: string;
  duration: string;
}

interface PlanConfig {
  subjects: string;
  examDate: string;
  dailyHours: string;
  weakAreas: string;
  studyStyle: string;
}

const StudyPlanner: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [config, setConfig] = useState<PlanConfig>({
    subjects: '',
    examDate: '',
    dailyHours: '3',
    weakAreas: '',
    studyStyle: 'balanced',
  });
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [completedSessions, setCompletedSessions] = useState<Set<string>>(new Set());
  const { isAIReady } = useAI();
  const { toast } = useToast();

  // Load existing plan on mount
  React.useEffect(() => {
    const loadPlan = async () => {
      const user = await dashboardService.getCurrentUser();
      if (!user) return;
      const translatedId = await translateClerkIdToUUID(user.id);

      const { data } = await (supabase
        .from('study_plans' as any) as any)
        .select('*')
        .eq('user_id', translatedId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const latestPlan = data[0];
        setPlan(latestPlan.plan as unknown as StudyPlan);
        setCompletedSessions(new Set((latestPlan.completed_sessions as string[]) || []));
        
        // Restore config if available
        if (latestPlan.config) {
          setConfig(latestPlan.config as unknown as PlanConfig);
        }
      }
    };
    loadPlan();
  }, []);

  const daysUntilExam = config.examDate
    ? Math.max(0, Math.ceil((new Date(config.examDate).getTime() - Date.now()) / 86400000))
    : 0;

  const generatePlan = useCallback(async () => {
    if (!config.subjects.trim()) {
      toast({ title: 'Subjects required', description: 'Please enter your subjects/topics.', variant: 'destructive' });
      return;
    }
    if (!isAIReady) {
      toast({ title: 'AI not ready', description: 'Please wait for AI to initialize.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    const daysInfo = config.examDate
      ? `Exam is in ${daysUntilExam} days (${config.examDate})`
      : 'No specific exam date (general study plan for 7 days)';

    const prompt = `Synthesize a high-density study plan for: ${config.subjects}.
Deadline: ${daysInfo}.
Available: ${config.dailyHours}h/day.
Focus: ${config.weakAreas || 'Balanced'}.
Style: ${config.studyStyle}.

Generate a 7-day schedule. Return ONLY valid JSON:
{
  "overview": "Summary",
  "schedule": [{"day": "Day 1", "sessions": [{"time": "Slot", "subject": "Topic", "activity": "Task", "duration": "Duration"}], "totalHours": 0}],
  "tips": ["Tip 1", "Tip 2"],
  "milestones": ["M1"]
}`;

    try {
      const result = await modelRouter.generateJSON<StudyPlan>(prompt);
      if (result && result.schedule && Array.isArray(result.schedule)) {
        setPlan(result);
        setCompletedSessions(new Set());

        // Save to Supabase
        const user = await dashboardService.getCurrentUser();
        if (user) {
          const translatedId = await translateClerkIdToUUID(user.id);
          await (supabase.from('study_plans' as any) as any).insert({
            user_id: translatedId,
            plan: result as any,
            config: config as any,
            completed_sessions: [],
            created_at: new Date().toISOString()
          });
        }
      } else {
        throw new Error('Invalid plan structure');
      }
    } catch (err) {
      console.error('Plan generation error:', err);
      toast({ title: 'Generation failed', description: 'Could not generate study plan. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [config, isAIReady, toast, daysUntilExam]);

  const toggleSession = async (sessionKey: string) => {
    const nextSessions = new Set(completedSessions);
    if (nextSessions.has(sessionKey)) nextSessions.delete(sessionKey);
    else nextSessions.add(sessionKey);
    
    setCompletedSessions(nextSessions);

    // Persist completed sessions to Supabase (Update the latest plan)
    const user = await dashboardService.getCurrentUser();
    if (user) {
      const translatedId = await translateClerkIdToUUID(user.id);
      const { data: plans } = await (supabase
        .from('study_plans' as any) as any)
        .select('id')
        .eq('user_id', translatedId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (plans && plans.length > 0) {
        await (supabase.from('study_plans' as any) as any).update({
          completed_sessions: Array.from(nextSessions)
        }).eq('id', plans[0].id);
      }
    }
  };

  const totalSessions = plan?.schedule.reduce((sum, day) => sum + day.sessions.length, 0) || 0;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions.size / totalSessions) * 100) : 0;

  const exportToPDF = () => {
    if (!plan) return;
    const doc = new jsPDF();
    const margin = 15;
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Study Plan', margin, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(plan.overview, margin, y, { maxWidth: doc.internal.pageSize.getWidth() - margin * 2 });
    y += 20;

    plan.schedule.forEach(day => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(day.day, margin, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      day.sessions.forEach(s => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`${s.time} - ${s.subject}: ${s.activity} (${s.duration})`, margin + 5, y);
        y += 5;
      });
      y += 5;
    });

    doc.save('study-plan.pdf');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,20,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Animated Neural Orbs */}
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px]"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
          {/* HEADER */}
          <header className="flex flex-col md:flex-row items-center justify-between p-6 glass-card rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative z-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.05] to-transparent pointer-events-none" />

            <div className="flex items-center gap-6">
              <button 
                onClick={() => onBack ? onBack() : window.history.back()}
              >
                <motion.div whileHover={{ scale: 1.1, x: -4 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="ghost" size="icon" className="h-12 w-12 text-zinc-400 hover:text-white hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                </motion.div>
              </button>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Calendar className="w-8 h-8 text-emerald-400 relative z-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Study <span className="text-emerald-400">Planner</span></h1>
                  <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-0.5">Academic Scheduling</p>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex items-center gap-3">
              {plan && (
                <Button
                  onClick={exportToPDF}
                  className="h-12 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              )}

            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="space-y-8 lg:col-span-1">
              <div className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                    <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">details</h2>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">subject</Label>
                    <Textarea
                      placeholder="Enumerate subjects or critical topics..."
                      value={config.subjects}
                      onChange={e => setConfig(c => ({ ...c, subjects: e.target.value }))}
                      className="bg-zinc-950/50 border-white/5 text-white placeholder:text-zinc-700 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40 min-h-[120px] rounded-2xl text-sm p-4 leading-relaxed transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Deadline</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={config.examDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setConfig(c => ({ ...c, examDate: e.target.value }))}
                        className="bg-zinc-950/50 border-white/5 h-12 rounded-2xl text-white focus:ring-emerald-500/20 transition-all font-bold text-xs uppercase tracking-widest px-4"
                      />
                      {config.examDate && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[8px] font-black text-amber-500 uppercase tracking-tighter"
                        >
                          {daysUntilExam}D REMAINING
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Daily Quota</Label>
                      <Select value={config.dailyHours} onValueChange={v => setConfig(c => ({ ...c, dailyHours: v }))}>
                        <SelectTrigger className="bg-zinc-950/50 border-white/5 h-12 rounded-2xl text-white font-bold text-xs uppercase tracking-widest">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                          {['1', '2', '3', '4', '5', '6', '8'].map(h => (
                            <SelectItem key={h} value={h} className="focus:bg-emerald-500/20 uppercase text-[10px] font-black tracking-widest">{h} HOURS</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Strategy</Label>
                      <Select value={config.studyStyle} onValueChange={v => setConfig(c => ({ ...c, studyStyle: v }))}>
                        <SelectTrigger className="bg-zinc-950/50 border-white/5 h-12 rounded-2xl text-white font-bold text-xs uppercase tracking-widest">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                          <SelectItem value="balanced" className="focus:bg-emerald-500/20 uppercase text-[10px] font-black tracking-widest">Balanced</SelectItem>
                          <SelectItem value="intensive" className="focus:bg-emerald-500/20 uppercase text-[10px] font-black tracking-widest">Intensive</SelectItem>
                          <SelectItem value="spaced" className="focus:bg-emerald-500/20 uppercase text-[10px] font-black tracking-widest">Spaced</SelectItem>
                          <SelectItem value="pomodoro" className="focus:bg-emerald-500/20 uppercase text-[10px] font-black tracking-widest">Pomodoro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">hard topics</Label>
                    <Input
                      placeholder="e.g., Quantum Mechanics, Fluid Dynamics..."
                      value={config.weakAreas}
                      onChange={e => setConfig(c => ({ ...c, weakAreas: e.target.value }))}
                      className="bg-zinc-950/50 border-white/5 h-12 rounded-2xl text-white placeholder:text-zinc-700 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40 text-sm px-4"
                    />
                  </div>

                  <Button
                    onClick={generatePlan}
                    disabled={loading || !config.subjects.trim()}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black h-16 rounded-[2rem] shadow-xl shadow-emerald-500/20 uppercase tracking-[0.3em] text-[10px] transition-all hover:translate-y-[-4px] group/btn overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin relative z-10" />Compiling...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2 relative z-10" />Generate Plan</>
                    )}
                  </Button>
                </div>
              </div>

              {plan && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center">{completedSessions.size} / {totalSessions} UNITS ARCHIVED</p>
                  </div>

                  <div className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-6 shadow-2xl space-y-4">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Brain className="w-4 h-4 text-emerald-400" />Strategic Insights
                    </p>
                    <div className="space-y-3">
                      {plan.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 group">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mt-1.5 group-hover:bg-emerald-400 transition-colors" />
                          <p className="text-xs text-zinc-400 font-medium leading-relaxed italic">"{tip}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-8">
              {!plan && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center min-h-[600px] glass-card border border-white/5 rounded-[3rem] text-center p-12"
                >
                  <div className="p-8 bg-white/5 rounded-[2.5rem] mb-6 group relative">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-[2.5rem] scale-110 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Calendar className="w-16 h-16 text-zinc-700 relative z-10" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-widest mb-3">System Idle</h3>
                  <p className="text-zinc-500 text-sm max-w-xs leading-relaxed font-medium uppercase tracking-wider">Awaiting Details to initiate academic pathfinding.</p>
                </motion.div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center min-h-[600px] gap-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-2 border-emerald-500/10 animate-ping absolute inset-0" />
                    <div className="w-24 h-24 rounded-full bg-emerald-500/5 flex items-center justify-center border border-emerald-500/20">
                      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-white font-black uppercase tracking-[0.4em] text-xs">Orchestrating Schedule</p>
                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Compiling high-density study blocks...</p>
                  </div>
                </div>
              )}

              {plan && (
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                      <Target size={150} />
                    </div>
                    <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">Strategic Overview</h3>
                    <p className="text-lg text-zinc-300 leading-[1.8] font-medium italic relative z-10">
                      \"{plan.overview}\"
                    </p>
                  </motion.div>

                  <div className="space-y-6">
                    {plan.schedule.map((day, dayIndex) => (
                      <motion.div
                        key={day.day}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: dayIndex * 0.1 }}
                        className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl group"
                      >
                        <div className="flex items-center justify-between px-8 py-5 bg-white/[0.03] border-b border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                            <span className="text-xs font-black text-white uppercase tracking-[0.2em]">{day.day}</span>
                          </div>
                          <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                            {day.totalHours}H QUANTUM
                          </div>
                        </div>

                        <div className="p-6 space-y-3">
                          {day.sessions.map((session, sessionIndex) => {
                            const sessionKey = `${dayIndex}-${sessionIndex}`;
                            const isDone = completedSessions.has(sessionKey);

                            return (
                              <motion.button
                                key={sessionIndex}
                                whileHover={{ scale: 1.01, x: 4 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => toggleSession(sessionKey)}
                                className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] text-left transition-all duration-500 ${isDone
                                  ? 'bg-emerald-500/10 border-emerald-500/20 opacity-60'
                                  : 'bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]'
                                  }`}
                              >
                                <div className={`w-10 h-10 rounded-2xl border flex-shrink-0 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-white/5 border-white/10 text-zinc-600'}`}>
                                  <CheckCircle className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDone ? 'text-zinc-600' : 'text-emerald-400'}`}>{session.time}</span>
                                    <span className={`text-base font-black tracking-tight ${isDone ? 'text-zinc-500 line-through' : 'text-white italic'}`}>
                                      {session.subject}
                                    </span>
                                  </div>
                                  <p className={`text-xs mt-1 font-medium ${isDone ? 'text-zinc-700' : 'text-zinc-400 opacity-80'}`}>
                                    {session.activity}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 px-3 py-1 bg-white/5 rounded-xl border border-white/5">
                                  <Clock className="w-3 h-3 text-zinc-600" />
                                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">{session.duration}</span>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {plan.milestones && plan.milestones.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-500/[0.03] border border-emerald-500/20 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-[0.05]">
                        <Target size={100} className="text-emerald-400" />
                      </div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Target className="w-4 h-4" />Strategic Milestones
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plan.milestones.map((m, i) => (
                          <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-start gap-4 hover:border-emerald-500/30 transition-all group">
                            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">{i + 1}</span>
                            <p className="text-sm text-zinc-300 font-medium leading-relaxed group-hover:text-white transition-colors italic">{m}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default StudyPlanner;
