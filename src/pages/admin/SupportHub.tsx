import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdmin, SupportTicket } from '@/hooks/useAdmin';
import { 
  LifeBuoy, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Mail,
  User,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { emailService } from '@/services/email-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PremiumIDCard from '@/components/settings/PremiumIDCard';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

const SupportHub = () => {
  const { tickets = [], loading, refresh, resolveTicket, escalateTicket } = useAdmin();
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved' | 'escalated'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionResponse, setResolutionResponse] = useState('');

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setResolutionResponse(ticket.resolution_text || '');
  };

  const filteredTickets = (tickets || []).filter(ticket => {
    const matchesSearch = 
      (ticket.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.message || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleResolve = async (ticket: SupportTicket) => {
    if (!resolutionResponse) {
      toast.error('Tactical Error', { description: 'Resolution notes required for dispatch.' });
      return;
    }

    try {
      const officialName = user?.fullName || 'Official Sentinel';
      const rank = (user?.profile?.user_type || 'Officer').toUpperCase();
      
      // Update Database with Resolution Text First
      await resolveTicket(ticket.id, ticket.type, resolutionResponse);

      // Automated API Dispatch Bridge (Resend)
      const subject = `RE: ${ticket.subject || 'Support Inquiry'} [RESOLVED]`;
      const htmlBody = `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #f0f0f0; border-radius: 24px; overflow: hidden; color: #111827;">
          <div style="padding: 40px 20px; text-align: center; background: #fafafa; border-bottom: 1px solid #f0f0f0;">
            <img src="https://margdarshan.tech/logo.png" alt="Margdarshak" style="width: 64px; height: 64px; margin-bottom: 16px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; color: #059669; text-transform: uppercase;">Query Resolution</h1>
          </div>
          
          <div style="padding: 40px; line-height: 1.6;">
            <p style="margin-top: 0; font-size: 16px; color: #4b5563;">Hello,</p>
            <p style="font-size: 16px; color: #4b5563;">Your inquiry regarding <strong>"${ticket.subject || 'Support Request'}"</strong> has been resolved by our support team.</p>
            
            <div style="margin: 32px 0; padding: 24px; background: #f9fafb; border-radius: 16px; border: 1px solid #f3f4f6;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">Resolution</p>
              <p style="margin: 0; font-size: 15px; color: #1f2937;">${resolutionResponse}</p>
            </div>

            <div style="border-top: 1px solid #f3f4f6; padding-top: 32px; margin-top: 32px;">
              <p style="margin: 0; font-size: 14px; font-weight: 700; color: #111827;">${officialName}</p>
              <p style="margin: 2px 0 0 0; font-size: 12px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.025em;">${rank}</p>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">VSAV GYANTAPA SUPPORT TEAM</p>
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

      const result = await emailService.sendDirect({
        to: ticket.email,
        from: 'support@margdarshan.tech',
        subject,
        html: htmlBody
      });

      if (result.success) {
        toast.success('AUTOMATED DISPATCH SUCCESSFUL', {
          description: `Strategic resolution transmitted to ${ticket.email} via direct API.`,
        });
      } else {
        // Fallback to Mailto Protocol if API fails
        console.warn('Falling back to mailto protocol...');
        const mailtoSubject = encodeURIComponent(subject);
        const mailtoBody = encodeURIComponent(
          `QUERY RESOLUTION:\n${resolutionResponse}\n\nSigned by: ${officialName} [${rank}]`
        );
        window.location.href = `mailto:${ticket.email}?subject=${mailtoSubject}&body=${mailtoBody}`;
        
        toast.info('MANUAL DISPATCH REQUIRED', {
          description: `Direct API transmission paused. External mail application initialized.`,
        });
      }
      
    } catch (error: any) {
      console.error('❌ [EMAIL-SERVICE] Critical failure:', error);
      
      if (error.message?.includes('verify a domain')) {
        toast.error('DOMAIN VERIFICATION REQUIRED', {
          description: 'Resend is in Sandbox Mode. Please verify margdarshan.tech at resend.com/domains to send to external users.',
          duration: 6000
        });
      } else {
        toast.error('DISPATCH FAILURE', { 
          description: error.message || 'Could not synchronize resolution status.' 
        });
      }
      
      // Fallback to mailto protocol
      console.warn('Falling back to mailto protocol...');
      const officialName = user?.fullName || 'Official Sentinel';
      const rank = (user?.profile?.user_type || 'Officer').toUpperCase();
      const subject = `RE: ${ticket.subject || 'Support Inquiry'} [RESOLVED]`;
      const mailtoSubject = encodeURIComponent(subject);
      const mailtoBody = encodeURIComponent(
        `OFFICIAL RESOLUTION:\n${resolutionResponse}\n\nSigned by: ${officialName} [${rank}]`
      );
      window.location.href = `mailto:${ticket.email}?subject=${mailtoSubject}&body=${mailtoBody}`;
    } finally {
      setResolutionResponse('');
      setSelectedTicket(null);
    }
  };

  const handleEscalate = async (ticket: SupportTicket) => {
    if (!resolutionResponse) {
      toast.error('Tactical Error', { description: 'Escalation notes required for routing.' });
      return;
    }

    try {
      const officialName = user?.fullName || 'Official Sentinel';
      const rank = (user?.profile?.user_type || 'Officer').toUpperCase();

      // 1. Update Database Status & Resolution (Escalation) Text
      await escalateTicket(ticket.id, ticket.type, resolutionResponse);

      // 2. Automated API Dispatch Bridge (Resend)
      const subject = `ALERT: ${ticket.subject || 'Support Inquiry'} [ESCALATED]`;
      const htmlBody = `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #f0f0f0; border-radius: 24px; overflow: hidden; color: #111827;">
          <div style="padding: 40px 20px; text-align: center; background: #fafafa; border-bottom: 1px solid #f0f0f0;">
            <img src="https://margdarshan.tech/logo.png" alt="Margdarshak" style="width: 64px; height: 64px; margin-bottom: 16px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; color: #f59e0b; text-transform: uppercase;">Ticket Escalated</h1>
          </div>
          
          <div style="padding: 40px; line-height: 1.6;">
            <p style="margin-top: 0; font-size: 16px; color: #4b5563;">Hello,</p>
            <p style="font-size: 16px; color: #4b5563;">Your inquiry regarding <strong>"${ticket.subject || 'Support Request'}"</strong> has been escalated for high-level review.</p>
            
            <div style="margin: 32px 0; padding: 24px; background: #fffbeb; border-radius: 16px; border: 1px solid #fef3c7;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 0.05em;">Escalation Notes</p>
              <p style="margin: 0; font-size: 15px; color: #92400e;">${resolutionResponse}</p>
            </div>

            <div style="border-top: 1px solid #f3f4f6; padding-top: 32px; margin-top: 32px;">
              <p style="margin: 0; font-size: 14px; font-weight: 700; color: #111827;">${officialName}</p>
              <p style="margin: 2px 0 0 0; font-size: 12px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.025em;">${rank}</p>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">VSAV GYANTAPA SUPPORT TEAM</p>
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
        to: ticket.email,
        from: 'support@margdarshan.tech',
        subject,
        html: htmlBody
      });

      toast.info('ESCALATION PROTOCOL ACTIVE', {
        description: `Ticket #${ticket.id.slice(0, 8)} has been routed to the Nexus with your official notes.`,
      });
      setResolutionResponse('');
      setSelectedTicket(null);
    } catch (err) {
      toast.error('ESCALATION FAILURE', { description: 'Could not route ticket to Nexus.' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-20">
        {/* Tactical Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <LifeBuoy className="w-5 h-5 text-emerald-500" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Support Hub</h1>
            </div>
            <p className="text-zinc-500 text-sm font-medium tracking-wide">Class C Operational Zone | Issue Management & Dispatches</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Support Uplink Active</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refresh()}
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl h-10 gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync Matrix
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Matrix */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="SEARCH TICKETS, EMAILS, OR LOGS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-emerald-500/30 transition-all placeholder-zinc-800"
                />
              </div>
              <div className="flex items-center gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-2xl">
                {(['all', 'pending', 'resolved', 'escalated'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      filterStatus === status 
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                        : 'text-zinc-600 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredTickets.map((ticket, index) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`group p-6 bg-white/[0.02] border rounded-3xl cursor-pointer transition-all hover:bg-white/[0.04] ${
                      selectedTicket?.id === ticket.id ? 'border-emerald-500/30 bg-white/[0.05]' : 'border-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl ${
                          ticket.status === 'resolved' ? 'bg-emerald-500/10' : 
                          ticket.status === 'escalated' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                        }`}>
                          {ticket.status === 'resolved' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : ticket.status === 'escalated' ? (
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1 group-hover:text-emerald-400 transition-colors">
                            {ticket.subject || 'UNTITLED INCIDENT'}
                          </h3>
                          <div className="flex items-center gap-3 text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {ticket.first_name} {ticket.last_name}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-800" />
                            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {ticket.email}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`uppercase text-[8px] font-black tracking-widest px-3 py-1 rounded-lg ${
                        ticket.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        ticket.status === 'escalated' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {ticket.status || 'pending'}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Action Panel */}
          <div className="space-y-8">
            {/* Class C Identity Node */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative z-10 scale-[0.85] -mx-10 -my-6">
                 {user && user.profile && (
                   <PremiumIDCard 
                     user={user as any} 
                     fullName={user.fullName || ''} 
                     setFullName={() => {}} 
                     studentId={user.profile?.id?.slice(0,8) || '0000'} 
                     setStudentId={() => {}} 
                     isSubmitting={false} 
                     onSubmit={() => {}} 
                     onRefresh={() => {}} 
                   />
                 )}
              </div>
            </div>

            {/* Ticket Details / Actions */}
            <AnimatePresence mode="wait">
              {selectedTicket ? (
                <motion.div
                  key={selectedTicket.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] italic">Incident Dossier</h2>
                    <button onClick={() => setSelectedTicket(null)} className="text-zinc-600 hover:text-white transition-colors">
                      <ArrowUpRight className="w-4 h-4 rotate-45" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
                      <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 italic">User Message</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                        "{selectedTicket.message}"
                      </p>
                    </div>

                    {selectedTicket.status !== 'pending' && selectedTicket.resolution_text && (
                      <div className="p-5 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl">
                        <h4 className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2 italic">Archived Resolution</h4>
                        <p className="text-[11px] text-zinc-300 leading-relaxed font-bold">
                          "{selectedTicket.resolution_text}"
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1 italic">Official Resolution / Response</label>
                      <textarea
                        rows={4}
                        value={resolutionResponse}
                        onChange={(e) => setResolutionResponse(e.target.value)}
                        placeholder="WRITE OFFICIAL RESOLUTION OR ESCALATION NOTES..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-[11px] font-medium text-white placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/30 transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        onClick={() => handleResolve(selectedTicket)}
                        disabled={!resolutionResponse}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[9px] rounded-2xl h-14 shadow-xl shadow-emerald-500/10 disabled:opacity-30"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Resolve & Mail
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleEscalate(selectedTicket)}
                        className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[9px] rounded-2xl h-14"
                      >
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Escalate
                      </Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Metadata Hash</h3>
                    <div className="font-mono text-[8px] text-zinc-500 break-all p-3 bg-black/40 rounded-xl">
                      REF_{selectedTicket.id.toUpperCase()}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white/[0.02] border border-white/5 border-dashed rounded-[2.5rem] p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/[0.03] rounded-3xl flex items-center justify-center mx-auto border border-white/5">
                    <LifeBuoy className="w-8 h-8 text-zinc-700 opacity-30" />
                  </div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Select an incident to initialize protocol</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SupportHub;
