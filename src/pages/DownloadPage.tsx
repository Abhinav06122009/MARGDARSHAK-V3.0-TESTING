import React from 'react';
import { motion } from 'framer-motion';
import { Download, Monitor, Smartphone, Archive, Shield, Zap, CheckCircle } from 'lucide-react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import GlobalFooter from '@/components/layout/GlobalFooter';

const DownloadPage = () => {
  const downloads = [
    {
      title: "Windows Application",
      description: "Complete desktop experience with offline support and system notifications.",
      filename: "MARGDARSHAK.exe",
      icon: <Monitor className="w-8 h-8" />,
      size: "212 MB",
      version: "v3.0.1",
      type: "Desktop"
    },
    {
      title: "Windows Setup",
      description: "Standard installer for Windows with automatic updates and system integration.",
      filename: "Margdarshak_Setup.exe",
      icon: <Download className="w-8 h-8" />,
      size: "917 MB",
      version: "v3.0.1",
      type: "Installer"
    },
    {
      title: "Android Mobile App",
      description: "Stay productive on the go with our feature-rich mobile companion.",
      filename: "Margdarshak.apk",
      icon: <Smartphone className="w-8 h-8" />,
      size: "7 MB",
      version: "v3.0.0",
      type: "Mobile"
    },
    {
      title: "Portable Version",
      description: "No installation required. Run MARGDARSHAK directly from any USB drive.",
      filename: "MARGDARSHAK_Portable.zip",
      icon: <Archive className="w-8 h-8" />,
      size: "1.9 GB",
      version: "v3.0.1",
      type: "Portable"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      <LandingHeader />

      <main className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-gradient-to-r from-white via-blue-200 to-emerald-200 bg-clip-text text-transparent">
                Download MARGDARSHAK
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Experience the full power of AI-enhanced learning on all your devices. 
                Secure, fast, and built for academic excellence.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {downloads.map((item, index) => (
              <motion.div
                key={item.filename}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/[0.08] hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-bold tracking-wider text-gray-400 uppercase border border-white/5">
                    {item.type}
                  </span>
                </div>

                <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center gap-6 mb-8 text-sm font-medium text-gray-500">
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
                  href={`/downloads/${item.filename}`}
                  download
                  className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-blue-900/20 group-hover:shadow-blue-500/20 transition-all duration-300"
                >
                  <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                  Download Now
                </a>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 max-w-4xl mx-auto">
            <div className="p-12 rounded-[40px] bg-gradient-to-br from-blue-600/20 to-emerald-600/20 border border-white/10 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Shield className="w-48 h-48" />
              </div>
              
              <div className="relative z-10 grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="font-bold mb-2">Secure & Verified</h4>
                  <p className="text-sm text-gray-400">All builds are digitally signed and scanned for threats.</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                    <Zap className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="font-bold mb-2">High Performance</h4>
                  <p className="text-sm text-gray-400">Optimized native builds for maximum efficiency.</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                    <CheckCircle className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="font-bold mb-2">Automatic Updates</h4>
                  <p className="text-sm text-gray-400">Stay current with the latest AI features automatically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <GlobalFooter />
    </div>
  );
};

export default DownloadPage;
