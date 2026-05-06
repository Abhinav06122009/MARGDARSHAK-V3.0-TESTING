import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, CloudRain, Coffee, Headphones, Play, Pause,
  Volume2, VolumeX, ChevronUp, ChevronDown, X, Brain,
  Upload, Trash2, FolderOpen, Sparkles, Lock, Command,
  Wind, Sunrise
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from '@/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Station {
  id: string;
  label: string;
  Icon: React.ElementType;
  url: string;
  isCustom?: boolean;
}

const BUILT_IN_STATIONS: Station[] = [
  { id: 'lofi',       label: 'Lofi Focus',    Icon: Music,       url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3' },
  { id: 'rain',       label: 'Heavy Rain',    Icon: CloudRain,   url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bde808.mp3?filename=heavy-rain-nature-sounds-8186.mp3' },
  { id: 'cafe',       label: 'Cafe Noise',    Icon: Coffee,      url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c82bf0c0a9.mp3?filename=restaurant-ambience-44815.mp3' },
  { id: 'binaural',   label: 'Binaural',      Icon: Headphones,  url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b32e02f9.mp3?filename=binaural-beats-focus-55618.mp3' },
  { id: 'nature',     label: 'Nature',        Icon: Sunrise,     url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d1718ab41b.mp3?filename=forest-with-small-river-birds-and-nature-field-recording-6735.mp3' },
  { id: 'whitenoise', label: 'White Noise',   Icon: Wind,        url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_a47ef2cba8.mp3?filename=white-noise-10-minutes-39874.mp3' },
];

interface BurnoutAlert {
  score: number;
  message: string;
}

interface AmbientSoundPlayerProps {
  isWidget?: boolean;
}

export const AmbientSoundPlayer: React.FC<AmbientSoundPlayerProps> = ({ isWidget = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeId, setActiveId] = useState('lofi');
  const [volume, setVolume] = useState(0.45);
  const [isMuted, setIsMuted] = useState(false);
  const [customTracks, setCustomTracks] = useState<Station[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useContext(AuthContext);
  const [burnout, setBurnout] = useState<BurnoutAlert | null>(null);

  const allStations = [...BUILT_IN_STATIONS, ...customTracks];
  const station = allStations.find(s => s.id === activeId) ?? allStations[0];

  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        url: URL.createObjectURL(f),
        isCustom: true,
      }));
    if (newTracks.length) {
      setCustomTracks(prev => [...prev, ...newTracks]);
      setActiveId(newTracks[0].id);
    }
  };

  const syncBurnout = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', user.id).neq('status', 'completed');
      if (!tasks) return;
      
      const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date());
      const highPrio = tasks.filter(t => t.priority === 'high');
      
      const score = Math.min(100, (tasks.length * 5) + (overdue.length * 15) + (highPrio.length * 10));
      
      let message = "Mind is clear. Ready to focus.";
      if (score > 80) message = "Extreme Burnout Risk. Stop and Rest.";
      else if (score > 50) message = "High Stress. Take a breather.";
      else if (score > 30) message = "Moderate Load. Stay steady.";

      setBurnout({ score, message });
    } catch (e) {
      console.error('Burnout sync failed:', e);
    }
  }, [user?.id]);

  useEffect(() => {
    syncBurnout();
    const channel = supabase.channel('tasks_burnout')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user?.id}` }, syncBurnout)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, syncBurnout]);

  const outerClass = isWidget ? 'relative' : 'fixed z-[999999] bottom-[110px] left-6';

  return (
    <React.Fragment>
      {/* Main floating player (draggable) */}
      <div className={outerClass} style={isWidget ? {} : { position: 'fixed' }}>
      <input ref={fileInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={handleFileImport} />

      <motion.div
        drag dragMomentum={false}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto cursor-grab active:cursor-grabbing"
      >
        <div className={`flex flex-col bg-[#1A1A1A]/80 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden text-white ${expanded ? 'w-[360px]' : 'w-auto'}`}>

          {expanded ? (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Built-in Stations</span>
                 <button onClick={() => setExpanded(false)} className="text-zinc-500 hover:text-white transition-colors">
                   <ChevronDown size={18} />
                 </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {BUILT_IN_STATIONS.map(s => {
                  const isActive = activeId === s.id;
                  return (
                    <button key={s.id} onClick={() => setActiveId(s.id)} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${isActive ? 'bg-[#2A2A2A] border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-[#222222] border-transparent text-zinc-500 hover:bg-[#252525]'}`}>
                      <s.Icon size={20} className={isActive ? 'text-purple-400' : 'text-zinc-500'} />
                      <span className="text-[10px] font-bold tracking-tight">{s.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">My Music</span>
                 <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg text-[10px] font-bold hover:bg-indigo-600/30 transition-all border border-indigo-500/20">
                   <Upload size={12} />
                   Import MP3
                 </button>
              </div>

              <div onClick={() => fileInputRef.current?.click()} className="group relative flex flex-col items-center justify-center py-10 border-2 border-dashed border-zinc-800 rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all bg-[#222222]/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <FolderOpen size={32} className="text-zinc-700 group-hover:text-indigo-400 transition-colors mb-3" />
                <p className="text-[11px] font-bold text-zinc-500 group-hover:text-zinc-300">Click to import MP3, WAV, FLAC files</p>
                <p className="text-[9px] text-zinc-600 mt-1">Files stay local — nothing is uploaded</p>
              </div>

              {customTracks.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                   {customTracks.map(t => (
                     <div key={t.id} onClick={() => setActiveId(t.id)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${activeId === t.id ? 'bg-[#2A2A2A] border-indigo-500/50' : 'bg-[#222222] border-transparent text-zinc-500'}`}>
                        <Music size={14} className={activeId === t.id ? 'text-indigo-400' : 'text-zinc-600'} />
                        <span className="flex-1 text-[10px] font-bold truncate">{t.label}</span>
                        <Trash2 size={12} className="cursor-pointer hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); setCustomTracks(p => p.filter(x => x.id !== t.id)); }} />
                     </div>
                   ))}
                </div>
              )}

              <div className="flex items-center gap-4 pt-2">
                <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-500 hover:text-white transition-colors">
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={e => setVolume(parseFloat(e.target.value))} className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                <span className="text-[10px] font-black text-zinc-600 tabular-nums w-8 text-right">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
              </div>

              {burnout && (
                <div className={`flex flex-col gap-2 py-3 px-4 rounded-xl border ${burnout.score > 50 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                   <div className="flex items-center gap-3">
                      <Brain size={16} />
                      <span className="text-[11px] font-bold tracking-tight">AI Burnout Predictor: {Math.round(burnout.score)}%</span>
                   </div>
                   <p className="text-[9px] font-medium opacity-80 pl-7 uppercase tracking-wider">{burnout.message}</p>
                </div>
              )}

              <div className="flex items-center gap-4 bg-[#0A0A0A] p-2 rounded-2xl border border-white/5">
                <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-lg">
                  {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1" />}
                </button>
                <div className="flex items-center gap-2 pr-2">
                  <Music size={14} className="text-zinc-500" />
                  <span className="text-xs font-black uppercase tracking-widest">{station.label}</span>
                </div>
                <div className="ml-auto flex items-center gap-3 px-2">
                   <Upload size={14} className="text-zinc-500 hover:text-white cursor-pointer" onClick={() => fileInputRef.current?.click()} />
                   <Sparkles size={14} className="text-indigo-400 cursor-pointer" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-2 pl-2 pr-4 bg-[#1A1A1A] border border-white/5 rounded-full shadow-2xl">
              <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all text-white shadow-xl">
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1" />}
              </button>
              <div className="flex items-center gap-2.5">
                <Music size={14} className="text-zinc-600" />
                <span className="text-[11px] font-black uppercase tracking-[0.1em] text-zinc-100 whitespace-nowrap">{station.label}</span>
              </div>
              <div className="flex items-center gap-4 pl-2 border-l border-white/5">
                 <Upload size={14} className="text-zinc-600 hover:text-white transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()} />
                 {burnout && burnout.score > 30 && <Brain size={14} className={burnout.score > 70 ? "text-red-500 animate-pulse" : "text-amber-500"} />}
                 <button onClick={() => setExpanded(true)} className="text-zinc-600 hover:text-white transition-colors">
                   <ChevronUp size={16} />
                 </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      <audio ref={audioRef} src={station.url} loop className="hidden" />
      </div>

      {/* Bottom dock that 'docks' into the corner on page load and stays pinned (only when not rendered as a widget/docked) */}
      {!isWidget && (
        <motion.div
        initial={{ opacity: 0, y: 60, x: -8 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ type: 'spring', stiffness: 110, damping: 18, delay: 0.08 }}
        className="fixed z-[999998] bottom-4 left-6 pointer-events-auto"
      >
        <div className="flex items-center gap-3 bg-gradient-to-r from-zinc-900/80 to-zinc-800/60 px-3 py-2 rounded-full border border-white/6 shadow-xl backdrop-blur">
          <Music size={18} className="text-indigo-400" />
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-black text-white">Lofi Focus</span>
            <span className="text-[10px] text-zinc-400">Ambient Player</span>
          </div>
          <div className="ml-3">
            <button onClick={() => setExpanded(true)} className="bg-indigo-600/90 hover:bg-indigo-600 px-3 py-1 rounded-full text-[11px] font-bold">Open</button>
          </div>
        </div>
      </motion.div>
    </React.Fragment>
  );
};

export default AmbientSoundPlayer;
