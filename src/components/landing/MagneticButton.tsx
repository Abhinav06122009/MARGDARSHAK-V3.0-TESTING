import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useSound } from './SoundContext';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * A button that physically pulls toward the user's cursor on desktop.
 * Optimized with localized event handlers to prevent global listener overhead.
 */
export const MagneticButton: React.FC<MagneticButtonProps> = ({ children, className = '', ...props }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { playSound } = useSound();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 200, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 20 });

  const rotateX = useTransform(springY, [-50, 50], ['10deg', '-10deg']);
  const rotateY = useTransform(springX, [-50, 50], ['-10deg', '10deg']);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !ref.current || !isHovering) return;

    const button = ref.current.getBoundingClientRect();
    const centerX = button.left + button.width / 2;
    const centerY = button.top + button.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const maxDistance = 120;
    const strength = 0.25;

    if (distance < maxDistance) {
      const factor = 1 - distance / maxDistance;
      mouseX.set(deltaX * factor * strength);
      mouseY.set(deltaY * factor * strength);
    } else {
      mouseX.set(0);
      mouseY.set(0);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        x: isMobile ? 0 : springX,
        y: isMobile ? 0 : springY,
        rotateX: isMobile ? 0 : rotateX,
        rotateY: isMobile ? 0 : rotateY,
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovering(true);
        playSound('hover');
      }}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${className} will-change-transform`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
