import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Terminal, Code, Cpu, Database, Zap, ChevronRight, Search, Shield, Lock, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import logo from "@/components/logo/logo.png";

// Navigation Categories
const NAV_CATEGORIES = [
  {
    title: 'Getting Started',
    icon: BookOpen,
    items: ['Introduction', 'Quick Start Guide', 'System Requirements']
  },
  {
    title: 'Core System',
    icon: Terminal,
    items: ['Dashboard Overview', 'Command Interface', 'Data Management']
  },
  {
    title: 'AI Intelligence',
    icon: Cpu,
    items: ['AI Tutor Integration', 'Study Planning', 'Performance Analytics']
  },
  {
    title: 'API Reference',
    icon: Code,
    items: ['Authentication', 'Endpoints', 'Webhooks', 'Rate Limits']
  }
];

const Docs = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('Introduction');

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 overflow-x-hidden font-sans selection:bg-emerald-500/30 relative">
      
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
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col min-h-screen">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16"
          >
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="p-3 bg-white/[0.02] border border-white/10 hover:bg-white/5 rounded-2xl transition-all shadow-xl"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </button>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <img src={logo} alt="Margdarshak" className="h-6 w-6 object-contain" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
                    Margdarshak <span className="text-emerald-500 not-italic font-light">Docs</span>
                  </h1>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-black mt-1 ml-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    Knowledge Protocol v3.0
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-3.5 backdrop-blur-3xl shadow-2xl">
                <Search className="w-4 h-4 text-zinc-500 mr-3" />
                <input 
                  type="text" 
                  placeholder="SEARCH THE VOID..." 
                  className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-white focus:outline-none w-full placeholder-zinc-700"
                />
                <div className="flex items-center gap-1 text-[8px] text-zinc-600 font-black border border-white/5 px-2 py-1 rounded bg-white/5">
                  <span>CMD</span><span>K</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 flex-1 mb-24">
            
            {/* Sidebar Navigation */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
              className="w-full lg:w-80 flex-shrink-0 space-y-10"
            >
              {NAV_CATEGORIES.map((category, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] flex items-center gap-2 px-2">
                    <category.icon className="w-3.5 h-3.5 text-emerald-500" /> {category.title}
                  </h3>
                  <ul className="space-y-2">
                    {category.items.map((item, i) => (
                      <li key={i}>
                        <button 
                          onClick={() => setActiveItem(item)}
                          className={`w-full text-left px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-between group ${activeItem === item ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10' : 'text-zinc-500 hover:text-white hover:bg-white/[0.02] border border-transparent'}`}
                        >
                          <span className={activeItem === item ? 'italic' : ''}>{item}</span>
                          {activeItem === item && <ChevronRight className="w-4 h-4 text-emerald-500" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>

            {/* Main Content Area */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
              className="flex-1 bg-white/[0.01] border border-white/5 backdrop-blur-3xl p-10 md:p-16 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-10">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Architectural Protocol</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 uppercase italic leading-none">{activeItem}</h1>
                <p className="text-xl text-zinc-500 font-medium leading-relaxed mb-12 uppercase tracking-widest">
                  Welcome to the <span className="text-white italic">Margdarshak Architectural Suite</span>. This repository contains the cognitive foundations, neural interfaces, and mission-critical protocols for the ecosystem.
                </p>

                <div className="space-y-16">
                  
                  {/* Content Block 1 */}
                  <div className="space-y-6">
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-4 uppercase italic">
                      <Zap className="w-6 h-6 text-emerald-400" /> System Orchestration
                    </h2>
                    <p className="text-zinc-500 leading-relaxed text-base font-medium">
                      The Margdarshak core operates on a high-fidelity cognitive architecture designed for elite student performance. Our neural engine prioritizes real-time analytics, predictive study modeling, and seamless AI integration across all student touchpoints.
                    </p>
                  </div>

                  {/* Code Block Architecture */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-black text-white uppercase tracking-[0.3em]">Protocol Initialization</h2>
                    <div className="bg-black/60 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                      <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-6">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/50" />
                          <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                          <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                        </div>
                        <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest ml-4 italic">zenith_core_init.ts</span>
                      </div>
                      <pre className="text-sm font-mono text-emerald-100 overflow-x-auto leading-relaxed">
                        <code className="text-blue-400">import</code> {'{ ZenithAI }'} <code className="text-blue-400">from</code> <code className="text-emerald-400">'@margdarshak/architecture'</code>;{'\n\n'}
                        <code className="text-blue-400">const</code> session = <code className="text-blue-400">new</code> ZenithAI({'{'}{'\n'}
                        {'  fidelity: '}<code className="text-emerald-400">'ULTRA_HIGH'</code>,{'\n'}
                        {'  neural_sync: '}<code className="text-blue-400">true</code>,{'\n'}
                        {'  security: {'}{'\n'}
                        {'    level: '}<code className="text-red-400">'MISSION_CRITICAL'</code>{'\n'}
                        {'  }'}{'\n'}
                        {'});'}{'\n\n'}
                        <code className="text-zinc-700">// Establish secure handshake</code>{'\n'}
                        <code className="text-blue-400">await</code> session.<code className="text-blue-500 italic">initialize_v3_core</code>();
                      </pre>
                    </div>
                  </div>

                  {/* Tactical Alert */}
                  <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[2.5rem] p-8 flex gap-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/[0.02] translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                    <div className="mt-1 flex-shrink-0 p-3 bg-emerald-500/20 rounded-2xl relative z-10">
                      <Lock className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-sm font-black text-emerald-400 mb-2 uppercase tracking-widest italic">Security Protocol Note</h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed font-bold uppercase tracking-widest opacity-80">
                        ENSURE THE ZENITH_AI CORE IS INITIALIZED WITHIN A PROTECTED CONTEXT TO MAINTAIN ABSOLUTE DATA SOVEREIGNTY AND PREVENT ARCHITECTURAL LEAKS.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Docs;
