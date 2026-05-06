import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, CloudRain, Coffee, Headphones, Play, Pause,
  Volume2, VolumeX, ChevronUp, ChevronDown, X, Brain,
  AlertTriangle, CheckCircle, Sunrise, Wind, Upload, Trash2, FolderOpen,
  Sparkles, Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import aiService from '@/lib/aiService';
import { useNavigate } from 'react-router-dom';
import { courseService } from '@/components/dashboard/courseService';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/contexts/AuthContext';

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
  { id: 'whitenoise', label: 'White Noise',   Icon: Wind,        color: 'text-zinc-500',   url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_a47ef2cba8.mp3?filename=white-noise-10-minutes-39874.mp3' },
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
    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
  >
    <motion.div
      initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
      className="relative w-full max-w-md bg-white border border-red-500/30 rounded-3xl p-8 shadow-2xl overflow-hidden text-zinc-900"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 pointer-events-none rounded-3xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
            <Brain className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-zinc-800">Burnout Warning</h2>
            <p className="text-red-500 text-sm font-semibold">AI Wellness Intervention</p>
          </div>
          <button onClick={onDismiss} className="ml-auto p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-6 mb-6 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="url(#burnoutGrad)" strokeWidth="6"
                strokeDasharray={213.6} strokeDashoffset={213.6 - (213.6 * alert.score / 100)} strokeLinecap="round" />
              <defs>
                <linearGradient id="burnoutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-red-500">{Math.round(alert.score)}</span>
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider">risk</span>
            </div>
          </div>
          <div>
            <p className="text-zinc-700 text-sm leading-relaxed font-medium">{alert.message}</p>
            <div className="flex gap-3 mt-3 text-xs text-zinc-500">
              <span className="bg-zinc-100 px-2 py-1 rounded-lg">{alert.tasks_count} active tasks</span>
              <span className="bg-red-500/10 text-red-600 px-2 py-1 rounded-lg">{alert.overdue} overdue</span>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-200 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">AI Recommendation</p>
            <p className="text-zinc-600 text-sm leading-relaxed">{alert.action}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onDismiss} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> I'll Take a Break
          </button>
          <button onClick={onDismiss} className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl font-semibold transition-colors text-sm">Dismiss</button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
interface AmbientSoundPlayerProps {
  isWidget?: boolean;
}

export const AmbientSoundPlayer: React.FC<AmbientSoundPlayerProps> = ({ isWidget = false }) => {
  const [expanded, setExpanded] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeId, setActiveId] = useState('lofi');
  const [volume, setVolume] = useState(0.45);
  const [isMuted, setIsMuted] = useState(false);
  const [customTracks, setCustomTracks] = useState<Station[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Burnout
  const [burnoutAlert, setBurnoutAlert] = useState<BurnoutAlert | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useContext(AuthContext);
  const [isPremium, setIsPremium] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    courseService.getCurrentUser().then(userData => {
      const tier = userData?.profile?.subscription_tier;
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
  }, [activeId]);

  const togglePlay = () => {
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
        label: f.name.replace(/\.[^.]+$/, '').slice(0, 20),
        Icon: Music,
        color: 'text-pink-400',
        url: URL.createObjectURL(f),
        isCustom: true,
      }));

    if (newTracks.length === 0) return;

    setCustomTracks(prev => [...prev, ...newTracks]);
    setActiveId(newTracks[0].id);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeCustomTrack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const track = customTracks.find(t => t.id === id);
    if (track) URL.revokeObjectURL(track.url);
    setCustomTracks(prev => prev.filter(t => t.id !== id));
    if (activeId === id) setActiveId('lofi');
  };

  // ── Burnout check ────────────────────────────────────────────────────────
  const checkBurnout = useCallback(async () => {
    if (!user?.id) return;

    const currentUser = await courseService.getCurrentUser();
    const tier = currentUser?.profile?.subscription_tier;
    if (tier !== 'premium' && tier !== 'premium_elite') return;

    const { data: tasks } = await supabase
      .from('tasks').select('status, due_date').eq('user_id', user.id);
    if (!tasks || tasks.length === 0) return;

    const pending = tasks.filter(t => t.status !== 'completed');
    const overdue = tasks.filter(t => t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date());
    const done = tasks.filter(t => t.status === 'completed');
    const completionRate = Math.round((done.length / tasks.length) * 100);

    let score = 0;
    if (pending.length > 15) score += 30; else if (pending.length > 8) score += 15;
    if (overdue.length > 5) score += 25;   else if (overdue.length > 2) score += 10;
    if (completionRate < 40 && tasks.length > 5) score += 20;
    score = Math.min(100, score);

    if (score >= 45) {
      const aiResult = await aiService.predictBurnout({
        todayStudyTime: 0, studyStreak: 0,
        inProgressTasks: pending.length, pendingTasks: pending.length,
        overdueTasks: overdue.length, completionRate
      });
      const finalScore = aiResult?.score ?? score;
      if (finalScore >= 45) {
        setBurnoutAlert({
          score: finalScore,
          message: aiResult?.message ?? `You have ${pending.length} pending tasks, ${overdue.length} of which are overdue.`,
          action: aiResult?.action ?? 'Consider taking a short break.',
          tasks_count: pending.length, overdue: overdue.length
        });
      }
    }
  }, [user?.id]);

  useEffect(() => { checkBurnout(); }, [checkBurnout]);

  const Icon = station.Icon;
  const isCustomStation = station.isCustom;

  return (
    <>
      <AnimatePresence>
        {showModal && burnoutAlert && (
          <BurnoutModal alert={burnoutAlert} onDismiss={() => setShowModal(false)} />
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={handleFileImport}
      />

      <motion.div
        initial={isWidget ? { opacity: 0, y: 20 } : { x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1, y: 0 }}
        className={isWidget ? "relative w-full h-full" : "fixed bottom-24 left-6 z-[9999]"}
      >
        <motion.div
          layout
          className={`${isWidget ? 'w-full h-full' : 'w-72'} bg-zinc-100/70 backdrop-blur-[60px] border border-white/80 rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.1)] overflow-hidden text-zinc-900`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center">
                <Sparkles className="text-indigo-600" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-800">Built-in Station</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">VSAV EDUKEEDA</p>
              </div>
            </div>
            {!isWidget && (
              <button 
                onClick={() => setExpanded(!expanded)}
                className="p-2 hover:bg-black/5 rounded-full text-zinc-400 hover:text-zinc-600 transition-all"
              >
                {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>
            )}
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-5 pb-5 overflow-hidden"
              >
                {/* Mini Player Row */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-black/5 rounded-[1.5rem] border border-black/[0.03]">
                  <button
                    onClick={togglePlay}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 ${isPlaying ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-zinc-400'}`}
                  >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate text-zinc-800 uppercase tracking-wide">{station.label}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Icon size={12} className={isPlaying ? 'text-indigo-600' : 'text-zinc-400'} />
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        {isPlaying ? 'Playing' : 'Paused'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-black/5 rounded-full text-zinc-400 hover:text-indigo-600 transition-all"
                    title="Import MP3"
                  >
                    <Upload size={14} />
                  </button>
                </div>

                {/* Stations Grid */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {allStations.slice(0, 6).map(s => {
                    const SI = s.Icon;
                    const isActive = activeId === s.id;
                    return (
                      <button 
                        key={s.id} 
                        onClick={() => selectStation(s.id)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-black/5 border-transparent text-zinc-500 hover:bg-black/[0.08]'}`}
                      >
                        <SI className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                        <span className="text-[9px] font-black uppercase tracking-tighter truncate w-full text-center leading-tight">{s.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* My Music Section (if any) */}
                {customTracks.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2 px-1">My Tracks</p>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-hide">
                      {customTracks.map(t => (
                        <div key={t.id} 
                          onClick={() => selectStation(t.id)}
                          className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${activeId === t.id ? 'bg-pink-500/10 border-pink-500/20 text-pink-600' : 'bg-black/5 border-transparent text-zinc-500 hover:bg-black/[0.05]'}`}
                        >
                          <Music size={12} className={activeId === t.id ? 'text-pink-500' : 'text-zinc-400'} />
                          <span className="flex-1 text-[10px] font-bold truncate uppercase">{t.label}</span>
                          <button onClick={(e) => removeCustomTrack(t.id, e)} className="p-1 hover:text-red-500 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Volume & Burnout */}
                <div className="mt-auto space-y-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-400 hover:text-zinc-600">
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <input
                      type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume}
                      onChange={e => setVolume(parseFloat(e.target.value))}
                      className="flex-1 h-1 bg-black/10 rounded-full appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-[10px] font-bold text-zinc-500 w-8 text-right">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                  </div>

                  {burnoutAlert && (
                    <button 
                      onClick={() => setShowModal(true)}
                      className="w-full flex items-center gap-2 p-3 bg-red-500/5 border border-red-500/10 rounded-2xl hover:bg-red-500/10 transition-colors group"
                    >
                      <Brain className="w-4 h-4 text-red-500 group-hover:animate-pulse" />
                      <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">Burnout Risk: {Math.round(burnoutAlert.score)}%</p>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!expanded && (
            <div className="px-5 pb-5">
               <div className="flex items-center gap-4 p-3 bg-black/5 rounded-2xl border border-black/[0.03]">
                  <button
                    onClick={togglePlay}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all ${isPlaying ? 'bg-indigo-600' : 'bg-zinc-400'}`}
                  >
                    {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black truncate text-zinc-800 uppercase tracking-wider">{station.label}</p>
                    {burnoutAlert && <p className="text-[8px] font-bold text-red-500 uppercase">Burnout Risk detected</p>}
                  </div>
               </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      <audio key={station.url} ref={audioRef} src={station.url} loop className="hidden" />
    </>
  );
};

export default AmbientSoundPlayer;
