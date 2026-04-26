import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Heart, Sparkles, ArrowLeft, Zap, Shield, BookOpen, Clock, MapPin, Calendar, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from "@/components/logo/logo.png";

// Social Icons from Timetable
const linkedinLogo = () => (
  <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
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

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-purple-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 group"
            >
              <img src={logo} alt="Logo" className="w-8 h-8 rounded group-hover:rotate-12 transition-transform" />
              <span className="font-bold tracking-tighter text-xl">MARGDARSHAK</span>
            </motion.div>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white gap-2 hover:bg-white/5 rounded-full transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="py-32 px-6 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 blur-[140px] rounded-full -z-10 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-widest uppercase mb-6"
            >
              Revolutionizing Education
            </motion.span>
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent leading-[1.1]">
              Our Mission
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
              At MARGDARSHAK, we are redefining the academic landscape by harmonizing artificial intelligence with human potential. Our mission is to provide every student with a <span className="text-white">sophisticated, AI-driven ecosystem</span> that transcends traditional management—fostering a culture of excellence, reducing cognitive load, and illuminating the path to intellectual mastery.
            </p>
          </motion.div>
        </section>

        {/* Values Grid */}
        <section className="container mx-auto px-6 py-24">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Focus", desc: "We build tools that help you filter out noise and concentrate on what matters: your education.", color: "text-blue-400", gradient: "from-blue-500/20 to-cyan-500/20" },
              { icon: Heart, title: "Wellness", desc: "Academic success shouldn't come at the cost of mental health. Our tools promote balance.", color: "text-red-400", gradient: "from-red-500/20 to-pink-500/20" },
              { icon: Sparkles, title: "Innovation", desc: "We constantly evolve, using the latest technology to solve old student problems.", color: "text-yellow-400", gradient: "from-yellow-500/20 to-orange-500/20" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group relative bg-white/[0.03] p-10 rounded-[2.5rem] border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${item.color} mb-8 group-hover:scale-110 transition-transform duration-500`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 tracking-tight">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-lg">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.02] -skew-y-3 origin-right scale-110"></div>
          <div className="container mx-auto px-6 max-w-5xl relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter">Our Story</h2>
                <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                  <p>
                    MARGDARSHAK was born from a pivotal realization in the heart of academic pursuit: the tools meant to help us were often the ones holding us back. Disconnected calendars, fragmented notes, and isolated grading systems created a chaotic environment that stifled true learning.
                  </p>
                  <p>
                    We didn't just build another app; we engineered a paradigm shift. By creating an intelligent orchestration layer where every syllabus, deadline, and study session communicates in real-time, we've transformed the student experience.
                  </p>
                  <p>
                    What began as a solution for a few has evolved into a global movement, empowering thousands of students to reclaim their focus, reduce academic friction, and achieve the extraordinary.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-[3rem] border border-white/10 flex items-center justify-center p-12 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                  <img src={logo} alt="Margdarshak" className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <p className="text-white font-bold text-xl tracking-tight">Founded by Students, for Students.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Leadership Section */}
        <section className="py-32 relative">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl font-black tracking-tighter mb-4">Our Leadership</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">Meet the visionaries behind the academic revolution.</p>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-8 rounded-full"></div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: "Abhinav Jha",
                  role: "Founder & Developer",
                  desc: "Visionary leader driving the future of AI-powered student success.",
                  gradient: "from-purple-500/20 to-pink-500/20",
                  icon: Users,
                  accent: "text-purple-400"
                },
                {
                  name: "Vaibhavi Jha",
                  role: "CTO & Co-founder",
                  desc: "Join us in building the next generation of academic intelligence.",
                  gradient: "from-blue-500/20 to-cyan-500/20",
                  icon: Sparkles,
                  accent: "text-blue-400"
                },
                {
                  name: "Vacant",
                  role: "Cheif Financial Officer",
                  desc: "Ensuring sustainable growth and financial excellence for our mission.",
                  gradient: "from-emerald-500/20 to-teal-500/20",
                  icon: Target,
                  accent: "text-emerald-400"
                }
              ].map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-500"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]`}></div>

                  <div className="relative z-10 text-center">
                    <div className={`w-24 h-24 mx-auto bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${member.accent}`}>
                      <member.icon className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-bold mb-2 tracking-tight">{member.name}</h3>
                    <p className={`${member.accent} font-bold text-sm uppercase tracking-widest mb-6`}>{member.role}</p>
                    <p className="text-gray-400 leading-relaxed">
                      {member.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Premium Footer (Same as Timetable) */}
      <footer className="relative bg-black border-t border-white/5 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 15, repeat: Infinity, delay: 2 }}
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            {/* Branding Column */}
            <div className="space-y-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="inline-block"
              >
                <h3 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
                  <img src={logo} alt="Logo" className="w-8 h-8 rounded" />
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">MARGDARSHAK</span>
                </h3>
                <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.4em] mt-3">by VSAV GYANTAPA</p>
              </motion.div>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-medium">
                Empowering students with AI-driven scheduling and intelligent academic orchestration. Built for the next generation of learners.
              </p>
              <div className="flex items-center gap-4">
                {[
                  { icon: TwitterLogo, href: "https://x.com/gyantappas", label: "Twitter" },
                  { icon: FacebookLogo, href: "https://www.facebook.com/profile.php?id=61584618795158", label: "Facebook" },
                  { icon: linkedinLogo, href: "https://www.linkedin.com/in/vsav-gyantapa-33893a399/", label: "LinkedIn" }
                ].map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-zinc-400 hover:text-white"
                  >
                    <social.icon />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
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
                  { name: "GDPR Compliance", href: "/gdpr" }
                ]
              },
              {
                title: "Support",
                links: [
                  { name: "Help Center", href: "/help" },
                  { name: "Contact Us", href: "mailto:abhinavjha393@gmail.com" }
                ]
              }
            ].map((section, i) => (
              <div key={i} className="space-y-8">
                <h4 className="text-white font-black text-xs uppercase tracking-[0.3em]">{section.title}</h4>
                <ul className="space-y-5">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        to={link.href}
                        className="text-zinc-500 hover:text-white transition-colors text-sm font-semibold flex items-center group"
                      >
                        <motion.span
                          whileHover={{ x: 4 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 group-hover:bg-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                          {link.name}
                        </motion.span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-zinc-500 text-xs font-bold tracking-wider">
              © 2026 <span className="text-white">VSAV GYANTAPA</span>. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-8">
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Version 3.0</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUsPage;
