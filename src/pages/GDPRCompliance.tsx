import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Globe, Zap, Cpu, Command, ArrowLeft, ChevronRight, Sparkles, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import logo from "@/components/logo/logo.png";

type Section = { id: number; slug: string; title: string; content: React.ReactNode };

const sections: Section[] = [
  {
    id: 1,
    slug: "introduction",
    title: "GDPR Commitment",
    content: (
      <>
        <p className="mb-6">
          At <strong>MARGDARSHAK</strong>, operated by <strong>VSAV GYANTAPA</strong>, we recognize the paramount
          importance of data sovereignty and the fundamental rights of natural persons within the European Union
          (EU) and the European Economic Area (EEA).
        </p>
        <p className="mb-6 italic text-zinc-500">
          We act as the “Data Controller” for the Personal Data of our users and are committed to maintaining a
          posture of absolute transparency, accountability, and security in all processing operations.
        </p>
      </>
    ),
  },
  {
    id: 2,
    slug: "principles",
    title: "Protection Pillars",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "Lawfulness", desc: "Processing on valid juridical bases." },
          { title: "Purpose Limitation", desc: "Data collected for explicit purposes." },
          { title: "Minimization", desc: "Only strictly necessary telemetry." },
          { title: "Accuracy", desc: "Rectification without delay." },
          { title: "Storage Limitation", desc: "Retention only as required." },
          { title: "Integrity", desc: "Advanced technical measures (TOMs)." }
        ].map((p, i) => (
          <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            <h4 className="text-emerald-400 text-[10px] uppercase font-black tracking-widest mb-1 italic">{p.title}</h4>
            <p className="text-zinc-500 text-sm">{p.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 3,
    slug: "rights",
    title: "Subject Prerogatives",
    content: (
      <div className="space-y-4">
        {[
          { title: "Right of Access", desc: "Obtain confirmation and copy of data." },
          { title: "Right to Rectification", desc: "Correction of inaccurate information." },
          { title: "Right to Erasure", desc: "Request deletion where justified." },
          { title: "Data Portability", desc: "Structured, machine-readable format." }
        ].map((r, i) => (
          <div key={i} className="flex gap-4 p-5 bg-white/[0.01] border border-white/5 rounded-3xl group hover:border-emerald-500/20 transition-all">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30 mt-2 shrink-0 group-hover:bg-emerald-500" />
             <div>
                <h4 className="text-white text-sm font-black uppercase italic tracking-tight mb-1">{r.title}</h4>
                <p className="text-zinc-500 text-sm">{r.desc}</p>
             </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 4,
    slug: "security",
    title: "Technical Substrate",
    content: (
      <p className="mb-6 text-zinc-400">
        We deploy a multi-layered security substrate including <strong>AES-256 encryption</strong> at rest,
        <strong>TLS 1.3</strong> for data in transit, multi-factor authentication (MFA), and periodic vulnerability
        assessments. Our infrastructure is hosted on vetted, SOC2-compliant cloud providers.
      </p>
    ),
  },
  {
    id: 5,
    slug: "contact",
    title: "Support Uplink",
    content: (
      <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem]">
        <address className="not-italic text-zinc-400 font-medium text-lg mb-6">
          VSAV GYANTAPA — MARGDARSHAK COMPLIANCE FUNCTION
        </address>
        <a
          href="mailto:support@margdarshan.tech"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 transition-all"
        >
          Contact DPO <ChevronRight size={14} />
        </a>
      </div>
    ),
  },
];

const GDPRCompliance: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,20,15,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        
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

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          
          {/* Header Identity */}
          <div className="flex flex-col items-center mb-24 text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative mb-8"
            >
              <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full group-hover:bg-emerald-500/40 transition-all duration-700" />
              <div className="p-5 rounded-[2.5rem] bg-white border border-white/20 relative z-10 shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:-translate-y-1">
                <img src={logo} alt="Margdarshak Official" className="w-16 h-16 object-contain" />
              </div>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-white mb-6">
              GDPR <span className="text-emerald-500">Compliance</span>
            </h1>
            <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.4em] italic mb-12">
              Margdarshak Ecosystem // European Data Protection Standards
            </p>
            <div className="flex items-center gap-6">
                <Link to="/">
                    <Button variant="ghost" className="text-zinc-600 hover:text-white uppercase font-black text-[10px] tracking-widest gap-2">
                        <ArrowLeft size={14} /> Protocol Hub
                    </Button>
                </Link>
                <div className="w-px h-4 bg-white/10" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">STATUS: VERIFIED</p>
            </div>
          </div>

          {/* Compliance Matrix */}
          <div className="grid lg:grid-cols-12 gap-16">
            <aside className="lg:col-span-4 lg:sticky lg:top-8 h-fit">
              <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 space-y-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Roadmap Nodes</h2>
                <div className="flex flex-col gap-4">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#section-${s.slug}`}
                      className="group flex items-center gap-4 text-[11px] font-bold text-zinc-600 hover:text-emerald-400 transition-all duration-500"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-emerald-500 group-hover:scale-125 transition-all" />
                      <span className="tracking-widest uppercase italic">{s.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            </aside>

            <div className="lg:col-span-8 space-y-16">
              <div className="p-10 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-[3.5rem] italic text-zinc-400 text-lg leading-relaxed">
                 MARGDARSHAK is engineered with <span className="text-white font-black">"Privacy by Design"</span> at its core, ensuring that your data rights are protected through every layer of our technical architecture.
              </div>

              {sections.map((s) => (
                <article
                  key={s.slug}
                  id={`section-${s.slug}`}
                  className="group relative bg-white/[0.01] backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-12 hover:border-emerald-500/20 transition-all duration-700 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <header className="mb-8 text-left">
                    <span className="text-[10px] font-black text-emerald-500/50 mb-4 block italic">SECTION_0{s.id}</span>
                    <h3 className="text-3xl font-black italic uppercase tracking-tight text-white">{s.title}</h3>
                  </header>
                  <div className="text-zinc-500 text-lg leading-relaxed font-medium">
                    {s.content}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Absolute Footer Navigation */}
          <div className="mt-32 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
               <Database size={16} className="text-zinc-700" />
               <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.4em]">MARGDARSHAK_DATA_SOVEREIGNTY_PROTOCOL</p>
            </div>
            <Link to="/cookies" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-all">
                Access Cookie Accord <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};

export default GDPRCompliance;
