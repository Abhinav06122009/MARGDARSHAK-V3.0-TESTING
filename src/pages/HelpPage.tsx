import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Search, HelpCircle, MessageCircle, Mail,
  ChevronDown, ChevronUp, ArrowLeft, 
  Clock, Shield, Sparkles, Zap, Globe, LifeBuoy,
  Users, Target, Brain, Rocket, ChevronRight,
  Command, Cpu, Database
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import logo from "@/components/logo/logo.png";

// FAQ Data
const FAQS = [
  {
    question: "How do I reset my security protocol?",
    answer: "Navigate to the Identity Hub and initiate the 'Recovery' sequence. You will receive an encrypted link via your registered communication channel to re-establish your credentials."
  },
  {
    question: "Is MARGDARSHAK accessible without credit?",
    answer: "Affirmative. Our foundational tier provides the complete Core Architectural Suite including task management, grade tracking, and the study timer at zero cost."
  },
  {
    question: "GPA Calculation Engine functionality?",
    answer: "Access the 'Grades' module and input your academic payloads (credits/grades). Our proprietary engine will automatically synthesize your semester and cumulative performance metrics."
  },
  {
    question: "Google Calendar Synchronization?",
    answer: "Current protocols support manual export via .ics manifest. Automatic real-time synchronization is currently in development for the next architectural phase."
  },
  {
    question: "Data Encryption standards?",
    answer: "We employ military-grade RSA-2048 encryption for all data transmissions. Your academic intelligence and personal identity are restricted to your local instance."
  }
];

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const filteredFaqs = FAQS.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,20,15,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]"
        />

        {/* Neural Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          
          {/* Nav Identity */}
          <nav className="flex items-center justify-between mb-24 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-3xl shadow-2xl">
            <Link to="/" className="flex items-center gap-4 group">
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="p-3 bg-white rounded-2xl shadow-xl shadow-emerald-500/10"
              >
                <img src={logo} alt="Margdarshak" className="w-8 h-8 object-contain" />
              </motion.div>
              <h1 className="text-xl font-black italic tracking-tighter uppercase">Margdarshak <span className="text-emerald-500">Support</span></h1>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" className="text-zinc-500 hover:text-white font-black text-[10px] tracking-widest uppercase gap-3 hover:bg-white/5 rounded-2xl transition-all">
                <ArrowLeft size={14} /> Dashboard Hub
              </Button>
            </Link>
          </nav>

          {/* Hero Section */}
          <div className="text-center max-w-5xl mx-auto mb-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black tracking-[0.3em] text-emerald-400 mb-12 uppercase italic">
                <Sparkles size={12} className="animate-pulse" /> Global Assistance Uplink
              </div>
              <h1 className="text-7xl md:text-9xl font-black mb-12 tracking-tighter leading-[0.85] italic uppercase">
                System <br />
                <span className="text-emerald-500 underline decoration-emerald-500/20 underline-offset-8">Guidance</span>
              </h1>

              <div className="relative max-w-3xl mx-auto group">
                <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] group-hover:bg-emerald-500/20 transition-all duration-700 rounded-full" />
                <div className="relative flex items-center">
                  <Search className="absolute left-8 h-6 w-6 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="QUERY THE KNOWLEDGE ARCHIVE..."
                    className="w-full h-24 pl-20 pr-10 bg-white/[0.02] border border-white/10 rounded-[2.5rem] text-xl font-black italic uppercase tracking-widest text-white focus:outline-none focus:border-emerald-500/40 transition-all placeholder:text-zinc-800"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tactical Categories */}
          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto mb-32">
            {[
              { icon: Rocket, title: "Operational Logs", desc: "Access performance insights and system updates.", link: "/blog/", color: "text-emerald-400", bg: "bg-emerald-500/5" },
              { icon: Shield, title: "Security Matrix", desc: "Manage identity encryption and privacy protocols.", link: "/settings", color: "text-blue-400", bg: "bg-blue-500/5" },
              { icon: Zap, title: "Elite Tiers", desc: "Unlock high-fidelity AI modules and storage.", link: "/upgrade", color: "text-amber-400", bg: "bg-amber-500/5" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group h-full"
              >
                <Link to={item.link} className="block h-full">
                  <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-12 hover:border-emerald-500/20 transition-all duration-700 h-full relative overflow-hidden group-hover:bg-white/[0.04]">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    <div className={`w-20 h-20 rounded-3xl ${item.bg} border border-white/5 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl ${item.color}`}>
                      <item.icon className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-black mb-6 italic uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                    <p className="text-zinc-500 font-medium leading-relaxed italic group-hover:text-zinc-300 transition-colors">{item.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Centralized FAQ Matrix */}
          <div className="max-w-4xl mx-auto mb-32">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-black tracking-tighter mb-4 uppercase italic">Encryption <span className="text-emerald-500">FAQ</span></h2>
              <div className="h-1 w-24 bg-emerald-500/30 mx-auto rounded-full" />
            </div>
            <div className="space-y-6">
              <AnimatePresence>
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group"
                    >
                      <div className={`border border-white/5 rounded-[2.5rem] bg-white/[0.01] backdrop-blur-3xl transition-all duration-700 overflow-hidden ${openFaqIndex === index ? 'border-emerald-500/20 bg-white/[0.03]' : 'hover:border-white/10'}`}>
                        <button
                          onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                          className="w-full px-12 py-10 flex items-center justify-between text-left group"
                        >
                          <span className={`text-xl font-black italic tracking-tight transition-colors ${openFaqIndex === index ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-white uppercase'}`}>
                            {faq.question}
                          </span>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${openFaqIndex === index ? 'bg-emerald-500 text-black' : 'bg-white/5 text-zinc-600 group-hover:bg-white/10'}`}>
                            {openFaqIndex === index ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                          </div>
                        </button>
                        <AnimatePresence>
                          {openFaqIndex === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.5, ease: "circOut" }}
                            >
                              <div className="px-12 pb-10 text-zinc-400 font-medium text-lg leading-relaxed border-t border-white/5 pt-10 italic bg-black/20">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-24 text-zinc-700 bg-white/[0.02] rounded-[4rem] border border-white/5">
                    <HelpCircle className="w-24 h-24 mx-auto mb-8 opacity-10" />
                    <p className="text-2xl font-black uppercase tracking-widest italic">Signal Lost</p>
                    <p className="text-sm font-medium mt-4 tracking-widest">ZERO DATA DETECTED FOR "{searchQuery}"</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Tactical Support CTA */}
          <div className="max-w-6xl mx-auto">
            <div className="relative p-16 md:p-24 rounded-[4.5rem] border border-white/10 overflow-hidden group bg-white/[0.01] backdrop-blur-3xl shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent)]" />
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.85] italic">Direct <br /> <span className="text-emerald-500">Uplink</span></h2>
                  <p className="text-zinc-500 font-medium text-xl max-w-xl italic leading-relaxed">Our elite technical operations team maintains a <span className="text-white font-black italic">24/7 Strategic Watch</span>. Initialize a direct communication payload now.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-8 w-full lg:w-auto">
                  <Link to="/contact">
                    <Button className="h-24 px-16 bg-white text-black font-black uppercase text-xs tracking-[0.4em] rounded-[2.5rem] hover:bg-zinc-200 transition-all shadow-2xl w-full">
                      <Mail className="w-6 h-6 mr-4" /> Start Transmission
                    </Button>
                  </Link>
                  <a href="mailto:support@margdarshak.tech">
                    <Button variant="outline" className="h-24 px-16 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-xs tracking-[0.4em] rounded-[2.5rem] w-full">
                      <MessageCircle className="w-6 h-6 mr-4" /> External Mail
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};

export default HelpPage;
