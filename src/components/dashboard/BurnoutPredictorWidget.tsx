import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, HeartPulse, Coffee, AlertCircle, CheckCircle2, Moon, Activity, Loader2, Lock } from 'lucide-react';
import { RealDashboardStats } from '@/types/dashboard';
import aiService from '@/lib/aiService';
import { courseService } from '@/components/dashboard/courseService';
import { useNavigate } from 'react-router-dom';
import { useRankTheme } from '@/context/ThemeContext';

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
  const { theme } = useRankTheme();
  const [analysis, setAnalysis] = useState<BurnoutAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchPrediction = async () => {
      const user = await courseService.getCurrentUser();
      const tier = user?.profile?.subscription_tier;
      const hasPremium = tier === 'premium' || tier === 'premium_elite' || user?.profile?.role?.includes('class');
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
      <div className="relative overflow-hidden rounded-[2.5rem] border bg-zinc-950/60 backdrop-blur-3xl p-10 h-full flex flex-col items-center justify-center min-h-[300px]"
        style={{ borderColor: theme.colors.border }}>
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin mb-6" style={{ color: theme.colors.primary }} />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 blur-xl rounded-full" 
            style={{ backgroundColor: theme.colors.glow }}
          />
        </div>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Scanning_Bio_Metrics</p>
      </div>
    );
  }

  if (isPremium === false) {
    const RankIcon = theme.icons.rank;
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        onClick={() => navigate('/upgrade')}
        className="relative overflow-hidden rounded-[3rem] border bg-zinc-950/80 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] p-8 h-full flex flex-col items-center justify-center min-h-[320px] group cursor-pointer transition-all duration-700"
        style={{ borderColor: theme.colors.border }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-5" 
          style={{ background: `radial-gradient(circle at 50% 50%, ${theme.colors.primary}, transparent)` }} />
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-10 border border-dashed rounded-full opacity-20"
              style={{ borderColor: theme.colors.primary }}
            />
            <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.03] flex items-center justify-center border transition-all duration-500 group-hover:scale-110 shadow-2xl"
              style={{ borderColor: `${theme.colors.primary}20` }}>
              <RankIcon className="w-12 h-12" style={{ color: theme.colors.primary, filter: `drop-shadow(0 0 10px ${theme.colors.glow})` }} />
              <div className="absolute top-0 right-0 p-1.5 rounded-full bg-zinc-950 border border-white/10">
                <Lock className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-black text-xl uppercase tracking-[0.2em] italic">
              {theme.id.includes('a+') ? 'RHODIUM_PREDICTOR' : 'VANGUARD_MATRIX'}
            </h3>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-black">Neural Cognitive Forecasting Locked</p>
          </div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 text-white"
            style={{ background: theme.gradients.main, boxShadow: theme.effects.glowIntensity }}
          >
            Unlock Access
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (!analysis) return null;

  const StatusIcon = analysis.status === 'critical' ? AlertCircle :
    analysis.status === 'warning' ? Coffee : CheckCircle2;

  const colorStyle =
    analysis.status === 'critical' ? { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' } :
      analysis.status === 'warning' ? { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' } :
        { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' };

  return (
    <div className="relative overflow-hidden rounded-[3rem] border bg-zinc-950/80 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] p-8 h-full flex flex-col group transition-all duration-700"
      style={{ borderColor: theme.colors.border }}>
      
      {/* Background Glow */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: analysis.status === 'critical' ? '#EF4444' : analysis.status === 'warning' ? '#F59E0B' : theme.colors.primary }}
      />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="space-y-1">
          <h3 className="text-base font-black text-white flex items-center gap-3 uppercase tracking-widest italic">
            <div className="p-2 rounded-xl border" style={{ backgroundColor: `${theme.colors.primary}10`, borderColor: `${theme.colors.primary}20` }}>
              <Brain className="w-5 h-5" style={{ color: theme.colors.primary }} />
            </div>
            {theme.id.includes('a+') ? 'RHODIUM_PREDICTOR' : 'VANGUARD_CORE'}
          </h3>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Neuro_Load_Forecasting</p>
        </div>
        <motion.span
          className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-2xl"
          style={{ backgroundColor: colorStyle.bg, borderColor: colorStyle.border, color: colorStyle.color }}
        >
          {analysis.status}_State
        </motion.span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-10 mb-10 relative z-10">
        <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="72" cy="72" r="66" stroke="currentColor" strokeWidth="12" fill="none" className="text-white/5" />
            <motion.circle
              cx="72" cy="72" r="66"
              stroke={colorStyle.color}
              strokeWidth="12"
              fill="none"
              strokeDasharray="414.69"
              initial={{ strokeDashoffset: 414.69 }}
              animate={{ strokeDashoffset: 414.69 - (414.69 * analysis.score) / 100 }}
              transition={{ duration: 2, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
            <span className="text-4xl font-black text-white tracking-tighter tabular-nums">{analysis.score}</span>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">%LOAD</span>
          </div>
        </div>

        <div className="flex-1 space-y-5">
          <p className="text-sm text-zinc-300 leading-relaxed font-bold italic border-l-2 pl-4"
            style={{ borderColor: theme.colors.primary }}>
            "{analysis.message}"
          </p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <motion.div 
                key={i}
                animate={{ opacity: i * 20 <= analysis.score ? 1 : 0.1, scale: i * 20 <= analysis.score ? [1, 1.2, 1] : 1 }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
                className="w-4 h-2 rounded-full"
                style={{ backgroundColor: colorStyle.color }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto relative z-10">
        <div className="relative bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] p-6 border border-white/5 flex items-start gap-6 transition-all duration-700 hover:border-white/10">
          <div className="mt-1 p-3 rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl"
            style={{ color: colorStyle.color }}>
            <StatusIcon className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block">Tactical_Recommendation</span>
            <p className="text-sm text-white font-bold leading-relaxed">{analysis.action}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
