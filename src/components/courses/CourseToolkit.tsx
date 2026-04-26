import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, Layers, Brain, MessageSquare, 
  CalendarDays, LineChart, Lock 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SecureUser } from '@/components/dashboard/course';
import { useToast } from '@/hooks/use-toast';

interface CourseToolkitProps {
  currentUser: SecureUser;
}

const CourseToolkit: React.FC<CourseToolkitProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const tools = [
    { id: 'flashcards', name: 'Flashcards', icon: Layers, path: '/flashcards', color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { id: 'doubt-solver', name: 'Doubt Solver', icon: Brain, path: '/doubt-solver', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'quiz', name: 'Quiz Generator', icon: MessageSquare, path: '/quiz', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'essay', name: 'Essay Writer', icon: PenTool, path: '/essay-helper', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'planner', name: 'Study Planner', icon: CalendarDays, path: '/study-planner', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: 'analytics', name: 'AI Analytics', icon: LineChart, path: '/ai-analytics', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  const handleToolClick = (tool: typeof tools[0]) => {
    const isPremiumElite = currentUser.profile?.subscription_tier === 'premium_elite';
    
    if (isPremiumElite) {
      navigate(tool.path);
    } else {
      toast({
        title: "Premium Elite Required",
        description: "Upgrade to Premium Elite to access this AI tool.",
        variant: "destructive",
      });
      navigate('/upgrade');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-5 px-1">
        <div className="p-2.5 rounded-2xl bg-violet-500/15 border border-violet-500/20 shadow-lg shadow-violet-500/5">
          <Bot className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            AI Course Toolkit
            <span className="text-[10px] bg-gradient-to-r from-amber-400 to-orange-500 text-black px-2.5 py-0.5 rounded-full font-bold">ELITE</span>
          </h2>
          <p className="text-[11px] text-zinc-500 font-medium">Empower your studies with dedicated AI agents</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {tools.map((tool, idx) => {
          const isPremiumElite = currentUser.profile?.subscription_tier === 'premium_elite';

          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={isPremiumElite ? { y: -5, scale: 1.02 } : {}}
              whileTap={isPremiumElite ? { scale: 0.98 } : {}}
              onClick={() => handleToolClick(tool)}
              className={`relative group overflow-hidden rounded-3xl border ${
                isPremiumElite 
                  ? 'border-white/10 hover:border-violet-500/40 cursor-pointer bg-zinc-900/40 shadow-xl' 
                  : 'border-white/5 cursor-not-allowed opacity-60 bg-zinc-950/20'
              } p-5 flex flex-col items-center justify-center gap-4 backdrop-blur-xl transition-all`}
            >
              {!isPremiumElite && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Lock className="w-5 h-5 text-amber-400 mb-2" />
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-tighter">Premium</span>
                </div>
              )}
              <div className={`p-4 rounded-2xl ${tool.bg} shadow-inner group-hover:scale-110 transition-transform`}>
                <tool.icon className={`w-6 h-6 ${tool.color}`} />
              </div>
              <span className="text-[11px] font-black text-zinc-300 text-center uppercase tracking-wide">
                {tool.name}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// Internal PenTool since it was missing in the tools array local scope
const PenTool = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"></path><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="m2 2 5 5"></path><path d="m11 11 5 5"></path></svg>
);

export default CourseToolkit;
