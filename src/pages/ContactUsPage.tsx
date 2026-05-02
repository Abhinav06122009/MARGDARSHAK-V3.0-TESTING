import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, MapPin, Phone, MessageSquare, ArrowLeft,
  Send, Loader2, Globe, Shield, Zap, Sparkles,
  Headphones, LifeBuoy, Users, ChevronRight,
  Twitter, Facebook, Linkedin, Cpu, Command, Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { ScrollArea } from '@/components/ui/scroll-area';
import logo from "@/components/logo/logo.png";

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
      const { error } = await (supabase.from('contact_messages' as any) as any).insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        message: formData.message,
        status: 'pending'
      });

      if (error) throw error;
      toast.success("Message Sent", { description: "Our Technocal support team will reach out shortly." });
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
    } catch (error: any) {
      console.error('Error:', error);
      const mailtoLink = `mailto:support@margdarshan.tech?subject=Contact from ${formData.firstName}&body=${encodeURIComponent(formData.message)}`;
      window.location.href = mailtoLink;
      toast.info("Database Latency Detected", { description: "Opening secondary mail channel." });
    } finally {
      setIsSubmitting(false);
    }
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
              <h1 className="text-xl font-black italic tracking-tighter uppercase">Margdarshak <span className="text-emerald-500">Contact</span></h1>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="text-zinc-500 hover:text-white font-black text-[10px] tracking-widest uppercase gap-3 hover:bg-white/5 rounded-2xl transition-all">
                <ArrowLeft size={14} /> Hub Return
              </Button>
            </Link>
          </nav>

          <div className="grid lg:grid-cols-2 gap-24 items-start">
            {/* Left: Info Grid */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-16"
            >
              <div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black tracking-widest text-emerald-400 uppercase italic mb-10"
                >
                  <Command size={10} /> Operational Support Channel
                </motion.div>
                <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter uppercase leading-[0.9] italic">
                  Command <br /> <span className="text-emerald-500">Center</span>
                </h2>
                <p className="text-zinc-500 text-xl font-medium max-w-md leading-relaxed italic border-l-2 border-emerald-500/20 pl-8">
                  Connect with the <span className="text-white">VSAV GYANTAPA</span> strategic operations team for technical support, partnerships, or elite feedback.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-12">
                {[
                  { icon: Mail, label: 'Tactical Email', value: 'support@margdarshan.tech', color: 'text-emerald-400' },
                  { icon: MapPin, label: 'Deployment Hub', value: 'Chennai, India', color: 'text-blue-400' },
                  { icon: Headphones, label: 'Response Time', value: '< 12 Hours', color: 'text-amber-400' },
                  { icon: Shield, label: 'Security Status', value: 'All Systems Nominal', color: 'text-rose-400' }
                ].map((item, i) => (
                  <div key={i} className="group flex flex-col gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center ${item.color} group-hover:scale-110 group-hover:bg-white/[0.06] transition-all duration-500 shadow-2xl`}>
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1 italic">{item.label}</h4>
                      <p className="text-sm font-bold text-white tracking-tight uppercase">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Contact Matrix */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-emerald-500/10 blur-[120px] rounded-full opacity-30 -z-10" />
              <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-12 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />

                <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 italic">FIRST_NAME</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-white text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-800"
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 italic">LAST_NAME</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-white text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-800"
                        placeholder="Charles"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 italic">EMAIL</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-white text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-800"
                      placeholder="abc@margdarshan.tech"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 italic">MESSAGE</label>
                    <textarea
                      rows={5}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-white text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-800 resize-none min-h-[160px]"
                      placeholder="ENTER DETAILED LOGS..."
                    ></textarea>
                  </div>

                  <Button
                    disabled={isSubmitting}
                    className="w-full h-24 bg-white text-black font-black uppercase text-xs tracking-[0.4em] rounded-[2rem] hover:bg-zinc-200 transition-all disabled:opacity-50 relative overflow-hidden group shadow-2xl"
                  >
                    <AnimatePresence mode="wait">
                      {isSubmitting ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-4"
                        >
                          <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="ready"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-4 group-hover:scale-110 transition-transform"
                        >
                          Send Now <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ContactUsPage;
