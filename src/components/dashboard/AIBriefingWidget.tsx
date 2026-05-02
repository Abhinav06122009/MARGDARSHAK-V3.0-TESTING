import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Maximize2, Minimize2, RefreshCw, Loader2, Zap, ArrowRight, BrainCircuit, Target, Star, ChevronRight } from 'lucide-react';
import aiService, { type AIBriefing, type UserStats } from '../../lib/aiService';

interface BriefingWidgetProps {
  user: any;
  tasks: any[];
  notes?: any[];
  courses?: any[];
  grades?: any[];
  timetable?: any[];
  sessions?: any[];
  analytics?: any;
  stats?: UserStats;
}

const AIBriefingWidget: React.FC<BriefingWidgetProps> = ({
  user,
  tasks,
  notes = [],
  courses = [],
  grades = [],
  timetable = [],
  sessions = [],
  analytics,
  stats = { studyStreak: 0, tasksCompleted: 0, hoursStudied: 0 }
}) => {
  const [briefing, setBriefing] = useState<AIBriefing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const fetchBriefing = useCallback(async (force = false) => {
    if (!user?.id) return;
    // Don't auto-fetch if we already have it, unless forced
    if (hasFetchedRef.current && !force && briefing) return;
    
    setIsLoading(true);
    setError(null);
    hasFetchedRef.current = true;
    
    try {
      const userName = user.user_metadata?.full_name || user.profile?.full_name || "Scholar";

      // Context construction
      const briefingContext = {
        tasks: tasks || [],
        grades: grades?.length ? grades : (analytics?.topGrades || []),
        courses: courses?.length ? courses : (analytics?.subjectBreakdown || []),
        schedule: timetable?.length ? timetable : (tasks?.filter(t => t.due_date && new Date(t.due_date) > new Date()) || []),
        notes,
        sessions,
        stats: stats
      };

      const data = await aiService.generateDailyBriefing(user.id, userName, briefingContext);
      if (data) {
        setBriefing(data);
      } else {
        throw new Error("Empty response from intelligence core");
      }
    } catch (err: any) {
      console.error("Briefing Engine Error:", err);
      setError(err.message || "Could not reach intelligence core");
    } finally {
      setIsLoading(false);
    }
  }, [user, tasks, notes, courses, grades, timetable, sessions, analytics, stats, briefing]);

  // Initial auto-fetch when user is ready
  useEffect(() => {
    if (user?.id && !hasFetchedRef.current) {
      console.log("[Briefing] Auto-initializing for user:", user.id);
      fetchBriefing();
    }
  }, [user?.id, fetchBriefing]);

  // Robust fallback: if user exists but no briefing after 3 seconds, force a check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user?.id && !briefing && !isLoading && !hasFetchedRef.current) {
        console.log("[Briefing] Fallback auto-fetch triggered");
        fetchBriefing();
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [user?.id, briefing, isLoading, fetchBriefing]);

  // Re-fetch if critical data arrives later (only if we don't have a briefing yet)
  useEffect(() => {
    if (!briefing && !isLoading && user?.id && (tasks.length > 0 || courses.length > 0)) {
       fetchBriefing();
    }
  }, [tasks.length, courses.length, briefing, isLoading, user?.id, fetchBriefing]);

  return (
    <motion.div
      layout
      className={`relative overflow-hidden rounded-[2rem] border border-white/10 shadow-xl transition-all duration-500
        ${isExpanded ? 'bg-zinc-900 shadow-2xl' : 'bg-zinc-900/40 backdrop-blur-xl'}`}
    >
      {/* ── Background Effects ── */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-indigo-500/15 transition-colors duration-700" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700" />
      
      {/* Animated scanline */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, transparent 1px, transparent 3px)', backgroundSize: '100% 4px' }} />

      {/* Grain Texture - Fixed 404 */}
      <div className="absolute inset-0 bg-noise opacity-[0.04] mix-blend-overlay pointer-events-none" />

      <div className="relative p-5 sm:p-8 md:p-10 flex flex-col h-full z-10">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-[0.1em] uppercase">Intelligence Briefing</h3>
                <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter">Live Sync</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-0.5">Margdarshak Neural Core V3.0</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 15 }} 
              whileTap={{ scale: 0.9 }}
              onClick={() => fetchBriefing(true)} 
              className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 text-zinc-400 hover:text-white transition-all shadow-inner"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(!isExpanded)} 
              className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 text-zinc-400 hover:text-white transition-all shadow-inner"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col items-center justify-center py-12"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="w-12 h-12 text-indigo-400 animate-spin relative z-10" />
              </div>
              <div className="space-y-2 text-center">
                <span className="text-xs text-indigo-300 font-black uppercase tracking-[0.3em] block">Synthesizing Briefing</span>
                <span className="text-[10px] text-zinc-500 font-medium">Accessing student metadata & academic patterns...</span>
              </div>
              {/* Fake progress line */}
              <div className="mt-8 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center py-10"
            >
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-4">
                <Target className="w-8 h-8 text-rose-400" />
              </div>
              <h4 className="text-white font-bold mb-2 text-lg">Neural Connection Interrupted</h4>
              <p className="text-zinc-500 text-sm mb-6 text-center max-w-xs">{error}</p>
              <button 
                onClick={() => fetchBriefing(true)}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all"
              >
                Reconnect Core
              </button>
            </motion.div>
          ) : !briefing ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center py-10 text-center"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full" />
                <BrainCircuit className="w-16 h-16 text-amber-500/40 relative z-10" />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Initialize Daily Briefing</h2>
              <p className="text-zinc-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                Connect your academic profile to our neural core to receive personalized study insights and daily focus areas.
              </p>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchBriefing(true)}
                className="star-burst flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-black text-sm text-white uppercase tracking-widest shadow-2xl shadow-indigo-500/30 relative overflow-hidden"
              >
                <Zap className="w-4 h-4 fill-current" />
                Get Started
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] font-black text-amber-400/80 uppercase tracking-widest">Personalized Insight</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter">
                  {briefing?.greeting || "Ready to excel?"}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                {briefing?.focus_area && (
                  <div className="px-5 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-lg flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-black text-indigo-300 uppercase tracking-wider">
                      Focus: {briefing.focus_area}
                    </span>
                  </div>
                )}

                {stats && stats.studyStreak > 0 && (
                  <div className="px-5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 shadow-lg">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      {stats.studyStreak} Day Streak
                    </span>
                  </div>
                )}
              </div>

              <div className={`relative ${isExpanded ? '' : 'max-h-[120px] overflow-hidden'}`}>
                <div className={`text-zinc-300 font-medium leading-relaxed tracking-tight ${isExpanded ? 'text-xl' : 'text-base md:text-lg line-clamp-3'}`}>
                  {briefing?.message}
                </div>
                {!isExpanded && (
                  <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-zinc-900/60 to-transparent pointer-events-none" />
                )}
              </div>

              {isExpanded && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Target className="w-3.5 h-3.5" /> Core Focus Area
                    </h4>
                    <p className="text-white text-lg font-bold leading-snug">
                      Your current analytics suggest prioritizing {briefing.focus_area} to maintain your {stats.averageGrade ? stats.averageGrade + '%' : 'optimal'} trajectory.
                    </p>
                  </div>
                  <div className="flex flex-col justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02, x: 5 }}
                      onClick={() => window.location.href = '/ai-assistant'}
                      className="group flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Deeper Analysis</span>
                        <span className="text-sm font-bold text-white">Ask AI Assistant</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
              
              {!isExpanded && (
                <div className="mt-auto pt-6 flex justify-end">
                  <button onClick={() => setIsExpanded(true)} className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] hover:text-indigo-300 transition-colors flex items-center gap-2">
                    Read Full Analysis <ChevronRight size={10} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AIBriefingWidget;
