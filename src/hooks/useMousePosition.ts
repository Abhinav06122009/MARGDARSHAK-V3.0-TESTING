import { useEffect } from 'react';
import { useMotionValue } from 'framer-motion';

export const useMousePosition = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    let lastUpdate = 0;
    const updateMousePosition = (ev: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdate > 16) { // ~60fps throttle
        x.set(ev.clientX);
        y.set(ev.clientY);
        lastUpdate = now;
      }
    };
    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, [x, y]);

  return { x, y };
};