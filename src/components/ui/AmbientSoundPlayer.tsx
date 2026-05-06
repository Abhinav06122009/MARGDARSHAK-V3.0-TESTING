import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Music, 
  CloudRain, Coffee, Headphones, ChevronUp, 
  ChevronDown, X, Minimize2, Maximize2, Upload, Trash2
} from 'lucide-react';

interface Station {
  id: string;
  name: string;
  icon: any;
  url: string;
  isCustom?: boolean;
}

const DEFAULT_STATIONS: Station[] = [
  { id: 'lofi', name: 'Lofi Focus', icon: Music, url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3' },
  { id: 'rain', name: 'Heavy Rain', icon: CloudRain, url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bde808.mp3?filename=heavy-rain-nature-sounds-8186.mp3' },
  { id: 'cafe', name: 'Cafe Noise', icon: Coffee, url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c82bf0c0a9.mp3?filename=restaurant-ambience-44815.mp3' },
  { id: 'binaural', name: 'Binaural', icon: Headphones, url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b32e02f9.mp3?filename=binaural-beats-focus-55618.mp3' }
];

export const AmbientSoundPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [stations, setStations] = useState<Station[]>(DEFAULT_STATIONS);
  const [activeStation, setActiveStation] = useState<Station>(DEFAULT_STATIONS[0]);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [activeStation]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const newStation: Station = {
      id: `custom-${Date.now()}`,
      name: file.name.split('.')[0],
      icon: Music,
      url: url,
      isCustom: true
    };

    setStations(prev => [...prev, newStation]);
    setActiveStation(newStation);
    setIsPlaying(true);
  };

  const removeStation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setStations(prev => prev.filter(s => s.id !== id));
    if (activeStation.id === id) {
      setActiveStation(DEFAULT_STATIONS[0]);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`fixed bottom-24 left-6 z-[60] transition-all duration-500 ease-in-out ${
        isMinimized ? 'w-14 h-14' : 'w-72'
      }`}
    >
      <div className="relative group">
        <AnimatePresence mode="wait">
          {isMinimized ? (
            <motion.button
              key="minimized"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => setIsMinimized(false)}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/40 transition-all ${
                isPlaying ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-white/80 text-indigo-600'
              }`}
            >
              {isPlaying ? (
                <div className="flex gap-0.5 items-end h-4">
                  <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-current rounded-full" />
                  <motion.div animate={{ height: [8, 4, 8] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-current rounded-full" />
                  <motion.div animate={{ height: [6, 10, 6] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1 bg-current rounded-full" />
                </div>
              ) : <Music size={20} />}
            </motion.button>
          ) : (
            <motion.div
              key="maximized"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white/90 backdrop-blur-3xl border border-white/50 rounded-[2rem] p-5 shadow-2xl overflow-hidden text-zinc-900"
            >
              {/* Decorative Background */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                    <Headphones size={16} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Built-in Station</h3>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest italic">A.I. Neural Focus</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                   <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-black/5 rounded-full text-zinc-500 hover:text-indigo-600 transition-all"
                    title="Upload Custom MP3"
                  >
                    <Upload size={14} />
                  </button>
                  <button 
                    onClick={() => setIsMinimized(true)}
                    className="p-2 hover:bg-black/5 rounded-full text-zinc-500 hover:text-zinc-800 transition-all"
                  >
                    <Minimize2 size={14} />
                  </button>
                </div>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="audio/mp3,audio/mpeg" 
                className="hidden" 
              />

              <div className="bg-zinc-100/50 border border-black/5 rounded-2xl p-4 mb-6 relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                  >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-zinc-900 uppercase tracking-tighter truncate italic">
                      {activeStation.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5 items-end h-2">
                        <motion.div animate={{ height: isPlaying ? [2, 6, 2] : 2 }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-indigo-500/50 rounded-full" />
                        <motion.div animate={{ height: isPlaying ? [4, 2, 4] : 2 }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-indigo-500/50 rounded-full" />
                        <motion.div animate={{ height: isPlaying ? [3, 5, 3] : 2 }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-0.5 bg-indigo-500/50 rounded-full" />
                      </div>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                        {isPlaying ? 'ACTIVE' : 'STANDBY'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-400 hover:text-zinc-800 transition-colors">
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-zinc-300 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 gap-2 relative z-10">
                {stations.map(station => (
                  <div key={station.id} className="relative group/item">
                    <button
                      onClick={() => setActiveStation(station)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        activeStation.id === station.id 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' 
                        : 'bg-zinc-100/50 border-black/5 text-zinc-600 hover:border-black/10 hover:text-zinc-900'
                      }`}
                    >
                      <station.icon size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest truncate flex-1">{station.name}</span>
                    </button>
                    {station.isCustom && (
                      <button 
                        onClick={(e) => removeStation(e, station.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover/item:opacity-100 text-red-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <audio 
        ref={audioRef} 
        src={activeStation.url} 
        loop 
        className="hidden"
      />
    </motion.div>
  );
};
