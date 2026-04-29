import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Terminal, Code, Cpu, Database, Zap, ChevronRight, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';


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
    <div className="min-h-screen bg-[#050505] text-slate-100 overflow-x-hidden font-sans selection:bg-indigo-500/30 relative">
      
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,15,30,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <motion.div 
          animate={{ opacity: [0.1, 0.15, 0.1], scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'easeInOut' }}
          className="absolute top-0 -left-40 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ opacity: [0.05, 0.1, 0.05], scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 -right-40 w-[800px] h-[800px] bg-sky-500/10 rounded-full blur-[150px]"
        />
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col min-h-screen">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12"
          >
            <div className="flex items-center gap-5">
              <button onClick={() => navigate('/dashboard')} className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all shadow-lg shadow-black/20">
                <ArrowLeft className="w-5 h-5 text-zinc-300" />
              </button>
              <div>
                <h1 className="text-3xl font-black flex items-center gap-3 tracking-tighter uppercase italic text-white">
                  Margdarshak Docs
                </h1>
                <p className="text-indigo-400 text-[10px] uppercase tracking-[0.3em] font-bold mt-1 ml-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Knowledge Base v2.0
                </p>
              </div>
            </div>
            
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 backdrop-blur-md">
                <Search className="w-4 h-4 text-zinc-500 mr-3" />
                <input 
                  type="text" 
                  placeholder="Search documentation..." 
                  className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder-zinc-600 font-medium tracking-wide"
                />
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold ml-3 border border-white/10 px-1.5 py-0.5 rounded">
                  <span>Ctrl</span><span>K</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 flex-1 mb-20">
            
            {/* Sidebar Navigation */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
              className="w-full lg:w-72 flex-shrink-0 space-y-8"
            >
              {NAV_CATEGORIES.map((category, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 px-2">
                    <category.icon className="w-3.5 h-3.5" /> {category.title}
                  </h3>
                  <ul className="space-y-1">
                    {category.items.map((item, i) => (
                      <li key={i}>
                        <button 
                          onClick={() => setActiveItem(item)}
                          className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-between group ${activeItem === item ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                        >
                          {item}
                          {activeItem === item && <ChevronRight className="w-3 h-3 text-indigo-400" />}
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
              className="flex-1 bg-white/[0.02] border border-white/5 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
                  <Database className="w-3 h-3 text-sky-400" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-400">Documentation</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6">{activeItem}</h1>
                <p className="text-lg text-zinc-400 font-medium leading-relaxed mb-10">
                  Welcome to the official Margdarshak OS documentation. This guide covers the core concepts, architecture, and integration points for the platform.
                </p>

                <div className="space-y-10">
                  
                  {/* Mock Content Block 1 */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                      <Zap className="w-5 h-5 text-indigo-400" /> Platform Architecture
                    </h2>
                    <p className="text-zinc-400 leading-relaxed text-sm">
                      The Margdarshak platform operates on a modern architecture designed to prioritize speed, offline capability, and smart AI integration. The core engine is built on React 18, utilizing Framer Motion for smooth interface transitions.
                    </p>
                  </div>

                  {/* Mock Code Block */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white tracking-tight">Initialization Example</h2>
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                        <span className="text-[10px] text-zinc-500 font-mono ml-2">system_init.ts</span>
                      </div>
                      <pre className="text-sm font-mono text-indigo-300 overflow-x-auto leading-loose">
                        <code className="text-sky-400">import</code> {'{ SmartAI }'} <code className="text-sky-400">from</code> <code className="text-emerald-400">'@margdarshak/core'</code>;{'\n\n'}
                        <code className="text-sky-400">const</code> system = <code className="text-sky-400">new</code> SmartAI({'{'}{'\n'}
                        {'  mode: '}<code className="text-emerald-400">'optimized'</code>,{'\n'}
                        {'  analytics: '}<code className="text-amber-400">true</code>,{'\n'}
                        {'  updates: {'}{'\n'}
                        {'    interval: '}<code className="text-purple-400">5000</code>{'\n'}
                        {'  }'}{'\n'}
                        {'});'}{'\n\n'}
                        <code className="text-zinc-500">// Initialize the AI core</code>{'\n'}
                        <code className="text-sky-400">await</code> system.<code className="text-blue-400">initialize</code>();
                      </pre>
                    </div>
                  </div>

                  {/* Mock Info Alert */}
                  <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-6 flex gap-4">
                    <div className="mt-1 flex-shrink-0 p-2 bg-sky-500/20 rounded-lg">
                      <BookOpen className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-sky-400 mb-1">Developer Note</h4>
                      <p className="text-xs text-sky-200/70 leading-relaxed font-medium">
                        For production environments, ensure that the SmartAI is initialized only once at the root layout level to prevent memory leaks in the AI modules.
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
