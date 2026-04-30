import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SoundProvider } from '@/components/landing/SoundContext';
import { CustomCursor, ScrollProgressBar } from '@/components/landing/UIEffects';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingHero } from '@/components/landing/LandingHero';
import { BackgroundScene } from '@/components/landing/BackgroundScene';

// Lazy load heavy sections for performance
const Features = lazy(() => import('@/components/landing/LandingSections').then(m => ({ default: m.Features })));
const Testimonials = lazy(() => import('@/components/landing/LandingSections').then(m => ({ default: m.Testimonials })));
const About = lazy(() => import('@/components/landing/LandingSections').then(m => ({ default: m.About })));
const GeminiFeatureDemo = lazy(() => import('@/components/landing/GeminiFeatureDemo').then(m => ({ default: m.GeminiFeatureDemo })));
const Pricing = lazy(() => import('@/components/landing/Pricing').then(m => ({ default: m.Pricing })));
const CTA = lazy(() => import('@/components/landing/Pricing').then(m => ({ default: m.CTA })));
const TechStack = lazy(() => import('@/components/landing/TechStack').then(m => ({ default: m.TechStack })));

/**
 * The main Landing Page component.
 * Optimized for universal display and high performance on all devices.
 */
const LandingPage: React.FC = () => {
  const [isTouch, setIsTouch] = useState(false);
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (!loading && session) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, loading, navigate]);

  return (
    <SoundProvider>
      <div className={`bg-[#0A0A0A] min-h-screen font-sans text-white antialiased relative ${!isTouch ? 'cursor-none' : ''}`}>
        {/* Global UI Overlays - Only show custom cursor on non-touch devices */}
        {!isTouch && <CustomCursor />}
        <ScrollProgressBar />
        <BackgroundScene />

        {/* Global Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Custom Scrollbar */
          ::-webkit-scrollbar {
            width: 6px;
          }
          ::-webkit-scrollbar-track {
            background: #0A0A0A;
          }
          ::-webkit-scrollbar-thumb {
            background: #3b82f6;
            border-radius: 10px;
          }
          
          /* Smooth Scrolling */
          html {
            scroll-behavior: smooth;
          }

          /* Universal sizing fixes */
          body {
            overflow-x: hidden;
            width: 100vw;
          }
          
          .button-interactive {
            cursor: ${isTouch ? 'pointer' : 'none'} !important;
          }
        `}} />

        <LandingHeader />

        <main className="relative z-10 w-full">
          <LandingHero />
          
          {/* Lazy-loaded sections with placeholders */}
          <Suspense fallback={<SectionPlaceholder />}>
            <Features />
            <GeminiFeatureDemo />
            <TechStack />
            <Testimonials />
            <About />
            <Pricing />
            <CTA />
          </Suspense>
        </main>

      </div>
    </SoundProvider>
  );
};

const SectionPlaceholder = () => (
  <div className="h-[50vh] w-full flex items-center justify-center bg-gray-900/10">
    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
  </div>
);

export default LandingPage;