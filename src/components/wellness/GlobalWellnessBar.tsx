/**
 * GlobalWellnessBar — persistent floating mini-player + AI burnout detector.
 * Supports built-in stations AND user-imported local MP3 files.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, CloudRain, Coffee, Headphones, Play, Pause,
  Volume2, VolumeX, ChevronUp, ChevronDown, X, Brain,
  AlertTriangle, CheckCircle, Sunrise, Wind, Upload, Trash2, FolderOpen
} from 'lucide-react';
import { dashboardService } from '@/lib/dashboardService';
import aiService from '@/lib/aiService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Station {
  id: string;
  label: string;
  Icon: React.ElementType;
  color: string;
  url: string;
  isCustom?: boolean;
}

// ─── Built-in Stations ────────────────────────────────────────────────────────
const BUILT_IN_STATIONS: Station[] = [
  { id: 'lofi',       label: 'Lofi Focus',    Icon: Music,       color: 'text-purple-400', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3' },
  { id: 'rain',       label: 'Heavy Rain',    Icon: CloudRain,   color: 'text-blue-400',   url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bde808.mp3?filename=heavy-rain-nature-sounds-8186.mp3' },
  { id: 'cafe',       label: 'Cafe Noise',    Icon: Coffee,      color: 'text-amber-400',  url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c82bf0c0a9.mp3?filename=restaurant-ambience-44815.mp3' },
  { id: 'binaural',   label: 'Binaural',      Icon: Headphones,  color: 'text-teal-400',   url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b32e02f9.mp3?filename=binaural-beats-focus-55618.mp3' },
  { id: 'nature',     label: 'Nature',        Icon: Sunrise,     color: 'text-green-400',  url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d1718ab41b.mp3?filename=forest-with-small-river-birds-and-nature-field-recording-6735.mp3' },
  { id: 'whitenoise', label: 'White Noise',   Icon: Wind,        color: 'text-zinc-300',   url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_a47ef2cba8.mp3?filename=white-noise-10-minutes-39874.mp3' },
];

// ─── Burnout Modal ────────────────────────────────────────────────────────────
interface BurnoutAlert {
  score: number;
  message: string;
  action: string;
  tasks_count: number;
  overdue: number;
}

const BurnoutModal: React.FC<{ alert: BurnoutAlert; onDismiss: () => void }> = ({ alert, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
  >
    <motion.div
      initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
      className="relative w-full max-w-md bg-zinc-900 border border-red-500/30 rounded-3xl p-8 shadow-2xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/5 pointer-events-none rounded-3xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/30">
            <Brain className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Burnout Warning</h2>
            <p className="text-red-400 text-sm font-semibold">AI Wellness Intervention</p>
          </div>
          <button onClick={onDismiss} className="ml-auto p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-6 mb-6 p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="url(#burnoutGrad)" strokeWidth="6"
                strokeDasharray={213.6} strokeDashoffset={213.6 - (213.6 * alert.score / 100)} strokeLinecap="round" />
              <defs>
                <linearGradient id="burnoutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-red-400">{alert.score}</span>
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider">risk</span>
            </div>
          </div>
          <div>
            <p className="text-zinc-200 text-sm leading-relaxed font-medium">{alert.message}</p>
            <div className="flex gap-3 mt-3 text-xs text-zinc-400">
              <span className="bg-zinc-800 px-2 py-1 rounded-lg">{alert.tasks_count} active tasks</span>
              <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-lg">{alert.overdue} overdue</span>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/50 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">AI Recommendation</p>
            <p className="text-zinc-200 text-sm leading-relaxed">{alert.action}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onDismiss} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> I'll Take a Break
          </button>
          <button onClick={onDismiss} className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold transition-colors text-sm">Dismiss</button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const GlobalWellnessBar: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeId, setActiveId] = useState('lofi');
  const [volume, setVolume] = useState(0.45);
  const [isMuted, setIsMuted] = useState(false);
  const [customTracks, setCustomTracks] = useState<Station[]>([]);
  const [showUploadHint, setShowUploadHint] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Burnout
  const [burnoutAlert, setBurnoutAlert] = useState<BurnoutAlert | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    dashboardService.getCurrentUser().then(user => {
      const tier = user?.profile?.subscription_tier;
      if (tier === 'premium' || tier === 'premium_elite') setIsPremium(true);
    });
  }, []);

  // All stations = built-in + custom
  const allStations = [...BUILT_IN_STATIONS, ...customTracks];
  const station = allStations.find(s => s.id === activeId) ?? allStations[0];

  // ── Volume / mute sync ───────────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // ── Switch track: update src and resume if was playing ──────────────────
  useEffect(() => {
    if (!audioRef.current) return;
    const wasPlaying = isPlaying;
    audioRef.current.pause();
    audioRef.current.load();
    if (wasPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const togglePlay = () => {
    if (!station.isCustom && !isPremium) {
      toast({
        title: "Premium Required",
        description: "Built-in Stations require a Premium subscription.",
        variant: "destructive",
        icon: <Lock className="w-4 h-4" />
      });
      navigate('/upgrade');
      return;
    }

    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); }
    else { audioRef.current.play().catch(console.error); }
    setIsPlaying(p => !p);
  };

  const selectStation = (id: string) => {
    setActiveId(id);
  };

  // ── MP3 import ──────────────────────────────────────────────────────────
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const newTracks: Station[] = files
      .filter(f => f.type.startsWith('audio/') || f.name.endsWith('.mp3') || f.name.endsWith('.ogg') || f.name.endsWith('.wav') || f.name.endsWith('.flac'))
      .map(f => ({
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        label: f.name.replace(/\.[^.]+$/, '').slice(0, 20), // strip extension, max 20 chars
        Icon: Music,
        color: 'text-pink-400',
        url: URL.createObjectURL(f),
        isCustom: true,
      }));

    if (newTracks.length === 0) return;

    setCustomTracks(prev => [...prev, ...newTracks]);
    // Auto-select and play first imported
    setActiveId(newTracks[0].id);
    setShowUploadHint(false);

    // Reset input so same file can be re-imported
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeCustomTrack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const track = customTracks.find(t => t.id === id);
    if (track) URL.revokeObjectURL(track.url); // Free memory
    setCustomTracks(prev => prev.filter(t => t.id !== id));
    if (activeId === id) setActiveId('lofi');
  };

  // ── Burnout check ────────────────────────────────────────────────────────
  const checkBurnout = useCallback(async () => {
    const user = await dashboardService.getCurrentUser();
    if (!user) return;
    setIsLoggedIn(true);

    const tier = user.profile?.subscription_tier;
    if (tier !== 'premium' && tier !== 'premium_elite') {
      return;
    }

    const data = await dashboardService.fetchAllUserData(user.id);
    const calculatedStats = dashboardService.calculateSecureStats(data);
    
    if (calculatedStats.totalTasks === 0) return;

    const pendingCount = calculatedStats.totalTasks - calculatedStats.completedTasks;
    const overdueCount = calculatedStats.overdueTasksCount;
    const completionRate = calculatedStats.totalTasks > 0 ? Math.round((calculatedStats.completedTasks / calculatedStats.totalTasks) * 100) : 0;

    let score = 0;
    if (pendingCount > 15) score += 30; else if (pendingCount > 8) score += 15;
    if (overdueCount > 5) score += 25;   else if (overdueCount > 2) score += 10;
    if (completionRate < 40 && calculatedStats.totalTasks > 5) score += 20;
    score = Math.min(100, score);

    if (score >= 45) {
      const aiResult = await aiService.predictBurnout({
        todayStudyTime: calculatedStats.totalStudyTime, 
        studyStreak: calculatedStats.currentStreak,
        inProgressTasks: pendingCount, 
        pendingTasks: pendingCount,
        overdueTasks: overdueCount, 
        completionRate
      });
      const finalScore = aiResult?.score ?? score;
      if (finalScore >= 45) {
        setBurnoutAlert({
          score: finalScore,
          message: aiResult?.message ?? `You have ${pendingCount} pending tasks, ${overdueCount} of which are overdue.`,
          action: aiResult?.action ?? 'Consider taking a short break and rescheduling lower-priority tasks.',
          tasks_count: pendingCount, overdue: overdueCount
        });
        setTimeout(() => setShowModal(true), 3000);
      }
    }
  }, []);

  useEffect(() => { checkBurnout(); }, [checkBurnout]);

  if (!isLoggedIn) return null;

  const Icon = station.Icon;
  const isCustomStation = station.isCustom;

  return (
    <>
      <AnimatePresence>
        {showModal && burnoutAlert && (
          <BurnoutModal alert={burnoutAlert} onDismiss={() => setShowModal(false)} />
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.ogg,.wav,.flac,.m4a"
        multiple
        className="hidden"
        onChange={handleFileImport}
      />

      {/* ── Floating Bar ── */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 24 }}
        className="fixed bottom-4 left-4 z-[100] pointer-events-auto"
      >
        <motion.div
          layout
          className="bg-zinc-900/96 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          style={{ minWidth: 260, maxWidth: 320 }}
        >
          {/* ── Expanded Panel ── */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {/* Section: Built-in */}
                <div className="px-3 pt-3 pb-1">
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-2 px-1">Built-in Stations</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {BUILT_IN_STATIONS.map(s => {
                      const SI = s.Icon;
                      const isActive = activeId === s.id;
                      return (
                        <button key={s.id} onClick={(e) => {
                          if (!isPremium) {
                            e.stopPropagation();
                            toast({
                              title: "Premium Required",
                              description: "Built-in Stations require a Premium subscription.",
                              variant: "destructive",
                              icon: <Lock className="w-4 h-4" />
                            });
                            navigate('/upgrade');
                            return;
                          }
                          selectStation(s.id);
                        }}
                          className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all text-xs font-medium ${isActive ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
                        >
                          <SI className={`w-4 h-4 ${isActive ? s.color : ''}`} />
                          <span className="truncate w-full text-center leading-tight">{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section: My Music */}
                <div className="px-3 pt-2 pb-1 border-t border-white/5 mt-2">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">My Music</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-lg border border-indigo-500/20"
                    >
                      <Upload className="w-3 h-3" /> Import MP3
                    </button>
                  </div>

                  {customTracks.length === 0 ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-dashed border-white/10 text-zinc-600 hover:text-zinc-400 hover:border-white/20 transition-all text-xs"
                    >
                      <FolderOpen className="w-6 h-6" />
                      <span>Click to import MP3, WAV, FLAC files</span>
                      <span className="text-[10px] text-zinc-700">Files stay local — nothing is uploaded</span>
                    </button>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {customTracks.map(s => {
                        const isActive = activeId === s.id;
                        return (
                          <div key={s.id}
                            className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${isActive ? 'bg-pink-500/10 border-pink-500/30 text-pink-300' : 'border-white/5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
                            onClick={() => selectStation(s.id)}
                          >
                            <Music className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-pink-400' : 'text-zinc-600'}`} />
                            <span className="flex-1 text-xs font-medium truncate">{s.label}</span>
                            {isActive && isPlaying && (
                              <div className="flex items-center gap-0.5">
                                {[1.5, 2.5, 1.5].map((h, i) => (
                                  <motion.span key={i} className="w-0.5 rounded-full bg-pink-400"
                                    animate={{ height: [h * 4, h * 8, h * 4] }} transition={{ repeat: Infinity, duration: 0.6 + i * 0.15, ease: 'easeInOut' }}
                                    style={{ height: h * 4 }}
                                  />
                                ))}
                              </div>
                            )}
                            <button
                              onClick={(e) => removeCustomTrack(s.id, e)}
                              className="p-1 text-zinc-700 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Volume */}
                <div className="flex items-center gap-3 px-4 py-2.5 border-t border-white/5">
                  <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-400 hover:text-white transition-colors">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-xs text-zinc-500 w-8 text-right">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                </div>

                {/* Burnout pill */}
                {burnoutAlert && isPremium && (
                  <button onClick={() => setShowModal(true)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-400 bg-red-500/10 border-t border-white/5 hover:bg-red-500/15 transition-colors"
                  >
                    <Brain className="w-4 h-4" />
                    AI detected burnout risk ({burnoutAlert.score}%) — tap to view
                  </button>
                )}
                {!isPremium && (
                  <button onClick={() => navigate('/upgrade')}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-amber-400 bg-amber-500/10 border-t border-white/5 hover:bg-amber-500/15 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    AI Burnout Predictor (Premium)
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Mini Player Row ── */}
          <div className="flex items-center gap-3 px-3 py-2.5">
            <button
              onClick={togglePlay}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg flex-shrink-0 ${isPlaying ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-white/10 hover:bg-white/15'}`}
            >
              {isPlaying ? <Pause className="w-4 h-4 text-white fill-current" /> : <Play className="w-4 h-4 text-white fill-current ml-0.5" />}
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Icon className={`w-4 h-4 flex-shrink-0 ${isPlaying ? (isCustomStation ? 'text-pink-400' : station.color) : 'text-zinc-500'}`} />
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${isPlaying ? 'text-white' : 'text-zinc-400'}`}>
                  {station.label}
                  {isCustomStation && <span className="ml-1 text-[9px] text-pink-400 font-normal">MY MUSIC</span>}
                </p>
                {isPlaying && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[2, 3, 2, 3.5, 2].map((h, i) => (
                      <motion.span key={i}
                        className={`w-0.5 rounded-full ${isCustomStation ? 'bg-pink-400' : station.color.replace('text-', 'bg-')}`}
                        animate={{ height: [h, h * 1.8, h] }}
                        transition={{ repeat: Infinity, duration: 0.7 + i * 0.1, ease: 'easeInOut' }}
                        style={{ height: h * 4 }}
                      />
                    ))}
                    <span className="text-[9px] text-zinc-500 ml-1">Playing</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick import button in collapsed state */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
              title="Import MP3"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>

            {burnoutAlert && isPremium && (
              <button onClick={() => setShowModal(true)} title="Burnout risk detected">
                <Brain className="w-4 h-4 text-red-400 animate-pulse" />
              </button>
            )}
            {!isPremium && (
              <button onClick={() => navigate('/upgrade')} title="AI Burnout Predictor (Locked)">
                <Lock className="w-4 h-4 text-amber-400" />
              </button>
            )}

            <button
              onClick={() => setExpanded(e => !e)}
              className="text-zinc-500 hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-white/5"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Hidden audio element — key forces re-mount on src change */}
      <audio key={station.url} ref={audioRef} src={station.url} loop className="hidden" />
    </>
  );
};

export default GlobalWellnessBar;
