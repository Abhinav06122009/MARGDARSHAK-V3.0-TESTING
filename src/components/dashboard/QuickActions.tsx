import React from 'react';
import { 
  Calendar, FileText, Book, Settings, ChevronRight,
  BrainCircuit, GraduationCap, BarChart3, Sparkles, Target,
  Library, MessageSquare, Image as ImageIcon, Trophy,
  Briefcase, Timer, Headphones, Zap, Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  stats: any;
  onNavigate: (path: string) => void;
}

interface ActionDef {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;        // tailwind gradient classes
  glow: string;         // shadow color
  badge?: string;
  badgeColor?: string;
  isPremium?: boolean;
  onClick: () => void;
}

const ActionCard = ({ icon: Icon, title, subtitle, color, glow, badge, badgeColor, isPremium, onClick }: ActionDef) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02, x: 4 }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className={`group relative flex items-center p-3.5 w-full rounded-2xl border border-white/[0.06] hover:border-white/15 bg-zinc-950/60 hover:bg-zinc-900/80 transition-all duration-200 text-left overflow-hidden shadow-lg hover:shadow-xl`}
    style={{ '--glow': glow } as any}
  >
    {/* Hover glow bar on left */}
    <div className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-gradient-to-b ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

    {/* Icon */}
    <div className={`relative flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${color} mr-3.5 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
      {isPremium ? <Lock className="w-4 h-4 text-white" /> : <Icon className="w-4 h-4 text-white" />}
      {/* Shimmer on icon */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)' }}
      />
    </div>

    {/* Text */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-bold text-zinc-100 truncate group-hover:text-white transition-colors">{title}</h4>
        {badge && (
          <span className={`flex-shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide border ${badgeColor}`}>
            {badge}
          </span>
        )}
        {isPremium && (
          <span className="flex-shrink-0 text-[8px] font-black px-1 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-tighter">
            PRO
          </span>
        )}
      </div>
      <p className="text-[11px] text-zinc-500 font-medium truncate group-hover:text-zinc-400 transition-colors">{subtitle}</p>
    </div>

    {/* Arrow */}
    <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-300 -translate-x-1 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0" />
  </motion.button>
);

const SectionLabel = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 px-1 pt-2 pb-1">
    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{label}</span>
    <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
  </div>
);

const QuickActions: React.FC<QuickActionsProps> = ({ stats, onNavigate }) => {
  const navigate = useNavigate();

  const ACTIONS: ActionDef[] = [
    // ── AI Tools ──
    { icon: BrainCircuit, title: 'AI Tutor', subtitle: 'Ask any academic question', color: 'from-amber-500 to-orange-500', glow: '#f59e0b', badge: 'AI', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30', onClick: () => navigate('/ai-assistant') },
    { icon: Library, title: 'Flashcards', subtitle: 'AI spaced repetition', color: 'from-amber-400 to-lime-500', glow: '#84cc16', badge: 'New', badgeColor: 'bg-lime-500/15 text-lime-400 border-lime-500/20', isPremium: true, onClick: () => navigate('/flashcards') },
    { icon: ImageIcon, title: 'Doubt Solver', subtitle: 'Snap to solve problems', color: 'from-indigo-500 to-blue-500', glow: '#6366f1', badge: 'New', badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', isPremium: true, onClick: () => navigate('/doubt-solver') },
    { icon: GraduationCap, title: 'Quiz Generator', subtitle: 'Test your knowledge with AI', color: 'from-purple-600 to-violet-600', glow: '#7c3aed', badge: 'New', badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30', isPremium: true, onClick: () => navigate('/quiz') },
    { icon: FileText, title: 'Essay Helper', subtitle: 'AI writing assistance', color: 'from-sky-500 to-blue-600', glow: '#0ea5e9', badge: 'New', badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30', isPremium: true, onClick: () => navigate('/essay-helper') },
    { icon: Sparkles, title: 'Study Planner', subtitle: 'AI-generated schedules', color: 'from-emerald-500 to-teal-600', glow: '#10b981', badge: 'New', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', isPremium: true, onClick: () => navigate('/study-planner') },
    { icon: BarChart3, title: 'AI Analytics', subtitle: 'Performance insights', color: 'from-indigo-500 to-purple-600', glow: '#6366f1', badge: 'New', badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', isPremium: true, onClick: () => navigate('/ai-analytics') },
    // ── Campus ──
    { icon: Trophy, title: 'Achievements', subtitle: 'Badges & Leaderboard', color: 'from-amber-400 to-yellow-500', glow: '#f59e0b', onClick: () => navigate('/achievements') },
    { icon: Calendar, title: 'Schedule', subtitle: 'Timetable & events', color: 'from-cyan-500 to-sky-600', glow: '#06b6d4', onClick: () => navigate('/timetable') },
    { icon: Book, title: 'Courses', subtitle: 'Manage your courses', color: 'from-pink-500 to-rose-600', glow: '#ec4899', onClick: () => navigate('/courses') },
    { icon: Headphones, title: 'Wellness', subtitle: 'Mental & Physical health', color: 'from-emerald-400 to-cyan-500', glow: '#10b981', isPremium: true, onClick: () => navigate('/wellness') },
    { icon: Settings, title: 'Settings', subtitle: 'Account & preferences', color: 'from-zinc-500 to-zinc-600', glow: '#71717a', onClick: () => navigate('/settings') },
  ];

  const CAREER_ACTIONS: ActionDef[] = [
    { icon: Briefcase, title: 'Portfolio Builder', subtitle: 'Auto-generate resume from data', color: 'from-indigo-500 to-violet-600', glow: '#6366f1', badge: 'New', badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', isPremium: true, onClick: () => navigate('/portfolio') },
    { icon: Timer, title: 'Exam Deadlines', subtitle: 'JEE · NEET · SAT · University', color: 'from-amber-500 to-orange-600', glow: '#f59e0b', badge: 'New', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30', isPremium: true, onClick: () => navigate('/deadlines') },
    { icon: Headphones, title: 'Smart Notes (TTS)', subtitle: 'Listen to your notes hands-free', color: 'from-sky-400 to-blue-600', glow: '#38bdf8', badge: 'New', badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30', isPremium: true, onClick: () => navigate('/smart-notes') },
  ];

  return (
    <div className="space-y-1">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-1 mb-3"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/20">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <h3 className="text-xs font-black text-zinc-300 uppercase tracking-widest">Quick Access</h3>
        </div>
        <span className="text-[10px] text-zinc-600 font-medium">{ACTIONS.length + CAREER_ACTIONS.length} tools</span>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
        {ACTIONS.map((action, i) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <ActionCard {...action} />
          </motion.div>
        ))}

        <SectionLabel label="Career & Future Prep" />

        {CAREER_ACTIONS.map((action, i) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (ACTIONS.length + i) * 0.03 }}
          >
            <ActionCard {...action} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
