import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useSound } from './SoundContext';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * A button that physically pulls toward the user's cursor when hovered.
 * Creates a premium, high-interaction feel.
 */
export const MagneticButton: React.FC<MagneticButtonProps> = ({ children, className = '', ...props }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const { playSound } = useSound();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 200, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 15 });

  // Add subtle tilt rotation as well
  const rotateX = useTransform(springY, [-50, 50], ['15deg', '-15deg']);
  const rotateY = useTransform(springX, [-50, 50], ['-15deg', '15deg']);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current && isHovering) {
        const button = ref.current.getBoundingClientRect();
        const centerX = button.left + button.width / 2;
        const centerY = button.top + button.height / 2;

        const deltaX = e.pageX - centerX;
        const deltaY = e.pageY - centerY;

        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        const maxDistance = 150;
        const strength = 0.3;

        if (distance < maxDistance) {
          const factor = 1 - distance / maxDistance;
          mouseX.set(deltaX * factor * strength * 2);
          mouseY.set(deltaY * factor * strength * 2);
        } else {
          mouseX.set(0);
          mouseY.set(0);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovering, mouseX, mouseY]);

  return (
    <motion.div
      ref={ref}
      style={{
        x: springX,
        y: springY,
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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
