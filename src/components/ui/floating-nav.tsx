import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Calendar,
  CheckSquare,
  Timer,
  BookOpen,
  Trophy,
  Calculator,
  GraduationCap,
  UserCheck,
  Book,
  FolderOpen,
  Shield,
  FileText,
  Target,
  Sparkles,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingNavProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

// Enhanced Custom Styles with Zenith Architecture Standards
const navStyles = `
  .floating-nav-container {
    background: rgba(5, 5, 5, 0.4);
    backdrop-filter: blur(32px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  .nav-item-active {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
  }

  .nav-item-hover:hover {
    background: rgba(255, 255, 255, 0.03);
    transform: translateY(-2px);
  }

  .nav-tooltip {
    background: rgba(5, 5, 5, 0.9);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  @keyframes pulseGlowEmerald {
    0%, 100% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); }
    50% { box-shadow: 0 0 25px rgba(16, 185, 129, 0.4); }
  }
`;

// Add styles to document head
const addNavStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('floating-nav-styles')) return;

  const styleSheet = document.createElement("style");
  styleSheet.id = 'floating-nav-styles';
  styleSheet.type = "text/css";
  styleSheet.innerText = navStyles;
  document.head.appendChild(styleSheet);
};

// Enhanced navigation items with Zenith high-stakes nomenclature
const navigationItems = [
  { id: 'dashboard', icon: Home, label: 'Operational Core' },
  { id: 'courses', icon: Book, label: 'Sector Registry' },
  { id: 'timetable', icon: Calendar, label: 'Temporal Grid' },
  { id: 'tasks', icon: CheckSquare, label: 'Tactical Units' },
  { id: 'progress', icon: Target, label: 'Neural Matrix' },
  { id: 'syllabus', icon: GraduationCap, label: 'Protocol Index' },
  { id: 'privacy', icon: Shield, label: 'Data Sovereignty' },
  { id: 'terms', icon: FileText, label: 'Legal Accord' },
  { id: 'profile', icon: UserCheck, label: 'Identity Hub' },
];

export const FloatingNav: React.FC<FloatingNavProps> = ({ onNavigate, currentPage }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    addNavStyles();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(lastScrollY > currentScrollY || currentScrollY < 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-4"
        >
          <div className="floating-nav-container rounded-[2rem] p-2.5 shadow-2xl overflow-hidden relative">
            {/* Background Grain/Noise */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')]" />
            
            <div className="flex items-center space-x-1.5 overflow-x-auto max-w-screen-lg scrollbar-hide relative z-10">
              {navigationItems.map((item, index) => {
                const isActive = currentPage === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      'relative p-3.5 rounded-[1.2rem] transition-all duration-500 flex-shrink-0 group nav-item-hover',
                      isActive
                        ? 'nav-item-active text-emerald-400'
                        : 'text-zinc-500 hover:text-white'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.03 }
                    }}
                  >
                    <div className="relative z-10">
                      <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-400" : "text-zinc-600 group-hover:text-white transition-colors")} />
                      {isActive && (
                        <motion.div
                          layoutId="activeGlow"
                          className="absolute inset-0 bg-emerald-500/20 blur-xl -z-10"
                        />
                      )}
                    </div>

                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 rounded-[1.2rem] border border-emerald-500/30"
                        style={{
                          animation: 'pulseGlowEmerald 3s ease-in-out infinite'
                        }}
                      />
                    )}

                    {/* Tooltip Engineering */}
                    <motion.div 
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 px-4 py-2.5 nav-tooltip text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap pointer-events-none shadow-2xl border border-white/5 italic"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles size={10} className="text-emerald-500" />
                        {item.label}
                      </div>
                      {/* Architectural arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-px h-2 bg-emerald-500/30" />
                    </motion.div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Subsystem Connection Indicators */}
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 px-4 py-1 bg-[#050505] rounded-full border border-white/5">
             <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
             <span className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-600">Neural Sync Active</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};