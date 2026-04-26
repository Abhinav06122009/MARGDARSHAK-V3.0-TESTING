import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search, HelpCircle, Book, MessageCircle, Mail,
  ChevronDown, ChevronUp, ArrowLeft, FileText,
  Clock, Shield, Sparkles, Zap, Globe, LifeBuoy,
  Users, Target, Brain, Rocket, ChevronRight,
  Twitter, Facebook, Linkedin
} from 'lucide-react';
import logo from "@/components/logo/logo.png";

// --- Social Icons ---
const LinkedinLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const TwitterLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z" />
  </svg>
);

// FAQ Data
const FAQS = [
  {
    question: "How do I reset my password?",
    answer: "Go to the login page and click on 'Forgot Password'. Enter your registered email address, and we will send you a link to reset your password securely."
  },
  {
    question: "Is MARGDARSHAK free to use?",
    answer: "Yes! MARGDARSHAK offers a comprehensive free tier that includes task management, grade tracking, and the study timer. We also offer premium features for advanced analytics and unlimited storage."
  },
  {
    question: "How do I calculate my GPA?",
    answer: "Navigate to the 'Grades' section from your dashboard. Enter your course names, credits, and the grades you achieved. Our built-in calculator will automatically compute your semester and cumulative GPA."
  },
  {
    question: "Can I sync my timetable with Google Calendar?",
    answer: "Currently, we support manual export of your timetable as an ICS file, which can be imported into Google Calendar, Outlook, or Apple Calendar. Automatic sync is coming in a future update."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption for all data transmission and storage. Your personal information and academic records are private and accessible only by you."
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
    <div className="min-h-screen bg-[#020202] text-white flex flex-col relative overflow-hidden font-sans selection:bg-indigo-500/30">

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 mix-blend-overlay" />
      </div>

      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-3xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Logo" className="h-8 w-8 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-transform group-hover:scale-110" />
            <span className="font-black text-xl tracking-tighter text-white uppercase">MARGDARSHAK</span>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" className="text-zinc-500 hover:text-white gap-2 font-black text-[10px] tracking-widest uppercase rounded-xl">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-6 py-24 relative z-10">

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.3em] text-indigo-400 mb-8 uppercase backdrop-blur-md">
              <Sparkles className="w-3 h-3" /> Support Portal
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-10 tracking-tighter leading-[0.9]">
              How can we <br />
              <span className="bg-gradient-to-r from-white via-indigo-200 to-zinc-500 bg-clip-text text-transparent">Assist you?</span>
            </h1>

            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute inset-0 bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />
              <div className="relative flex items-center">
                <Search className="absolute left-6 h-5 w-5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Query knowledge base (e.g., 'GPA', 'Sync')"
                  className="w-full h-20 pl-16 pr-8 bg-zinc-950/80 border border-white/10 rounded-3xl text-xl font-bold focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Support Categories */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-32">
          {[
            { icon: Rocket, title: "Insights", desc: "Access Insights By VSAV GYANTAPA.", link: "/blog/", color: "text-indigo-400" },
            { icon: Shield, title: "Settings", desc: "Account encryption and privacy protocols.", link: "/settings", color: "text-purple-400" },
            { icon: Zap, title: "Plans", desc: "Upgrade to premium tier.", link: "/upgrade", color: "text-amber-400" }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="group"
            >
              <Link to={item.link} className="block h-full">
                <div className="bg-zinc-950/50 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 hover:border-indigo-500/40 transition-all duration-500 h-full group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
                  <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${item.color}`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 group-hover:text-indigo-400 transition-colors tracking-tight">{item.title}</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase">System FAQ</h2>
            <div className="h-1.5 w-20 bg-indigo-600 mx-auto rounded-full" />
          </div>
          <div className="space-y-6">
            <AnimatePresence>
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div className={`border border-white/5 rounded-3xl bg-zinc-950/40 backdrop-blur-3xl transition-all duration-500 overflow-hidden ${openFaqIndex === index ? 'border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.1)]' : 'hover:border-white/10'}`}>
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                        className="w-full px-10 py-8 flex items-center justify-between text-left group"
                      >
                        <span className={`text-lg font-black transition-colors ${openFaqIndex === index ? 'text-indigo-400' : 'text-zinc-300 group-hover:text-white'}`}>
                          {faq.question.toUpperCase()}
                        </span>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${openFaqIndex === index ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-600 group-hover:bg-white/10'}`}>
                          {openFaqIndex === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {openFaqIndex === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="px-10 pb-8 text-zinc-500 font-medium leading-relaxed border-t border-white/5 pt-8 bg-black/20">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-24 text-zinc-700 bg-zinc-950/50 rounded-[3.5rem] border border-white/5">
                  <HelpCircle className="w-20 h-20 mx-auto mb-6 opacity-10" />
                  <p className="text-xl font-black uppercase tracking-widest">Query Unmatched</p>
                  <p className="text-sm font-medium mt-2">Zero results detected for "{searchQuery}"</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="max-w-6xl mx-auto">
          <div className="relative p-12 md:p-20 rounded-[4rem] border border-white/10 overflow-hidden group bg-zinc-950/50 backdrop-blur-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase leading-tight">Support <br /> Required?</h2>
                <p className="text-zinc-500 font-medium text-lg max-w-xl">Our technical Team are available for Your support from Monday through Friday.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
                <Link to="/contact">
                  <Button className="h-20 px-12 bg-white text-black font-black uppercase text-xs tracking-widest rounded-3xl hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 w-full">
                    <Mail className="w-5 h-5 mr-3" /> Get Support Now
                  </Button>
                </Link>
                <a href="mailto:support@margdarshak.tech">
                  <Button variant="outline" className="h-20 px-12 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-xs tracking-widest rounded-3xl w-full">
                    <MessageCircle className="w-5 h-5 mr-3" /> E-MAIL DIRECTLY
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

      </main>

      <footer className="relative bg-black border-t border-white/5 mt-32">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-6">
              <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                <h3 className="text-3xl font-black tracking-tighter text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">MARGDARSHAK</span>
                </h3>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.3em] mt-1">by VSAV GYANTAPA</p>
              </motion.div>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-medium">
                Empowering students with AI-driven scheduling and intelligent academic orchestration. Built for the next generation of learners.
              </p>
              <div className="flex items-center gap-4">
                {[
                  { icon: TwitterLogo, href: "https://x.com/gyantappas", label: "Twitter" },
                  { icon: FacebookLogo, href: "https://www.facebook.com/profile.php?id=61584618795158", label: "Facebook" },
                  { icon: LinkedinLogo, href: "https://www.linkedin.com/in/vsav-gyantapa-33893a399/", label: "LinkedIn" }
                ].map((social, i) => (
                  <motion.a
                    key={i} href={social.href} target="_blank" rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, y: -4 }} whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-zinc-400 hover:text-white"
                  >
                    <social.icon />
                  </motion.a>
                ))}
              </div>
            </div>

            {[
              {
                title: "Platform",
                links: [
                  { name: "Scheduler", href: "/timetable" },
                  { name: "AI Assistant", href: "/ai-assistant" },
                  { name: "Quiz Gen", href: "/quiz" },
                  { name: "Wellness", href: "/wellness" }
                ]
              },
              {
                title: "Legal",
                links: [
                  { name: "Terms of Service", href: "/terms" },
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Cookie Policy", href: "/cookies" },
                ]
              },
              {
                title: "Support",
                links: [
                  { name: "Help Center", href: "/help" },
                  { name: "Contact Us", href: "/contact" }
                ]
              }
            ].map((section, i) => (
              <div key={i} className="space-y-8">
                <h4 className="text-white font-black text-xs uppercase tracking-[0.3em]">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link to={link.href} className="text-zinc-500 hover:text-white transition-colors text-xs font-bold flex items-center group">
                        <motion.span whileHover={{ x: 4 }} className="flex items-center gap-3">
                          <div className="w-1 h-1 rounded-full bg-indigo-500/40 group-hover:bg-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                          {link.name.toUpperCase()}
                        </motion.span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
              © 2026 <span className="text-white font-bold">VSAV GYANTAPA</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <p className="text-zinc-600 text-[10px] font-black tracking-widest">Version 3.0</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HelpPage;
