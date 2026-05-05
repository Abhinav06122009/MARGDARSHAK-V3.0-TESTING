import React, { ReactNode, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical, CheckSquare, Calendar, Trash2, Shield } from 'lucide-react';
import { RealTask } from './types';

export const MagneticButton = ({ children, ...props }: { children: ReactNode } & React.ComponentProps<typeof motion.button>) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const ySpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ x: xSpring, y: ySpring }} {...props}>
      {children}
    </motion.button>
  );
};

export const AuroraBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full">
      <motion.div className="absolute top-[-20%] left-[-20%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-3xl" animate={{ x: [0, 100, 0], y: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity, repeatType: 'mirror' }} />
      <motion.div className="absolute bottom-[-20%] right-[-20%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-3xl" animate={{ x: [0, -100, 0], y: [0, -50, 0] }} transition={{ duration: 25, repeat: Infinity, repeatType: 'mirror', delay: 5 }} />
    </div>
  </div>
);

export const GlareEffect = () => (
  <motion.div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none" style={{ transform: "translateZ(50px)" }}>
    <div className="absolute w-96 h-96 bg-white/10 -top-1/2 -left-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ transform: 'rotate(45deg)', filter: 'blur(50px)' }} />
  </motion.div>
);

export const TiltCard = ({ children, className }: { children: ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} transition={{ type: 'spring' }} className={className}>
      {children}
    </motion.div>
  );
};

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="bg-black/50 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
          <p className="text-white/70 mb-8">{message}</p>
          <div className="flex justify-end gap-4">
            <button onClick={onClose} className="px-6 py-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors">Cancel</button>
            <button onClick={onConfirm} className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-soft-light active:shadow-inner-soft">Confirm</button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={`bg-black/20 p-6 rounded-3xl border border-white/10 animate-pulse shadow-inner-soft ${className}`}>
    <div className="h-10 w-10 bg-white/10 rounded-2xl mb-6"></div>
    <div className="h-8 w-3/4 bg-white/10 rounded-lg mb-3"></div>
    <div className="h-4 w-1/2 bg-white/10 rounded-lg"></div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-[#0A0A0A] text-gray-300 relative overflow-hidden p-6">
    <AuroraBackground />
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 h-20">
        <div className="h-16 w-48 bg-white/[.04] rounded-2xl animate-pulse"></div>
        <div className="flex items-center gap-4"><div className="h-16 w-64 bg-white/[.04] rounded-2xl animate-pulse"></div><div className="h-14 w-14 bg-white/[.04] rounded-2xl animate-pulse"></div></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
    </div>
  </div>
);
