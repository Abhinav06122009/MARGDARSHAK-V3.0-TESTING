import React, { useState, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import {
  Zap, X, Command, Search, Star,
  ChevronRight, BrainCircuit, Library, ImageIcon,
  GraduationCap, FileText, Sparkles, BarChart3,
  Trophy, Calendar, Book, Headphones, Settings,
  Briefcase, Timer, MousePointer2, User, Hash,
  Clock, ArrowUp, LayoutGrid, ClipboardCheck,
  Target, ShieldCheck, FileSearch
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

const DOCK_ACTIONS: Action[] = [
  { icon: BrainCircuit, title: 'AI Assistant', subtitle: 'Chat With Saarthi', color: 'from-amber-400 to-orange-500', path: '/ai-assistant', category: 'AI', keywords: ['ai', 'chat'] },
  { icon: LayoutGrid, title: 'Dashboard', subtitle: 'Main Hub', color: 'from-blue-600 to-indigo-700', path: '/dashboard', category: 'Main', keywords: ['dash'] },
  { icon: Calendar, title: 'Schedule', subtitle: 'Timetable', color: 'from-cyan-400 to-blue-600', path: '/timetable', category: 'Academic', keywords: ['time'] },
  { icon: ClipboardCheck, title: 'Tasks', subtitle: 'To-Do List', color: 'from-blue-400 to-indigo-600', path: '/tasks', category: 'Academic', keywords: ['todo'] },
  { icon: Target, title: 'Focus', subtitle: 'Pomodoro', color: 'from-rose-400 to-red-500', path: '/timer', category: 'Academic', keywords: ['focus'] },
  { icon: Book, title: 'Notes', subtitle: 'Study Hub', color: 'from-orange-400 to-amber-600', path: '/notes', category: 'Academic', keywords: ['note'] },
  { icon: Trophy, title: 'Awards', subtitle: 'Achievements', color: 'from-amber-400 to-yellow-500', path: '/achievements', category: 'Academic', keywords: ['rank'] },
  { icon: GraduationCap, title: 'Courses', subtitle: 'Curriculum', color: 'from-violet-400 to-purple-600', path: '/courses', category: 'Academic', keywords: ['study'] },
  { icon: ShieldCheck, title: 'Security', subtitle: 'Protection', color: 'from-emerald-400 to-green-500', path: '/status', category: 'System', keywords: ['status'] },
  { icon: FileSearch, title: 'Logs', subtitle: 'Activity', color: 'from-zinc-500 to-zinc-700', path: '/sitemap', category: 'System', keywords: ['map'] },
];

export const GlobalQuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { session } = useContext(AuthContext);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!session) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
      <motion.div
        drag dragMomentum={false}
        className="pointer-events-auto cursor-grab active:cursor-grabbing"
      >
        <motion.div
          layout
          className="flex items-center gap-1 p-2 bg-[#1A1A1A]/90 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Main Action Trigger (Glow Effect) */}
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

          <div className="h-8 w-px bg-white/10 mx-2" />

          {/* Dock Icons */}
          <div className="flex items-center gap-1 pr-2">
            {DOCK_ACTIONS.map((action, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.2, y: -4 }} whileTap={{ scale: 0.9 }}
                onClick={() => navigate(action.path)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all group relative"
              >
                <action.icon size={18} />
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-3 px-3 py-1.5 bg-black border border-white/10 rounded-lg text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
                  {action.title}
                </div>
              </motion.button>
            ))}
          </div>

          <div className="h-8 w-px bg-white/10 mx-2" />

          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
          >
            <Search size={16} />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Full Search Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-xl z-[10001] p-6"
            >
              <div className="bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-6">
                 <div className="flex items-center gap-4 px-6 py-5 bg-white/5 rounded-3xl border border-white/10 focus-within:border-indigo-500/50 transition-all">
                    <Search size={24} className="text-zinc-500" />
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Search for tools, courses, settings..." 
                      className="bg-transparent border-none outline-none text-lg text-white w-full font-bold placeholder:text-zinc-600"
                    />
                    <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">
                      <X size={20} />
                    </button>
                 </div>
                 <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="col-span-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 mb-2">Suggested Hubs</div>
                    {DOCK_ACTIONS.slice(0, 4).map((a, i) => (
                      <button key={i} onClick={() => { navigate(a.path); setIsOpen(false); }} className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/[0.08] transition-all text-left">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${a.color} shadow-lg shadow-indigo-500/10`}>
                          <a.icon size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{a.title}</p>
                          <p className="text-[10px] text-zinc-500">{a.subtitle}</p>
                        </div>
                      </button>
                    ))}
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
