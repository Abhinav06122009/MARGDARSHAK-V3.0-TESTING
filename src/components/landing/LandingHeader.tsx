import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSound } from './SoundContext';
import { MagneticButton } from './MagneticButton';
import logo from '@/components/logo/logo.png';

/**
 * Responsive navigation header for the landing page.
 * Adapts styling on scroll and includes a mobile menu.
 */
export const LandingHeader = React.memo(() => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { soundEnabled, toggleSound, playSound } = useSound();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'home', label: 'Home' },
    { name: 'features', label: 'Features' },
    { name: 'margdarshak-Saarthi', label: 'margdarshak-Saarthi' },
    { name: 'testimonials', label: 'Success' },
    { name: 'about', label: 'Mission' },
    { name: 'download', label: 'Download', path: '/download' },
    { name: 'blog', label: 'Blog', path: '/blog' },
    { name: 'pricing', label: 'Pricing' }
  ];

  const handleLinkClick = (id: string, path?: string) => {
    if (path) {
      navigate(path);
      setIsMobileMenuOpen(false);
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
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`text-white sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? 'py-2 bg-gray-900/80 backdrop-blur-md border-b border-white/5 shadow-2xl'
          : 'py-4 bg-transparent border-transparent'
        }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Brand */}
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => handleLinkClick('home')}>
          <div className="relative">
            <div className="p-1 rounded-xl bg-white/5 border border-white/10 relative z-10 group-hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="Margdarshak Logo" className="h-10 w-10 rounded-lg object-contain" />
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-black tracking-tighter text-white group-hover:text-blue-400 transition-colors leading-none uppercase">
              MARGDARSHAK
            </span>
            <span className="text-[8px] md:text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1 opacity-80">AI Powered Educational Suite</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center space-x-8 font-medium">
          {navItems.map(item => (
            <li key={item.name}>
              <button
                onClick={() => handleLinkClick(item.name, item.path)}
                onMouseEnter={() => playSound('hover')}
                className="capitalize text-xs md:text-sm text-gray-300 hover:text-blue-400 transition-colors relative group tracking-widest font-bold"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300" />
              </button>
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleSound}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <MagneticButton>
            <button
              onClick={() => navigate('/auth')}
              className="bg-blue-600 text-white font-black text-xs uppercase tracking-widest py-3 px-8 rounded-xl transition-all duration-300 hover:bg-blue-500 shadow-lg shadow-blue-600/20 active:scale-95"
            >
              Get Started
            </button>
          </MagneticButton>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-2">
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-gray-900 border-t border-white/5 overflow-hidden"
          >
            <ul className="flex flex-col p-6 space-y-4">
              {navItems.map(item => (
                <li key={item.name}>
                  <button
                    onClick={() => handleLinkClick(item.name, item.path)}
                    className="text-sm font-bold tracking-widest uppercase text-gray-300 hover:text-blue-400 w-full text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li className="pt-4 border-t border-white/5">
                <button
                  onClick={() => navigate('/auth')}
                  className="block w-full text-center bg-blue-600 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl"
                >
                  Launch Console
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
});

LandingHeader.displayName = 'LandingHeader';
