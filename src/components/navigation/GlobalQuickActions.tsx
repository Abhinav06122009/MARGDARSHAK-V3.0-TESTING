import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  Zap, X, Command, Search, Star, Clock, 
  ChevronRight, BrainCircuit, Library, ImageIcon,
  GraduationCap, FileText, Sparkles, BarChart3,
  Trophy, Calendar, Book, Headphones, Settings,
  Briefcase, Timer, MousePointer2, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';

const GlobalQuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { session } = useContext(AuthContext);
  const { stats } = useDashboardData();
  
  // POSITION STATE
  const [position, setPosition] = useState({ x: 32, y: window.innerHeight - 200 });
  
  // WIN+K (CTRL+K) SHORTCUT
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!session) return null;

  const ACTIONS = [
    { icon: BrainCircuit, title: 'AI Tutor', color: 'from-amber-400 to-orange-500', path: '/ai-assistant' },
    { icon: Library, title: 'Flashcards', color: 'from-lime-400 to-emerald-500', path: '/flashcards' },
    { icon: GraduationCap, title: 'Quiz Gen', color: 'from-purple-500 to-violet-600', path: '/quiz' },
    { icon: FileText, title: 'Essay Help', color: 'from-sky-400 to-blue-500', path: '/essay-helper' },
    { icon: Sparkles, title: 'Planner', color: 'from-emerald-400 to-teal-500', path: '/study-planner' },
    { icon: BarChart3, title: 'AI Analytics', color: 'from-indigo-400 to-purple-500', path: '/ai-analytics' },
    { icon: Timer, title: 'Study Timer', color: 'from-rose-400 to-red-500', path: '/timer' },
    { icon: MousePointer2, title: 'Calculator', color: 'from-slate-400 to-slate-600', path: '/calculator' },
    { icon: Briefcase, title: 'Tasks', color: 'from-blue-400 to-indigo-600', path: '/tasks' },
    { icon: GraduationCap, title: 'Grades', color: 'from-yellow-500 to-amber-600', path: '/grades' },
    { icon: Clock, title: 'Attendance', color: 'from-green-400 to-emerald-600', path: '/attendance' },
    { icon: Book, title: 'Notes', color: 'from-orange-400 to-amber-600', path: '/notes' },
    { icon: Calendar, title: 'Calendar', color: 'from-pink-400 to-rose-600', path: '/calendar' },
    { icon: Command, title: 'Timetable', color: 'from-cyan-400 to-blue-600', path: '/timetable' },
    { icon: Library, title: 'Courses', color: 'from-violet-400 to-purple-600', path: '/courses' },
    { icon: FileText, title: 'Syllabus', color: 'from-emerald-400 to-green-600', path: '/syllabus' },
    { icon: BarChart3, title: 'Progress', color: 'from-indigo-400 to-blue-600', path: '/progress' },
    { icon: Headphones, title: 'Wellness', color: 'from-teal-400 to-cyan-600', path: '/wellness' },
    { icon: User, title: 'Identity Hub', color: 'from-zinc-400 to-zinc-600', path: '/profile' },
    { icon: Settings, title: 'Settings', color: 'from-zinc-500 to-zinc-700', path: '/settings' },
  ];

  return (
    <>
      {/* FLOATING TRIGGER */}
      <motion.button
        drag
        dragMomentum={false}
        onDragEnd={(_, info) => {
          setPosition({ 
            x: position.x + info.offset.x, 
            y: position.y + info.offset.y 
          });
        }}
        initial={false}
        animate={{ x: position.x, y: position.y }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9, cursor: "grabbing" }}
        onClick={() => setIsOpen(true)}
        className="fixed top-0 left-0 z-[100] w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-[0_20px_40px_rgba(99,102,241,0.4)] flex items-center justify-center border border-white/20 group cursor-grab active:cursor-grabbing"
      >
        <Zap className="w-6 h-6 text-white group-hover:animate-pulse" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#050505]" />
      </motion.button>

      {/* OVERLAY PANEL */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
            />
            
            <motion.div
              drag
              dragMomentum={false}
              initial={{ opacity: 0, scale: 0.9, x: position.x, y: position.y }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: Math.min(Math.max(10, position.x - 130), window.innerWidth - 330), 
                y: position.y > window.innerHeight / 2 
                   ? position.y - 520 // Open above if in bottom half
                   : position.y + 70   // Open below if in top half
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-0 left-0 z-[1001] w-[320px] bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[85vh] cursor-move"
            >
              {/* HEADER */}
              <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                      <Zap size={20} className="text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Quick_Access</h3>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search terminal..." 
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-indigo-500/30 transition-all"
                  />
                </div>
              </div>

              {/* ACTIONS SCROLL */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                {ACTIONS.map((action, i) => (
                  <motion.button
                    key={action.title}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      navigate(action.path);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/30 hover:bg-zinc-900/80 border border-white/5 hover:border-white/15 transition-all group"
                  >
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.color} shadow-lg group-hover:scale-110 transition-transform`}>
                      <action.icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-xs font-black text-zinc-200 group-hover:text-white transition-colors uppercase tracking-wider">{action.title}</span>
                    </div>
                    <ChevronRight size={14} className="text-zinc-700 group-hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
                  </motion.button>
                ))}
              </div>

              {/* FOOTER STATS */}
              <div className="p-6 bg-zinc-950 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Identity_Hub</span>
                  <span className="text-[11px] font-mono text-emerald-400">SYNC_OK</span>
                </div>
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-zinc-800" />
                   ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalQuickActions;
