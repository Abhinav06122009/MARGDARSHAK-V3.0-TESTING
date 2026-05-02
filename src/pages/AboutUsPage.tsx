import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Target,
  Heart,
  Sparkles,
  ArrowLeft,
  Zap,
  Shield,
  BookOpen,
  Clock,
  MapPin,
  Calendar,
  Mail,
  Globe,
  Database,
  Cpu,
  Command,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import logo from "@/components/logo/logo.png";

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,20,15,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        {/* Animated Orbs */}
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut', delay: 3 }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]"
        />

        {/* Neural Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-20">

          {/* Hero Section */}
          <section className="relative pt-20 pb-32 px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-[0.3em] uppercase mb-10"
              >
                <Sparkles size={12} className="animate-pulse" />
                Evolution of Academic Intelligence
              </motion.div>

              <h1 className="text-6xl md:text-9xl font-black mb-10 tracking-tighter leading-none italic uppercase">
                Our <span className="text-emerald-500 underline decoration-emerald-500/30 underline-offset-8">Mission</span>
              </h1>

              <p className="text-xl md:text-3xl text-zinc-400 max-w-4xl mx-auto leading-relaxed font-medium mb-16 italic">
                Connecting <span className="text-white font-bold">Students</span> with Margdarshak Intelligence To Help Scholars
              </p>

              <div className="flex flex-wrap justify-center gap-6">
                <Link to="/auth">
                  <Button className="h-16 px-10 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-zinc-200 transition-all active:scale-95">
                    Get Started
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/10 transition-all active:scale-95">
                    Contact Us Now
                  </Button>
                </Link>
              </div>
            </motion.div>
          </section>

          {/* Core Values Matrix */}
          <section className="py-32">
            <div className="grid md:grid-cols-3 gap-10">
              {[
                { icon: Target, title: "Precision", desc: "Filtering academic noise to amplify deep cognitive focus on mission-critical learning.", color: "text-blue-400", border: "group-hover:border-blue-500/30" },
                { icon: Heart, title: "Wellness", desc: "Prioritizing neural health and mental equilibrium as the foundation of sustainable mastery.", color: "text-rose-400", border: "group-hover:border-rose-500/30" },
                { icon: Zap, title: "Innovation", desc: "Leveraging bleeding-edge neural architectures to solve traditional academic debt.", color: "text-amber-400", border: "group-hover:border-amber-500/30" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className={`group relative bg-white/[0.02] p-12 rounded-[3.5rem] border border-white/5 transition-all duration-700 ${item.border} hover:bg-white/[0.04] overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                  <div className={`w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center ${item.color} mb-10 group-hover:scale-110 transition-transform duration-500 shadow-2xl`}>
                    <item.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black mb-6 tracking-tight italic uppercase">{item.title}</h3>
                  <p className="text-zinc-500 leading-relaxed text-lg font-medium group-hover:text-zinc-300 transition-colors">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Architectural Heritage */}
          <section className="py-32 relative">
            <div className="rounded-[4rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl p-16 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />
              <div className="grid md:grid-cols-2 gap-20 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="space-y-10"
                >
                  <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic">The <span className="text-emerald-500">Genesis</span></h2>
                  <div className="space-y-8 text-zinc-400 text-xl leading-relaxed font-medium">
                    <p>
                      MARGDARSHAK was engineered from a pivotal realization: the tools meant to empower students were actually the primary sources of academic friction.
                    </p>
                    <p className="italic border-l-4 border-emerald-500/30 pl-8 py-2 bg-emerald-500/[0.02]">
                      We didn't just build another application; we engineered a <span className="text-white font-bold">Paradigm Shift</span> in how knowledge is structured, synthesized, and mastered.
                    </p>
                    <p>
                      What began as a tactical solution for a few has evolved into a global movement, empowering thousands of students to reclaim their focus and achieve the extraordinary.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative flex justify-center"
                >
                  <div className="relative group">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full group-hover:bg-emerald-500/40 transition-all duration-1000 scale-110" />
                    <div className="p-10 rounded-[4rem] bg-white border border-white/20 relative z-10 shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:-translate-y-2">
                      <img src={logo} alt="Margdarshak Official Logo" className="w-48 h-48 object-contain" />
                    </div>
                    <div className="absolute -bottom-6 -right-6 px-6 py-3 bg-black border border-white/10 rounded-2xl shadow-2xl z-20">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">Official Protocol Asset</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Leadership Matrix */}
          <section className="py-32">
            <div className="text-center mb-24">
              <h2 className="text-6xl font-black tracking-tighter uppercase italic mb-6">Strategic <span className="text-emerald-500 underline decoration-emerald-500/20 underline-offset-8">Command</span></h2>
              <p className="text-zinc-500 text-xl font-medium tracking-wide uppercase italic">The visionaries behind the academic revolution.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {[
                {
                  name: "Abhinav Jha",
                  role: "Founder & Architect",
                  desc: "Leading the core neural development and strategic vision for universal student empowerment.",
                  icon: Command,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10"
                },
                {
                  name: "Vaibhavi Jha",
                  role: "CTO & Co-Founder",
                  desc: "Engineering high-performance infrastructure and data integrity across the Margdarshak suite.",
                  icon: Cpu,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10"
                },
                {
                  name: "Shlok Tomar",
                  role: "Chief Technical Officer",
                  desc: "Scaling our mission to reach every ambitious scholar globally with uncompromising excellence.",
                  icon: Database,
                  color: "text-amber-400",
                  bg: "bg-amber-500/10"
                }
              ].map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative p-12 rounded-[3.5rem] bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all duration-700 hover:bg-white/[0.04]"
                >
                  <div className="text-center">
                    <div className={`w-24 h-24 mx-auto ${member.bg} rounded-[2rem] flex items-center justify-center mb-10 border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl`}>
                      <member.icon className={`w-10 h-10 ${member.color}`} />
                    </div>
                    <h3 className="text-3xl font-black mb-2 tracking-tight italic uppercase">{member.name}</h3>
                    <p className={`${member.color} font-black text-xs uppercase tracking-[0.3em] mb-8 italic`}>{member.role}</p>
                    <p className="text-zinc-500 leading-relaxed font-medium group-hover:text-zinc-300 transition-colors italic">
                      {member.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Terminal Action */}
          <section className="py-32 text-center">
            <div className="inline-flex items-center gap-4 p-4 px-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] mb-12 animate-pulse">
              <Shield size={16} className="text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">Join the Elite Resistance against Academic Noise</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-16 tracking-tighter uppercase leading-[0.9]">
              Are You Ready to <br /> <span className="text-white italic underline decoration-white/20">Master Your Future?</span>
            </h2>
            <Link to="/auth">
              <Button className="h-24 px-20 bg-emerald-500 text-black font-black uppercase text-xs tracking-[0.5em] rounded-[2.5rem] hover:bg-emerald-400 transition-all hover:scale-105 shadow-2xl shadow-emerald-500/20">
                Get Started Now
              </Button>
            </Link>
          </section>

        </div>
      </ScrollArea>
    </div>
  );
};

export default AboutUsPage;
