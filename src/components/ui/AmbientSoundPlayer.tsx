import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Play, 
  Pause, 
  Upload, 
  Lock, 
  ChevronUp,
  X,
  Volume2
} from 'lucide-react';

export const AmbientSoundPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    <div className="flex flex-col items-start gap-3 pointer-events-auto">
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="p-4 bg-[#141414]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-64 mb-2"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Atmosphere</span>
              <button onClick={() => setShowControls(false)} className="text-zinc-500 hover:text-white">
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <Volume2 size={14} className="text-zinc-500" />
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={volume} 
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  if (audioRef.current) audioRef.current.volume = v;
                }}
                className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-purple-500" 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-2 pl-2 pr-5 bg-[#141414]/70 backdrop-blur-md border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
      >
        {/* Play Button Circle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-lg"
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1" />}
        </motion.button>

        {/* Music Icon & Text */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-full">
            <Music size={14} className="text-purple-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white whitespace-nowrap">
            Lofi Focus
          </span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4 ml-2 pl-4 border-l border-white/10">
          <motion.button 
            whileHover={{ scale: 1.1, textShadow: '0 0 8px rgba(255,255,255,0.5)' }}
            onClick={() => fileInputRef.current?.click()}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <Upload size={14} />
          </motion.button>
          
          <div className="relative group">
            <Lock size={14} className="text-yellow-500 fill-yellow-500/20" />
            <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-[8px] text-white font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
              Premium Protected
            </div>
          </div>

          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => setShowControls(!showControls)}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <ChevronUp size={16} />
          </motion.button>
        </div>
      </motion.div>

      <input 
        ref={fileInputRef} 
        type="file" 
        accept="audio/*" 
        className="hidden" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && audioRef.current) {
            audioRef.current.src = URL.createObjectURL(file);
            audioRef.current.play();
            setIsPlaying(true);
          }
        }} 
      />
      <audio 
        ref={audioRef} 
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3" 
        loop 
        className="hidden" 
      />
    </div>
  );
};

export default AmbientSoundPlayer;
