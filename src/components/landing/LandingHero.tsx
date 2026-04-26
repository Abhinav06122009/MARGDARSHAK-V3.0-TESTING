import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Rocket, Users, Award, TrendingUp } from 'lucide-react';
import { MagneticButton } from './MagneticButton';
import { useSound } from './SoundContext';

/**
 * The main Hero section of the landing page.
 * Includes scroll-driven scaling and parallax depth.
 */
export const LandingHero: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const { playSound } = useSound();

  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const stats = [
    { icon: Users, label: '50k+ Active Students', color: 'text-blue-400' },
    { icon: Award, label: '98% Improvement Rate', color: 'text-emerald-400' },
    { icon: TrendingUp, label: 'AI Driven Success', color: 'text-purple-400' },
  ];

  return (
    <motion.section
      id="home"
      ref={heroRef}
      style={{ scale, opacity }}
      className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-12 overflow-hidden px-6"
    >
      <div className="container mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-bold mb-8 backdrop-blur-sm"
        >
          ✨ Revolutionizing Academic Success
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white mb-8 tracking-tighter leading-none"
        >
          Master Your Studies <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            With Intelligent AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          The ultimate academic orchestration platform. 
          Combine dynamic scheduling, predictive analytics, and AI tutoring 
          to unlock your full potential.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <MagneticButton>
            <a 
              href="/auth" 
              className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-10 rounded-2xl text-xl shadow-2xl shadow-blue-600/30 transition-all duration-300"
              onMouseEnter={() => playSound('hover')}
            >
              Get Started Free <Rocket className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </a>
          </MagneticButton>

          <button 
            className="flex items-center gap-2 text-white font-bold py-4 px-8 rounded-2xl border border-white/10 hover:bg-white/5 transition-all duration-300 text-lg"
            onMouseEnter={() => playSound('hover')}
          >
            Watch Demo <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 pt-12"
        >
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
              <span className="text-white font-bold text-lg">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[150px] pointer-events-none" />
    </motion.section>
  );
};
