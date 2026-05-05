import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Twitter, Github, Linkedin, ShieldCheck, Zap, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Ensure you have a logo image or remove the img tag
import logo from "@/components/logo/logo.png"; 
import { Instagram, Youtube } from 'lucide-react';

const Footer = React.memo(() => {
  return (
    <footer className="relative w-full bg-[#050505] border-t border-white/10 pt-16 pb-8 overflow-hidden font-sans z-50">
      {/* AdSense Requirement: Privacy & Terms must be visible */}
      
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3 group relative">
              <div className="relative">
                {/* Enhanced Brand Glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-emerald-500 blur-xl opacity-0 group-hover:opacity-40 transition-all duration-700 rounded-full" />
                <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 transition-opacity" />
                
                {/* Premium Logo Container */}
                <div className="p-0.5 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/10 relative z-10 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                  <img src={logo} alt="Margdarshak Logo" className="w-14 h-14 rounded-xl object-contain bg-white/5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  MARGDARSHAK
                </h3>
                <p className="text-xs text-blue-400 font-medium tracking-widest uppercase">Academic Excellence</p>
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Your comprehensive platform for academic success. We help students organize their studies, track progress, and achieve their goals with ease.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              {[
                { icon: Twitter, href: "https://x.com/gyantappas", color: "hover:bg-sky-500/20 hover:text-sky-400 hover:border-sky-500/50" },
                { icon: Github, href: "https://github.com", color: "hover:bg-slate-700/20 hover:text-slate-100 hover:border-slate-500/50" },
                { icon: Linkedin, href: "https://linkedin.com", color: "hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500/50" },
                { icon: Instagram, href: "https://instagram.com", color: "hover:bg-pink-600/20 hover:text-pink-400 hover:border-pink-500/50" },
                { icon: Youtube, href: "https://youtube.com", color: "hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/50" }
              ].map((social, idx) => (
                <motion.a 
                  key={idx}
                  href={social.href} 
                  target="_blank" 
                  rel="noreferrer"
                  aria-label="Social Link"
                  whileHover={{ scale: 1.15, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 transition-all duration-300 shadow-xl ${social.color}`}
                >
                  <social.icon size={22} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns - CRITICAL FOR ADSENSE NAVIGATION */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {[
              { 
                title: "Platform", 
                links: [
                  { label: "Dashboard", to: "/dashboard" },
                  { label: "AI Tutor", to: "/ai-assistant" },
                  { label: "Study Schedule", to: "/timetable" },
                  { label: "Assignments", to: "/tasks" },
                ] 
              },
              { 
                title: "Resources", 
                links: [
                  { label: "Calculator", to: "/calculator" },
                  { label: "Study Timer", to: "/timer" },
                  { label: "Academic Blog", to: "/blog" },
                ] 
              },
              { 
                title: "Support", 
                links: [
                  { label: "Help Center", to: "/help" },
                  { label: "Privacy Policy", to: "/privacy" },
                  { label: "Terms of Service", to: "/terms" },
                  { label: "Contact Us", to: "/contact" },
                ] 
              }
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link 
                        to={link.to} 
                        className="text-sm text-slate-400 hover:text-blue-400 hover:pl-2 transition-all duration-300 flex items-center gap-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Privacy & Security Verified</span>
          </div>
          <p>© {new Date().getFullYear()} VSAV GYANTAPA. All rights reserved.</p>
        </div>
      </div>

    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
