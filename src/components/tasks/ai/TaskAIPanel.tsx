import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Wand2, ListTodo, ChevronDown, ChevronUp, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { modelRouter } from '@/lib/ai/modelRouter';
import { useAI } from '@/contexts/AIContext';
import { useAuth } from '@/contexts/AuthContext';

interface Task {
  title: string;
  description?: string;
  due_date?: string | null;
  priority: string;
  status: string;
}

interface TaskAIPanelProps {
  tasks: Task[];
  onAddSubtasks?: (parentTitle: string, subtasks: string[]) => void;
}

interface TaskAnalysis {
  priorityAdvice: string;
  riskTasks: string[];
  estimatedCompletion: string;
  focusRecommendation: string;
}

const TaskAIPanel: React.FC<TaskAIPanelProps> = ({ tasks, onAddSubtasks }) => {
  const [analysis, setAnalysis] = useState<TaskAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAIReady } = useAI();
  const { user: authUser } = useAuth();
  const { toast } = useToast();

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const overdueTasks = tasks.filter(t =>
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
  );

  const analyze = async () => {
    if (!isAIReady || pendingTasks.length === 0) return;

    setLoading(true);

    const taskSummary = pendingTasks.slice(0, 10).map(t => {
      const dueStr = t.due_date ? `due ${new Date(t.due_date).toLocaleDateString()}` : 'no deadline';
      return `"${t.title}" (${t.priority} priority, ${dueStr})`;
    }).join('; ');

    const prompt = `Act as an expert Academic Success Coach. Analyze these student tasks and provide strategic advice:

Tasks: ${taskSummary}
Overdue: ${overdueTasks.length} tasks
Total pending: ${pendingTasks.length} tasks

Return ONLY valid JSON:
{
  "priorityAdvice": "1 punchy sentence on the immediate NEXT move",
  "riskTasks": ["task title 1", "task title 2"],
  "estimatedCompletion": "Realistic timeframe (e.g., Next 48 hours)",
  "focusRecommendation": "2 sentences of high-level strategic advice"
}`;

    try {
      const userTier = authUser?.publicMetadata?.subscription?.tier || authUser?.publicMetadata?.tier || 'free';

      const result = await modelRouter.generateJSON<TaskAnalysis>(prompt, {
        useCache: true,
        cacheKey: `task_analysis_v4_${pendingTasks.length}_${overdueTasks.length}`,
        cacheTtl: 10 * 60 * 1000,
        tier: userTier, // Use the user's actual tier from Clerk metadata
        task: 'tasks', // Let the neuro-engine architecture handle optimal model selection
      });

      if (result) {
        setAnalysis(result);
        toast({
          title: "Analysis Complete",
          description: "Your task strategy has been optimized by Margdarshak AI.",
          className: "bg-black border border-indigo-500/50 shadow-2xl",
        });
      }
    } catch (e: any) {
      console.error("AI Analysis Error:", e);
      toast({ title: 'Orchestration failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isExpanded && !analysis) analyze();
    setIsExpanded(prev => !prev);
  };

  if (pendingTasks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 group transition-all duration-500 hover:border-indigo-500/30"
    >
      {/* Animated Aurora Substrate */}
      <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-3xl z-0" />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, 20, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-1/2 -left-1/2 w-full h-full bg-indigo-600/10 rounded-full blur-[120px] z-0"
      />

      <button
        onClick={handleToggle}
        className="relative w-full flex items-center justify-between px-6 py-5 hover:bg-white/5 transition-all duration-300 z-10"
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={loading ? { rotate: 360 } : {}}
            transition={loading ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
            className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-white/10 shadow-xl"
          >
            {loading ? <Loader2 className="w-5 h-5 text-indigo-400" /> : <Sparkles className="w-5 h-5 text-indigo-400" />}
          </motion.div>
          <div className="text-left">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              AI Task
              {loading && <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full animate-pulse">Syncing</span>}
            </h3>
            <p className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-wider">
              {pendingTasks.length} Active Tasks • <span className="text-red-400/80">{overdueTasks.length} CRITICAL</span>
            </p>
          </div>
        </div>
        <div className="p-2 bg-white/5 rounded-xl border border-white/5">
          {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-10 overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-6">
              {!loading && analysis && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="space-y-6 pt-4 border-t border-white/5"
                >
                  {/* Strategic Recommendation */}
                  <div className="p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 shadow-inner">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-indigo-500/20 rounded-xl">
                        <Wand2 className="w-4 h-4 text-indigo-400" />
                      </div>
                      <p className="text-sm font-medium text-zinc-300 leading-relaxed italic">
                        "{analysis.focusRecommendation}"
                      </p>
                    </div>
                  </div>

                  {/* Matrix Dashboard */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-3xl bg-zinc-900/60 border border-white/10 shadow-xl group/card overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/card:opacity-30 transition-opacity">
                        <Clock className="w-12 h-12 text-blue-400" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Due Time</span>
                      </div>
                      <p className="text-lg font-black text-white tracking-tight leading-tight">{analysis.estimatedCompletion}</p>
                    </div>

                    <div className="p-4 rounded-3xl bg-zinc-900/60 border border-white/10 shadow-xl group/card overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/card:opacity-30 transition-opacity">
                        <ListTodo className="w-12 h-12 text-amber-400" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Strike Point</span>
                      </div>
                      <p className="text-lg font-black text-white tracking-tight leading-tight line-clamp-2">{analysis.priorityAdvice}</p>
                    </div>
                  </div>

                  {/* Risk Alert */}
                  {analysis.riskTasks && analysis.riskTasks.length > 0 && (
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="p-5 rounded-3xl bg-red-500/10 border border-red-500/20 shadow-lg"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-500/20 rounded-xl">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        </div>
                        <span className="text-xs font-black text-red-400 uppercase tracking-widest">Risk Detection</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.riskTasks.map((task, i) => (
                          <span key={i} className="px-3 py-1.5 bg-red-500/20 rounded-full text-[10px] font-bold text-red-300 border border-red-500/30">
                            {task}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={analyze}
                      className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl px-6"
                    >
                      Re-Analysis
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskAIPanel;
