import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, X, Command, Search, Star,
  ChevronRight, BrainCircuit, Library, ImageIcon,
  GraduationCap, FileText, Sparkles, BarChart3,
  Trophy, Calendar, Book, Headphones, Settings,
  Briefcase, Timer, MousePointer2, User, Hash,
  Clock, ArrowUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Action {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
  path: string;
  category: string;
  keywords: string[];
}

// ─── Master Action Registry ───────────────────────────────────────────────────
const ALL_ACTIONS: Action[] = [
  { icon: BrainCircuit, title: 'AI Tutor',        subtitle: 'Ask any academic question',       color: 'from-amber-400 to-orange-500',   path: '/ai-assistant',  category: 'AI Tools',   keywords: ['ai','tutor','question','assistant','chat'] },
  { icon: Library,     title: 'Flashcards',        subtitle: 'AI spaced repetition',            color: 'from-lime-400 to-emerald-500',   path: '/flashcards',    category: 'AI Tools',   keywords: ['flash','card','memory','spaced','repeat'] },
  { icon: GraduationCap, title: 'Quiz Generator',  subtitle: 'Test your knowledge with AI',    color: 'from-purple-500 to-violet-600',  path: '/quiz',          category: 'AI Tools',   keywords: ['quiz','test','exam','mcq','generate'] },
  { icon: FileText,    title: 'Essay Helper',       subtitle: 'AI writing assistance',           color: 'from-sky-400 to-blue-500',       path: '/essay-helper',  category: 'AI Tools',   keywords: ['essay','write','writing','draft','help'] },
  { icon: Sparkles,    title: 'Study Planner',      subtitle: 'AI-generated schedules',         color: 'from-emerald-400 to-teal-500',   path: '/study-planner', category: 'AI Tools',   keywords: ['plan','schedule','study','planner','time'] },
  { icon: BarChart3,   title: 'AI Analytics',       subtitle: 'Performance insights',           color: 'from-indigo-400 to-purple-500',  path: '/ai-analytics',  category: 'AI Tools',   keywords: ['analytics','insight','performance','stats','data'] },
  { icon: ImageIcon,   title: 'Doubt Solver',       subtitle: 'Snap to solve problems',         color: 'from-pink-500 to-rose-500',      path: '/doubt-solver',  category: 'AI Tools',   keywords: ['doubt','solve','photo','image','snap'] },
  { icon: Timer,       title: 'Study Timer',        subtitle: 'Pomodoro focus sessions',        color: 'from-rose-400 to-red-500',       path: '/timer',         category: 'Productivity', keywords: ['timer','pomodoro','focus','session','countdown'] },
  { icon: MousePointer2, title: 'Calculator',       subtitle: 'Scientific calculator',          color: 'from-slate-400 to-slate-600',    path: '/calculator',    category: 'Productivity', keywords: ['calc','math','calculator','formula'] },
  { icon: Briefcase,   title: 'Tasks',              subtitle: 'Manage your to-dos',             color: 'from-blue-400 to-indigo-600',    path: '/tasks',         category: 'Productivity', keywords: ['task','todo','to-do','manage','list'] },
  { icon: Book,        title: 'Notes',              subtitle: 'Smart note-taking',              color: 'from-orange-400 to-amber-600',   path: '/notes',         category: 'Productivity', keywords: ['note','notes','write','text','jot'] },
  { icon: Trophy,      title: 'Achievements',       subtitle: 'Badges & Leaderboard',           color: 'from-amber-400 to-yellow-500',   path: '/achievements',  category: 'Campus',     keywords: ['trophy','achieve','badge','leader','rank'] },
  { icon: Calendar,    title: 'Timetable',          subtitle: 'Schedule & events',              color: 'from-cyan-400 to-blue-600',      path: '/timetable',     category: 'Campus',     keywords: ['calendar','timetable','schedule','event','class'] },
  { icon: GraduationCap, title: 'Courses',          subtitle: 'Manage your courses',            color: 'from-violet-400 to-purple-600',  path: '/courses',       category: 'Campus',     keywords: ['course','subject','class','lecture','study'] },
  { icon: BarChart3,   title: 'Progress',           subtitle: 'Track your progress',            color: 'from-indigo-400 to-blue-600',    path: '/progress',      category: 'Campus',     keywords: ['progress','track','graph','chart','improve'] },
  { icon: Book,        title: 'Syllabus',           subtitle: 'Curriculum overview',            color: 'from-emerald-400 to-green-600',  path: '/syllabus',      category: 'Campus',     keywords: ['syllabus','curriculum','topic','chapter'] },
  { icon: Headphones,  title: 'Wellness',           subtitle: 'Mental & Physical health',       color: 'from-teal-400 to-cyan-600',      path: '/wellness',      category: 'Campus',     keywords: ['wellness','mental','health','relax','mood'] },
  { icon: Briefcase,   title: 'Portfolio Builder',  subtitle: 'Auto-generate resume from data', color: 'from-indigo-500 to-violet-600',  path: '/portfolio',     category: 'Career',     keywords: ['portfolio','resume','career','cv','job'] },
  { icon: Timer,       title: 'Exam Deadlines',     subtitle: 'JEE · NEET · SAT · University', color: 'from-amber-500 to-orange-600',   path: '/deadlines',     category: 'Career',     keywords: ['exam','deadline','jee','neet','sat','date'] },
  { icon: User,        title: 'Identity Hub',       subtitle: 'Profile & biometrics',           color: 'from-zinc-400 to-zinc-600',      path: '/profile',       category: 'Account',    keywords: ['profile','identity','user','account','bio'] },
  { icon: Settings,    title: 'Settings',           subtitle: 'Account & preferences',          color: 'from-zinc-500 to-zinc-700',      path: '/settings',      category: 'Account',    keywords: ['settings','preference','config','account'] },
];

const RECENT_KEY = 'mgs_recent_actions';

// ─── Component ────────────────────────────────────────────────────────────────
const GlobalQuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [recentPaths, setRecentPaths] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
  });
  const navigate = useNavigate();
  const { session } = useContext(AuthContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ x: 32, y: typeof window !== 'undefined' ? window.innerHeight - 200 : 400 });

  const handleDrag = (_: any, info: any) =>
    setPosition(prev => ({ x: prev.x + info.delta.x, y: prev.y + info.delta.y }));

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsOpen(p => !p); }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) { setQuery(''); setSelected(0); setTimeout(() => inputRef.current?.focus(), 80); }
  }, [isOpen]);

  // Filtered results
  const filteredActions = query.trim()
    ? ALL_ACTIONS.filter(a => {
        const q = query.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.subtitle.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.keywords.some(k => k.includes(q))
        );
      })
    : ALL_ACTIONS;

  // Recent actions (shown when no query)
  const recentActions = recentPaths
    .map(p => ALL_ACTIONS.find(a => a.path === p))
    .filter(Boolean) as Action[];

  const displayList = query.trim() ? filteredActions : (recentActions.length ? recentActions : ALL_ACTIONS.slice(0, 8));

  // Group by category when no query
  const grouped = query.trim()
    ? null
    : displayList.reduce((acc: Record<string, Action[]>, a) => {
        const cat = recentActions.length && recentPaths.includes(a.path) ? 'Recent' : a.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(a);
        return acc;
      }, {});

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(p => Math.min(p + 1, displayList.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(p => Math.max(p - 1, 0)); }
      if (e.key === 'Enter') { e.preventDefault(); if (displayList[selected]) goTo(displayList[selected]); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, selected, displayList]);

  // Auto-scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selected}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const goTo = useCallback((action: Action) => {
    navigate(action.path);
    setIsOpen(false);
    setRecentPaths(prev => {
      const next = [action.path, ...prev.filter(p => p !== action.path)].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, [navigate]);

  if (!session) return null;

  // Flat list for keyboard indexing
  const flatList = query.trim()
    ? filteredActions
    : (recentActions.length ? recentActions : ALL_ACTIONS.slice(0, 8));
  let flatIdx = 0;

  return (
    <>
      {/* ─── Floating Trigger ─────────────────────────────────────────────── */}
      <motion.button
        drag dragMomentum={false} onDrag={handleDrag}
        initial={false} animate={{ x: position.x, y: position.y }}
        whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed top-0 left-0 z-[100] w-14 h-14 rounded-2xl flex items-center justify-center border border-white/20 cursor-grab active:cursor-grabbing group"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 20px 50px rgba(99,102,241,0.5), 0 0 0 1px rgba(255,255,255,0.05)' }}
      >
        <Zap className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#050505]"
        />
        {/* Tooltip */}
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
          Quick Access <kbd className="ml-1 px-1 py-0.5 bg-white/10 rounded text-[8px]">⌘K</kbd>
        </div>
      </motion.button>

      {/* ─── Overlay + Panel ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[1000]"
            />

            {/* Panel */}
            <motion.div
              initial={{ 
                opacity: 0, 
                scale: 0.4, 
                x: position.x - 20, 
                y: position.y - 20,
                originX: 0,
                originY: 0
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                x: Math.min(Math.max(20, position.x - 250), window.innerWidth - 560),
                y: position.y > window.innerHeight / 2 
                   ? Math.max(20, position.y - 600) 
                   : Math.min(window.innerHeight - 620, position.y + 70)
              }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed z-[1001] w-[540px] max-w-[95vw] max-h-[80vh] flex flex-col rounded-[2rem] overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(10,10,15,0.98) 0%, rgba(15,15,25,0.96) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 60px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.06)'
              }}
            >
              {/* ── Search Header ── */}
              <div className="p-5 border-b border-white/[0.06]">
                <div className="relative flex items-center gap-4 px-5 py-4 rounded-xl bg-white/[0.04] border border-white/[0.06] focus-within:border-indigo-500/40 focus-within:bg-indigo-500/[0.04] transition-all">
                  <Search className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setSelected(0); }}
                    placeholder="Search tools, pages, features..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 font-medium focus:outline-none"
                  />
                  {query && (
                    <button onClick={() => setQuery('')} className="text-zinc-600 hover:text-white transition-colors">
                      <X size={14} />
                    </button>
                  )}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/10 rounded text-[9px] text-zinc-500 font-mono">↑↓</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/10 rounded text-[9px] text-zinc-500 font-mono">↵</kbd>
                  </div>
                </div>
              </div>

              {/* ── Results List ── */}
              <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {displayList.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Search className="w-10 h-10 text-zinc-700" />
                    <p className="text-zinc-500 text-sm font-medium">No results for <span className="text-white">"{query}"</span></p>
                  </div>
                )}

                {query.trim()
                  ? filteredActions.map((action, i) => {
                      const idx = flatIdx++;
                      return (
                        <ActionRow
                          key={action.path} action={action} isSelected={selected === idx}
                          dataIdx={idx}
                          onClick={() => goTo(action)}
                          onHover={() => setSelected(idx)}
                        />
                      );
                    })
                  : Object.entries(
                      (recentActions.length ? recentActions : ALL_ACTIONS.slice(0, 8)).reduce((acc: Record<string, Action[]>, a) => {
                        const cat = recentActions.length ? 'Recent' : a.category;
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(a);
                        return acc;
                      }, {})
                    ).map(([cat, actions]) => (
                      <div key={cat}>
                        <div className="flex items-center gap-2 px-3 py-1.5">
                          {cat === 'Recent' ? <Clock className="w-3 h-3 text-zinc-600" /> : <Hash className="w-3 h-3 text-zinc-700" />}
                          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{cat}</span>
                        </div>
                        {actions.map(action => {
                          const idx = flatIdx++;
                          return (
                            <ActionRow
                              key={action.path} action={action} isSelected={selected === idx}
                              dataIdx={idx}
                              onClick={() => goTo(action)}
                              onHover={() => setSelected(idx)}
                            />
                          );
                        })}
                      </div>
                    ))
                }
              </div>

              {/* ── Footer ── */}
              <div className="px-5 py-3.5 border-t border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Nexus_Active</span>
                  </div>
                  <span className="text-[9px] text-zinc-700 font-mono">{ALL_ACTIONS.length} tools indexed</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                  <X size={12} className="text-zinc-600" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Action Row ───────────────────────────────────────────────────────────────
const ActionRow: React.FC<{
  action: Action;
  isSelected: boolean;
  dataIdx: number;
  onClick: () => void;
  onHover: () => void;
}> = ({ action, isSelected, dataIdx, onClick, onHover }) => (
  <motion.button
    data-idx={dataIdx}
    onClick={onClick}
    onMouseEnter={onHover}
    whileTap={{ scale: 0.98 }}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left group ${
      isSelected
        ? 'bg-white/[0.07] border border-white/[0.1]'
        : 'hover:bg-white/[0.04] border border-transparent'
    }`}
  >
    <div className={`flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${action.color} shadow-lg`}>
      <action.icon size={16} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-zinc-100 group-hover:text-white truncate leading-tight">{action.title}</p>
      <p className="text-[11px] text-zinc-600 font-medium truncate mt-0.5">{action.subtitle}</p>
    </div>
    <div className={`transition-all duration-150 ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0'}`}>
      <ChevronRight size={14} className="text-zinc-400" />
    </div>
  </motion.button>
);

export default GlobalQuickActions;
