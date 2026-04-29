import React from "react";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, FileText, Lock, Eye, Globe, Database, Cpu, Sparkles, Scale, Gavel, Handshake } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/components/logo/logo.png";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type Section = { id: number; slug: string; title: string; content: React.ReactNode };

const sections: Section[] = [
  {
    id: 1,
    slug: "acceptance-and-construction",
    title: "Acceptance of Terms",
    content: (
      <p>
        By accessing or utilizing the services, interfaces, modules, and adjunct integrations provided by
        <span className="text-white font-bold italic"> MARGDARSHAK</span>, operated by <span className="text-blue-400 font-black tracking-tight uppercase italic">VSAV GYANTAPA</span>,
        an individual or juridical person signifies unconditional assent to these Terms and Conditions.
      </p>
    ),
  },
  {
    id: 2,
    slug: "eligibility-and-accounts",
    title: "Eligibility and Accounts",
    content: (
      <p>
        The User represents and warrants the provision of accurate, current, and complete information and undertakes to preserve credential confidentiality. The Services are not deliberately directed to minors below the applicable age of digital consent.
      </p>
    ),
  },
  {
    id: 3,
    slug: "authorized-use-and-conduct",
    title: "Authorized Conduct",
    content: (
      <ul className="space-y-3">
        <li className="flex items-start gap-3 text-zinc-500">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
          <span>No reverse engineering, scraping, or data exfiltration.</span>
        </li>
        <li className="flex items-start gap-3 text-zinc-500">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
          <span>No dissemination of unlawful or infringing material.</span>
        </li>
        <li className="flex items-start gap-3 text-zinc-500">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
          <span>No evasion of rate limits or organizational controls.</span>
        </li>
      </ul>
    ),
  },
  {
    id: 4,
    slug: "intellectual-property",
    title: "Intellectual Property",
    content: (
      <p>
        The Services and their constituent content, compilations, software, and trademarks are owned by VSAV or its licensors. VSAV grants a limited, revocable, non‑exclusive license to access the Services for personal purposes.
      </p>
    ),
  },
  {
    id: 5,
    slug: "warranties-disclaimer",
    title: "Disclaimer of Warranties",
    content: (
      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 italic text-zinc-400 text-sm">
        "The services are provided 'As Is' and 'As Available,' without warranties of any kind, whether express, implied, or statutory, including any implied warranties of merchantability or fitness."
      </div>
    ),
  },
  {
    id: 6,
    slug: "limitation-liability",
    title: "Limitation of Liability",
    content: (
      <p>
        To the maximum extent permitted by law, VSAV shall not be liable for any indirect, incidental, or consequential damages arising from the use of the services. Liability shall be limited to the greatest extent permitted.
      </p>
    ),
  },
  {
    id: 7,
    slug: "arbitration-disputes",
    title: "Dispute Resolution",
    content: (
      <p>
        Any claim or controversy arising out of these terms shall be resolved by binding arbitration on an individual basis. Class actions and representative proceedings are waived to the fullest extent permitted by law.
      </p>
    ),
  },
  {
    id: 8,
    slug: "contact",
    title: "Legal Correspondence",
    content: (
      <div className="p-6 rounded-[2rem] bg-blue-500/[0.03] border border-blue-500/10 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
          <Gavel className="text-blue-400" />
        </div>
        <div>
          <p className="text-white font-black uppercase tracking-widest text-[10px] mb-1">Legal Operations Desk</p>
          <p className="text-lg font-bold text-blue-400 italic">support@margdarshan.tech</p>
        </div>
      </div>
    ),
  }
];

const TermsAndConditions: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,15,25,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]"
        />

        {/* Neural Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[3.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent pointer-events-none" />

            {/* Header Hero */}
            <header className="px-12 pt-16 pb-12 border-b border-white/5 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: -5 }}
                  className="p-6 bg-white rounded-[2.5rem] border border-white/20 shadow-2xl shadow-blue-500/10"
                >
                  <img src={logo} alt="Margdarshak Official" className="w-12 h-12 object-contain" />
                </motion.div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic mb-4">
                    Terms <span className="text-blue-500">&</span> Conditions
                  </h1>
                  <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-2xl">
                    The cognitive accord governing eligibility, licenses, and jurisdictional resolution for the <span className="text-white italic">Margdarshak Ecosystem</span>.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="px-5 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 flex items-center gap-2">
                      <Handshake size={14} className="text-blue-400" />
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Binding Protocol</span>
                    </div>
                    <div className="px-5 py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Effective: July 25, 2025</span>
                    </div>
                  </div>
                </div>
                {onBack && (
                  <Button 
                    onClick={onBack}
                    className="h-16 px-10 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-zinc-200 transition-all active:scale-95"
                  >
                    Return to Hub
                  </Button>
                )}
              </div>
            </header>

            <div className="p-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* TOC Sidebar */}
                <aside className="lg:col-span-4 hidden lg:block">
                  <div className="sticky top-12 space-y-8">
                    <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-2xl">
                      <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                        <Database size={14} className="text-blue-500" /> Cognitive Map
                      </h3>
                      <nav className="space-y-1">
                        {sections.map((s) => (
                          <a 
                            key={s.id}
                            href={`#section-${s.slug}`}
                            className="flex items-start gap-3 p-3 rounded-2xl hover:bg-blue-500/10 transition-all group"
                          >
                            <span className="text-[10px] font-black text-zinc-600 group-hover:text-blue-500 mt-0.5">{s.id < 10 ? `0${s.id}` : s.id}</span>
                            <span className="text-[11px] font-bold text-zinc-400 group-hover:text-white transition-colors">{s.title}</span>
                          </a>
                        ))}
                      </nav>
                    </div>
                  </div>
                </aside>

                {/* Content Area */}
                <div className="lg:col-span-8 space-y-16">
                   {/* Preamble */}
                  <div className="p-8 rounded-[2.5rem] bg-blue-500/[0.03] border border-blue-500/10 relative overflow-hidden group text-center">
                    <p className="text-lg text-zinc-300 leading-relaxed font-medium relative z-10 italic">
                      These Terms constitute a binding accord between <span className="text-white font-bold italic">VSAV</span> and the <span className="text-blue-400 italic font-black">User</span> concerning the Services and shall be construed to maximize legal efficacy.
                    </p>
                  </div>

                  {sections.map((s) => (
                    <motion.article 
                      key={s.slug} 
                      id={`section-${s.slug}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="group scroll-mt-24"
                    >
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-[10px] font-black text-zinc-600 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all duration-500">
                          {s.id < 10 ? `0${s.id}` : s.id}
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight group-hover:text-blue-400 transition-colors">
                          {s.title}
                        </h2>
                      </div>
                      <div className="pl-18 border-l border-white/5 group-hover:border-blue-500/20 transition-all duration-700">
                        <div className="text-zinc-500 leading-relaxed font-medium group-hover:text-zinc-300 transition-colors">
                          {s.content}
                        </div>
                      </div>
                    </motion.article>
                  ))}

                  {/* Warning Section */}
                  <div className="p-8 rounded-[2.5rem] bg-red-500/[0.03] border border-red-500/10 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/[0.02] translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                    <AlertCircle className="w-8 h-8 text-red-500/50 mx-auto mb-4 relative z-10" />
                    <p className="text-[9px] text-red-400/60 font-black uppercase tracking-[0.3em] leading-relaxed relative z-10 max-w-md mx-auto">
                      ⚠️ Unauthorized reproduction or distribution of proprietary assets is strictly monitored.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
};

const AlertCircle = ({ className, size = 20 }: { className?: string, size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default TermsAndConditions;