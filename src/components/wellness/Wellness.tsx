import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Heart, Moon, Droplets, Sun, Sparkles,
  Wind, Play, Pause, RefreshCcw, TrendingUp,
  ShieldCheck, AlertCircle, Coffee, Music,
  Smile, Frown, Meh, Star, Zap,
  ArrowLeft, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { dashboardService } from '@/lib/dashboardService';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import GlobalFooter from '@/components/layout/GlobalFooter';

// Social Icons
const linkedinLogo = () => (
  <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const TwitterLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z" />
  </svg>
);

// ─── Constants ──────────────────────────────────────────────────────────────
const MOODS = [
  { id: 'great', label: 'Great', Icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { id: 'good', label: 'Good', Icon: Smile, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { id: 'okay', label: 'Okay', Icon: Meh, color: 'text-zinc-400', bg: 'bg-zinc-500/20' },
  { id: 'tired', label: 'Tired', Icon: Coffee, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { id: 'bad', label: 'Bad', Icon: Frown, color: 'text-rose-400', bg: 'bg-rose-500/20' },
];

const AUDIO_STATIONS = [
  { id: 'lofi', label: 'Lofi Study', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3' },
  { id: 'rain', label: 'Heavy Rain', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bde808.mp3?filename=heavy-rain-nature-sounds-8186.mp3' },
  { id: 'beats', label: 'Binaural Beats', url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b32e02f9.mp3?filename=binaural-beats-focus-55618.mp3' },
];

const MEDITATION_SESSIONS = [
  { id: 'breathe', title: 'Deep Breathing', duration: 300, Icon: Wind, color: 'text-teal-400' },
  { id: 'focus', title: 'Laser Focus', duration: 600, Icon: Target, color: 'text-indigo-400' },
  { id: 'sleep', title: 'Dream State', duration: 900, Icon: Moon, color: 'text-purple-400' },
];

function Target(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

const TiltCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
    const centerX = card.width / 2;
    const centerY = card.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;
    setRotate({ x: rotateX, y: rotateY });
  };
  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setRotate({ x: 0, y: 0 })}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
};

// ─── Main Wellness Component ────────────────────────────────────────────────
const Wellness: React.FC = () => {
  const { toast } = useToast();

  // State Persistence Fallback to LocalStorage
  const [mood, setMood] = useState(() => localStorage.getItem('wellness_mood') || 'okay');
  const [hydration, setHydration] = useState(() => parseInt(localStorage.getItem('wellness_hydration') || '4'));
  const [sleep, setSleep] = useState(() => parseInt(localStorage.getItem('wellness_sleep') || '7'));

  const [burnoutRisk, setBurnoutRisk] = useState(32);
  const [recommendation, setRecommendation] = useState("Your cognitive load is optimal. Maintain current intensity.");
  const [isGenerating, setIsGenerating] = useState(false);

  // Audio State
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Meditation State
  const [activeMeditation, setActiveMeditation] = useState<typeof MEDITATION_SESSIONS[0] | null>(null);
  const [meditationTime, setMeditationTime] = useState(0);
  const [isMeditationActive, setIsMeditationActive] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    activeTasks: 0,
    overdueTasks: 0,
    studyStreak: 0,
    completionRate: 0
  });

  useEffect(() => {
    fetchWellnessData();
  }, []);

  // Audio Playback Effect
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeAudio]);

  // Meditation Timer Effect
  useEffect(() => {
    let interval: any;
    if (isMeditationActive && meditationTime > 0) {
      interval = setInterval(() => {
        setMeditationTime(prev => prev - 1);
      }, 1000);
    } else if (meditationTime === 0 && isMeditationActive) {
      setIsMeditationActive(false);
      setActiveMeditation(null);
      toast({ title: "Session Complete", description: "You've successfully centered your focus." });
    }
    return () => clearInterval(interval);
  }, [isMeditationActive, meditationTime]);

  const fetchWellnessData = async () => {
    try {
      const user = await dashboardService.getCurrentUser();
      if (!user) return;

      const data = await dashboardService.fetchAllUserData(user.id);
      const calculatedStats = dashboardService.calculateSecureStats(data);

      setStats({
        activeTasks: calculatedStats.totalTasks - calculatedStats.completedTasks,
        overdueTasks: calculatedStats.overdueTasksCount,
        studyStreak: calculatedStats.currentStreak,
        completionRate: calculatedStats.totalTasks > 0 
          ? Math.round((calculatedStats.completedTasks / calculatedStats.totalTasks) * 100) 
          : 0
      });

      analyzeWellness(
        calculatedStats.totalTasks - calculatedStats.completedTasks, 
        calculatedStats.overdueTasksCount, 
        calculatedStats.totalTasks > 0 ? Math.round((calculatedStats.completedTasks / calculatedStats.totalTasks) * 100) : 0
      );
    } catch (error) {
      console.error('Error fetching wellness data:', error);
    }
  };

  const analyzeWellness = async (active: number, overdue: number, rate: number) => {
    setIsGenerating(true);
    try {
      const result = await aiService.predictBurnout({
        todayStudyTime: 120,
        studyStreak: 5,
        inProgressTasks: active,
        pendingTasks: active,
        overdueTasks: overdue,
        completionRate: rate
      });

      if (result) {
        setBurnoutRisk(result.score);
        setRecommendation(result.action);
      }
    } catch (e) {
      console.error('AI Analysis failed:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMoodChange = (id: string) => {
    setMood(id);
    localStorage.setItem('wellness_mood', id);
    toast({ title: "Mood Recorded", description: `You are feeling ${id} today.` });
  };

  const handleHydration = (delta: number) => {
    const newVal = Math.max(0, Math.min(12, hydration + delta));
    setHydration(newVal);
    localStorage.setItem('wellness_hydration', newVal.toString());
  };

  const toggleAudio = (id: string) => {
    if (activeAudio === id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveAudio(id);
      setIsPlaying(true);
    }
  };

  const startMeditation = (session: typeof MEDITATION_SESSIONS[0]) => {
    setActiveMeditation(session);
    setMeditationTime(session.duration);
    setIsMeditationActive(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30">
      <audio ref={audioRef} src={AUDIO_STATIONS.find(s => s.id === activeAudio)?.url} loop />

      {/* ── Background Infrastructure ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 blur-[100px]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 min-h-screen flex flex-col">
          {/* ── Header Section ── */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <Link to="/dashboard" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group">
                  <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                </Link>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Wellness Matrix</span>
                </div>
              </div>
              <h1 className="text-5xl font-black tracking-tighter mb-4 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                Mind & <span className="italic text-emerald-400">Body</span> Balance
              </h1>
              <p className="text-zinc-400 text-lg font-medium max-w-xl leading-relaxed">
                Real-time biometric synthesis and burnout mitigation. Maintain your academic peak without compromising your health.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-6 p-6 bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl"
            >
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <motion.circle
                    cx="48" cy="48" r="40" fill="none" stroke="url(#wellnessGrad)" strokeWidth="8"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * (100 - burnoutRisk) / 100) }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="wellnessGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{100 - burnoutRisk}%</span>
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Integrity</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Vital Status</p>
                <p className="text-xl font-bold text-white mb-1">Optimal Performance</p>
                <div className="flex items-center gap-2 text-zinc-500 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  System Harmonized
                </div>
              </div>
            </motion.div>
          </header>

          {/* ── Meditation Active Modal ── */}
          <AnimatePresence>
            {isMeditationActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl p-6"
              >
                <div className="text-center space-y-12 max-w-lg w-full">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className={`mx-auto w-40 h-40 rounded-full flex items-center justify-center bg-zinc-900 border-4 ${activeMeditation?.color.replace('text', 'border')}`}
                  >
                    {activeMeditation && <activeMeditation.Icon className={`w-16 h-16 ${activeMeditation.color}`} />}
                  </motion.div>

                  <div>
                    <h2 className="text-4xl font-black text-white mb-2">{activeMeditation?.title}</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest">Focusing Inward</p>
                  </div>

                  <div className="text-7xl font-mono font-black text-white tracking-tighter">
                    {formatTime(meditationTime)}
                  </div>

                  <Button
                    onClick={() => setIsMeditationActive(false)}
                    className="px-12 h-16 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-black uppercase tracking-widest"
                  >
                    End Session
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Mood & Daily Vitality */}
            <div className="lg:col-span-4 space-y-8">

              {/* Mood Tracker */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-zinc-900/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-400" /> Mood State
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-3">
                      {MOODS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => handleMoodChange(m.id)}
                          className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${mood === m.id
                              ? `${m.bg} border-${m.color.split('-')[1]}-500/40 text-white`
                              : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10'
                            }`}
                        >
                          <m.Icon className={`w-6 h-6 ${mood === m.id ? m.color : 'group-hover:text-zinc-300'}`} />
                          <span className="text-[9px] font-black uppercase tracking-tighter">{m.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                        AI Note: Your mood patterns help us optimize your study intensity and schedule rest periods.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Hydration Tracker */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-zinc-900/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden group shadow-2xl">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 group-hover:scale-110 transition-transform">
                          <Droplets className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-black text-white uppercase tracking-widest text-sm">Hydration</h3>
                          <p className="text-xs text-zinc-500">Target: 8 Glasses</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => handleHydration(-1)}
                          className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl"
                        >-</Button>
                        <span className="text-2xl font-black text-white w-8 text-center">{hydration}</span>
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => handleHydration(1)}
                          className="w-10 h-10 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl"
                        >+</Button>
                      </div>
                    </div>
                    <div className="flex gap-1.5 h-10">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={false}
                          animate={{
                            backgroundColor: i < hydration ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                            borderColor: i < hydration ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)'
                          }}
                          className="flex-1 rounded-lg border shadow-inner"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Sleep Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-zinc-900/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                          <Moon className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-black text-white uppercase tracking-widest text-sm">Sleep Rhythm</h3>
                          <p className="text-xs text-zinc-500">Last Night</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-white">{sleep}h</span>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Regenerative</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <span>Rest Quality</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2 bg-white/5" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

            </div>

            {/* Right Column: AI Analysis & Meditation */}
            <div className="lg:col-span-8 space-y-8">

              {/* AI Burnout Detection Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', delay: 0.3 }}
              >
                <TiltCard>
                  <div className="relative p-10 rounded-[3rem] bg-zinc-950/60 backdrop-blur-3xl border border-white/10 overflow-hidden shadow-2xl group">
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px]" />
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-500/30">
                            <Brain className="w-8 h-8 text-rose-400" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Burnout Analysis</h2>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">AI Engine v4.2</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <div>
                            <div className="flex justify-between items-end mb-3">
                              <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Burnout Probability</p>
                              <span className={`text-4xl font-black ${burnoutRisk > 70 ? 'text-rose-400' : burnoutRisk > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {burnoutRisk}%
                              </span>
                            </div>
                            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${burnoutRisk}%` }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                className={`h-full rounded-full ${burnoutRisk > 70 ? 'bg-rose-500' : burnoutRisk > 40 ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`}
                              />
                            </div>
                          </div>

                          <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 relative overflow-hidden group/reco">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover/reco:opacity-100 transition-opacity" />
                            <div className="relative z-10 flex gap-4">
                              <Info className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                              <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">AI Recommendation</p>
                                <AnimatePresence mode="wait">
                                  <motion.p
                                    key={recommendation}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-zinc-300 leading-relaxed font-medium"
                                  >
                                    {isGenerating ? "Synthesizing vitality telemetry..." : recommendation}
                                  </motion.p>
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Active Load', value: stats.activeTasks, icon: Zap, color: 'text-amber-400' },
                          { label: 'Latency', value: stats.overdueTasks, icon: AlertCircle, color: 'text-rose-400' },
                          { label: 'Streak', value: stats.studyStreak, icon: TrendingUp, color: 'text-emerald-400' },
                          { label: 'Efficiency', value: `${stats.completionRate}%`, icon: Sparkles, color: 'text-indigo-400' }
                        ].map((stat, i) => (
                          <div key={i} className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 group/stat">
                            <stat.icon className={`w-5 h-5 ${stat.color} mb-3 group-hover/stat:scale-125 transition-transform`} />
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-xl font-bold text-white">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>

              {/* Meditation & Focus Hub */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Audio Hub */}
                  <Card className="bg-zinc-900/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Music className="w-5 h-5 text-indigo-400" /> Focus Audio
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {AUDIO_STATIONS.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => toggleAudio(s.id)}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${activeAudio === s.id && isPlaying ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeAudio === s.id && isPlaying ? 'bg-indigo-500' : 'bg-zinc-800'}`}>
                              {activeAudio === s.id && isPlaying ? (
                                <Pause className="w-4 h-4 text-white fill-current" />
                              ) : (
                                <Play className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                              )}
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${activeAudio === s.id && isPlaying ? 'text-indigo-400' : 'text-white'}`}>{s.label}</p>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Ambient Audio</p>
                            </div>
                          </div>
                          {activeAudio === s.id && isPlaying && (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 1.5, 2.5].map((h, i) => (
                                <motion.span
                                  key={i}
                                  animate={{ height: [h * 4, h * 8, h * 4] }}
                                  transition={{ repeat: Infinity, duration: 0.5 + i * 0.1 }}
                                  className="w-0.5 bg-indigo-400 rounded-full"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                        Configure Audio Matrix
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Meditation Hub */}
                  <Card className="bg-zinc-900/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Wind className="w-5 h-5 text-teal-400" /> Guided sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {MEDITATION_SESSIONS.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => startMeditation(session)}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-teal-500/10 hover:border-teal-500/20 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl bg-zinc-800 ${session.color} group-hover:scale-110 transition-all`}>
                              <session.Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{session.title}</p>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{session.duration / 60} min session</p>
                            </div>
                          </div>
                          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-teal-500/20 transition-colors">
                            <Play className="w-4 h-4 text-zinc-500 group-hover:text-teal-400" />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

            </div>
          </div>

          {/* ── Wellness Quote / AI Insight ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-24 text-center pb-12"
          >
            <div className="inline-flex flex-col items-center">
              <RefreshCcw className="w-8 h-8 text-zinc-800 mb-8 animate-spin-slow" />
              <p className="text-2xl font-medium text-zinc-500 italic max-w-3xl leading-relaxed">
                "True academic excellence is sustained not by constant output, but by the strategic oscillation
                between high-intensity focus and regenerative stillness."
              </p>
              <div className="mt-8 flex items-center gap-3 text-xs font-black text-zinc-700 uppercase tracking-[0.5em]">
                <div className="w-8 h-px bg-zinc-800" />
                MARGDARSHAK Wellness Philosophy
                <div className="w-8 h-px bg-zinc-800" />
              </div>
            </div>
          </motion.div>

      <GlobalFooter />

        </div>
      </ScrollArea>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Wellness;
