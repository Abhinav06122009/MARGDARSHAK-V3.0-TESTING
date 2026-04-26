import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, CloudRain, Coffee, Headphones } from 'lucide-react';

const STATIONS = [
  { id: 'lofi', name: 'Lofi Focus', icon: Music, url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3' },
  { id: 'rain', name: 'Heavy Rain', icon: CloudRain, url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bde808.mp3?filename=heavy-rain-nature-sounds-8186.mp3' },
  { id: 'cafe', name: 'Cafe Noise', icon: Coffee, url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c82bf0c0a9.mp3?filename=restaurant-ambience-44815.mp3' },
  { id: 'binaural', name: 'Binaural', icon: Headphones, url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b32e02f9.mp3?filename=binaural-beats-focus-55618.mp3' }
];

export const AmbientSoundPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStation, setActiveStation] = useState(STATIONS[0]);
  const [volume, setVolume] = useState(0.5);
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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-4 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="flex items-center justify-between relative z-10">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Headphones className="w-4 h-4 text-indigo-400" /> Ambient Focus
        </h3>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className="text-zinc-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white hover:bg-indigo-400 hover:scale-105 transition-all shadow-lg"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-1" />}
        </button>

        <div className="flex-1">
          <p className="text-xs font-bold text-zinc-200">{activeStation.name}</p>
          <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
            {isPlaying ? (
              <span className="flex items-center gap-0.5">
                <span className="w-1 h-2 bg-indigo-400 animate-pulse rounded-full" />
                <span className="w-1 h-3 bg-indigo-400 animate-pulse rounded-full delay-75" />
                <span className="w-1 h-1.5 bg-indigo-400 animate-pulse rounded-full delay-150" />
                <span className="ml-1">Playing</span>
              </span>
            ) : "Paused"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 relative z-10">
        {STATIONS.map(station => (
          <button
            key={station.id}
            onClick={() => setActiveStation(station)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
              activeStation.id === station.id 
              ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
              : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
            }`}
            title={station.name}
          >
            <station.icon className="w-4 h-4 mb-1" />
            <span className="text-[9px] font-medium truncate w-full text-center">{station.name}</span>
          </button>
        ))}
      </div>

      <audio 
        ref={audioRef} 
        src={activeStation.url} 
        loop 
        className="hidden"
      />
    </div>
  );
};
