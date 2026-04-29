import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Plus, Trash2, ArrowLeft, Bell, Clock, AlertTriangle,
  GraduationCap, BookOpen, Target, Filter, ChevronDown, CheckCircle2,
  Loader2, Timer
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { dashboardService } from '@/lib/dashboardService';
import { translateClerkIdToUUID } from '@/lib/id-translator';

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

type ExamCategory = 'engineering' | 'medical' | 'university' | 'scholarship' | 'government' | 'other';

interface ExamDeadline {
  id: string;
  name: string;
  category: ExamCategory;
  date: string;
  registrationDeadline?: string;
  notes?: string;
  isCompleted: boolean;
}

const CATEGORY_CONFIG: Record<ExamCategory, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  engineering: { label: 'Engineering', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: <Target className="w-4 h-4" /> },
  medical: { label: 'Medical', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: <BookOpen className="w-4 h-4" /> },
  university: { label: 'University', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', icon: <GraduationCap className="w-4 h-4" /> },
  scholarship: { label: 'Scholarship', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: <BookOpen className="w-4 h-4" /> },
  government: { label: 'Government', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <Target className="w-4 h-4" /> },
  other: { label: 'Other', color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', icon: <Calendar className="w-4 h-4" /> },
};


const getDaysRemaining = (dateStr: string) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const DeadlineCard = React.forwardRef<HTMLDivElement, { exam: ExamDeadline; onDelete: (id: string) => void; onToggle: (id: string) => void }>(({ exam, onDelete, onToggle }, ref) => {
  const config = CATEGORY_CONFIG[exam.category] || CATEGORY_CONFIG.other;
  const examDays = getDaysRemaining(exam.date);
  const regDays = exam.registrationDeadline ? getDaysRemaining(exam.registrationDeadline) : null;
  const isExamPast = examDays < 0;
  const isRegUrgent = regDays !== null && regDays >= 0 && regDays <= 7;
  const isUrgent = examDays >= 0 && examDays <= 14;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`relative rounded-2xl border p-5 transition-all shadow-xl ${exam.isCompleted
          ? 'opacity-40 border-white/5 bg-white/[0.01] backdrop-blur-md'
          : isUrgent
            ? 'border-red-500/40 bg-red-500/[0.05] shadow-[0_0_20px_rgba(239,68,68,0.1)] backdrop-blur-3xl'
            : `bg-white/[0.02] backdrop-blur-3xl ${config.border} hover:border-white/20`
        }`}
    >
      {isRegUrgent && !exam.isCompleted && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3" /> REG CLOSING
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={() => onToggle(exam.id)}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${exam.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-500 hover:border-emerald-400'}`}
          >
            {exam.isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
          </button>
          <div className="min-w-0">
            <p className={`font-bold text-base leading-tight ${exam.isCompleted ? 'line-through text-zinc-500' : 'text-white'}`}>{exam.name}</p>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 px-2 py-0.5 rounded-full ${config.color} ${config.bg} border ${config.border}`}>
              {config.icon} {config.label}
            </span>
            {exam.notes && <p className="text-zinc-400 text-xs mt-2 leading-relaxed">{exam.notes}</p>}
          </div>
        </div>
        <button onClick={() => onDelete(exam.id)} className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold ${isExamPast ? 'bg-zinc-800 text-zinc-500' : isUrgent ? 'bg-red-500/20 text-red-300' : 'bg-white/5 text-zinc-200'}`}>
          <Calendar className="w-3.5 h-3.5" />
          <span>{isExamPast ? 'Exam Passed' : examDays === 0 ? 'TODAY!' : `${examDays}d to exam`}</span>
          <span className="text-zinc-500 font-normal text-xs">({new Date(exam.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})</span>
        </div>
        {exam.registrationDeadline && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${regDays !== null && regDays < 0 ? 'bg-zinc-800 text-zinc-600' : isRegUrgent ? 'bg-red-500/30 text-red-300 animate-pulse' : 'bg-amber-500/10 text-amber-300'}`}>
            <Bell className="w-3.5 h-3.5" />
            <span>{regDays !== null && regDays < 0 ? 'Reg. Closed' : `Reg. closes in ${regDays}d`}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
});

DeadlineCard.displayName = 'DeadlineCard';

// ... (types and helper functions stay the same)

const DeadlineTracker = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [exams, setExams] = useState<ExamDeadline[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState<ExamCategory | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'engineering' as ExamCategory, date: '', registrationDeadline: '', notes: '' });
  const [loading, setLoading] = useState(true);

  const fetchDeadlines = async () => {
    try {
      const user = await dashboardService.getCurrentUser();
      if (!user) return;

      const translatedId = await translateClerkIdToUUID(user.id);

      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('user_id', translatedId);

      if (error) throw error;

      const mappedExams: ExamDeadline[] = (data || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        category: d.category as ExamCategory,
        date: d.date,
        registrationDeadline: d.registration_deadline,
        notes: d.notes,
        isCompleted: d.is_completed
      }));
      
      setExams(mappedExams.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (err) {
      console.error("Error fetching deadlines:", err);
      toast({ title: "Error", description: "Failed to load deadlines.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.date) return;

    try {
      const user = await dashboardService.getCurrentUser();
      if (!user) return;

      const translatedId = await translateClerkIdToUUID(user.id);

      const { data, error } = await supabase.from('deadlines').insert({
        user_id: translatedId,
        name: form.name,
        category: form.category,
        date: form.date,
        registration_deadline: form.registrationDeadline || null,
        notes: form.notes || null,
        is_completed: false
      }).select().single();

      if (error) throw error;

      const newExam: ExamDeadline = {
        id: data.id,
        name: data.name,
        category: data.category as ExamCategory,
        date: data.date,
        registrationDeadline: data.registration_deadline,
        notes: data.notes,
        isCompleted: data.is_completed
      };

      setExams([...exams, newExam].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setForm({ name: '', category: 'engineering', date: '', registrationDeadline: '', notes: '' });
      setShowForm(false);
      toast({ title: "Deadline Added", description: `${form.name} added to your tracker.` });
    } catch (err) {
      console.error("Error adding deadline:", err);
      toast({ title: "Error", description: "Failed to add deadline.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const user = await dashboardService.getCurrentUser();
      if (!user) return;
      
      const translatedId = await translateClerkIdToUUID(user.id);

      const originalExams = [...exams];
      setExams(exams.filter(e => e.id !== id)); // Optimistic update
      
      const { error } = await supabase.from('deadlines').delete().eq('id', id).eq('user_id', translatedId);
      if (error) {
        setExams(originalExams);
        throw error;
      }
      toast({ title: "Deleted", description: "Deadline removed successfully." });
    } catch (err) {
      console.error("Error deleting deadline:", err);
      toast({ title: "Error", description: "Failed to delete deadline.", variant: "destructive" });
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const user = await dashboardService.getCurrentUser();
      if (!user) return;
      
      const translatedId = await translateClerkIdToUUID(user.id);

      const exam = exams.find(e => e.id === id);
      if (!exam) return;

      const newStatus = !exam.isCompleted;
      setExams(exams.map(e => e.id === id ? { ...e, isCompleted: newStatus } : e)); // Optimistic update

      const { error } = await supabase.from('deadlines').update({ 
        is_completed: newStatus, 
        updated_at: new Date().toISOString() 
      }).eq('id', id).eq('user_id', translatedId);

      if (error) throw error;
    } catch (err) {
      console.error("Error updating deadline:", err);
      toast({ title: "Error", description: "Failed to update deadline.", variant: "destructive" });
      fetchDeadlines(); // Revert
    }
  };

  const filtered = exams
    .filter(e => filterCat === 'all' || e.category === filterCat)
    .filter(e => showCompleted || !e.isCompleted)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcoming = exams.filter(e => !e.isCompleted && getDaysRemaining(e.date) >= 0 && getDaysRemaining(e.date) <= 30);
  const urgent = exams.filter(e => !e.isCompleted && getDaysRemaining(e.date) >= 0 && getDaysRemaining(e.date) <= 7);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 overflow-x-hidden font-sans selection:bg-indigo-500/30 relative">
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
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

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">

          {/* Page Controls */}
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8 bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-4 rounded-[2rem] shadow-2xl"
          >
            <div className="flex items-center gap-5">
              <button onClick={() => navigate('/dashboard')} className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all shadow-lg shadow-black/20">
                <ArrowLeft className="w-5 h-5 text-zinc-300" />
              </button>
              <div>
                <h1 className="text-xl font-black flex items-center gap-3 tracking-tighter uppercase italic text-white">
                  <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
                    <Timer className="w-5 h-5 text-amber-400" />
                  </div>
                  Exam Deadlines
                </h1>
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold mt-1 ml-1">
                  Track JEE, NEET, SAT, & University
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black rounded-xl hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.3)] font-black text-xs uppercase tracking-widest mr-2"
            >
              <Plus className="w-4 h-4" /> Add Deadline
            </button>
          </motion.div>

          {/* Alert banner */}
          {urgent.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-300">🚨 {urgent.length} deadline{urgent.length > 1 ? 's' : ''} within 7 days!</p>
                <p className="text-red-400 text-sm">{urgent.map(e => e.name).join(' · ')}</p>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Total Tracked', value: exams.length, color: 'text-white', glow: 'shadow-[0_0_15px_rgba(255,255,255,0.05)]' },
              { label: 'Upcoming (30d)', value: upcoming.length, color: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.15)]' },
              { label: 'Urgent (7d)', value: urgent.length, color: urgent.length > 0 ? 'text-red-400' : 'text-zinc-500', glow: urgent.length > 0 ? 'shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'shadow-[0_0_15px_rgba(255,255,255,0.05)]' },
              { label: 'Completed', value: exams.filter(e => e.isCompleted).length, color: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.15)]' },
            ].map((s, i) => (
              <motion.div whileHover={{ y: -4 }} key={s.label} className={`bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-[2rem] p-5 ${s.glow}`}>
                <p className={`text-4xl font-black tracking-tighter tabular-nums ${s.color}`}>{s.value}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Add Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-8 bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl"
              >
                <h3 className="font-black text-amber-400 mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em]"><Plus className="w-4 h-4" /> New Exam / Deadline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Exam / Event Name *</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. JEE Main 2025" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold placeholder-zinc-600 outline-none focus:border-amber-500 focus:bg-white/5 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as ExamCategory })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-amber-500 focus:bg-white/5 transition-all">
                      {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
                        <option key={key} value={key} className="bg-zinc-900">{val.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Exam Date *</label>
                    <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-amber-500 focus:bg-white/5 transition-all [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Registration Deadline (optional)</label>
                    <input type="date" value={form.registrationDeadline} onChange={e => setForm({ ...form, registrationDeadline: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-amber-500 focus:bg-white/5 transition-all [color-scheme:dark]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Notes (optional)</label>
                    <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Add any important details..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold placeholder-zinc-600 outline-none focus:border-amber-500 focus:bg-white/5 transition-all" />
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={handleAdd} className="px-6 py-3 bg-amber-500 text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]">Add to Tracker</button>
                  <button onClick={() => setShowForm(false)} className="px-6 py-3 bg-white/5 text-zinc-300 border border-white/10 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors">Cancel</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter Bar */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <button onClick={() => setFilterCat('all')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterCat === 'all' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'}`}>All</button>
            {(Object.keys(CATEGORY_CONFIG) as ExamCategory[]).map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterCat === cat ? `${CATEGORY_CONFIG[cat].bg} ${CATEGORY_CONFIG[cat].color} border ${CATEGORY_CONFIG[cat].border} shadow-[0_0_15px_rgba(255,255,255,0.1)]` : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                {CATEGORY_CONFIG[cat].label}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 cursor-pointer hover:text-white transition-colors">
              <input type="checkbox" checked={showCompleted} onChange={e => setShowCompleted(e.target.checked)} className="rounded accent-indigo-500 w-4 h-4" />
              Show Completed
            </label>
          </div>

          {/* Deadline Cards */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 text-zinc-500 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-md">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-black uppercase tracking-widest">No deadlines found</p>
                  <p className="text-xs font-semibold mt-2 opacity-60">Click "Add Deadline" to start tracking your exams.</p>
                </motion.div>
              ) : (
                filtered.map(exam => (
                  <DeadlineCard key={exam.id} exam={exam} onDelete={handleDelete} onToggle={handleToggle} />
                ))
              )}
            </AnimatePresence>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};

export default DeadlineTracker;
