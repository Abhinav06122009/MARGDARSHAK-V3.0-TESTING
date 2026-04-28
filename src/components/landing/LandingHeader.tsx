import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Menu, X } from 'lucide-react';
import { useSound } from './SoundContext';
import { MagneticButton } from './MagneticButton';
import logo from '@/components/logo/logo.png';

/**
 * Responsive navigation header for the landing page.
 * Adapts styling on scroll and includes a mobile menu.
 */
export const LandingHeader: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { soundEnabled, toggleSound, playSound } = useSound();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'home', label: 'Home' },
    { name: 'features', label: 'Features' },
    { name: 'margdarshak-ai', label: 'AI Assistant' },
    { name: 'testimonials', label: 'Success' },
    { name: 'about', label: 'Mission' },
    { name: 'blog', label: 'Blog', path: '/blog' },
    { name: 'pricing', label: 'Pricing' }
  ];

  const handleLinkClick = (id: string, path?: string) => {
    if (path) {
      window.location.href = path;
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
    playSound('click');
  };


  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`text-white sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? 'py-3 bg-gray-900/60 backdrop-blur-xl border-b border-blue-600/30 shadow-2xl'
          : 'py-4 bg-transparent border-transparent'
        }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Brand */}
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => handleLinkClick('home')}>
          <div className="relative">
            {/* Logo Glow */}
            <div className="absolute -inset-2 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            
            {/* Logo Glass Container */}
            <div className="p-1 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 relative z-10 shadow-2xl group-hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="Margdarshak Logo" className="h-10 w-10 rounded-lg object-contain" />
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-white group-hover:text-blue-400 transition-colors leading-none">
              MARGDARSHAK
            </span>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1 opacity-80">AI Powered</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center space-x-8 font-medium">
          {navItems.map(item => (
            <li key={item.name}>
              <button
                onClick={() => handleLinkClick(item.name, item.path)}
                onMouseEnter={() => playSound('hover')}
                className="capitalize text-gray-300 hover:text-blue-400 transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-emerald-400 group-hover:w-full transition-all duration-300" />
              </button>
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleSound}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <MagneticButton>
            <a
              href="/auth"
              className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 group relative overflow-hidden"
            >
              <span className="relative z-10">Launch</span>
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </MagneticButton>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button onClick={toggleSound} className="p-2 text-gray-400">
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button
            onClick={() => { playSound('click'); setIsMobileMenuOpen(!isMobileMenuOpen); }}
            className="p-2 text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-blue-600/10 overflow-hidden"
          >
            <ul className="flex flex-col p-6 space-y-4">
              {navItems.map(item => (
                <li key={item.name}>
                  <button
                    onClick={() => handleLinkClick(item.name, item.path)}
                    className="text-lg text-gray-300 hover:text-blue-400 w-full text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li className="pt-4">
                <a
                  href="/auth"
                  className="block w-full text-center bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold py-3 rounded-xl"
                >
                  Launch Console
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
