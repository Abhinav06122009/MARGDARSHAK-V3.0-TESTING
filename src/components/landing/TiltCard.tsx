import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useSound } from './SoundContext';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * A card component that tilts on desktop and simplifies on mobile.
 */
export const TiltCard: React.FC<TiltCardProps> = ({ children, className = '', ...props }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { playSound } = useSound();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(springY, [-100, 100], ['8deg', '-8deg']);
  const rotateY = useTransform(springX, [-100, 100], ['-8deg', '8deg']);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current && isHovering) {
        const card = ref.current.getBoundingClientRect();
        const deltaX = (e.clientX - (card.left + card.width / 2)) / (card.width / 2) * 100;
        const deltaY = (e.clientY - (card.top + card.height / 2)) / (card.height / 2) * 100;

        mouseX.set(deltaX);
        mouseY.set(deltaY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isHovering, isMobile, mouseX, mouseY]);

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX: isMobile ? 0 : rotateX,
        rotateY: isMobile ? 0 : rotateY,
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      whileHover={{ scale: isMobile ? 1 : 1.02 }}
      onMouseEnter={() => {
        setIsHovering(true);
        playSound('hover');
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        mouseX.set(0);
        mouseY.set(0);
      }}
      className={`preserve-3d ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
