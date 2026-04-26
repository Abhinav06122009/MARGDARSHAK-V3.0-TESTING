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

export const BurnoutPredictorWidget: React.FC<BurnoutPredictorProps> = ({ stats }) => {
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
        className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900/60 backdrop-blur-2xl shadow-xl p-6 h-full flex flex-col items-center justify-center min-h-[250px] group cursor-pointer"
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center transition-all duration-300">
          <Lock className="w-8 h-8 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="text-white font-bold text-sm mb-1">AI Burnout Predictor</h3>
          <p className="text-amber-400/80 text-[11px] uppercase tracking-widest font-semibold mt-1">Premium Feature</p>
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
    <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900/60 backdrop-blur-2xl shadow-xl p-6 h-full flex flex-col group">
      <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-20 ${
        analysis.status === 'critical' ? 'bg-red-500' : analysis.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
      }`} />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400" /> AI Burnout Predictor
        </h3>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colorClasses}`}>
          {analysis.status}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-zinc-800" />
            <motion.circle 
              cx="32" cy="32" r="28" 
              stroke="url(#gradient)" 
              strokeWidth="6" 
              fill="none" 
              strokeDasharray="175.93" 
              initial={{ strokeDashoffset: 175.93 }}
              animate={{ strokeDashoffset: 175.93 - (175.93 * analysis.score) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={analysis.status === 'critical' ? 'text-red-500' : analysis.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'} stopColor="currentColor" />
                <stop offset="100%" className={analysis.status === 'critical' ? 'text-orange-500' : analysis.status === 'warning' ? 'text-orange-400' : 'text-teal-400'} stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-sm font-black">{analysis.score}%</span>
          </div>
        </div>
        
        <div>
          <p className="text-xs text-zinc-300 leading-relaxed font-medium">
            {analysis.message}
          </p>
        </div>
      </div>

      <div className="mt-auto bg-black/40 rounded-xl p-3 border border-white/5 relative z-10 flex items-start gap-3">
        <div className={`mt-0.5 ${colorClasses.split(' ')[0]}`}>
          <StatusIcon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">AI Recommendation</p>
          <p className="text-xs text-zinc-300">{analysis.action}</p>
        </div>
      </div>
    </div>
  );
};
