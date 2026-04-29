import React, { useRef, useEffect } from 'react';

/**
 * An optimized interactive particle background.
 * Particles react to mouse position and form dynamic networks.
 * Designed for high performance across all devices.
 */
export const BackgroundScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: -1000, y: -1000 });
  const requestRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimization: disable alpha if possible or keep for trail
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: any[] = [];
    const isMobile = window.innerWidth < 768;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      // Significantly fewer particles on mobile/tablet
      const count = isMobile ? 30 : Math.min(Math.floor(width / 15), 100);
      
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.2 + 0.5,
          color: `hsl(${215 + Math.random() * 15}, 60%, 50%)`
        });
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    const animate = () => {
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, width, height);

      const maxDist = isMobile ? 60 : 100;
      const mouseMaxDist = isMobile ? 80 : 130;
      const maxDistSq = maxDist * maxDist;
      const mouseMaxDistSq = mouseMaxDist * mouseMaxDist;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse interaction
        const dxMouse = mousePos.current.x - p.x;
        const dyMouse = mousePos.current.y - p.y;
        const distSqMouse = dxMouse * dxMouse + dyMouse * dyMouse;

        if (distSqMouse < mouseMaxDistSq) {
          const distMouse = Math.sqrt(distSqMouse);
          const force = (mouseMaxDist - distMouse) / mouseMaxDist;
          p.vx -= (dxMouse / distMouse) * force * 0.015;
          p.vy -= (dyMouse / distMouse) * force * 0.015;
        }

        // Draw lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.08 * (1 - dist / maxDist)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 opacity-50"
      style={{ zIndex: 0, pointerEvents: 'none' }}
    />
  );
};
