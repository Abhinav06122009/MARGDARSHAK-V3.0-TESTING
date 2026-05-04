import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdmin, SupportTicket } from '@/hooks/useAdmin';
import { 
  ShieldCheck, 
  Search, 
  Zap, 
  Terminal, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  User,
  ArrowUpRight,
  ShieldAlert,
  RefreshCw,
  Crown,
  Activity,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PremiumIDCard from '@/components/settings/PremiumIDCard';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

const SupportNexus = () => {
  const { tickets, loading, refresh } = useAdmin();
  const { user } = useContext(AuthContext);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Nexus only focuses on escalated or high-priority items
  const escalatedTickets = tickets.filter(t => t.status === 'escalated' || t.status === 'pending');

  const handleExecutiveDispatch = (ticket: SupportTicket) => {
    const officialName = user?.fullName || 'High-Command Official';
    const rank = (user?.profile?.user_type || 'Officer').toUpperCase();
    
    toast.success('EXECUTIVE DISPATCH FINALIZED', {
      description: `Direct mailing from dev@margdarshan.tech. Signed by: ${officialName} [${rank}] | VSAV GYANTAPA`,
      duration: 6000,
      className: "bg-black border-emerald-500/50 text-emerald-400 font-black",
    });
    
    setTimeout(() => refresh(), 1000);
  };

  const handleOverride = (ticket: SupportTicket) => {
    toast.warning('PROTOCOL OVERRIDE ACTIVE', {
      description: `High-Command has assumed direct control of Ticket #${ticket.id.slice(0, 8)}.`,
    });
    setTimeout(() => refresh(), 1000);
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

            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
               <div className="flex items-center gap-3">
                 <Terminal className="w-4 h-4 text-emerald-500" />
                 <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Nexus Console</h3>
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
                    className="group bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 rounded-[2rem] p-8 transition-all hover:bg-white/[0.04]"
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                           <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[8px] font-black tracking-widest uppercase">Escalated</Badge>
                           <h3 className="text-lg font-black text-white uppercase tracking-widest">{ticket.subject}</h3>
                        </div>
                        <p className="text-sm text-zinc-400 font-medium leading-relaxed italic">"{ticket.message}"</p>
                        <div className="flex items-center gap-6 pt-2">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <User className="w-4 h-4 text-zinc-500" />
                              </div>
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">{ticket.first_name} {ticket.last_name}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-zinc-700" />
                              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{ticket.email}</span>
                           </div>
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-3 justify-center">
                        <Button 
                          onClick={() => handleExecutiveDispatch(ticket)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[9px] h-14 px-8 rounded-2xl shadow-xl shadow-emerald-500/20"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Executive Dispatch
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleOverride(ticket)}
                          className="bg-white/5 border-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-[9px] h-14 px-8 rounded-2xl"
                        >
                          <ShieldAlert className="w-4 h-4 mr-2" />
                          Override Protocol
                        </Button>
                      </div>
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
