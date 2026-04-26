
import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Lock, Unlock, Zap, Shield, Sparkles } from 'lucide-react';

const GlareEffect = () => (
  <motion.div
    className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-[2.5rem] pointer-events-none z-30"
    style={{ transform: "translateZ(60px)" }}
  >
    <motion.div 
      className="absolute w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent -top-1/2 -left-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
      animate={{ 
        rotate: [0, 10, 0],
        x: ['-5%', '5%', '-5%'],
        y: ['-5%', '5%', '-5%']
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      style={{
        filter: 'blur(60px)',
        mixBlendMode: 'overlay'
      }}
    />
  </motion.div>
);

interface AchievementBadgeProps {
  achievement: Achievement;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const { width, height } = rect;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.05 }}
        className={`relative p-8 rounded-[2.5rem] border-2 flex flex-col items-center justify-center text-center transition-all duration-700 overflow-hidden ${
          achievement.unlocked 
            ? 'border-yellow-500/20 bg-zinc-950/40 shadow-[0_20px_50px_rgba(234,179,8,0.1)]' 
            : 'border-white/5 bg-zinc-950/20 grayscale'
        }`}
      >
        <GlareEffect />
        
        {/* Animated Pulsar Background */}
        {achievement.unlocked && (
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <motion.div 
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-400 rounded-full blur-[40px]"
            />
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center">
          {achievement.unlocked ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="text-6xl mb-6 filter drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]"
            >
              {achievement.icon}
            </motion.div>
          ) : (
            <div className="text-6xl mb-6 opacity-20 filter blur-[2px]">
              {achievement.icon}
            </div>
          )}

          <div className="space-y-2">
            <h3 className={`font-black text-xl tracking-tighter uppercase ${
              achievement.unlocked ? 'text-yellow-400' : 'text-zinc-600'
            }`}>
              {achievement.name}
            </h3>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest max-w-[180px] leading-relaxed mx-auto">
              {achievement.description}
            </p>
          </div>
        </div>

        {/* Lock/Unlock Status */}
        <div className="absolute bottom-6 right-6 z-20">
          {achievement.unlocked ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-400/10 rounded-full border border-yellow-400/20">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest">Unlocked</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
              <Lock className="w-3 h-3 text-zinc-600" />
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Encrypted</span>
            </div>
          )}
        </div>

        {/* Architectural Accent */}
        <div className="absolute top-6 left-6 flex flex-col gap-1 opacity-20">
          <div className="h-0.5 w-4 bg-zinc-500 rounded-full" />
          <div className="h-0.5 w-2 bg-zinc-500 rounded-full" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AchievementBadge;
