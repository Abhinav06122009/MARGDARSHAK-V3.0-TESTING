import React, { Suspense } from 'react';
import { SoundProvider } from '@/components/landing/SoundContext';
import { CustomCursor, ScrollProgressBar } from '@/components/landing/UIEffects';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingHero } from '@/components/landing/LandingHero';
import { BackgroundScene } from '@/components/landing/BackgroundScene';
import { Features, Testimonials, About } from '@/components/landing/LandingSections';
import { GeminiFeatureDemo } from '@/components/landing/GeminiFeatureDemo';
import { Pricing, CTA } from '@/components/landing/Pricing';
import Footer from '@/components/Footer';

/**
 * The main Landing Page component.
 * Orchestrates all landing page sections and global effects.
 * Modularized for better maintainability and professional standards.
 */
const LandingPage: React.FC = () => {
  return (
    <SoundProvider>
      <div className="bg-[#0A0A0A] min-h-screen font-sans text-white antialiased relative cursor-none">
        {/* Global UI Overlays */}
        <CustomCursor />
        <ScrollProgressBar />
        <BackgroundScene />

        {/* Global Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Custom Scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #0A0A0A;
          }
          ::-webkit-scrollbar-thumb {
            background: #3b82f6;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #2563eb;
          }
          
          /* Interactive elements fallback for cursor */
          .button-interactive {
            cursor: none !important;
          }
        `}} />

        <LandingHeader />

        <main className="relative z-10">
          <LandingHero />
          
          {/* Lazy-loaded sections for performance */}
          <Suspense fallback={<SectionPlaceholder />}>
            <Features />
            <GeminiFeatureDemo />
            <Testimonials />
            <About />
            <Pricing />
            <CTA />
          </Suspense>
        </main>

        <Footer />
      </div>
    </SoundProvider>
  );
};

const SectionPlaceholder = () => <div className="h-96 w-full animate-pulse bg-gray-900/20" />;

export default LandingPage;