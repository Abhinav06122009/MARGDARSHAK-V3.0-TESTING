import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Download, Shield, Zap, CheckCircle } from 'lucide-react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { SoundProvider } from '@/components/landing/SoundContext';
import { CustomCursor, ScrollProgressBar } from '@/components/landing/UIEffects';

// Ultra-Optimized Download Card Component
const DownloadCard = memo(({ item, index }: { item: any, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="group relative p-6 md:p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 hover:border-blue-500/30 transition-all duration-300 will-change-transform"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 md:p-4 rounded-2xl bg-blue-500/5 text-blue-400 border border-blue-500/10 group-hover:bg-blue-500/10 transition-colors duration-300">
        {React.cloneElement(item.icon as React.ReactElement, { 
          loading: "lazy", 
          decoding: "async" 
        })}
      </div>
      <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
        {item.type}
      </span>
    </div>

    <h3 className="text-xl md:text-2xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">
      {item.title}
    </h3>
    <p className="text-gray-400 mb-8 leading-relaxed text-sm md:text-base line-clamp-2">
      {item.description}
    </p>

    <div className="flex items-center gap-6 mb-8 text-xs md:text-sm font-medium text-gray-500">
      <span className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-emerald-500/70" />
        {item.version}
      </span>
      <span className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-blue-500/70" />
        {item.size}
      </span>
    </div>

    <a
      href={item.downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 md:py-4 px-6 rounded-2xl shadow-lg shadow-blue-900/10 transition-all duration-300 active:scale-95"
    >
      <Download className="w-5 h-5" />
      Download
    </a>
  </motion.div>
));

DownloadCard.displayName = 'DownloadCard';

const DownloadPageContent = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
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
    <div className={`min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden scroll-smooth`}>
      {!isTouch && <CustomCursor />}
      <ScrollProgressBar />
      <LandingHeader />

      <main className="relative pt-20 pb-32">
        {/* Optimized Background - Using subtle radial gradients instead of heavy blurs */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent leading-tight">
                Download MARGDARSHAK
              </h1>
              <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Experience the full power of AI-enhanced learning on all your devices. 
                Secure, fast, and built for academic excellence.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {downloads.map((item, index) => (
              <DownloadCard key={item.filename} item={item} index={index} />
            ))}
          </div>

          {/* Trust Banner - Simplified */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="p-8 md:p-12 rounded-[2.5rem] bg-zinc-900/20 border border-white/5 relative overflow-hidden">
              <div className="relative z-10 grid sm:grid-cols-3 gap-10 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-500/5 rounded-xl flex items-center justify-center mb-4 border border-blue-500/10">
                    <Shield className="w-5 h-5 text-blue-400/70" />
                  </div>
                  <h4 className="font-bold mb-1 text-sm text-white">Secure</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Verified Builds</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-emerald-500/5 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/10">
                    <Zap className="w-5 h-5 text-emerald-400/70" />
                  </div>
                  <h4 className="font-bold mb-1 text-sm text-white">Fast</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Native Apps</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-purple-500/5 rounded-xl flex items-center justify-center mb-4 border border-purple-500/10">
                    <CheckCircle className="w-5 h-5 text-purple-400/70" />
                  </div>
                  <h4 className="font-bold mb-1 text-sm text-white">Smart</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Auto Updates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Attribution Section */}
          <div className="mt-16 text-center opacity-40 hover:opacity-100 transition-opacity">
            <p className="text-[10px] font-medium text-gray-500 mb-2 uppercase tracking-widest">Digital Assets Attribution</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <a href="https://iconscout.com/3d-icons/android" className="text-[10px] text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                Android Logo by IconScout Store
              </a>
              <a href="https://iconscout.com/3d-icons/windows" className="text-[10px] text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                Windows Logo by IconScout Store
              </a>
              <a href="https://iconscout.com" className="text-[10px] text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                on IconScout
              </a>
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

