import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Cpu, 
  Github, 
  Twitter, 
  Instagram, 
  MessageSquare, 
  Globe, 
  Zap, 
  Lock,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';

const GlobalFooter = () => {
  const socialLinks = [
    { icon: <Instagram size={18} />, label: 'Instagram', color: 'hover:text-pink-500', glow: 'group-hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]' },
    { icon: <Twitter size={18} />, label: 'Twitter', color: 'hover:text-blue-400', glow: 'group-hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]' },
    { icon: <MessageSquare size={18} />, label: 'Discord', color: 'hover:text-indigo-400', glow: 'group-hover:shadow-[0_0_20px_rgba(129,140,248,0.3)]' },
    { icon: <Github size={18} />, label: 'GitHub', color: 'hover:text-white', glow: 'group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]' },
  ];

  const footerLinks = {
    protocols: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Security Audit', path: '/security' },
    ],
    infrastructure: [
      { name: 'Identity Hub', path: '/auth' },
      { name: 'Premium Upgrade', path: '/upgrade' },
      { name: 'System Status', path: '/status' },
    ],
    support: [
      { name: 'Documentation', path: '/docs' },
      { name: 'Help Center', path: '/support' },
      { name: 'AI Feedback', path: '/feedback' },
    ]
  };

  return (
    <footer className="w-full relative mt-24 pb-12 px-6 overflow-hidden border-t border-white/5 bg-[#050505]">
      {/* Background Aesthetics */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-sm" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.03),transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand & Social Section */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-3 group cursor-default">
                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl group-hover:border-blue-500/30 transition-all duration-500 shadow-2xl">
                  <Cpu className="text-blue-500 w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">
                  Margdarshak <span className="text-blue-500">Systems</span>
                </h2>
              </div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] leading-relaxed max-w-xs">
                The definitive cognitive infrastructure for elite academic engineering.
              </p>
            </div>

            {/* Social Pulse Hub */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href="#"
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group relative p-3 bg-white/[0.02] border border-white/5 rounded-xl transition-all duration-300 ${social.color} ${social.glow}`}
                >
                  <div className="relative z-10">{social.icon}</div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation Matrix */}
          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-12">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="space-y-6">
                <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.6em] mb-4">{title}</h4>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        to={link.path} 
                        className="group flex items-center gap-2 text-[11px] font-bold text-zinc-400 hover:text-white transition-all duration-300"
                      >
                        <ChevronRight size={10} className="text-blue-500/0 group-hover:text-blue-500 transition-all -ml-2 group-hover:ml-0" />
                        <span className="tracking-widest uppercase">{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Elite Status Section */}
          <div className="lg:col-span-2 flex flex-col items-center lg:items-end justify-start space-y-8">
            <div className="w-full p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl space-y-4 group hover:border-blue-500/20 transition-all duration-500">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Health</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                  <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-tighter">Operational</span>
                </div>
              </div>
              <div className="h-[1px] bg-white/5" />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white uppercase tracking-tighter">AI Core</span>
                  <span className="text-[10px] font-mono text-zinc-400 italic">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Latency</span>
                  <span className="text-[10px] font-mono text-blue-400">12ms</span>
                </div>
              </div>
            </div>
            
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600/10 border border-blue-500/30 rounded-xl text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] hover:bg-blue-600/20 transition-all group">
              Global Support <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

        </div>

        {/* Global Security Strip */}
        <div className="flex flex-col md:flex-row items-center justify-between py-10 border-t border-white/5 gap-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
              <Zap size={14} className="text-amber-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Powered by Gemini Pro</span>
            </div>
            <div className="w-1 h-1 bg-zinc-800 rounded-full hidden md:block" />
            <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-all cursor-default">
              <Lock size={12} className="text-zinc-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Military Grade RSA</span>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-zinc-500 opacity-30" />
              <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.5em]">
                © 2026 MARGDARSHAK_SYSTEMS. ALL_RIGHTS_RESERVED.
              </p>
            </div>
            <p className="text-[7px] font-mono text-zinc-800 uppercase tracking-[0.4em]">
              V3.0.4_BUILD_STABLE // SHA_256_VERIFIED
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
