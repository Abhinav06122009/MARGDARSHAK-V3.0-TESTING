import React, { useState, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, X, Command, Search, Star,
  ChevronRight, BrainCircuit, Library, ImageIcon,
  GraduationCap, FileText, Sparkles, BarChart3,
  Trophy, Calendar, Book, Headphones, Settings,
  Briefcase, Timer, MousePointer2, User, Hash,
  Clock, ArrowUp, LayoutGrid, ClipboardCheck,
  Target, ShieldCheck, FileSearch, HelpCircle,
  Shield, Newspaper, Download, Info, Mail,
  HeartPulse
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { useDock } from '@/contexts/DockContext';

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

const SECTION_TO_ACTION: Record<string, string> = {
  dashboard: 'Dashboard',
  tasks: 'Tasks',
  analytics: 'AI Analytics',
  courses: 'Courses',
  progress: 'Progress',
  'ai-assistant': 'AI Assistant',
  'focus-timer': 'Focus Timer',
  timetable: 'Timetable',
  notes: 'Notes',
};

const ALL_ACTIONS: Action[] = [
  // --- CORE & IDENTITY ---
  { icon: LayoutGrid, title: 'Dashboard', subtitle: 'Main command center', color: 'from-blue-600 to-indigo-700', path: '/dashboard', category: 'General', keywords: ['dash', 'home'] },
  { icon: User, title: 'Profile', subtitle: 'Universal holographic ID', color: 'from-zinc-400 to-zinc-600', path: '/profile', category: 'General', keywords: ['user', 'account'] },
  { icon: Sparkles, title: 'Premium Upgrade', subtitle: 'Ascend to Elite status', color: 'from-yellow-400 to-amber-600', path: '/upgrade', category: 'General', keywords: ['upgrade', 'premium'] },
  { icon: Settings, title: 'Settings', subtitle: 'Platform parameters', color: 'from-zinc-500 to-zinc-700', path: '/settings', category: 'General', keywords: ['config'] },
  
  // --- AI & COGNITIVE ---
  { icon: BrainCircuit, title: 'AI Assistant', subtitle: 'Chat with Saarthi', color: 'from-amber-400 to-orange-500', path: '/ai-assistant', category: 'AI Tools', keywords: ['ai', 'chat', 'tutor'] },
  { icon: Sparkles, title: 'Study Planner', subtitle: 'AI Study Planner', color: 'from-emerald-400 to-teal-500', path: '/study-planner', category: 'AI Tools', keywords: ['plan', 'schedule'] },
  { icon: GraduationCap, title: 'Quiz Gen', subtitle: 'AI MCQ Generator', color: 'from-purple-500 to-violet-600', path: '/quiz', category: 'AI Tools', keywords: ['quiz', 'mcq'] },
  { icon: FileText, title: 'Essay Helper', subtitle: 'AI writing assistance', color: 'from-sky-400 to-blue-500', path: '/essay-helper', category: 'AI Tools', keywords: ['essay', 'write'] },
  { icon: Library, title: 'Flashcards', subtitle: 'Spaced repetition', color: 'from-lime-400 to-emerald-500', path: '/flashcards', category: 'AI Tools', keywords: ['memory', 'flash'] },
  { icon: ImageIcon, title: 'Doubt Solver', subtitle: 'Snap to solve', color: 'from-pink-500 to-rose-500', path: '/doubt-solver', category: 'AI Tools', keywords: ['solve', 'doubt'] },
  { icon: Sparkles, title: 'Smart Notes', subtitle: 'AI note enhancement', color: 'from-violet-500 to-fuchsia-600', path: '/smart-notes', category: 'AI Tools', keywords: ['notes', 'ai'] },

  // --- ACADEMICS ---
  { icon: BarChart3, title: 'Progress', subtitle: 'Growth analytics', color: 'from-indigo-400 to-blue-600', path: '/progress', category: 'Academic', keywords: ['progress'] },
  { icon: GraduationCap, title: 'Courses', subtitle: 'Curriculum hub', color: 'from-violet-400 to-purple-600', path: '/courses', category: 'Academic', keywords: ['study'] },
  { icon: Book, title: 'Notes', subtitle: 'Management enclave', color: 'from-orange-400 to-amber-600', path: '/notes', category: 'Academic', keywords: ['notes'] },
  { icon: ClipboardCheck, title: 'Tasks', subtitle: 'Workload tracker', color: 'from-blue-400 to-indigo-600', path: '/tasks', category: 'Academic', keywords: ['todo'] },
  { icon: Calendar, title: 'Timetable', subtitle: 'Daily schedule', color: 'from-cyan-400 to-blue-600', path: '/timetable', category: 'Academic', keywords: ['time'] },
  { icon: Book, title: 'Syllabus', subtitle: 'Completion status', color: 'from-emerald-400 to-green-600', path: '/syllabus', category: 'Academic', keywords: ['syllabi'] },
  { icon: Target, title: 'Focus Timer', subtitle: 'Pomodoro module', color: 'from-rose-400 to-red-500', path: '/timer', category: 'Academic', keywords: ['focus'] },
  { icon: HeartPulse, title: 'Wellness', subtitle: 'Mind & Body', color: 'from-emerald-400 to-teal-600', path: '/wellness', category: 'Academic', keywords: ['wellness', 'health'] },

  // --- SYSTEM & LEGAL ---
  { icon: ShieldCheck, title: 'System Status', subtitle: 'Matrix health', color: 'from-emerald-400 to-green-500', path: '/status', category: 'System', keywords: ['status'] },
  { icon: HelpCircle, title: 'Help Center', subtitle: 'Support hub', color: 'from-teal-500 to-emerald-600', path: '/help', category: 'System', keywords: ['support'] },
  { icon: Newspaper, title: 'Blog', subtitle: 'Updates & tips', color: 'from-blue-400 to-cyan-500', path: '/blog', category: 'System', keywords: ['news'] },
  { icon: Shield, title: 'Privacy', subtitle: 'Data standards', color: 'from-zinc-400 to-zinc-600', path: '/privacy', category: 'Legal', keywords: ['legal'] },
  { icon: Shield, title: 'Terms', subtitle: 'Accord guidelines', color: 'from-zinc-400 to-zinc-600', path: '/terms', category: 'Legal', keywords: ['legal'] },
  { icon: Download, title: 'Downloads', subtitle: 'Platform access', color: 'from-zinc-500 to-zinc-700', path: '/download', category: 'General', keywords: ['app'] },
  { icon: Info, title: 'About Us', subtitle: 'Mission overview', color: 'from-blue-500 to-indigo-600', path: '/about', category: 'General', keywords: ['team'] },
  { icon: Mail, title: 'Contact', subtitle: 'Direct channel', color: 'from-cyan-500 to-blue-600', path: '/contact', category: 'General', keywords: ['email'] },
];

const DOCK_ACTIONS = ALL_ACTIONS.filter(a => ['Dashboard', 'AI Assistant', 'Timetable', 'Tasks', 'Focus Timer', 'Notes', 'Courses', 'Progress'].includes(a.title));

interface GlobalQuickActionsProps {
  isDocked?: boolean;
}

export const GlobalQuickActions: React.FC<GlobalQuickActionsProps> = ({ isDocked = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useContext(AuthContext);
  const { activeSection } = useDock();

  const filteredActions = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return ALL_ACTIONS;
    return ALL_ACTIONS.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.subtitle.toLowerCase().includes(q) || 
      a.category.toLowerCase().includes(q) ||
      a.keywords.some(k => k.includes(q))
    );
  }, [query]);

  const categories = useMemo(() => {
    const groups: Record<string, Action[]> = {};
    filteredActions.forEach(a => {
      if (!groups[a.category]) groups[a.category] = [];
      groups[a.category].push(a);
    });
    return groups;
  }, [filteredActions]);

  const activeActionTitle = useMemo(() => {
    if (activeSection && SECTION_TO_ACTION[activeSection]) return SECTION_TO_ACTION[activeSection];

    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/tasks') return 'Tasks';
    if (path === '/progress' || path === '/grades') return 'Progress';
    if (path === '/courses') return 'Courses';
    if (path === '/timetable') return 'Timetable';
    if (path === '/notes') return 'Notes';
    if (path === '/timer') return 'Focus Timer';
    if (path === '/ai-assistant') return 'AI Assistant';
    if (path === '/ai-analytics') return 'AI Analytics';

    return null;
  }, [activeSection, location.pathname]);

  if (!session) return null;

  const outerClass = isDocked ? 'relative z-0' : 'fixed bottom-6 left-6 z-[999999]';
  const dockWidthClass = isDocked ? 'w-[min(92vw,700px)] max-w-[700px]' : '';

  return (
    <div className={outerClass} style={isDocked ? {} : { position: 'fixed' }}>
      <motion.div
        drag={!isDocked}
        dragMomentum={false}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`pointer-events-auto ${isDocked ? '' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <div className={`flex items-center gap-1 p-2 bg-[#1A1A1A]/90 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ${dockWidthClass}`}>
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="relative w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg"
            >
              <Zap size={20} fill="currentColor" />
            </motion.button>
          </div>

          <div className="h-8 w-px bg-white/10 mx-2 shrink-0" />

          <div className={`flex items-center gap-1 pr-2 ${isDocked ? 'overflow-x-auto whitespace-nowrap flex-1' : ''}`}>
            {DOCK_ACTIONS.map((action, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.2, y: -4 }} whileTap={{ scale: 0.9 }}
                onClick={() => navigate(action.path)}
                className={`rounded-xl flex items-center justify-center transition-all group relative shrink-0 ${isDocked ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-10 h-10'} ${activeActionTitle === action.title ? 'text-white bg-white/10 shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_0_24px_rgba(99,102,241,0.22)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                <action.icon size={isDocked ? 16 : 18} className={activeActionTitle === action.title ? 'text-indigo-300' : ''} />
                <div className="absolute bottom-full mb-3 px-3 py-1.5 bg-black border border-white/10 rounded-lg text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
                  {action.title}
                </div>
              </motion.button>
            ))}
          </div>

          <div className="h-8 w-px bg-white/10 mx-2 shrink-0" />

          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors shrink-0"
          >
            <Search size={16} />
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[10000] pointer-events-auto"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="fixed inset-x-4 top-12 bottom-12 md:inset-x-24 md:top-24 md:bottom-24 z-[10001] pointer-events-auto"
            >
              <div className="w-full h-full bg-[#111111] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
                 <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-6 px-8 py-6 bg-white/5 rounded-[2rem] border border-white/10 focus-within:border-indigo-500/50 transition-all">
                       <Search size={28} className="text-zinc-500" />
                       <input 
                         autoFocus
                         type="text" 
                         value={query}
                         onChange={e => setQuery(e.target.value)}
                         placeholder="Search the entire MARGDARSHAK matrix..." 
                         className="bg-transparent border-none outline-none text-xl text-white w-full font-black placeholder:text-zinc-600 uppercase tracking-tight"
                       />
                       <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-all">
                         <X size={24} />
                       </button>
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">
                    {Object.entries(categories).map(([cat, actions]) => (
                      <div key={cat} className="space-y-6">
                        <div className="flex items-center gap-3 px-4">
                           <Hash size={14} className="text-indigo-500" />
                           <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">{cat}</h3>
                           <div className="flex-1 h-px bg-white/5 ml-4" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {actions.map((a, i) => (
                             <motion.button 
                               key={i} 
                               whileHover={{ x: 8 }}
                               onClick={() => { navigate(a.path); setIsOpen(false); }} 
                              className={`flex items-center gap-5 p-5 rounded-[2rem] bg-white/[0.03] border transition-all text-left group ${activeActionTitle === a.title ? 'border-indigo-500/30 bg-white/[0.07]' : 'border-transparent hover:border-white/10 hover:bg-white/[0.06]'}`}
                             >
                               <div className={`p-4 rounded-2xl bg-gradient-to-br ${a.color} shadow-lg shadow-black/50 transition-transform ${activeActionTitle === a.title ? 'scale-110 ring-2 ring-indigo-400/30' : 'group-hover:scale-110'}`}>
                                 <a.icon size={22} className={`text-white ${activeActionTitle === a.title ? 'drop-shadow-[0_0_12px_rgba(165,180,252,0.6)]' : ''}`} />
                               </div>
                               <div className="flex-1">
                                 <p className={`text-sm font-black uppercase tracking-tight transition-colors ${activeActionTitle === a.title ? 'text-indigo-300' : 'text-white group-hover:text-indigo-400'}`}>{a.title}</p>
                                 <p className={`text-[10px] font-bold mt-0.5 ${activeActionTitle === a.title ? 'text-zinc-300' : 'text-zinc-500'}`}>{a.subtitle}</p>
                               </div>
                               <ChevronRight size={16} className={`transition-all ${activeActionTitle === a.title ? 'text-indigo-300' : 'text-zinc-700 group-hover:text-white'}`} />
                             </motion.button>
                           ))}
                        </div>
                      </div>
                    ))}

                    {filteredActions.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                         <FileSearch size={48} className="text-zinc-800" />
                         <p className="text-zinc-500 font-bold">No sectors matching "{query}" found in current matrix.</p>
                      </div>
                    )}
                 </div>

                 <div className="px-12 py-6 bg-black/40 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Protocol Active</span>
                       </div>
                       <span className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">{ALL_ACTIONS.length} sectors indexed</span>
                    </div>
                    <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">MARGDARSHAK OS V3.0</p>
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalQuickActions;
