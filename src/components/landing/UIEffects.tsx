import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll } from 'framer-motion';

/**
 * A custom mouse cursor that reacts to interactive elements (links, buttons).
 * Automatically disabled on touch devices to save resources.
 */
export const CustomCursor: React.FC = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();

    if (isTouch) return;

    let rafId: number;
    const moveCursor = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (cursorDotRef.current) {
          cursorDotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        }
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('a') || 
        target.closest('button');
      
      setHovered(!!isInteractive);
    };

    window.addEventListener('mousemove', moveCursor, { passive: true });
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isTouch]);

  if (isTouch) return null;

  return (
    <motion.div
      ref={cursorDotRef}
      className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[99] hidden md:block"
    >
      <motion.div
        animate={{ 
          scale: hovered ? 1.5 : 1, 
          opacity: hovered ? 0.4 : 0.6 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`w-6 h-6 rounded-full ${hovered ? 'bg-blue-400' : 'bg-blue-600'} border border-white/20`}
      />
    </motion.div>
  );
};

/**
 * A thin progress bar at the top indicating scroll depth.
 */
export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 origin-left z-[100]"
      style={{ scaleX: scrollYProgress }}
    />
  );
};
