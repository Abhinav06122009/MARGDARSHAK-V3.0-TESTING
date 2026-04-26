import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, TrendingUp, TrendingDown, Lightbulb, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { modelRouter } from '@/lib/ai/modelRouter';
import { useAI } from '@/contexts/AIContext';
import cacheService from '@/lib/ai/cacheService';

interface GradeData {
  subject: string;
  grade: number;
  total_points: number;
  assignment_name: string;
  semester?: string;
}

interface GradeInsightsProps {
  grades: GradeData[];
}

interface InsightResult {
  topSubject: string;
  weakestSubject: string;
  trend: 'improving' | 'declining' | 'stable';
  gpaForecast: string;
  recommendations: string[];
}

const GradeInsights: React.FC<GradeInsightsProps> = ({ grades }) => {
  const [insights, setInsights] = useState<InsightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAIReady } = useAI();

  const hasEnoughData = grades.length >= 3;

  const subjectAverages = grades.reduce((acc, g) => {
    const pct = (g.grade / g.total_points) * 100;
    if (!acc[g.subject]) acc[g.subject] = { total: 0, count: 0 };
    acc[g.subject].total += pct;
    acc[g.subject].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const subjectSummary = Object.entries(subjectAverages).map(([subject, data]) => ({
    subject,
    avg: Math.round(data.total / data.count),
  }));

  const generate = async () => {
    if (!isAIReady || !hasEnoughData) return;

    const cacheKey = cacheService.buildKey('grade_insights', JSON.stringify(subjectSummary));
    const cached = cacheService.get(cacheKey);
    if (cached) {
      try {
        setInsights(JSON.parse(cached));
        return;
      } catch { /* ignore */ }
    }

    setLoading(true);

    const subjectData = subjectSummary.map(s => `${s.subject}: ${s.avg}%`).join(', ');
    const overallAvg = Math.round(subjectSummary.reduce((s, c) => s + c.avg, 0) / subjectSummary.length);

    const prompt = `A student has these grade averages: ${subjectData}. Overall average: ${overallAvg}%.

Analyze and return ONLY valid JSON:
{
  "topSubject": "best performing subject",
  "weakestSubject": "subject needing most improvement",
  "trend": "improving|declining|stable",
  "gpaForecast": "Brief forecast (1 sentence)",
  "recommendations": ["specific tip 1", "specific tip 2", "specific tip 3"]
}`;

    try {
      const result = await modelRouter.generateJSON<InsightResult>(prompt, {
        systemPrompt: 'You are an academic advisor analyzing student grade data. Be specific and encouraging.',
      });

      if (result) {
        setInsights(result);
        cacheService.set(cacheKey, JSON.stringify(result), 30 * 60 * 1000);
      }
    } catch { /* silent fail */ }
    finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isExpanded && !insights) generate();
    setIsExpanded(prev => !prev);
  };

  if (!hasEnoughData) return null;

  return (
    <div className="border border-white/5 rounded-[2.5rem] overflow-hidden bg-zinc-950/40 backdrop-blur-3xl shadow-2xl transition-all duration-500 hover:shadow-indigo-500/10 group/ai">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-8 py-6 hover:bg-white/5 transition-all duration-500 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover/ai:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-0.5">AI Forecast</span>
            <span className="text-sm font-black text-white uppercase tracking-widest">AI Intelligence Hub</span>
          </div>
          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-4 h-4 text-indigo-400" />
            </motion.div>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-zinc-600 group-hover/ai:text-white transition-colors" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-600 group-hover/ai:text-white transition-colors" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 border-t border-white/5 space-y-6">
              {loading && (
                <div className="flex flex-col items-center gap-4 py-12">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full" />
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-2 border-t-indigo-500 rounded-full"
                    />
                  </div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest animate-pulse">Analyzing academic data...</p>
                </div>
              )}

              {!loading && insights && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pt-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-zinc-950/40 border border-white/5 shadow-xl group/card hover:border-emerald-500/30 transition-all duration-500">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Top Performance</span>
                      </div>
                      <p className="text-lg font-black text-white tracking-tighter truncate">{insights.topSubject}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-zinc-950/40 border border-white/5 shadow-xl group/card hover:border-red-500/30 transition-all duration-500">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                          <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Needs Attention</span>
                      </div>
                      <p className="text-lg font-black text-white tracking-tighter truncate">{insights.weakestSubject}</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20" />
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Performance Forecast</p>
                    <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                      {insights.gpaForecast}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-[1px] flex-grow bg-white/5" />
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                        <Lightbulb className="w-3 h-3 text-amber-400" />
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Recommendations</span>
                      </div>
                      <div className="h-[1px] flex-grow bg-white/5" />
                    </div>
                    
                    <ul className="space-y-3">
                      {insights.recommendations.map((rec, i) => (
                        <motion.li 
                          key={i} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="text-xs text-zinc-400 flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group/li border border-transparent hover:border-white/5"
                        >
                          <span className="text-indigo-400 font-black text-[10px] mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                          <span className="leading-relaxed font-medium group-hover/li:text-white transition-colors">{rec}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setInsights(null); generate(); }}
                      className="h-10 px-6 bg-white/5 hover:bg-white/10 text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-widest rounded-xl transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-2" /> Refresh Insights
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GradeInsights;
