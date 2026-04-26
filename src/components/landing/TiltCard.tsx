import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useSound } from './SoundContext';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * A card component that tilts based on mouse position.
 * Features hover sound effects and smooth spring animations.
 */
export const TiltCard: React.FC<TiltCardProps> = ({ children, className = '', ...props }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const { playSound } = useSound();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for rotation
  const springX = useSpring(mouseX, { stiffness: 150, damping: 12 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 12 });

  const rotateX = useTransform(springY, [-100, 100], ['8deg', '-8deg']);
  const rotateY = useTransform(springX, [-100, 100], ['-8deg', '8deg']);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current && isHovering) {
        const card = ref.current.getBoundingClientRect();
        
        // Calculate relative mouse position (-100 to 100)
        const deltaX = (e.clientX - (card.left + card.width / 2)) / (card.width / 2) * 100;
        const deltaY = (e.clientY - (card.top + card.height / 2)) / (card.height / 2) * 100;

        mouseX.set(deltaX);
        mouseY.set(deltaY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovering, mouseX, mouseY]);

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX: rotateX,
        rotateY: rotateY,
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
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
