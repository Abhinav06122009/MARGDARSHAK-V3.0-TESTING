import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdmin, SupportTicket } from '@/hooks/useAdmin';
import {
  ShieldCheck,
  Zap,
  Terminal,
  CheckCircle2,
  Mail,
  User,
  ShieldAlert,
  RefreshCw,
  Crown,
  Activity,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PremiumIDCard from '@/components/settings/PremiumIDCard';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { emailService } from '@/services/email-service';

const SupportNexus = () => {
  const { tickets, loading, refresh, resolveTicket, saveResolution } = useAdmin();
  const { user } = useContext(AuthContext);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Nexus only focuses on escalated or high-priority items
  const escalatedTickets = (tickets || []).filter(t => t.status === 'escalated' || (t.status === 'pending' && t.type === 'ticket'));

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setResolutionText(ticket.resolution_text || '');
  };

  const handleExecutiveDispatch = async (ticket: SupportTicket) => {
    if (!resolutionText) {
      toast.error('Tactical Error', { description: 'Resolution notes required for executive dispatch.' });
      return;
    }

    try {
      const officialName = user?.fullName || 'High-Command Official';
      const rank = (user?.profile?.user_type || 'Officer').toUpperCase();

      // 1. Resolve in Database using the translated UUID from profile
      await resolveTicket(ticket.id, ticket.type, resolutionText, user?.profile?.id || ticket.id);

      // 2. Dispatch Email
      const subject = `EXECUTIVE RESOLUTION: ${ticket.subject}`;
      const htmlBody = `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #f0f0f0; border-radius: 24px; overflow: hidden; color: #111827;">
          <div style="padding: 40px 20px; text-align: center; background: #fafafa; border-bottom: 1px solid #f0f0f0;">
            <img src="https://margdarshan.tech/logo.png" alt="Margdarshak" width="120" style="display: block; margin: 0 auto 16px auto; border: none; outline: none; text-decoration: none;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.025em; color: #059669; text-transform: uppercase;">Executive Resolution</h1>
          </div>
          
          <div style="padding: 40px; line-height: 1.6;">
            <p style="margin-top: 0; font-size: 15px; color: #4b5563;">Hello,</p>
            
            <div style="margin: 24px 0; padding: 20px; background: #f9fafb; border-radius: 16px; border: 1px solid #f3f4f6;">
              <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">Incident Context</p>
              <p style="margin: 0; font-size: 14px; color: #4b5563; font-style: italic;">"${ticket.message || 'No message provided'}"</p>
            </div>

            <div style="margin: 24px 0; padding: 20px; background: #ecfdf5; border-radius: 16px; border: 1px solid #d1fae5;">
              <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.05em;">High-Command Decision</p>
              <p style="margin: 0; font-size: 15px; color: #064e3b; font-weight: 500;">${resolutionText}</p>
            </div>

            <div style="border-top: 1px solid #f3f4f6; padding-top: 24px; margin-top: 32px;">
              <p style="margin: 0; font-size: 14px; font-weight: 700; color: #111827;">${officialName}</p>
              <p style="margin: 2px 0 0 0; font-size: 12px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.025em;">${rank}</p>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">VSAV GYANTAPA EXECUTIVE NEXUS</p>
            </div>
          </div>

          <div style="padding: 40px 20px; background: #050505; text-align: center; color: #9ca3af;">
            <div style="margin-bottom: 24px;">
              <a href="https://www.instagram.com/vsavgyantapa/" style="display: inline-block; margin: 0 12px; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600;">Instagram</a>
              <a href="https://x.com/gyantappas" style="display: inline-block; margin: 0 12px; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600;">Twitter</a>
              <a href="https://www.facebook.com/profile.php?id=61584618795158" style="display: inline-block; margin: 0 12px; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600;">Facebook</a>
            </div>
            <p style="margin: 0; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;">© 2026 MARGDARSHAK</p>
            <p style="margin: 4px 0 0 0; font-size: 9px; color: #4b5563;">POWERED BY VSAV GYANTAPA</p>
          </div>
        </div>
      `;

      await emailService.sendDirect({
        to: ticket.email || '',
        from: 'support@margdarshan.tech',
        subject,
        html: htmlBody
      });

      toast.success('EXECUTIVE DISPATCH FINALIZED', {
        description: `Direct mailing transmitted. Signed by: ${officialName} [${rank}]`,
        className: "bg-black border-emerald-500/50 text-emerald-400 font-black",
      });

      setSelectedTicket(null);
      setResolutionText('');
      refresh();
    } catch (error) {
      toast.error('DISPATCH FAILURE', { description: 'Could not synchronize executive override.' });
    }
  };

  const handleSaveDraft = async (ticket: SupportTicket) => {
    try {
      await saveResolution(ticket.id, ticket.type, resolutionText);
      toast.success('NEXUS DRAFT SAVED', { description: 'Resolution draft persisted to high-command matrix.' });
    } catch (error) {
      toast.error('SYNC FAILURE', { description: 'Could not save resolution to nexus.' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-20">
        {/* Nexus Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500 text-black rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <Crown className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Support Nexus</h1>
            </div>
            <p className="text-emerald-500/60 text-sm font-black tracking-[0.2em] uppercase italic">High-Command Operational Node | Executive Overrides</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 px-6 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
              <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest">Nexus Load</span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol 3.0.5 Active</span>
              </div>
            </div>
            <Button
              onClick={() => refresh()}
              className="bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl h-12 gap-2 font-black tracking-widest uppercase shadow-xl shadow-emerald-500/20"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync Matrix
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* High Command identity */}
          <div className="lg:col-span-1 space-y-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative">
                {user && (
                  <PremiumIDCard
                    user={user}
                    fullName={user.fullName || ''}
                    setFullName={() => { }}
                    studentId={user.profile?.id?.slice(0, 8) || '0000'}
                    setStudentId={() => { }}
                    isSubmitting={false}
                    onSubmit={() => { }}
                    onRefresh={() => { }}
                  />
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {selectedTicket ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Resolution Console</h3>
                    <button onClick={() => setSelectedTicket(null)} className="text-zinc-600 hover:text-white">
                      <ArrowUpRight className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                      <p className="text-[10px] text-zinc-500 mb-2 font-bold uppercase tracking-widest italic">Incident Description</p>
                      <p className="text-xs text-zinc-300 leading-relaxed italic">"{selectedTicket.message}"</p>
                    </div>

                    <textarea
                      rows={6}
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="ENTER EXECUTIVE RESOLUTION..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xs font-medium text-white placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/30 transition-all resize-none"
                    />

                    <div className="space-y-3 pt-2">
                      <Button
                        onClick={() => handleExecutiveDispatch(selectedTicket)}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[9px] h-14 rounded-2xl shadow-xl shadow-emerald-500/20"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Execute Dispatch
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSaveDraft(selectedTicket)}
                        className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[9px] h-12 rounded-2xl"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" />
                        Save Nexus Draft
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Nexus Status</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">Escalated Tickets</span>
                      <span className="text-xs font-black text-emerald-500">{escalatedTickets.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">System Integrity</span>
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Incident Management Matrix */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                <Layers className="w-4 h-4 text-emerald-500" />
                Escalated Incident Matrix
              </h2>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {escalatedTickets.length > 0 ? escalatedTickets.map((ticket, index) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`group bg-white/[0.02] border cursor-pointer rounded-[2rem] p-8 transition-all hover:bg-white/[0.04] ${
                      selectedTicket?.id === ticket.id ? 'border-emerald-500/30 bg-white/[0.05]' : 'border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-8">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[8px] font-black tracking-widest uppercase">Escalated</Badge>
                          <h3 className="text-lg font-black text-white uppercase tracking-widest group-hover:text-emerald-400 transition-colors">{ticket.subject}</h3>
                        </div>
                        <p className="text-sm text-zinc-400 font-medium leading-relaxed italic">"{ticket.message}"</p>
                        <div className="flex items-center gap-6 pt-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-zinc-700" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{ticket.first_name} {ticket.last_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-zinc-700" />
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{ticket.email}</span>
                          </div>
                        </div>
                      </div>
                      <ShieldAlert className={`w-8 h-8 transition-all ${selectedTicket?.id === ticket.id ? 'text-emerald-500 opacity-100' : 'text-zinc-800 opacity-20'}`} />
                    </div>
                  </motion.div>
                )) : (
                  <div className="py-20 text-center space-y-6 bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
                    <div className="w-20 h-20 bg-emerald-500/5 rounded-full flex items-center justify-center mx-auto border border-emerald-500/10">
                      <ShieldCheck className="w-10 h-10 text-emerald-500/20" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-black text-white uppercase tracking-[0.4em]">All Sectors Secured</p>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">No escalated incidents detected in nexus uplink</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SupportNexus;
