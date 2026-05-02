import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Map, FileText, Lock, Layout, BookOpen, Calculator as CalcIcon, Briefcase, Users, LayoutGrid, Globe, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import logo from "@/components/logo/logo.png";

const SitemapPage = () => {
  const navigate = useNavigate();
  const links = [
    {
      category: "Architectural Hubs",
      icon: LayoutGrid,
      items: [
        { name: "Global Landing", path: "/" },
        { name: "Authentication Portal", path: "/auth" },
        { name: "Neural Dashboard", path: "/dashboard" },
        { name: "Framework Overview", path: "/features" }
      ]
    },
    {
      category: "Neural Subsystems",
      icon: Sparkles,
      items: [
        { name: "AI Saarthi Analyst", path: "/ai" },
        { name: "Performance Metrics", path: "/analytics" },
        { name: "Neural Calculator", path: "/calculator" },
        { name: "System Status", path: "/status" }
      ]
    },
    {
      category: "Knowledge Streams",
      icon: BookOpen,
      items: [
        { name: "Margdarshak Hub", path: "/community" },
        { name: "Intelligence Blog", path: "/blog" }
      ]
    },
    {
      category: "Governance & Intel",
      icon: Shield,
      items: [
        { name: "Mission Overview", path: "/about" },
        { name: "Direct Uplink", path: "/contact" },
        { name: "Privacy Protocol", path: "/privacy" },
        { name: "Terms of Engagement", path: "/terms" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      
      {/* Zenith Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,20,15,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        
        {/* Animated Neural Orbs */}
        <motion.div 
          animate={{ opacity: [0.1, 0.15, 0.1], scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute top-0 -left-40 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ opacity: [0.05, 0.1, 0.05], scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 -right-40 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px]"
        />
        
        {/* Neural Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-24">
          
          {/* Header Architecture */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-24 gap-8">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate(-1)} 
                className="p-3 bg-white/[0.02] border border-white/10 hover:bg-white/5 rounded-2xl transition-all shadow-xl"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </button>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <img src={logo} alt="Margdarshak" className="h-6 w-6 object-contain" />
                </div>
                <div>
                  <h1 className="text-3xl font-black flex items-center gap-3 tracking-tighter uppercase italic text-white leading-none">
                    Zenith <span className="text-emerald-500 not-italic font-light">Index</span>
                  </h1>
                  <p className="text-emerald-500 text-[10px] uppercase tracking-[0.3em] font-black mt-2 ml-1 opacity-60">Architectural Navigation</p>
                </div>
              </div>
            </div>
            
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Neural Mapping Synchronized</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {links.map((section, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="bg-white/[0.01] border border-white/5 rounded-[2.8rem] p-10 backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5 relative z-10">
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform duration-700">
                    <section.icon className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tighter group-hover:text-emerald-400 transition-colors">{section.category}</h2>
                </div>
                
                <ul className="space-y-4 relative z-10">
                  {section.items.map((item, i) => (
                    <li key={i}>
                      <Link 
                        to={item.path} 
                        className="text-xs font-black text-zinc-500 uppercase tracking-widest hover:text-white hover:pl-4 transition-all duration-500 flex items-center gap-3 group/link"
                      >
                        <div className="w-1 h-1 rounded-full bg-emerald-500/30 group-hover/link:bg-emerald-500 transition-colors" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Tactical Diagnostic Panel */}
          <div className="mt-24 pt-24 border-t border-white/5 text-center space-y-8">
            <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
              <Map className="w-8 h-8 text-zinc-800" />
            </div>
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.5em] max-w-lg mx-auto leading-relaxed">
              Margdarshak Global Intelligence Network Indexing Complete. Current Version: <span className="text-emerald-500 italic">ZENITH_STABLE_V3.0.5</span>
            </p>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};

export default SitemapPage;
