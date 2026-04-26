// src/components/progress/MountainClimbVisualization.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Mountain, Flag, Sparkles, Cloud } from 'lucide-react';

interface MountainClimbVisualizationProps {
  progress: number; // 0-100
}

const MountainClimbVisualization: React.FC<MountainClimbVisualizationProps> = ({ progress }) => {
  const path = "M0,90 C50,90 80,40 120,40 C160,40 190,70 230,70 C270,70 320,20 380,20";
  const pathLength = 500;

  return (
    <div className="w-full h-32 relative overflow-hidden rounded-[2rem] bg-zinc-950 border border-white/5 shadow-2xl">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-zinc-950 to-emerald-950/40" />

      {/* Neural Pulsar (Sun) */}
      <motion.div
        className="absolute w-12 h-12 bg-indigo-500/20 rounded-full blur-2xl"
        style={{ top: '10%', left: '80%' }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div
        className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_#fff]"
        style={{ top: '15%', left: '81%' }}
        animate={{
          scale: [1, 1.2, 1],
          boxShadow: ['0 0 10px #fff', '0 0 30px #fff', '0 0 10px #fff'],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Atmospheric Clouds */}
      {[1, 2, 3].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-white/5"
          initial={{ x: -100 }}
          animate={{ x: 500 }}
          style={{ top: `${i * 25}%` }}
          transition={{ duration: 20 + i * 10, repeat: Infinity, ease: "linear" }}
        >
          <Cloud size={40 + i * 20} />
        </motion.div>
      ))}

      {/* Sparks / Snow */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 bg-white/40 rounded-full"
          initial={{
            top: -10,
            left: Math.random() * 400
          }}
          animate={{
            top: 150,
            left: (Math.random() * 400) + 50
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}

      {/* Mountain Path SVG */}
      <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none" className="absolute bottom-0 left-0 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Path (Shadow) */}
        <path
          d={path}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Inactive Path */}
        <path
          d={path}
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="2"
          strokeDasharray="8 8"
        />

        {/* Active Progress Path */}
        <motion.path
          d={path}
          fill="none"
          stroke="url(#activeGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#glow)"
          strokeDasharray={pathLength}
          initial={{ strokeDashoffset: pathLength }}
          animate={{ strokeDashoffset: pathLength - (progress / 100) * pathLength }}
          transition={{ duration: 2, ease: 'circOut' }}
        />

        {/* Progress Point (Pulse) */}
        <motion.g
          style={{ offsetPath: `path('${path}')` }}
          initial={{ offsetDistance: '0%' }}
          animate={{ offsetDistance: `${progress}%` }}
          transition={{ duration: 2, ease: 'circOut' }}
        >
          <motion.circle
            r="6"
            fill="#fff"
            className="shadow-2xl"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <Sparkles className="text-white" width="12" height="12" x="-6" y="-18" />
        </motion.g>

        {/* Terminal Flag */}
        <motion.g
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Flag className="text-cyan-400" width="18" height="18" x="375" y="5" />
        </motion.g>
      </svg>

      {/* Progress Counter */}
      <div className="absolute bottom-4 right-6 flex items-center gap-2">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Progress Tracker</span>
        <span className="text-xl font-black text-white italic tracking-tighter">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export default MountainClimbVisualization;