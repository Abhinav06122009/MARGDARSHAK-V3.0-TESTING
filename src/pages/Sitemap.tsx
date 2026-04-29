import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Map, Globe, Shield, 
  Cpu, Command, Sparkles, Zap,
  Layout, List, Database, Terminal,
  ArrowUpRight, ChevronRight, Hash, Code
} from 'lucide-react';
import ParallaxBackground from '@/components/ui/ParallaxBackground';

const SitemapPage = ({ onBack }: { onBack?: () => void }) => {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const sections = [
    {
      title: 'Identity & Access',
      icon: <Shield size={20} className="text-emerald-500" />,
      links: [
        { name: 'Identity Hub', path: '/auth', description: 'Authentication and session management enclave.' },
        { name: 'Profile Node', path: '/profile', description: 'Manage your universal holographic ID.' },
        { name: 'Premium Upgrade', path: '/upgrade', description: 'Ascend to Elite or Multi-core tiers.' },
        { name: 'System Settings', path: '/settings', description: 'Configure neural core and aesthetic parameters.' }
      ]
    },
    {
      title: 'Cognitive Suite',
      icon: <Cpu size={20} className="text-blue-500" />,
      links: [
        { name: 'AI Assistant', path: '/ai-assistant', description: 'Direct uplink to Margdarshak Neural Core.' },
        { name: 'Study Planner', path: '/study-planner', description: 'Algorithmic academic orchestration.' },
        { name: 'Timetable Hub', path: '/timetable', description: 'Temporal schedule management.' },
        { name: 'Notes Database', path: '/notes', description: 'Structured knowledge storage.' }
      ]
    },
    {
      title: 'Performance & Tracking',
      icon: <Zap size={20} className="text-amber-500" />,
      links: [
        { name: 'Progress Tracer', path: '/tracer', description: 'Real-time academic telemetry for Elite users.' },
        { name: 'Grades Analytics', path: '/grades', description: 'Quantitative academic performance metrics.' },
        { name: 'Attendance Monitor', path: '/attendance', description: 'Log and verify presence protocols.' },
        { name: 'Course Management', path: '/courses', description: 'Universal syllabus and curriculum hub.' }
      ]
    },
    {
      title: 'Legal & Operational',
      icon: <Terminal size={20} className="text-zinc-500" />,
      links: [
        { name: 'System Status', path: '/status', description: 'Real-time matrix health and feedback loop.' },
        { name: 'Privacy Protocol', path: '/privacy', description: 'Data encryption and security standards.' },
        { name: 'Terms of Accord', path: '/terms', description: 'Operational guidelines and legal framework.' },
        { name: 'Sitemap Index', path: '/sitemap', description: 'This navigational matrix.' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-300 selection:bg-emerald-500/30 overflow-x-hidden">
      <ParallaxBackground />
      
      {/* AMBIENT GRID */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.03),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        
        {/* HEADER */}
        <header className="mb-32">
          <button
            onClick={() => onBack ? onBack() : window.history.back()}
            className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-all mb-12"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Close_Directory</span>
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="h-px w-12 bg-emerald-500" />
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em]">Navigational_Matrix</span>
              </div>
              <h1 className="text-8xl lg:text-[12rem] font-black text-white tracking-tighter leading-none italic uppercase">
                SITEMAP
              </h1>
            </div>
            
            <div className="p-8 bg-zinc-950/50 border border-white/5 rounded-3xl backdrop-blur-3xl max-w-xs">
               <p className="text-[11px] font-medium text-zinc-500 leading-relaxed uppercase tracking-widest italic">
                 Architectural overview of the Margdarshak Cognitive Ecosystem. All endpoints are verified for V3.0 Stable Deployment.
               </p>
            </div>
          </div>
        </header>

        {/* MAPPING MATRIX */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24">
          {sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-12"
            >
              <div className="flex items-center gap-6">
                <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">{section.title}</h2>
              </div>

              <div className="grid gap-6">
                {section.links.map((link, lIdx) => (
                  <a 
                    key={lIdx}
                    href={link.path}
                    onMouseEnter={() => setHoveredLink(link.path)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className="group relative p-8 bg-zinc-950/40 border border-white/5 rounded-[2.5rem] hover:border-white/10 hover:bg-white/[0.02] transition-all overflow-hidden"
                  >
                    {/* Hover Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-500 ${hoveredLink === link.path ? 'opacity-100' : ''}`} />
                    
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">PROTOCOL_{idx}_{lIdx}</span>
                           <div className="w-1 h-1 rounded-full bg-emerald-500/30" />
                        </div>
                        <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase italic">{link.name}</h3>
                        <p className="text-[11px] font-medium text-zinc-500 leading-relaxed group-hover:text-zinc-300 transition-colors">{link.description}</p>
                      </div>
                      <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all">
                        <ArrowUpRight size={18} />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* METADATA FOOTER */}
        <div className="mt-48 pt-24 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-4">
             <Code size={16} className="text-zinc-600" />
             <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.5em]">Static_Index_Generated: {new Date().toISOString().split('T')[0]}</span>
           </div>
           <div className="flex items-center gap-8">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500" />
               <span className="text-[10px] font-black text-white uppercase tracking-widest">V3.0_STABLE</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-blue-500" />
               <span className="text-[10px] font-black text-white uppercase tracking-widest">EDGE_READY</span>
             </div>
           </div>
        </div>

        </div>
    </div>
  );
};

export default SitemapPage;
