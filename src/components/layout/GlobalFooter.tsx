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
  ArrowUpRight,
  Sparkles,
  Command,
  Database,
  Search,
  Mail,
  Facebook
} from 'lucide-react';
import logo from "@/components/logo/logo.png";

const GlobalFooter = () => {
  const socialLinks = [
    { icon: <Instagram size={18} />, label: 'Instagram', href: 'https://www.instagram.com/vsavgyantapa/', color: 'hover:text-pink-500', glow: 'group-hover:shadow-[0_0_30px_rgba(236,72,153,0.4)]' },
    { icon: <Twitter size={18} />, label: 'Twitter', href: 'https://x.com/gyantappas', color: 'hover:text-blue-400', glow: 'group-hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]' },
    { icon: <Facebook size={18} />, label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61584618795158', color: 'hover:text-blue-600', glow: 'group-hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]' },
    { icon: <Github size={18} />, label: 'GitHub', href: 'https://github.com/Abhinav06122009/MARGDARSHAK-V3.0-TESTING', color: 'hover:text-white', glow: 'group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]' },
  ];

  const footerLinks = {
    protocols: [
      { name: 'Privacy Protocol', path: '/privacy' },
      { name: 'Terms of Accord', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'GDPR Compliance', path: '/gdpr' },
    ],
    infrastructure: [
      { name: 'Identity Hub', path: '/profile' },
      { name: 'Premium Upgrade', path: '/upgrade' },
      { name: 'System Status', path: '/status' },
    ],
    intelligence: [
      { name: 'AI Tutor Hub', path: '/ai-assistant' },
      { name: 'Smart Analytics', path: '/ai-analytics' },
      { name: 'Study Planner', path: '/study-planner' },
      { name: 'Doubt Solver', path: '/doubt-solver' },
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Contact-Us', path: '/contact' },
      { name: 'Download Center', path: '/download' },
      { name: 'Sitemap Index', path: '/sitemap' },
    ]
  };

  return (
    <footer className="w-full relative mt-20 md:mt-32 pb-12 px-6 overflow-hidden border-t border-white/5 bg-[#050505]">
      {/* Precision Aesthetic Underlay - Optimized with lower opacity and blur */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.02),transparent_70%)]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">

          {/* Brand Engine Section */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-10">
            <div className="space-y-6">
              <Link to="/" className="flex items-center justify-center lg:justify-start gap-4 group">
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="p-4 bg-white rounded-[1.8rem] border border-white/20 group-hover:border-emerald-500/30 transition-all duration-700 shadow-2xl shadow-emerald-500/10"
                >
                  <img src={logo} alt="Margdarshak" className="w-8 h-8 object-contain" />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
                    Margdarshak <span className="text-emerald-500 block text-xs tracking-[0.5em] mt-1 not-italic font-black opacity-80 uppercase">Education Suite</span>
                  </h2>
                </div>
              </Link>
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-[0.3em] leading-relaxed max-w-sm">
                Engineering high-fidelity cognitive ecosystems for the <span className="text-white italic">Student Needs</span>. Powered by the VSAV GYANTAPA.
              </p>
            </div>

            {/* Social Signal Hub */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -8, scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group relative p-4 bg-white/[0.02] border border-white/5 rounded-2xl transition-all duration-500 ${social.color} ${social.glow}`}
                >
                  <div className="relative z-10">{social.icon}</div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.a>
              ))}
            </div>

            {/* Newsletter Micro-Interaction */}
            <div className="w-full max-w-xs relative group">
              <input
                type="email"
                placeholder="JOIN THE INTELLIGENCE"
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/30 transition-all"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-black transition-all">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Navigational Matrix */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="space-y-8">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.5em] mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                  {title}
                </h4>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="group flex items-center gap-3 text-[11px] font-bold text-zinc-500 hover:text-emerald-400 transition-all duration-500"
                      >
                        <span className="w-0 group-hover:w-3 h-[1px] bg-emerald-500 transition-all duration-500" />
                        <span className="tracking-widest uppercase italic group-hover:not-italic">{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Operational Status Strip */}
        <div className="flex flex-col md:flex-row items-center justify-between py-12 border-y border-white/5 gap-10">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
            <div className="flex items-center gap-3 px-5 py-2 bg-white/[0.02] border border-white/5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">System Nominal</span>
            </div>
            <div className="flex items-center gap-3 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all cursor-default group">
              <Zap size={14} className="text-amber-400 group-hover:animate-bounce" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Backed By Gemini 2.0 Flash For High Security</span>
            </div>
            <div className="flex items-center gap-3 opacity-30 hover:opacity-100 transition-all cursor-default">
              <Shield size={12} className="text-blue-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">RSA_2048 Verified</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-[0.5em] mb-1">Build Version</p>
              <p className="text-[10px] font-black text-white italic tracking-tighter">MARGDARSHAK V3.0</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group hover:border-emerald-500/20 transition-all">
              <Command size={18} className="text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>
        </div>

        {/* Global Footer Terminal */}
        <div className="flex flex-col md:flex-row items-center justify-between py-8 gap-4">
          <div className="flex items-center gap-2">
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.4em]">
              © 2026 MARGDARSHAK. POWERED BY <span className="text-white font-black italic">VSAV GYANTAPA</span>.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
              DESIGNED BY <span className="text-emerald-500 font-black">ABHINAV JHA</span>
              <span className="w-1 h-1 rounded-full bg-zinc-800" />
            </p>
            {/* Subtle Asset Attribution */}
            {/* Subtle Asset Attribution */}
            <div className="opacity-[0.01] hover:opacity-100 transition-opacity duration-[3000ms] text-[7px] font-mono flex flex-wrap gap-4 grayscale max-w-xl justify-center lg:justify-end">
              <span>
                1.<a href="https://iconscout.com/3d-icons/android" className="hover:underline" target="_blank">Android Logo</a> by <a href="https://iconscout.com/contributors/iconscout" className="hover:underline">IconScout Store</a> on <a href="https://iconscout.com" className="hover:underline">IconScout</a>
              </span>
              <span>
                2.<a href="https://iconscout.com/3d-icons/windows" className="hover:underline" target="_blank">Windows</a> by <a href="https://iconscout.com/contributors/iconscout" className="hover:underline" target="_blank">IconScout Store</a>
              </span>
              <span>
                3.<a href="https://iconscout.com/icons/clerk" className="hover:underline" target="_blank">Clerk</a> by <a href="https://iconscout.com/contributors/icon-mafia" className="hover:underline">Icon Mafia</a> on <a href="https://iconscout.com" className="hover:underline">IconScout</a>
              </span>
              <span>
                4.<a href="https://iconscout.com/icons/supabase" className="hover:underline" target="_blank">Supabase</a> by <a href="https://iconscout.com/contributors/icon-mafia" className="hover:underline" target="_blank">Icon Mafia</a>
              </span>
              <span>
                5.<a href="https://iconscout.com/icons/framer" className="hover:underline" target="_blank">Framer</a> by <a href="https://iconscout.com/contributors/icon-54" className="hover:underline" target="_blank">Icon 54</a>
              </span>
              <span>
                6.<a href="https://iconscout.com/icons/vitejs" className="hover:underline" target="_blank">Vite</a> by <a href="https://iconscout.com/contributors/icon-mafia" className="hover:underline" target="_blank">Icon Mafia</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
