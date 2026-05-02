import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Headphones, 
  ChevronUp, ChevronDown, Music, Activity
} from 'lucide-react';
import { STATIONS } from './AmbientSoundPlayer';

export const GlobalAmbientPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStation, setActiveStation] = useState(STATIONS[0]);
  const [volume, setVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);
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

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-24 right-6 z-[100] pointer-events-none">
      <div className="flex flex-col items-end gap-3 pointer-events-auto">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-2 w-72 rounded-[2rem] bg-zinc-950/80 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/20">
                    <Headphones className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Neural Audio</h3>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">Station Controller</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                      {isMuted ? <VolumeX size={14} className="text-zinc-500" /> : <Volume2 size={14} className="text-zinc-400" />}
                   </button>
                   <input 
                     type="range" min="0" max="1" step="0.01" value={volume} 
                     onChange={(e) => setVolume(parseFloat(e.target.value))}
                     className="w-16 h-1 bg-zinc-800 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                   />
                </div>
              </div>

              {/* Stations Grid */}
              <div className="p-4 grid grid-cols-2 gap-2">
                {STATIONS.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => setActiveStation(station)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 ${
                      activeStation.id === station.id 
                      ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' 
                      : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <station.icon size={16} className="mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{station.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Active Control */}
              <div className="p-5 bg-indigo-500/5 flex items-center gap-4">
                 <button 
                   onClick={togglePlay}
                   className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform"
                 >
                   {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                 </button>
                 <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Active Mode</p>
                    <h4 className="text-sm font-bold text-white truncate">{activeStation.name}</h4>
                 </div>
                 {isPlaying && (
                   <div className="flex items-center gap-1">
                      {[1, 2, 1.5, 2.5].map((h, i) => (
                        <motion.div 
                          key={i}
                          animate={{ height: [h*4, h*10, h*4] }}
                          transition={{ repeat: Infinity, duration: 0.6 + i*0.1 }}
                          className="w-0.5 bg-indigo-500 rounded-full"
                        />
                      ))}
                   </div>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Trigger Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-4 rounded-2xl shadow-2xl transition-all duration-500 ${
            isOpen ? 'bg-indigo-500 text-white' : 'bg-zinc-900/80 backdrop-blur-xl text-zinc-400 border border-white/10 hover:border-indigo-500/50 hover:text-indigo-400'
          }`}
        >
          <div className="relative">
            {isPlaying && !isOpen && (
              <motion.div 
                layoutId="audioGlow"
                className="absolute inset-0 bg-indigo-500/40 blur-xl rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <Headphones size={20} className="relative z-10" />
          </div>
          <div className="absolute -top-1 -right-1">
             {isPlaying ? (
               <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse" />
             ) : (
               <div className="w-3 h-3 bg-zinc-600 rounded-full border-2 border-zinc-950" />
             )}
          </div>
        </motion.button>
      </div>

      <audio ref={audioRef} src={activeStation.url} loop className="hidden" />
    </div>
  );
};
