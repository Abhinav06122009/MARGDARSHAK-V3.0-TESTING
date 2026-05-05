import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Download, Monitor, Smartphone, Archive, Shield, Zap, CheckCircle } from 'lucide-react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import GlobalFooter from '@/components/layout/GlobalFooter';
import { SoundProvider } from '@/components/landing/SoundContext';
import { CustomCursor, ScrollProgressBar } from '@/components/landing/UIEffects';

// Optimized Download Card Component
const DownloadCard = memo(({ item, index }: { item: any, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    className="group relative p-6 md:p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] hover:border-blue-500/30 transition-all duration-300 will-change-transform"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 md:p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform duration-300">
        {React.cloneElement(item.icon as React.ReactElement, { 
          loading: "lazy", 
          decoding: "async" 
        })}
      </div>
      <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold tracking-wider text-gray-400 uppercase border border-white/5">
        {item.type}
      </span>
    </div>

    <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
      {item.title}
    </h3>
    <p className="text-gray-400 mb-8 leading-relaxed text-sm md:text-base">
      {item.description}
    </p>

    <div className="flex items-center gap-6 mb-8 text-xs md:text-sm font-medium text-gray-500">
      <span className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-emerald-500" />
        {item.version}
      </span>
      <span className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-blue-500" />
        {item.size}
      </span>
    </div>

    <a
      href={item.downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold py-3 md:py-4 px-6 rounded-2xl shadow-xl shadow-blue-900/10 group-hover:shadow-blue-500/20 transition-all duration-300 active:scale-95"
    >
      <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
      Download Now
    </a>
  </motion.div>
));

DownloadCard.displayName = 'DownloadCard';

const DownloadPageContent = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    // Smooth scroll polyfill or behavior
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  const downloads = useMemo(() => [
    {
      title: "Windows Application",
      description: "Complete desktop experience with offline support and system notifications.",
      filename: "MARGDARSHAK.exe",
      downloadUrl: "https://github.com/Abhinav06122009/MARGDARSHAK-PUBLIC-RELEASES/releases/download/V3.0/MARGDARSHAK.exe", 
      icon: <img src="/windows.png" alt="Windows" className="w-10 h-10 object-contain" />,
      size: "213 MB",
      version: "V3.0",
      type: "Desktop"
    },
    {
      title: "Windows Setup",
      description: "Standard installer for Windows with automatic updates and system integration.",
      filename: "Margdarshak_Setup.exe",
      downloadUrl: "https://github.com/Abhinav06122009/MARGDARSHAK-PUBLIC-RELEASES/releases/download/V3.0/Margdarshak_Setup.exe",
      icon: <img src="/windows.png" alt="Windows Setup" className="w-10 h-10 object-contain" />,
      size: "1.97 GB",
      version: "V3.0",
      type: "Installer"
    },
    {
      title: "Android Mobile App",
      description: "Stay productive on the go with our feature-rich mobile companion.",
      filename: "Margdarshak.apk",
      downloadUrl: "https://github.com/Abhinav06122009/MARGDARSHAK-PUBLIC-RELEASES/releases/download/V3.0/Margdarshak.apk",
      icon: <img src="/android-logo.png" alt="Android" className="w-10 h-10 object-contain" />,
      size: "11.4 MB",
      version: "V3.0",
      type: "Mobile"
    },
    {
      title: "Portable Version",
      description: "No installation required. Run MARGDARSHAK directly from any USB drive.",
      filename: "MARGDARSHAK_Portable.zip",
      downloadUrl: "https://github.com/Abhinav06122009/MARGDARSHAK-PUBLIC-RELEASES/releases/download/V3.0/MARGDARSHAK_Portable.zip",
      icon: <img src="/windows.png" alt="Windows Portable" className="w-10 h-10 object-contain" />,
      size: "1.94 GB",
      version: "V3.0",
      type: "Portable"
    }
  ], []);

  return (
    <div className={`min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 ${!isTouch ? 'cursor-none' : ''} overflow-x-hidden`}>
      {!isTouch && <CustomCursor />}
      <ScrollProgressBar />
      <LandingHeader />

      <main className="relative pt-20 pb-32">
        {/* Optimized Background Gradients - Reduced blur and size for better performance */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none z-0" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16 md:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6 bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent leading-tight">
                Download MARGDARSHAK
              </h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Experience the full power of AI-enhanced learning on all your devices. 
                Secure, fast, and built for academic excellence.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
            {downloads.map((item, index) => (
              <DownloadCard key={item.filename} item={item} index={index} />
            ))}
          </div>

          {/* Feature Trust Banner */}
          <div className="mt-16 md:mt-24 max-w-4xl mx-auto">
            <div className="p-8 md:p-12 rounded-[32px] md:rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute -top-24 -right-24 opacity-[0.03] pointer-events-none">
                <Shield className="w-64 h-64" />
              </div>
              
              <div className="relative z-10 grid sm:grid-cols-3 gap-8 md:gap-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/10">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="font-bold mb-2 text-sm md:text-base">Secure & Verified</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">All builds are digitally signed and scanned for threats.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/10">
                    <Zap className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="font-bold mb-2 text-sm md:text-base">High Performance</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Optimized native builds for maximum efficiency.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/10">
                    <CheckCircle className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="font-bold mb-2 text-sm md:text-base">Automatic Updates</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Stay current with the latest AI features automatically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const DownloadPage = () => (
  <SoundProvider>
    <DownloadPageContent />
  </SoundProvider>
);

export default DownloadPage;

