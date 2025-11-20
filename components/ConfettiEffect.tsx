
import React, { useEffect, useRef } from 'react';
import { useHabits } from '../context/HabitContext';

const ConfettiEffect: React.FC = () => {
  const { state } = useHabits();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { newlyUnlockedAchievements } = state;

  useEffect(() => {
    if (newlyUnlockedAchievements.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = 150;
    const colors = ['#5D5FEF', '#11D1A9', '#F59E0B', '#EF4444', '#3B82F6'];

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      life: number;

      constructor() {
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        this.vx = (Math.random() - 0.5) * 20;
        this.vy = (Math.random() - 0.5) * 20;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = Math.random() * 8 + 4;
        this.life = 100;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.5; // Gravity
        this.vx *= 0.95; // Friction
        this.vy *= 0.95;
        this.life -= 1;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.life / 100);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
      }

      // Remove dead particles
      for (let i = particles.length - 1; i >= 0; i--) {
          if (particles[i].life <= 0) {
              particles.splice(i, 1);
          }
      }

      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [newlyUnlockedAchievements]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[60]"
      style={{ display: newlyUnlockedAchievements.length > 0 ? 'block' : 'none' }}
    />
  );
};

export default ConfettiEffect;
