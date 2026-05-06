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

export const AmbientSoundPlayer: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeId, setActiveId] = useState('lofi');
  const [volume, setVolume] = useState(0.45);
  const [isMuted, setIsMuted] = useState(false);
  const [customTracks, setCustomTracks] = useState<Station[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useContext(AuthContext);

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
        url: URL.createObjectURL(f),
        isCustom: true,
      }));
    if (newTracks.length) {
      setCustomTracks(prev => [...prev, ...newTracks]);
      setActiveId(newTracks[0].id);
    }
  };

  return (
    <div className="fixed z-[9999] bottom-6 left-6 pointer-events-none">
      <input ref={fileInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={handleFileImport} />

      <motion.div
        drag dragMomentum={false}
        className="pointer-events-auto cursor-grab active:cursor-grabbing"
      >
        <motion.div
          layout
          className={`flex flex-col bg-[#1A1A1A] border border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden text-white ${expanded ? 'w-[360px]' : 'w-auto'}`}
        >
          {expanded ? (
            // ─── EXPANDED UI (Matches Second Image) ──────────────────────────
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Built-in Stations</span>
                 <button onClick={() => setExpanded(false)} className="text-zinc-500 hover:text-white transition-colors">
                   <ChevronDown size={18} />
                 </button>
              </div>

              {/* Stations Grid */}
              <div className="grid grid-cols-3 gap-3">
                {BUILT_IN_STATIONS.map(s => {
                  const isActive = activeId === s.id;
                  return (
                    <button 
                      key={s.id} 
                      onClick={() => setActiveId(s.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${isActive ? 'bg-[#2A2A2A] border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-[#222222] border-transparent text-zinc-500 hover:bg-[#252525]'}`}
                    >
                      <s.Icon size={20} className={isActive ? 'text-purple-400' : 'text-zinc-500'} />
                      <span className="text-[10px] font-bold tracking-tight">{s.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* My Music Header */}
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">My Music</span>
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg text-[10px] font-bold hover:bg-indigo-600/30 transition-all border border-indigo-500/20"
                 >
                   <Upload size={12} />
                   Import MP3
                 </button>
              </div>

              {/* Upload Box */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center py-10 border-2 border-dashed border-zinc-800 rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all bg-[#222222]/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <FolderOpen size={32} className="text-zinc-700 group-hover:text-indigo-400 transition-colors mb-3" />
                <p className="text-[11px] font-bold text-zinc-500 group-hover:text-zinc-300">Click to import MP3, WAV, FLAC files</p>
                <p className="text-[9px] text-zinc-600 mt-1">Files stay local — nothing is uploaded</p>
              </div>

              {/* Custom Tracks List (If any) */}
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

              {/* Volume Slider */}
              <div className="flex items-center gap-4 pt-2">
                <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-500 hover:text-white transition-colors">
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={isMuted ? 0 : volume} 
                  onChange={e => setVolume(parseFloat(e.target.value))} 
                  className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-[10px] font-black text-zinc-600 tabular-nums w-8 text-right">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
              </div>

              {/* Premium Predictor Row */}
              <div className="flex items-center gap-3 py-3 px-4 bg-[#2A1F00]/30 border border-amber-500/20 rounded-xl">
                 <Lock size={16} className="text-amber-500" />
                 <span className="text-[11px] font-bold text-amber-500/90 tracking-tight">AI Burnout Predictor (Premium)</span>
              </div>

              {/* Bottom Mini Bar (Integrated in Expanded) */}
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
                   <Lock size={14} className="text-amber-500 cursor-pointer" />
                </div>
              </div>
            </div>
          ) : (
            // ─── COMPACT PILL MODE (Matches Bottom-Left of First Image) ──────
            <div className="flex items-center gap-4 p-2 pl-2 pr-4 bg-[#1A1A1A] border border-white/5 rounded-full shadow-2xl">
              <button 
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all text-white shadow-xl"
              >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1" />}
              </button>
              <div className="flex items-center gap-2.5">
                <Music size={14} className="text-zinc-600" />
                <span className="text-[11px] font-black uppercase tracking-[0.1em] text-zinc-100 whitespace-nowrap">{station.label}</span>
              </div>
              <div className="flex items-center gap-4 pl-2 border-l border-white/5">
                 <Upload size={14} className="text-zinc-600 hover:text-white transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()} />
                 <Lock size={14} className="text-amber-500/80 hover:text-amber-400 transition-colors cursor-pointer" />
                 <button onClick={() => setExpanded(true)} className="text-zinc-600 hover:text-white transition-colors">
                   <ChevronUp size={16} />
                 </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
      <audio ref={audioRef} src={station.url} loop className="hidden" />
    </div>
  );
};

export default AmbientSoundPlayer;
