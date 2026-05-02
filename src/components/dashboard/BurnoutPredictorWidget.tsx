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
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/60 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-10 h-full flex flex-col items-center justify-center min-h-[300px]">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-6" />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" 
          />
        </div>
        <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] animate-pulse">Scanning_Bio_Metrics</p>
      </div>
    );
  }

  if (isPremium === false) {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        onClick={() => navigate('/upgrade')}
        className="relative overflow-hidden rounded-[3rem] border border-amber-500/20 bg-zinc-950/80 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] p-8 h-full flex flex-col items-center justify-center min-h-[320px] group cursor-pointer transition-all duration-700 hover:border-amber-500/50"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 border border-dashed border-amber-500/20 rounded-full"
            />
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-amber-500/20 to-orange-600/30 flex items-center justify-center border border-amber-500/30 shadow-2xl">
              <Lock className="w-9 h-9 text-amber-400 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-black text-lg uppercase tracking-[0.2em] italic">Vanguard_Matrix</h3>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-black">Elite Cognitive Forecasting</p>
          </div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:bg-white transition-all duration-500"
          >
            Access Matrix
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (!analysis) return null;

  const StatusIcon = analysis.status === 'critical' ? AlertCircle :
    analysis.status === 'warning' ? Coffee : CheckCircle2;

  const colorClasses =
    analysis.status === 'critical' ? 'text-red-400 bg-red-500/10 border-red-500/30 shadow-red-500/5' :
      analysis.status === 'warning' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-amber-500/5' :
        'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/5';

  return (
    <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-zinc-950/80 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] p-8 h-full flex flex-col group transition-all duration-700 hover:border-indigo-500/30">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${
          analysis.status === 'critical' ? 'bg-red-500' : analysis.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
      />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="space-y-1">
          <h3 className="text-base font-black text-white flex items-center gap-3 uppercase tracking-widest italic drop-shadow-lg">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Brain className="w-5 h-5 text-indigo-400" />
            </div>
            Vanguard_Predictor
          </h3>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Neuro_Load_Forecasting</p>
        </div>
        <motion.span
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-2xl shadow-2xl ${colorClasses}`}
        >
          {analysis.status}_State
        </motion.span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-10 mb-10 relative z-10">
        <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center group/gauge">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="none" className="text-white/5" />
            <motion.circle
              cx="64" cy="64" r="58"
              stroke="url(#vanguard-gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray="364.42"
              initial={{ strokeDashoffset: 364.42 }}
              animate={{ strokeDashoffset: 364.42 - (364.42 * analysis.score) / 100 }}
              transition={{ duration: 2.5, type: 'spring', bounce: 0 }}
              strokeLinecap="round"
              className="drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            />
            <defs>
              <linearGradient id="vanguard-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={analysis.status === 'critical' ? 'text-red-500' : analysis.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'} stopColor="currentColor" />
                <stop offset="100%" className={analysis.status === 'critical' ? 'text-orange-600' : analysis.status === 'warning' ? 'text-orange-500' : 'text-teal-500'} stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
            <span className="text-3xl font-black text-white tracking-tighter tabular-nums">{analysis.score}</span>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">%LOAD</span>
          </div>
          {/* Orbital shimmer */}
          <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
             className="absolute -inset-4 border border-dashed border-white/10 rounded-full opacity-20 pointer-events-none" 
          />
        </div>

        <div className="flex-1 space-y-4">
          <div className="relative">
             <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500/50 to-transparent rounded-full" />
             <p className="text-sm text-zinc-300 leading-relaxed font-bold italic pl-4">
               "{analysis.message}"
             </p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <motion.div 
                key={i}
                animate={{ opacity: i * 20 <= analysis.score ? 1 : 0.1, scale: i * 20 <= analysis.score ? [1, 1.2, 1] : 1 }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
                className={`w-3 h-1.5 rounded-full ${
                  analysis.status === 'critical' ? 'bg-red-500' : 
                  analysis.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto relative z-10 group/rec">
        <div className={`absolute inset-0 opacity-[0.03] bg-current transition-all duration-700 group-hover/rec:opacity-[0.08] rounded-3xl ${colorClasses.split(' ')[0].replace('text-', 'bg-')}`} />
        <div className="relative bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] p-6 border border-white/5 flex items-start gap-6 transition-all duration-700 group-hover/rec:translate-y-[-5px] group-hover/rec:border-white/10">
          <motion.div 
            whileHover={{ rotate: 360 }}
            className={`mt-1 p-3 rounded-2xl bg-black/40 border border-white/10 shadow-2xl ${colorClasses.split(' ')[0]}`}
          >
            <StatusIcon className="w-6 h-6" />
          </motion.div>
          <div className="space-y-2">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block">Tactical_Recommendation</span>
            <p className="text-sm text-white font-bold leading-relaxed">{analysis.action}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
