import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, Zap, BarChart, BookOpen, Calendar, Shield, 
  Clock, Target, CheckCircle2, ArrowRight, BrainCircuit, Database, Sparkles, LayoutGrid
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import logo from "@/components/logo/logo.png";

const FeaturesPage = () => {
  const features = [
    {
      id: "dashboard",
      title: "Neural Command Center",
      description: "Your academic orchestration hub. Experience high-fidelity performance metrics, real-time GPA modeling, and predictive study habit analysis in a unified Zenith interface.",
      icon: Cpu,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      details: [
        "Real-time GPA synchronization and predictive analytics.",
        "Daily mission summary and priority neural alerts.",
        "Personalized cognitive recommendations for peak performance."
      ]
    },
    {
      id: "tasks",
      title: "Tactical Task Matrix",
      description: "Eliminate friction and optimize output. Our task matrix is engineered for students to manage complex assignment chains and mission-critical projects with precision.",
      icon: Zap,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      details: [
        "High-performance Kanban boards for project staging.",
        "Recurring protocols for consistent academic output.",
        "Smart signal reminders before temporal deadlines."
      ]
    },
    {
      id: "grades",
      title: "High-Fidelity Grade Metrics",
      description: "Visualize your academic trajectory. Identify high-performance zones and areas requiring neural reinforcement with detailed diagnostic charts.",
      icon: BarChart,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      details: [
        "Subject-specific diagnostic performance tracking.",
        "Historical grade trajectory over multiple cycles.",
        "Objective setting and milestone achievement analytics."
      ]
    },
    {
      id: "timetable",
      title: "Adaptive Temporal Scheduler",
      description: "Optimize your time allocation. Our intelligent scheduler synchronizes with your academic commitments to ensure maximum cognitive efficiency.",
      icon: Calendar,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      details: [
        "Color-coded neural schedules for visual clarity.",
        "Exam conflict detection and risk mitigation.",
        "Full integration with the Margdarshak Global Network."
      ]
    },
    {
      id: "security",
      title: "Zenith Security Protocol",
      description: "Mission-critical data protection. We implement enterprise-grade encryption and autonomous security layers to safeguard your cognitive profile.",
      icon: Shield,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      details: [
        "End-to-end RSA-4096 encryption for sensitive assets.",
        "Secure neural storage with autonomous redundant backups.",
        "Global privacy law and GDPR standard compliance."
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
        <div className="max-w-7xl mx-auto px-6 py-24">
          
          {/* Header Architecture */}
          <div className="text-center mb-32 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-4 px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-2xl backdrop-blur-xl"
            >
              <div className="p-1 bg-white rounded-lg shadow-lg">
                <img src={logo} alt="Margdarshak" className="h-4 w-4 object-contain" />
              </div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] italic">System Architecture Overview</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-none"
            >
              The Zenith <span className="text-emerald-500">Framework</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-[10px] md:text-xs text-zinc-500 font-black uppercase tracking-[0.6em] max-w-3xl mx-auto leading-relaxed"
            >
              Engineering the ultimate academic ecosystem for mission-critical student success.
            </motion.p>
          </div>

          {/* Feature Matrix */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-32">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] hover:bg-white/[0.03] hover:border-emerald-500/20 transition-all duration-700 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
                
                <div className={`w-16 h-16 rounded-[1.5rem] ${feature.bg} border border-white/5 flex items-center justify-center mb-10 shadow-xl group-hover:scale-110 transition-transform duration-700`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                
                <h3 className="text-2xl font-black text-white mb-6 uppercase italic tracking-tighter leading-tight group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                <p className="text-sm text-zinc-500 mb-8 leading-relaxed font-medium">
                  {feature.description}
                </p>
                
                <ul className="space-y-4">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-4 text-[10px] text-zinc-400 font-black uppercase tracking-widest leading-relaxed">
                      <div className="p-1 bg-emerald-500/10 rounded-md mt-0.5">
                        <CheckCircle2 className={`w-3 h-3 ${feature.color}`} />
                      </div>
                      <span className="opacity-70 group-hover:opacity-100 transition-opacity">{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Tactical Diagnostic Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/[0.01] border border-white/5 rounded-[4rem] p-16 text-center mb-32 relative overflow-hidden group shadow-[0_60px_100px_-30px_rgba(0,0,0,0.9)]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:30px_30px] opacity-20" />
            <div className="relative z-10 space-y-10">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 flex items-center justify-center mx-auto shadow-2xl relative">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20" />
                <BrainCircuit className="w-12 h-12 text-emerald-400 relative z-10" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">Beyond the <span className="text-emerald-500">Standard</span></h2>
                <p className="text-zinc-600 text-[10px] max-w-lg mx-auto leading-relaxed font-black uppercase tracking-[0.4em] opacity-60">We offer a high-fidelity suite of tactical tools engineered for immediate cognitive optimization.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                <Link to="/calculator">
                  <Button variant="ghost" className="h-14 px-10 border border-white/5 bg-white/[0.02] hover:bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all hover:translate-y-[-4px]">
                    <Database className="w-4 h-4 mr-3 text-emerald-500" />
                    Neural Calculator
                  </Button>
                </Link>
                <Link to="/career">
                  <Button variant="ghost" className="h-14 px-10 border border-white/5 bg-white/[0.02] hover:bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all hover:translate-y-[-4px]">
                    <Target className="w-4 h-4 mr-3 text-blue-500" />
                    Career Roadmap
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Final Protocol Initiation */}
          <div className="text-center pb-24 space-y-12">
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Initialize <span className="text-emerald-500">Protocol</span></h2>
            <Link to="/auth">
              <Button className="h-20 px-16 text-[11px] bg-white text-black font-black uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl shadow-emerald-500/10 transition-all hover:translate-y-[-4px] active:scale-95 group/btn overflow-hidden relative">
                <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-700" />
                <span className="relative z-10">Begin Academic Ascent <ArrowRight className="ml-4 w-5 h-5 group-hover:translate-x-2 transition-transform" /></span>
              </Button>
            </Link>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};

export default FeaturesPage;
