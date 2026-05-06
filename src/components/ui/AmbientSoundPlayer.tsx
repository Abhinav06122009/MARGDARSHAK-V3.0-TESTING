import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, CloudRain, Coffee, Headphones, Play, Pause,
  Volume2, VolumeX, ChevronUp, ChevronDown, X, Brain,
  Upload, Trash2, FolderOpen, Sparkles, Lock, Command
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import aiService from '@/lib/aiService';
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

const BUILT_IN_STATIONS: Station[] = [
  { id: 'lofi',       label: 'Lofi Focus',    Icon: Music,       color: 'text-purple-400', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3' },
  { id: 'rain',       label: 'Heavy Rain',    Icon: CloudRain,   color: 'text-blue-400',   url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bde808.mp3?filename=heavy-rain-nature-sounds-8186.mp3' },
  { id: 'cafe',       label: 'Cafe Noise',    Icon: Coffee,      color: 'text-amber-400',  url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c82bf0c0a9.mp3?filename=restaurant-ambience-44815.mp3' },
  { id: 'binaural',   label: 'Binaural',      Icon: Headphones,  color: 'text-teal-400',   url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b32e02f9.mp3?filename=binaural-beats-focus-55618.mp3' },
  { id: 'nature',     label: 'Nature',        Icon: Sunrise,     color: 'text-green-400',  url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d1718ab41b.mp3?filename=forest-with-small-river-birds-and-nature-field-recording-6735.mp3' },
  { id: 'whitenoise', label: 'White Noise',   Icon: Wind,        color: 'text-zinc-500',   url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_a47ef2cba8.mp3?filename=white-noise-10-minutes-39874.mp3' },
];

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
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onDismiss} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors text-sm">Dismiss</button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

export const AmbientSoundPlayer: React.FC<{ isWidget?: boolean }> = ({ isWidget = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeId, setActiveId] = useState('lofi');
  const [volume, setVolume] = useState(0.45);
  const [isMuted, setIsMuted] = useState(false);
  const [customTracks, setCustomTracks] = useState<Station[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useContext(AuthContext);
  const [burnoutAlert, setBurnoutAlert] = useState<BurnoutAlert | null>(null);
  const [showModal, setShowModal] = useState(false);

  const allStations = [...BUILT_IN_STATIONS, ...customTracks];
  const station = allStations.find(s => s.id === activeId) ?? allStations[0];

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (!audioRef.current) return;
    const wasPlaying = isPlaying;
    audioRef.current.pause();
    audioRef.current.load();
    if (wasPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
  }, [activeId]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); }
    else { audioRef.current.play().catch(console.error); }
    setIsPlaying(p => !p);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newTracks: Station[] = files
      .filter(f => f.type.startsWith('audio/'))
      .map(f => ({
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        label: f.name.replace(/\.[^.]+$/, '').slice(0, 15),
        Icon: Music,
        color: 'text-indigo-400',
        url: URL.createObjectURL(f),
        isCustom: true,
      }));
    if (newTracks.length) {
      setCustomTracks(prev => [...prev, ...newTracks]);
      setActiveId(newTracks[0].id);
    }
  };

  const removeCustomTrack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const track = customTracks.find(t => t.id === id);
    if (track) URL.revokeObjectURL(track.url);
    setCustomTracks(prev => prev.filter(t => t.id !== id));
    if (activeId === id) setActiveId('lofi');
  };

  const checkBurnout = useCallback(async () => {
    if (!user?.id) return;
    const { data: tasks } = await supabase.from('tasks').select('status, due_date').eq('user_id', user.id);
    if (!tasks?.length) return;
    const pending = tasks.filter(t => t.status !== 'completed');
    const overdue = tasks.filter(t => t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date());
    if (pending.length > 8) {
      setBurnoutAlert({
        score: Math.min(100, pending.length * 8),
        message: 'High workload detected.',
        action: 'Take a short break.',
        tasks_count: pending.length,
        overdue: overdue.length
      });
    }
  }, [user?.id]);

  useEffect(() => { checkBurnout(); }, [checkBurnout]);

  return (
    <>
      <AnimatePresence>{showModal && burnoutAlert && <BurnoutModal alert={burnoutAlert} onDismiss={() => setShowModal(false)} />}</AnimatePresence>
      <input ref={fileInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={handleFileImport} />

      <motion.div
        drag dragMomentum={false}
        initial={isWidget ? { opacity: 0 } : { x: 32, y: typeof window !== 'undefined' ? window.innerHeight - 100 : 600 }}
        className={isWidget ? "relative w-full h-full" : "fixed z-[9999] cursor-grab active:cursor-grabbing"}
      >
        <motion.div
          layout
          className={`flex flex-col bg-[#111111]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden text-white transition-all ${expanded ? 'w-80 p-6' : 'w-auto px-2 py-2 items-center'}`}
        >
          {!expanded ? (
            // PILL MODE (Compact like user image)
            <div className="flex items-center gap-4 pl-1 pr-3">
              <button 
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white shadow-xl"
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
              </button>
              <div className="flex items-center gap-2 pr-2">
                <Music size={14} className="text-zinc-500" />
                <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">{station.label}</span>
              </div>
              <div className="flex items-center gap-3">
                 <button onClick={() => fileInputRef.current?.click()} className="text-zinc-500 hover:text-white transition-colors">
                   <Upload size={14} />
                 </button>
                 {burnoutAlert && (
                   <button onClick={() => setShowModal(true)} className="text-amber-500 hover:text-amber-400">
                     <Lock size={14} />
                   </button>
                 )}
                 <button onClick={() => setExpanded(true)} className="text-zinc-500 hover:text-white">
                   <ChevronUp size={14} />
                 </button>
              </div>
            </div>
          ) : (
            // EXPANDED MODE
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                     <Sparkles size={20} className="text-white" />
                   </div>
                   <div>
                     <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Sanctuary</h3>
                     <p className="text-sm font-bold">{station.label}</p>
                   </div>
                </div>
                <button onClick={() => setExpanded(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500">
                  <ChevronDown size={20} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-3xl border border-white/[0.05]">
                <button onClick={togglePlay} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all ${isPlaying ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>
                <div className="flex-1 min-w-0">
                  <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] font-black text-zinc-500 uppercase">Volume</span>
                    <span className="text-[10px] font-black text-indigo-400">{Math.round(volume * 100)}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-6">
                {BUILT_IN_STATIONS.map(s => (
                  <button key={s.id} onClick={() => setActiveId(s.id)} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${activeId === s.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'}`}>
                    <s.Icon size={14} />
                    <span className="text-[8px] font-black uppercase tracking-tighter truncate w-full text-center">{s.label}</span>
                  </button>
                ))}
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-dashed border-white/20 text-zinc-500 hover:bg-white/5">
                   <FolderOpen size={14} />
                   <span className="text-[8px] font-black uppercase">Add</span>
                </button>
              </div>

              {customTracks.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {customTracks.map(t => (
                    <div key={t.id} onClick={() => setActiveId(t.id)} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${activeId === t.id ? 'bg-indigo-600/20 border-indigo-600 text-indigo-400' : 'bg-white/5 border-transparent text-zinc-500'}`}>
                      <Music size={12} />
                      <span className="flex-1 text-[10px] font-black uppercase truncate">{t.label}</span>
                      <button onClick={(e) => removeCustomTrack(t.id, e)} className="hover:text-red-500"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
      <audio ref={audioRef} src={station.url} loop className="hidden" />
    </>
  );
};

export default AmbientSoundPlayer;
