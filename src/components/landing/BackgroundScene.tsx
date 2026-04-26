import React, { useRef, useState, useEffect } from 'react';

/**
 * An interactive particle background that simulates a 3D space.
 * Particles react to mouse position and form dynamic networks.
 */
export const BackgroundScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const particles: any[] = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 10), 200);
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (Math.random() * 0.5 + 0.1),
        vy: (Math.random() - 0.5) * (Math.random() * 0.5 + 0.1),
        size: Math.random() * 1.5 + 0.5,
        color: `hsl(${200 + Math.random() * 40}, 80%, 60%)`
      });
    }

    let animationFrameId: number;

    const animate = () => {
      // Clear with slight trail effect
      ctx.fillStyle = 'rgba(10, 10, 10, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        // Apply friction
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Mouse interaction (repulsion/attraction)
        const dxMouse = mousePos.x - p.x;
        const dyMouse = mousePos.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        const maxDist = 150;

        if (distMouse < maxDist) {
          const force = (maxDist - distMouse) / maxDist;
          p.vx -= (dxMouse / distMouse) * force * 0.05;
          p.vy -= (dyMouse / distMouse) * force * 0.05;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Draw lines between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 opacity-70 transition-opacity duration-500"
      style={{ zIndex: 0, pointerEvents: 'none' }}
    />
  );
};
