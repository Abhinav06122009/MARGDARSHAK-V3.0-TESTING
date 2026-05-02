import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Globe, Zap, Cpu, Command, ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import logo from "@/components/logo/logo.png";

type Section = { id: number; slug: string; title: string; content: React.ReactNode };

const sections: Section[] = [
  {
    id: 1,
    slug: "introduction",
    title: "Protocol Scope",
    content: (
      <>
        <p className="mb-6">
          This Cookie Policy (“Policy”) elucidates the modalities and purposes pursuant to which <strong>VSAV GYANTAPA</strong>,
          operating <strong>MARGDARSHAK</strong> (“we,” “us,” “our”), deploys cookies and analogous tracking technologies
          (collectively, “Cookies”) on our website, applications, and related interfaces (the “Services”).
        </p>
        <p className="mb-6 italic text-zinc-500">
          By continuing to engage our Services, you acknowledge notice of this Policy and our utilization of Cookies in
          accordance with the dispositions herein articulated.
        </p>
      </>
    ),
  },
  {
    id: 2,
    slug: "what-are-cookies",
    title: "Cookie Architecture",
    content: (
      <>
        <p className="mb-6 text-zinc-400">
          Cookies comprise infinitesimal data packets—alphanumeric identifiers—that are sequestered on your local
          terminal (computer, smartphone, or tablet) when you access digital resources. They facilitate the
          preservation of state, recognize return visitations, and sustain persistent authentication or preference
          signals.
        </p>
      </>
    ),
  },
  {
    id: 3,
    slug: "how-we-use-cookies",
    title: "Juridical Rationale",
    content: (
      <>
        <p className="mb-6">
          The deployment of Cookies is strictly circumscribed by operational necessity and performance optimization:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            { label: "Authentication", desc: "Identity verification and session integrity." },
            { label: "Security", desc: "Fraud interdiction and mitigation of CSRF." },
            { label: "Preferences", desc: "Linguistic nodes and UI/UX configurations." },
            { label: "Performance", desc: "Aggregated telemetry and velocity instrumentation." }
          ].map((item, i) => (
            <li key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-emerald-500/20 transition-all">
              <strong className="block text-emerald-400 text-[10px] uppercase tracking-widest mb-1 italic">{item.label}</strong>
              <span className="text-sm text-zinc-500">{item.desc}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 4,
    slug: "categories",
    title: "Node Taxonomy",
    content: (
      <div className="space-y-6">
        {[
          { title: "Strictly Essential", desc: "Indispensable for core operability and secure authentication." },
          { title: "Functionality", desc: "Enable personalized attributes and archival configurations." },
          { title: "Analytical", desc: "Measure engagement metrics and navigational paths." }
        ].map((item, i) => (
          <div key={i} className="flex gap-4 p-6 bg-white/[0.01] rounded-3xl border border-white/5 italic">
            <div className="w-2 h-2 rounded-full bg-emerald-500/50 mt-1.5 shrink-0" />
            <div>
               <h4 className="text-white font-black uppercase text-xs tracking-widest mb-2">{item.title} Nodes</h4>
               <p className="text-zinc-500 text-sm">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 5,
    slug: "managing-cookies",
    title: "Governance Controls",
    content: (
      <>
        <p className="mb-6">
          You possess the inherent right to regulate Cookie deployment via browser-level configurations or system
          preferences:
        </p>
        <ul className="space-y-3 mb-6">
          {[
            "Inspect and selectively delete Cookies.",
            "Block third-party Cookies in toto.",
            "Honor Universal Opt-Out signals (DNT headers).",
            "Actuate 'Incognito' mode for session purging."
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-zinc-500 text-sm">
              <div className="w-1 h-1 rounded-full bg-zinc-800" />
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 6,
    slug: "contact",
    title: "Contact Protocol",
    content: (
      <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] mt-8">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-4 italic">Communications Uplink</h4>
        <address className="not-italic text-zinc-400 font-medium text-lg leading-relaxed mb-6">
          VSAV GYANTAPA — MARGDARSHAK ARCHITECTURAL SUITE
        </address>
        <a
          href="mailto:support@margdarshan.tech"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 transition-all"
        >
          support@margdarshan.tech <ChevronRight size={14} />
        </a>
      </div>
    ),
  },
];

const CookiePolicy: React.FC = () => {
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
              Cookie <span className="text-emerald-500">Policy</span>
            </h1>
            <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.4em] italic mb-12">
              Margdarshak Ecosystem // Local Storage Nodes & Telemetry
            </p>
            <div className="flex items-center gap-6">
                <Link to="/">
                    <Button variant="ghost" className="text-zinc-600 hover:text-white uppercase font-black text-[10px] tracking-widest gap-2">
                        <ArrowLeft size={14} /> Protocol Hub
                    </Button>
                </Link>
                <div className="w-px h-4 bg-white/10" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Effective: July 2025</p>
            </div>
          </div>

          {/* Policy Matrix */}
          <div className="grid lg:grid-cols-12 gap-16">
            <aside className="lg:col-span-4 lg:sticky lg:top-8 h-fit">
              <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 space-y-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Core Sections</h2>
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
              {sections.map((s) => (
                <article
                  key={s.slug}
                  id={`section-${s.slug}`}
                  className="group relative bg-white/[0.01] backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-12 hover:border-emerald-500/20 transition-all duration-700 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <header className="mb-8">
                    <span className="text-[10px] font-black text-emerald-500/50 mb-4 block italic">SECTION_0{s.id}</span>
                    <h3 className="text-3xl font-black italic uppercase tracking-tight text-white">{s.title}</h3>
                  </header>
                  <div className="text-zinc-400 text-lg leading-relaxed font-medium">
                    {s.content}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Absolute Footer Navigation */}
          <div className="mt-32 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
               <Shield size={16} className="text-zinc-700" />
               <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.4em]">MARGDARSHAK_SECURITY_COMPLIANCE_PROTOCOL</p>
            </div>
            <Link to="/privacy" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-all">
                Access Privacy Accord <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};

export default CookiePolicy;
