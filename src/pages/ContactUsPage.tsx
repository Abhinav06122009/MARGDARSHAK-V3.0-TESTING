import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, MapPin, Phone, MessageSquare, ArrowLeft,
  Send, Loader2, Globe, Shield, Zap, Sparkles,
  Headphones, LifeBuoy, Users, ChevronRight,
  Twitter, Facebook, Linkedin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
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

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) {
      toast.error("Required fields missing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        message: formData.message,
        status: 'pending'
      });

      if (error) throw error;
      toast.success("Received", { description: "Our team will reach out shortly." });
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
    } catch (error: any) {
      console.error('Error:', error);
      const mailtoLink = `mailto:abhinavjha393@gmail.com?subject=Contact from ${formData.firstName}&body=${encodeURIComponent(formData.message)}`;
      window.location.href = mailtoLink;
      toast.info("Database Latency", { description: "Opening secondary mail channel." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col relative overflow-hidden font-sans selection:bg-indigo-500/30">

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 mix-blend-overlay" />
      </div>

      {/* Nav */}
      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-3xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Logo" className="h-8 w-8 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-transform group-hover:scale-110" />
            <span className="font-black text-xl tracking-tighter text-white">MARGDARSHAK</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="text-zinc-500 hover:text-white gap-2 font-black text-[10px] tracking-widest uppercase rounded-xl">
              <ArrowLeft className="w-4 h-4" /> Return Home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-6 py-24 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-start">

            {/* Left: Info & Branding */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.3em] text-indigo-400 mb-8 uppercase backdrop-blur-md">
                <Sparkles className="w-3 h-3" /> Communication Portal
              </div>
              <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
                <span className="bg-gradient-to-r from-white via-indigo-200 to-zinc-500 bg-clip-text text-transparent">Contact Us</span>
              </h1>
              <p className="text-zinc-500 text-xl font-medium max-w-md leading-relaxed mb-16">
                Connect With VSAV GYANTAPA Team
              </p>

              <div className="grid sm:grid-cols-2 gap-8">
                {[
                  { icon: Mail, label: 'Support Email', value: 'support@margdarshan.tech', color: 'text-indigo-400' },
                  { icon: MapPin, label: 'Headquarters', value: 'Chennai, India', color: 'text-purple-400' },
                  { icon: Headphones, label: 'Support', value: '24/7 Availability', color: 'text-emerald-400' },
                  { icon: Globe, label: 'Network', value: 'Global Reach', color: 'text-amber-400' }
                ].map((item, i) => (
                  <div key={i} className="space-y-3 group">
                    <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${item.color} group-hover:bg-white/10 transition-all`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{item.label}</h4>
                      <p className="text-sm font-bold text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Indicator */}
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] -z-10 rounded-full opacity-50" />
              <div className="bg-zinc-950/50 backdrop-blur-3xl border border-white/5 p-10 md:p-12 rounded-[3.5rem] shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">NAME: First</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">NAME: Last</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">E_MAIL Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Message</label>
                    <textarea
                      rows={5}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700 resize-none"
                      placeholder="detailed message..."
                    ></textarea>
                  </div>

                  <Button
                    disabled={isSubmitting}
                    className="w-full h-20 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-3xl hover:bg-zinc-200 transition-all disabled:opacity-50 relative overflow-hidden group"
                  >
                    <AnimatePresence mode="wait">
                      {isSubmitting ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-3"
                        >
                          <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="ready"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-3"
                        >
                          Contact <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default ContactUsPage;
