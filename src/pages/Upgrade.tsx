import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  ArrowLeft,
  Crown,
  Sparkles,
  Zap,
  Shield,
  BrainCircuit,
  Info,
  ChevronRight,
  Database,
  Lock,
  Cpu,
  Command,
  ArrowUpRight,
  Globe
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import logo from "@/components/logo/logo.png";
import { Button } from '@/components/ui/button';

const Upgrade = () => {
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const { user: clerkUser } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserTier = async () => {
      try {
        // --- ZENITH SYNC: Prioritize Clerk Metadata ---
        const clerkTier = (clerkUser?.publicMetadata as any)?.subscription?.tier;
        if (clerkTier) {
          setCurrentTier(clerkTier as string);
          return;
        }

        // Fallback to Supabase Profile
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', authUser.id)
            .maybeSingle();
          setCurrentTier((profile as any)?.subscription_tier || 'free');
        } else {
          setCurrentTier('free');
        }
      } catch (err) {
        console.error("Error syncing user tier:", err);
        setCurrentTier('free');
      }
    };
    fetchUserTier();
  }, [clerkUser]);

  useEffect(() => {
    // Inject Uropay Script
    if (!document.querySelector('script[src="https://cdn.uropay.me/uropay-embed.min.js"]')) {
      const script = document.createElement('script');
      script.src = "https://cdn.uropay.me/uropay-embed.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: any = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

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
        <div className="max-w-7xl mx-auto px-6 py-16">

          {/* Nav Identity */}
          <nav className="flex items-center justify-between mb-24 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-3xl shadow-2xl">
            <Link to="/" className="flex items-center gap-4 group">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="p-3 bg-white rounded-2xl shadow-xl shadow-emerald-500/10"
              >
                <img src={logo} alt="Margdarshak" className="w-8 h-8 object-contain" />
              </motion.div>
              <h1 className="text-xl font-black italic tracking-tighter uppercase">Margdarshak <span className="text-emerald-500">Systems</span></h1>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" className="text-zinc-500 hover:text-white font-black text-[10px] tracking-widest uppercase gap-3 hover:bg-white/5 rounded-2xl transition-all">
                <ArrowLeft size={14} /> Return To Home
              </Button>
            </Link>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 max-w-4xl mx-auto mb-32"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 italic">
              <Crown size={14} className="animate-pulse" /> UPGRADATION PAGE
            </div>
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] italic uppercase">
              Unlock Your <br />
              <span className="text-emerald-500 underline decoration-emerald-500/20 underline-offset-8">Elite Potential</span>
            </h1>

            {/* Current Status Badge */}
            <div className="flex justify-center mt-6">
              <div className="px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-xl flex items-center gap-6 shadow-2xl">
                <div className="flex flex-col items-start">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Active Subscription</span>
                  <span className="text-sm font-black text-white uppercase tracking-tighter italic">
                    {currentTier === 'free' ? 'Starter Suite (Free)' :
                      currentTier === 'premium' ? 'Premium Suite' :
                        ['premium_elite', 'extra_plus', 'premium_plus'].includes(currentTier || '') ? 'Elite Suite' :
                          (currentTier || 'Starter Suite').toUpperCase()}
                  </span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col items-start">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Security Identity</span>
                  <span className="text-xs font-bold text-emerald-500/80 truncate max-w-[120px]">
                    {clerkUser?.username || clerkUser?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xl text-zinc-500 font-medium leading-relaxed max-w-2xl mx-auto mb-12 italic border-l-2 border-emerald-500/20 pl-8">
              Engineer your academic success with the full power of <span className="text-white font-bold">Margdarshak</span> available. Unlimited research, high-fidelity analytics, and priority support.
            </p>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-10 text-left max-w-3xl mx-auto flex flex-col md:flex-row gap-8 items-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />
              <div className="bg-emerald-500/10 p-5 rounded-3xl shrink-0 group-hover:scale-110 transition-transform">
                <Info className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-emerald-500 font-black text-xs mb-3 tracking-[0.4em] uppercase italic">Deployment Notice</h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                  <strong className="text-white">VSAV GYANTAPA</strong> maintains manual verification for elite tier deployments. Activate below and our Technical team will finalize your account re-encryption within 24-48 hrs.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start mb-40"
          >

            {/* STARTER */}
            <motion.div variants={itemVariants} className="relative p-12 rounded-[3.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl overflow-hidden group hover:border-emerald-500/20 transition-all duration-700">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
              <h3 className="text-xs font-black text-zinc-600 mb-6 flex items-center gap-3 tracking-[0.3em] uppercase italic">
                <div className="w-2 h-2 rounded-full bg-zinc-800" /> Starter Suite
              </h3>
              <div className="text-5xl font-black text-white mb-6 italic uppercase tracking-tighter">Free</div>
              <p className="text-sm text-zinc-500 mb-10 h-10 font-medium italic">Foundational tools for task management and basic organization.</p>

              {currentTier === 'free' ? (
                <div className="w-full py-6 rounded-2xl border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-black text-[10px] tracking-[0.3em] uppercase text-center italic cursor-default">
                  Active Instance
                </div>
              ) : (
                <div className="w-full py-6 rounded-2xl border border-white/5 bg-white/5 text-zinc-600 font-black text-[10px] tracking-[0.3em] uppercase text-center italic cursor-default">
                  Legacy Plan
                </div>
              )}

              <div className="mt-12 space-y-6">
                {[
                  { label: 'Daily Task Management', icon: Command },
                  { label: 'Basic Study Telemetry', icon: Cpu },
                  { label: '100MB Secure Vault', icon: Database }
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-4 text-xs text-zinc-400 font-medium italic group-hover:text-zinc-300 transition-colors">
                    <feat.icon size={14} className="text-emerald-500/40" />
                    {feat.label}
                  </div>
                ))}
                <div className="h-px bg-white/5" />
                {[
                  { label: 'Elite Learning Model', icon: BrainCircuit },
                  { label: 'Deep Research Uplink', icon: Globe },
                  { label: 'Tactical Support', icon: Shield }
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-4 text-xs text-zinc-700 font-medium italic">
                    <X size={14} className="text-zinc-800" />
                    {feat.label}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* PREMIUM */}
            <motion.div
              variants={itemVariants}
              className="relative p-12 rounded-[4rem] bg-white/[0.02] border border-blue-500/20 backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden group hover:border-blue-500/40 transition-all duration-700"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent pointer-events-none" />
              <h3 className="text-xs font-black text-blue-500 mb-6 flex items-center gap-3 tracking-[0.3em] uppercase italic">
                <Sparkles size={14} className="animate-pulse" /> Premium Tier
              </h3>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-6xl font-black text-white italic tracking-tighter">₹750</span>
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest italic">/ Two Month</span>
              </div>

              <p className="text-sm text-zinc-400 mb-10 h-10 font-medium italic leading-relaxed">Enhanced power for serious students with technical priority support.</p>

              {currentTier === 'premium' ? (
                <div className="w-full py-6 rounded-2xl border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-black text-[10px] tracking-[0.3em] uppercase text-center italic cursor-default">
                  Active Instance
                </div>
              ) : (
                <a
                  href="#"
                  className="uropay-btn w-full block text-center py-6 text-[10px] font-black tracking-[0.3em] uppercase rounded-2xl bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 transform active:scale-95 italic"
                  data-uropay-api-key={import.meta.env.VITE_UROPAY_API_KEY || "ENV_MISSING"}
                  data-uropay-button-id="ECHO559265"
                  data-uropay-environment="LIVE"
                  data-uropay-amount="750"
                >
                  Activate Premium
                </a>
              )}

              <div className="mt-12 space-y-6">
                {[
                  '50 GB SECURE STORAGE',
                  'BULK ARCHIVAL OPERATIONS',
                  'ADVANCED TIME ANALYTICS',
                  'WHATSAPP STATUS REPORTS',
                  'PRIORITY COMMAND SUPPORT',
                  'AND MUCH MORE'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 text-xs group-hover:translate-x-1 transition-transform">
                    <div className="p-1 rounded-lg bg-blue-500/20 text-blue-400">
                      <Check size={12} strokeWidth={4} />
                    </div>
                    <span className="text-zinc-300 font-bold uppercase tracking-widest text-[9px]">{feature}</span>
                  </div>
                ))}
                <div className="h-px bg-white/5" />
                <div className="flex items-center gap-4 text-xs text-zinc-700 italic font-medium">
                  <X size={14} className="text-zinc-800" />
                  ELITE_MODEL_UNRESTRICTED
                </div>
              </div>
            </motion.div>

            {/* PREMIUM + ELITE */}
            <motion.div
              variants={itemVariants}
              className="relative p-12 rounded-[4.5rem] bg-gradient-to-b from-emerald-500/[0.05] to-black border border-emerald-500/30 backdrop-blur-3xl shadow-[0_0_80px_rgba(16,185,129,0.15)] md:-translate-y-8 overflow-hidden group hover:border-emerald-500/50 transition-all duration-700"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 rounded-full bg-emerald-500 text-black text-[9px] font-black uppercase tracking-[0.4em] shadow-2xl z-20 italic">
                Most Powerful
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent)]" />

              <h3 className="text-xs font-black text-emerald-400 mb-6 flex items-center gap-3 tracking-[0.3em] uppercase italic">
                <BrainCircuit size={16} className="animate-pulse" /> Premium + Elite
              </h3>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-6xl font-black text-white italic tracking-tighter">₹1200</span>
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest italic">/ TWO MONTHS</span>
              </div>

              <p className="text-sm text-zinc-400 mb-10 h-10 font-medium italic leading-relaxed">The extra-ordinary Subscription Gives Full potential Of margdarshak. All systems unrestricted.</p>

              {['premium_elite', 'extra_plus', 'premium_plus'].includes(currentTier || '') ? (
                <div className="w-full py-6 rounded-2xl border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-black text-[10px] tracking-[0.3em] uppercase text-center italic cursor-default">
                  Active Instance
                </div>
              ) : (
                <a
                  href="#"
                  className="uropay-btn w-full block text-center py-6 text-[10px] font-black tracking-[0.3em] uppercase rounded-2xl bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 transform active:scale-95 italic"
                  data-uropay-api-key={import.meta.env.VITE_UROPAY_API_KEY || "ENV_MISSING"}
                  data-uropay-button-id="VICTOR148602"
                  data-uropay-environment="LIVE"
                  data-uropay-amount="1200"
                >
                  Activate Elite Tier
                </a>
              )}

              <div className="mt-12 space-y-6">
                <div className="flex items-center gap-4 text-xs group-hover:scale-105 transition-transform">
                  <div className="p-1 rounded-lg bg-emerald-500 text-black">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span className="text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] italic">Elite_Core (Managed Access)</span>
                </div>
                {[
                  'EVERYTHING IN PREMIUM',
                  'DEEP WEB ARCHIVAL RESEARCH',
                  'VISION_CORE ENABLED',
                  '500 GB CLOUD REPOSITORY',
                  'PREDICTIVE GRADE SYNTHESIS',
                  'NEURAL TIMETABLE GENERATOR',
                  'DEDICATED 24/7 SMART TUTOR',
                  'AND MUCH MORE'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 text-xs group-hover:translate-x-1 transition-transform">
                    <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Check size={12} strokeWidth={4} />
                    </div>
                    <span className="text-white font-bold uppercase tracking-widest text-[9px]">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

          </motion.div>

          {/* FAQ Architecture */}
          <div className="mt-40 max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-4">Technical <span className="text-emerald-500">FAQ</span></h2>
              <div className="h-1 w-24 bg-emerald-500/30 mx-auto rounded-full" />
            </div>
            <div className="grid grid-cols-1 gap-6">
              {[
                { q: "ONE-TIME ENCRYPTION FEE?", a: "No. Both Premium and Elite tiers are valid only for Two months. recurring should be after Two months only." },
                { q: "ELITE CORE FUNCTIONALITY?", a: "The Elite System utilizes our internal high-performance engine. You do not require external API keys; access is managed and unrestricted." },
                { q: "UPGRADE SUBSCRIPTION?", a: "Incremental upgrades from Premium to Elite are supported at any time. Contact the technical support team for re-adjustment." },
                { q: "DATA SECURITY?", a: "Absolute. We employ end-to-end encryption. Your academic intelligence remains your property, strictly segregated from external entities." }
              ].map((item, idx) => (
                <FaqItem key={idx} q={item.q} a={item.a} />
              ))}
            </div>
          </div>

          {/* Footer Terminal Actions */}
          <div className="mt-40 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] italic">MARGDARSHAK VERSION</p>
              <p className="text-sm font-bold text-white uppercase tracking-tighter">V3.0</p>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/contact">
                <Button variant="outline" className="h-14 px-8 border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                  Support Uplink
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};

const FaqItem = ({ q, a }: { q: string, a: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`border rounded-[2.5rem] transition-all duration-700 ${isOpen ? 'bg-white/[0.03] border-emerald-500/20' : 'bg-white/[0.01] border-white/5 hover:border-white/10'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-10 py-8 text-left"
      >
        <span className={`text-sm font-black tracking-widest transition-colors italic ${isOpen ? 'text-emerald-400' : 'text-zinc-500 uppercase'}`}>{q}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-emerald-500 text-black' : 'bg-white/5 text-zinc-600'}`}>
          <ChevronRight size={18} className={`transition-transform duration-500 ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="px-10 pb-8 text-md font-medium text-zinc-500 leading-relaxed italic border-t border-white/5 pt-8"
          >
            {a}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Upgrade;
