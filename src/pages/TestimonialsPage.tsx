import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, User, CheckCircle2, TrendingUp, Zap, Globe, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import logo from "@/components/logo/logo.png";

const TestimonialsPage = () => {
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Engineering Vanguard",
      image: "👩‍💻",
      content: "MARGDARSHAK has completely transformed how I study. The high-fidelity performance tracking ensures I remain at peak cognitive output. It's the mission-critical app every student needs.",
      rating: 5
    },
    {
      id: 2,
      name: "Rahul Verma",
      role: "Strategic Scholar",
      image: "👨‍🎓",
      content: "The neural task management system eliminates friction from my workflow. I feel much more prepared for board exams now that I have a unified architectural command center.",
      rating: 5
    },
    {
      id: 3,
      name: "Anjali Gupta",
      role: "Medical Operative",
      image: "👩‍⚕️",
      content: "The Study Timer with the Pomodoro protocol is exceptional. It helps me maintain focus during high-stakes NEET prep. The Career Pathways module is equally vital.",
      rating: 5
    },
    {
      id: 4,
      name: "Vikram Singh",
      role: "CS Architect",
      image: "👨‍💻",
      content: "The technical diagnostic modules in the Interview Prep section are gold. The predictive HR patterns helped me secure my elite internship position.",
      rating: 5
    },
    {
      id: 5,
      name: "Sneha Patel",
      role: "Commerce Analyst",
      image: "👩‍💼",
      content: "Finally, an ecosystem that respects cognitive clarity. No clutter, just high-performance tools. The Neural Calculator is an essential tactical asset.",
      rating: 5
    },
    {
      id: 6,
      name: "Arjun Reddy",
      role: "Academic Elite",
      image: "👨‍🏫",
      content: "The Zenith UI is beautiful and exceptionally fast. Studying at night is effortless with the signature deep-space glassmorphism.",
      rating: 5
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
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] italic">Global Validation Network</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-none"
            >
              Success <span className="text-emerald-500">Signatures</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-[10px] md:text-xs text-zinc-500 font-black uppercase tracking-[0.6em] max-w-3xl mx-auto leading-relaxed"
            >
              Authentic validation from the academic elite utilizing the Margdarshak ecosystem.
            </motion.p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-32">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] hover:bg-white/[0.03] hover:border-emerald-500/20 transition-all duration-700 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
                <Quote className="absolute top-10 right-10 w-12 h-12 text-white/[0.03] group-hover:text-emerald-500/10 transition-colors duration-700" />
                
                <div className="flex items-center gap-6 mb-10 relative z-10">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/5 flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform duration-700">
                    {testimonial.image}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">{testimonial.name}</h4>
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1 opacity-60">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex gap-2 mb-8 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? 'fill-emerald-500 text-emerald-500' : 'text-zinc-800'}`} 
                    />
                  ))}
                </div>

                <p className="text-base text-zinc-400 leading-relaxed italic font-medium relative z-10 group-hover:text-zinc-200 transition-colors">
                  "{testimonial.content}"
                </p>
              </motion.div>
            ))}
          </div>

          {/* Trust Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-32 border-y border-white/5 py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/[0.02] to-transparent pointer-events-none" />
            {[
              { label: 'Academic Operatives', value: '50K+', icon: Globe },
              { label: 'Neural Rating', value: '4.9/5', icon: Star },
              { label: 'Units Orchestrated', value: '1M+', icon: Zap },
              { label: 'Network Uptime', value: '24/7', icon: TrendingUp }
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-4 group">
                <stat.icon className="w-6 h-6 mx-auto text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                <div className="text-5xl font-black text-white tracking-tighter italic">{stat.value}</div>
                <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Protocol Activation CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-white/[0.01] border border-white/5 rounded-[4rem] p-20 backdrop-blur-3xl shadow-[0_60px_100px_-30px_rgba(0,0,0,0.9)] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:30px_30px] opacity-20" />
            <div className="relative z-10 space-y-10">
               <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 flex items-center justify-center mx-auto shadow-2xl relative">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20" />
                <Sparkles className="w-12 h-12 text-emerald-400 relative z-10" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">Draft Your <span className="text-emerald-500">Legend</span></h2>
                <p className="text-zinc-600 text-[10px] max-w-lg mx-auto leading-relaxed font-black uppercase tracking-[0.4em] opacity-60">Experience the architectural difference of the Margdarshak ecosystem. Secure your academic future today.</p>
              </div>
              <Link to="/auth">
                <Button className="h-16 px-12 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-emerald-500 hover:text-black transition-all shadow-2xl shadow-white/5 active:scale-95">Initialize Ascent</Button>
              </Link>
            </div>
          </motion.div>

        </div>
      </ScrollArea>
    </div>
  );
};

export default TestimonialsPage;
