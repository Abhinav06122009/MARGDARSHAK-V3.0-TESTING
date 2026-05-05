import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, 
  Wind, Coffee, Moon, Sun, Heart, Flame,
  BrainCircuit, Music, Sliders, ChevronUp, ChevronDown,
  Sparkles, Zap, Shield, Waves, ListMusic, Plus, Trash2,
  X, Check, Lock, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService } from '@/lib/dashboardService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Station {
  id: string;
  name: string;
  url: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  description: string;
}

// ─── Built-in Lofi/Ambient Stations ──────────────────────────────────────────
const BUILT_IN_STATIONS: Station[] = [
  { 
    id: 'lofi-focus', 
    name: 'Deep Focus', 
    url: 'https://stream.zeno.fm/0r0xa792kwzuv',
    icon: BrainCircuit, 
    color: 'text-amber-400',
    bgGradient: 'from-amber-500/20 to-orange-500/10',
    description: 'Binaural beats & lofi for intense studying'
  },
  { 
    id: 'rain-ambient', 
    name: 'Cyber Rain', 
    url: 'https://luna.shoutca.st/proxy/lofi?mp=/stream',
    icon: Waves, 
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/20 to-indigo-500/10',
    description: 'Soothing rain with neon-city vibes'
  },
  { 
    id: 'zen-garden', 
    name: 'Zen Garden', 
    url: 'https://icecast.walmradio.com:8000/lofi',
    icon: Wind, 
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-500/20 to-teal-500/10',
    description: 'Traditional instruments & natural echoes'
  },
  { 
    id: 'midnight-jazz', 
    name: 'Night Owl', 
    url: 'https://stream.zeno.fm/f3v5u7z61u8uv',
    icon: Moon, 
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/20 to-fuchsia-500/10',
    description: 'Smooth jazz for late-night productivity'
  }
];

export const GlobalWellnessBar: React.FC = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeId, setActiveId] = useState('lofi-focus');
  const [volume, setVolume] = useState(0.5);
  const [showStations, setShowStations] = useState(false);
  const [burnoutLevel, setBurnoutLevel] = useState(0);
  const [customTracks, setCustomTracks] = useState<Station[]>([]);
  const [showAddTrack, setShowAddTrack] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastFetchRef = useRef<number>(0);
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // ─── Memoized Stations ────────────────────────────────────────────────────
  const allStations = useMemo(() => [...BUILT_IN_STATIONS, ...customTracks], [customTracks]);
  const station = useMemo(() => allStations.find(s => s.id === activeId) ?? allStations[0], [allStations, activeId]);

  const isPremium = useMemo(() => {
    if (!authUser) return false;
    const tier = authUser.profile?.subscription_tier || authUser.user_metadata?.subscription_tier || 'free';
    return ['plus', 'elite', 'pro', 'premium', 'premium_elite'].includes(String(tier).toLowerCase());
  }, [authUser]);

  // ─── Identity & Premium Checks ─────────────────────────────────────────────
  useEffect(() => {
    if (authUser) {
      // Load custom tracks from localStorage
      const saved = localStorage.getItem(`mg_tracks_${authUser.id}`);
      if (saved) {
        try { setCustomTracks(JSON.parse(saved)); } catch (e) { console.error('Failed to load tracks'); }
      }
    }
  }, [authUser]);

  // ─── Audio Logic ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = useCallback(() => {
    if (!isPremium && !station.id.includes('custom')) {
      toast({ 
        title: "Premium Required", 
        description: "Built-in Stations require a Premium subscription.", 
        variant: "destructive",
        action: <button onClick={() => navigate('/upgrade')} className="px-3 py-1 bg-white text-black text-xs font-bold rounded">Upgrade</button>
      });
      return;
    }

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        toast({ title: "Stream Error", description: "Could not connect to radio station", variant: "destructive" });
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, isPremium, station.id, toast, navigate]);

  const switchStation = useCallback((id: string) => {
    setActiveId(id);
    setIsPlaying(true);
    // Audio source change is handled by the key prop on audio element
  }, []);

  // ─── AI Burnout Detection (Throttled) ─────────────────────────────────────
  const checkBurnout = useCallback(async () => {
    if (!authUser) return;
    
    const now = Date.now();
    if (now - lastFetchRef.current < 300000) return; // 5 minute throttle
    lastFetchRef.current = now;

    try {
      const data = await dashboardService.fetchAllUserData(authUser.id);
      const overdueCount = (data.tasks || []).filter((t: any) => 
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
      ).length;
      
      const studyTimeToday = (data.studySessions || [])
        .filter((s: any) => s.start_time?.startsWith(new Date().toISOString().split('T')[0]))
        .reduce((sum: number, s: any) => sum + (s.duration || 0), 0);

      // Simple heuristic for burnout
      let level = 0;
      if (studyTimeToday > 240) level += 30; // Over 4 hours study
      if (overdueCount > 5) level += 40;     // Many overdue tasks
      if (studyTimeToday > 480) level += 30; // Over 8 hours study
      
      setBurnoutLevel(Math.min(100, level));
      
      if (level > 70) {
        toast({
          title: "High Burnout Detected ⚠️",
          description: "Your stats indicate high stress. Please take a break and listen to some calming music.",
          variant: "destructive"
        });
      }
    } catch (e) { /* silent */ }
  }, [authUser, toast]);

  useEffect(() => {
    checkBurnout();
    const interval = setInterval(checkBurnout, 300000);
    return () => clearInterval(interval);
  }, [checkBurnout]);

  // ─── Custom Track Logic ───────────────────────────────────────────────────
  const addTrack = (name: string, url: string) => {
    if (!authUser) {
      toast({ title: "Premium Access Required", description: "Please log in to customize your soundscape.", variant: "destructive" });
      return;
    }
    if (!isPremium) {
      toast({ title: "Premium Required", description: "Custom tracks are an Elite feature", variant: "destructive" });
      return;
    }
    const newTrack: Station = {
      id: `custom-${Date.now()}`,
      name,
      url,
      icon: Music,
      color: 'text-indigo-400',
      bgGradient: 'from-indigo-500/20 to-purple-500/10',
      description: 'Your custom wellness stream'
    };
    const updated = [...customTracks, newTrack];
    setCustomTracks(updated);
    if (authUser) localStorage.setItem(`mg_tracks_${authUser.id}`, JSON.stringify(updated));
    setShowAddTrack(false);
    toast({ title: "Track Added", description: "Custom station integrated successfully" });
  };

  if (!authUser) return null;

  return (
    <>
      <audio 
        ref={audioRef} 
        src={station.url} 
        onPlay={() => setIsPlaying(true)} 
        onPause={() => setIsPlaying(false)}
        key={station.id}
        loop
      />

      {/* ─── Collapsed Launcher ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-6 bottom-32 z-40"
          >
            <motion.button
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="group relative flex items-center gap-3 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full pl-4 pr-2 py-2 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${burnoutLevel > 70 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Wellness</span>
              </div>
              
              <div className="flex items-center gap-1.5 p-1.5 bg-indigo-500/20 rounded-full">
                {isPlaying ? (
                  <div className="flex gap-0.5 items-end h-3 w-4 px-0.5">
                    {[1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        animate={{ height: ['20%', '100%', '20%'] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                        className="w-1 bg-indigo-400 rounded-full"
                      />
                    ))}
                  </div>
                ) : (
                  <Music className="w-3 h-3 text-indigo-400" />
                )}
              </div>

              {/* Burnout Bar Underlay */}
              <div className="absolute bottom-0 left-0 h-1 bg-red-500/30 transition-all duration-1000" style={{ width: `${burnoutLevel}%` }} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Expanded Dashboard ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed right-6 bottom-24 z-50 w-80 bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className={`p-6 bg-gradient-to-br ${station.bgGradient} transition-colors duration-500`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                    <station.icon className={`w-4 h-4 ${station.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{station.name}</h3>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest">Wellness Node</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Visualizer */}
              <div className="h-16 flex items-center justify-center gap-1">
                {isPlaying ? (
                  [...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: [
                          Math.random() * 40 + 20 + '%', 
                          Math.random() * 60 + 40 + '%', 
                          Math.random() * 40 + 20 + '%'
                        ] 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.4 + Math.random() * 0.4,
                        ease: "easeInOut"
                      }}
                      className={`w-1 rounded-full ${station.color.replace('text-', 'bg-')}/40`}
                    />
                  ))
                ) : (
                  <div className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">Paused</div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-center gap-8">
                <button 
                  onClick={() => {
                    const idx = allStations.findIndex(s => s.id === activeId);
                    const prev = allStations[(idx - 1 + allStations.length) % allStations.length];
                    switchStation(prev.id);
                  }}
                  className="p-3 text-white/50 hover:text-white transition-colors"
                >
                  <SkipBack className="w-6 h-6" />
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                    isPlaying 
                      ? 'bg-white text-black' 
                      : 'bg-indigo-500 text-white shadow-indigo-500/20'
                  }`}
                >
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </motion.button>

                <button 
                  onClick={() => {
                    const idx = allStations.findIndex(s => s.id === activeId);
                    const next = allStations[(idx + 1) % allStations.length];
                    switchStation(next.id);
                  }}
                  className="p-3 text-white/50 hover:text-white transition-colors"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                  <span>Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-zinc-600" />
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>

              {/* Burnout Detection */}
              <div className="p-4 bg-zinc-800/50 border border-white/5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-500" /> AI Stress Shield
                  </span>
                  <span className={`text-[9px] font-black uppercase ${burnoutLevel > 70 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {burnoutLevel > 70 ? 'Warning' : 'Healthy'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${burnoutLevel}%` }}
                    className={`h-full rounded-full ${burnoutLevel > 70 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500'}`} 
                  />
                </div>
              </div>

              {/* Station Selection */}
              <button 
                onClick={() => setShowStations(!showStations)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-all"
              >
                <Sliders className="w-3 h-3" />
                {showStations ? 'Hide Mixes' : 'Change Stream'}
              </button>
            </div>

            {/* Station List Overlay */}
            <AnimatePresence>
              {showStations && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="bg-black/50 backdrop-blur-xl border-t border-white/10 overflow-hidden"
                >
                  <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                    {allStations.map(s => (
                      <button
                        key={s.id}
                        onClick={() => switchStation(s.id)}
                        className={`w-full p-3 rounded-xl flex items-center gap-4 transition-all ${
                          activeId === s.id ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className={`p-2 rounded-lg bg-zinc-900 ${activeId === s.id ? s.color : 'text-zinc-600'}`}>
                          <s.icon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className={`text-xs font-bold ${activeId === s.id ? 'text-white' : 'text-zinc-400'}`}>{s.name}</p>
                          <p className="text-[9px] text-zinc-600 truncate">{s.description}</p>
                        </div>
                        {activeId === s.id && <Sparkles className="w-3 h-3 text-indigo-400 ml-auto" />}
                      </button>
                    ))}

                    <button 
                      onClick={() => setShowAddTrack(true)}
                      className="w-full p-3 rounded-xl border border-dashed border-zinc-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-500 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Add Custom Stream
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Premium Badge */}
            <div className="p-3 bg-zinc-950/50 flex items-center justify-center gap-2">
              <Shield className={`w-3 h-3 ${isPremium ? 'text-amber-500' : 'text-zinc-700'}`} />
              <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em]">
                {isPremium ? 'Elite Wellness Active' : 'Upgrade to Add Custom Streams'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Track Modal */}
      <AnimatePresence>
        {showAddTrack && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            {!authUser && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-xl">
                <p className="text-white font-bold">Please log in</p>
              </div>
            )}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddTrack(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[2rem] p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-500/20 rounded-2xl">
                  <Music className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Custom Stream</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Elite Protocol</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Station Name</label>
                  <input id="track-name" placeholder="E.g. Synthwave Study" className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Stream URL (Radio URL)</label>
                  <input id="track-url" placeholder="https://..." className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowAddTrack(false)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-white/5 rounded-xl transition-all">Cancel</button>
                <button 
                  onClick={() => {
                    const name = (document.getElementById('track-name') as HTMLInputElement).value;
                    const url = (document.getElementById('track-url') as HTMLInputElement).value;
                    if (name && url) addTrack(name, url);
                  }}
                  className="flex-1 py-3 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20"
                >
                  Integrate Stream
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
});

export default GlobalWellnessBar;
