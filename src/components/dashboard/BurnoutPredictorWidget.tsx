import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, HeartPulse, Coffee, AlertCircle, CheckCircle2, Moon, Activity, Loader2, Lock } from 'lucide-react';
import { RealDashboardStats } from '@/types/dashboard';
import aiService from '@/lib/aiService';
import { courseService } from '@/components/dashboard/courseService';
import { useNavigate } from 'react-router-dom';

interface BurnoutPredictorProps {
  stats: RealDashboardStats | null;
}

interface BurnoutAnalysis {
  status: 'critical' | 'warning' | 'healthy';
  score: number;
  message: string;
  action: string;
}

export const BurnoutPredictorWidget: React.FC<BurnoutPredictorProps> = React.memo(({ stats }) => {
  const [analysis, setAnalysis] = useState<BurnoutAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchPrediction = async () => {
      const user = await courseService.getCurrentUser();
      const tier = user?.profile?.subscription_tier;
      const hasPremium = tier === 'premium' || tier === 'premium_elite';
      if (isMounted) setIsPremium(hasPremium);

      if (!hasPremium) {
        if (isMounted) setLoading(false);
        return;
      }

      if (!stats) return;
      setLoading(true);

      const prediction = await aiService.predictBurnout(stats);

      if (!isMounted) return;

      if (prediction) {
        setAnalysis(prediction);
      } else {
        // Fallback algorithm
        let burnoutScore = 0;
        const dailyHours = stats.todayStudyTime / 60;
        if (dailyHours > 8) burnoutScore += 40;
        else if (dailyHours > 5) burnoutScore += 20;
        if (stats.studyStreak > 14) burnoutScore += 15;
        const taskLoad = stats.inProgressTasks + stats.pendingTasks;
        if (taskLoad > 20) burnoutScore += 25;
        if (stats.overdueTasks > 5) burnoutScore += 20;
        if (stats.completionRate > 80) burnoutScore -= 15;
        if (dailyHours < 3 && stats.studyStreak > 0) burnoutScore -= 10;
        burnoutScore = Math.max(0, Math.min(100, burnoutScore));

        if (burnoutScore >= 75) {
          setAnalysis({ status: 'critical', score: burnoutScore, message: 'High risk of burnout detected. Your task load and study hours are peaking.', action: 'We strongly recommend a 24-hour digital detox. Reschedule non-urgent tasks.' });
        } else if (burnoutScore >= 50) {
          setAnalysis({ status: 'warning', score: burnoutScore, message: 'You are working hard, but fatigue may be accumulating.', action: 'Consider taking a 30-minute break. Try a brief mindfulness exercise.' });
        } else {
          setAnalysis({ status: 'healthy', score: burnoutScore, message: 'Excellent pacing! You are maintaining a highly sustainable workflow.', action: 'Keep up the good work and ensure you stay hydrated.' });
        }
      }
      setLoading(false);
    };

    fetchPrediction();

    return () => {
      isMounted = false;
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900/60 backdrop-blur-2xl shadow-xl p-6 h-full flex flex-col items-center justify-center min-h-[250px]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
        <p className="text-zinc-400 text-sm animate-pulse">AI analyzing your productivity metrics...</p>
      </div>
    );
  }

  if (isPremium === false) {
    return (
      <div
        onClick={() => navigate('/upgrade')}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl p-7 h-full flex flex-col items-center justify-center min-h-[280px] group cursor-pointer transition-all duration-500 hover:border-amber-500/30"
      >
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-700" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-dashed border-amber-500/20 rounded-full"
            />
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center border border-amber-500/30">
              <Lock className="w-7 h-7 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-white font-black text-sm uppercase tracking-wider italic">Burnout Predictor</h3>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold">A.I. Powered Analysis</p>
          </div>

          <div className="px-4 py-1.5 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest group-hover:bg-white transition-colors">
            Upgrade to Premium
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const StatusIcon = analysis.status === 'critical' ? AlertCircle :
    analysis.status === 'warning' ? Coffee : CheckCircle2;

  const colorClasses =
    analysis.status === 'critical' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
      analysis.status === 'warning' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
        'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  const gradientFill =
    analysis.status === 'critical' ? 'from-red-500 to-orange-500' :
      analysis.status === 'warning' ? 'from-amber-400 to-orange-400' :
        'from-emerald-400 to-teal-400';

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl p-7 h-full flex flex-col group transition-all duration-500 hover:border-white/20">
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none ${analysis.status === 'critical' ? 'bg-red-500' : analysis.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
      />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-tight italic">
            <Brain className="w-4 h-4 text-indigo-400" />Burnout Predictor
          </h3>
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Cognitive Load Analysis</p>
        </div>
        <motion.span
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border backdrop-blur-md shadow-lg ${colorClasses}`}
        >
          {analysis.status}
        </motion.span>
      </div>

      <div className="flex items-center gap-6 mb-8 relative z-10">
        <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="none" className="text-white/5" />
            <motion.circle
              cx="40" cy="40" r="35"
              stroke="url(#burnout-gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray="219.91"
              initial={{ strokeDashoffset: 219.91 }}
              animate={{ strokeDashoffset: 219.91 - (219.91 * analysis.score) / 100 }}
              transition={{ duration: 2, type: 'spring', bounce: 0 }}
              strokeLinecap="round"
              className="drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]"
            />
            <defs>
              <linearGradient id="burnout-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={analysis.status === 'critical' ? 'text-red-500' : analysis.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'} stopColor="currentColor" />
                <stop offset="100%" className={analysis.status === 'critical' ? 'text-orange-600' : analysis.status === 'warning' ? 'text-orange-500' : 'text-teal-500'} stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black text-white tracking-tighter">{Math.round(analysis.score)}<span className="text-[10px] text-zinc-500">%</span></span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-[11px] text-zinc-300 leading-relaxed font-semibold italic">
            "{analysis.message}"
          </p>
        </div>
      </div>

      <div className="mt-auto relative z-10 group/rec overflow-hidden">
        <div className={`absolute inset-0 opacity-10 bg-current transition-all duration-500 group-hover/rec:opacity-20 ${colorClasses.split(' ')[0].replace('text-', 'bg-')}`} />
        <div className={`relative bg-white/[0.03] backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-start gap-4 transition-transform duration-500 group-hover/rec:translate-y-[-2px]`}>
          <div className={`mt-0.5 p-1.5 rounded-lg bg-black/40 border border-white/10 ${colorClasses.split(' ')[0]}`}>
            <StatusIcon className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] block">Recommended Protocol</span>
            <p className="text-xs text-white font-medium leading-relaxed">{analysis.action}</p>
          </div>
        </div>
      </div>
    </div>
  );
});
