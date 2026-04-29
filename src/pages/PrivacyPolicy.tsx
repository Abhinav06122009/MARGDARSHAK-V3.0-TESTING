import React from "react";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, FileText, Lock, Eye, Globe, Database, Cpu, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/components/logo/logo.png";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type Section = { id: number; slug: string; title: string; content: React.ReactNode };

const sections: Section[] = [
  {
    id: 1,
    slug: "definitions-and-interpretation",
    title: "Definitions and Interpretation",
    content: (
      <div className="space-y-4">
        <p>
          For purposes of this Privacy Policy (“Policy”), “Personal Data” connotes any datum relating to an
          identified or identifiable natural person; “Processing” subsumes any operation performed upon Personal
          Data, whether or not by automated means.
        </p>
        <p>
          “Controller” signifies the juridical person determining purposes and means of Processing; “Processor” denotes any person so engaged on the Controller’s behalf;
          and “Services” shall comprise all websites, applications, APIs, modules, integrations, and adjunct
          interfaces provided herein.
        </p>
      </div>
    ),
  },
  {
    id: 2,
    slug: "scope-and-applicability",
    title: "Scope and Applicability",
    content: (
      <p>
        This Policy governs Processing appertaining to the Services irrespective of locus of access and is
        intended to discharge transparency obligations cognizable under GDPR/UK GDPR, CCPA/CPRA, India’s DPDP,
        Brazil’s LGPD, and cognate regimes.
      </p>
    ),
  },
  {
    id: 3,
    slug: "controller-and-coordinates",
    title: "Controller Identity",
    content: (
      <p>
        The Controller responsible for the Processing delineated herein is <span className="text-white font-bold">VSAV GYANTAPA</span>,
        operating <span className="text-emerald-400 font-black italic">MARGDARSHAK</span>.
      </p>
    ),
  },
  {
    id: 4,
    slug: "categories-of-data",
    title: "Categories of Personal Data",
    content: (
      <ul className="space-y-4">
        <li className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="p-2 bg-emerald-500/10 rounded-lg h-fit"><Lock size={14} className="text-emerald-400" /></div>
          <div><p className="text-white font-bold mb-1 uppercase tracking-widest text-[10px]">Identifying Coordinates</p><p className="text-zinc-500 text-sm">Names, email addresses, account identifiers, and authentication artifacts.</p></div>
        </li>
        <li className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="p-2 bg-blue-500/10 rounded-lg h-fit"><Cpu size={14} className="text-blue-400" /></div>
          <div><p className="text-white font-bold mb-1 uppercase tracking-widest text-[10px]">Telemetry and Diagnostics</p><p className="text-zinc-500 text-sm">IP addresses, device fingerprints, session identifiers, and event logs.</p></div>
        </li>
      </ul>
    ),
  },
  {
    id: 5,
    slug: "lawful-bases",
    title: "Juridical Bases",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { t: "Consent", d: "Explicit, granular, and revocable at any time." },
          { t: "Contractual", d: "Necessary for performing our service undertakings." },
          { t: "Legal Obligation", d: "Mandated to discharge statutory prescriptions." },
          { t: "Legitimate Interests", d: "Security, continuity, and system integrity." }
        ].map((base, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
            <p className="text-emerald-400 font-black uppercase tracking-tighter text-xs mb-1">{base.t}</p>
            <p className="text-zinc-600 text-xs">{base.d}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 6,
    slug: "disclosures",
    title: "Disclosures and Processors",
    content: (
      <p>
        Personal Data may be disclosed to vetted processors furnishing hosting, storage, analytics, and security under binding data protection covenants. No sale or rental of Personal Data for pecuniary consideration is undertaken.
      </p>
    ),
  },
  {
    id: 7,
    slug: "security",
    title: "Security Infrastructure",
    content: (
      <p>
        A layered control surface is maintained, encompassing encryption in transit and at rest; least‑privilege access; role segregation; hardened configurations; and incident response playbooks calibrated to contemporary risk morphologies.
      </p>
    ),
  },
  {
    id: 8,
    slug: "retention",
    title: "Data Retention",
    content: (
      <p>
        Personal Data is retained strictly for durations requisite to the disclosed purposes or legal mandates and thereafter subjected to defensible disposition (erasure, anonymization, or archival).
      </p>
    ),
  },
  {
    id: 9,
    slug: "rights",
    title: "Subject Prerogatives",
    content: (
      <p>
        Data subjects may exercise rights of access, rectification, erasure, restriction, portability, and objection. Complaints may be lodged with a competent supervisory authority without derogating from other remedies.
      </p>
    ),
  },
  {
    id: 10,
    slug: "contact",
    title: "Terminal Contact",
    content: (
      <div className="p-6 rounded-[2rem] bg-emerald-500/[0.03] border border-emerald-500/10 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
          <Globe className="text-emerald-400" />
        </div>
        <div>
          <p className="text-white font-black uppercase tracking-widest text-[10px] mb-1">Privacy Operations Desk</p>
          <p className="text-lg font-bold text-emerald-400 italic">support@margdarshan.tech</p>
        </div>
        <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-black">VSAV GYANTAPA — MARGDARSHAK</p>
      </div>
    ),
  }
];

const PrivacyPolicy: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
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
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px]"
        />

        {/* Neural Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[3.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />

            {/* Header Hero */}
            <header className="px-12 pt-16 pb-12 border-b border-white/5 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="p-6 bg-white rounded-[2.5rem] border border-white/20 shadow-2xl shadow-emerald-500/10"
                >
                  <img src={logo} alt="Margdarshak Official" className="w-12 h-12 object-contain" />
                </motion.div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic mb-4">
                    Privacy <span className="text-emerald-500">Protocol</span>
                  </h1>
                  <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-2xl">
                    High-fidelity data protection architecture governing the <span className="text-white italic">Processing of Personal Data</span> across the Margdarshak neural network.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="px-5 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-400" />
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Version 3.0 Stable</span>
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
                        <Database size={14} className="text-emerald-500" /> Infrastructure Map
                      </h3>
                      <nav className="space-y-1">
                        {sections.map((s) => (
                          <a 
                            key={s.id}
                            href={`#section-${s.slug}`}
                            className="flex items-start gap-3 p-3 rounded-2xl hover:bg-emerald-500/10 transition-all group"
                          >
                            <span className="text-[10px] font-black text-zinc-600 group-hover:text-emerald-500 mt-0.5">{s.id < 10 ? `0${s.id}` : s.id}</span>
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
                  <div className="p-8 rounded-[2.5rem] bg-emerald-500/[0.03] border border-emerald-500/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/[0.02] translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                    <p className="text-lg text-zinc-300 leading-relaxed font-medium relative z-10 italic">
                      This Policy is promulgated by <span className="text-white font-bold italic">VSAV GYANTAPA</span>, acting through and for <span className="text-emerald-400 font-black tracking-tight uppercase italic">MARGDARSHAK</span>. We have architected our systems to maximize data sovereignty while maintaining operational excellence.
                    </p>
                  </div>

                  {sections.map((s) => (
                    <motion.article 
                      key={s.slug} 
                      id={`section-${s.slug}`}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="group scroll-mt-24"
                    >
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-[10px] font-black text-zinc-600 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all duration-500">
                          {s.id < 10 ? `0${s.id}` : s.id}
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight group-hover:text-emerald-400 transition-colors">
                          {s.title}
                        </h2>
                      </div>
                      <div className="pl-18 border-l border-white/5 group-hover:border-emerald-500/20 transition-all duration-700">
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
                      ⚠️ Unauthorized reproduction or distribution of proprietary cognitive assets is strictly proscribed and monitored.
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

export default PrivacyPolicy;
