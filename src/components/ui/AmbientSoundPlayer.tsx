import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Music, 
  CloudRain, Coffee, Headphones, ChevronUp, 
  ChevronDown, X, Minimize2, Maximize2 
} from 'lucide-react';

export const STATIONS = [
  { id: 'lofi', name: 'Lofi Focus', icon: Music, url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3' },
  { id: 'rain', name: 'Heavy Rain', icon: CloudRain, url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bde808.mp3?filename=heavy-rain-nature-sounds-8186.mp3' },
  { id: 'cafe', name: 'Cafe Noise', icon: Coffee, url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c82bf0c0a9.mp3?filename=restaurant-ambience-44815.mp3' },
  { id: 'binaural', name: 'Binaural', icon: Headphones, url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b32e02f9.mp3?filename=binaural-beats-focus-55618.mp3' }
];

export const AmbientSoundPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStation, setActiveStation] = useState(STATIONS[0]);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`fixed bottom-24 right-6 z-[60] transition-all duration-500 ease-in-out ${
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
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/10 transition-all ${
                isPlaying ? 'bg-emerald-500 text-black shadow-emerald-500/20' : 'bg-zinc-900/80 text-emerald-400'
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
              className="bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-5 shadow-2xl overflow-hidden"
            >
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Headphones size={16} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Ambient_Station</h3>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Focus_Sequence</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMinimized(true)}
                  className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all"
                >
                  <Minimize2 size={14} />
                </button>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-6 relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white uppercase tracking-tighter truncate italic">
                      {activeStation.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5 items-end h-2">
                        <motion.div animate={{ height: isPlaying ? [2, 6, 2] : 2 }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-emerald-500/50 rounded-full" />
                        <motion.div animate={{ height: isPlaying ? [4, 2, 4] : 2 }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-emerald-500/50 rounded-full" />
                        <motion.div animate={{ height: isPlaying ? [3, 5, 3] : 2 }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-0.5 bg-emerald-500/50 rounded-full" />
                      </div>
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                        {isPlaying ? 'System_Active' : 'Standby'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-500 hover:text-white transition-colors">
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 relative z-10">
                {STATIONS.map(station => (
                  <button
                    key={station.id}
                    onClick={() => setActiveStation(station)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      activeStation.id === station.id 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                    }`}
                  >
                    <station.icon size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest truncate">{station.name}</span>
                  </button>
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
