import React, { useState, useEffect, useContext } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from '@/contexts/AuthContext';
import { 
  LifeBuoy, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Loader2, 
  User, 
  Shield,
  Search,
  Mail,
  Zap,
  Clock,
  Fingerprint,
  Database,
  Activity,
  ChevronRight,
  RefreshCw,
  Terminal,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const SupportNexus = () => {
  const { tickets, loading, refresh } = useAdmin();
  const { user: currentUser } = useContext(AuthContext);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'escalated'>('all');
  const [lastSync, setLastSync] = useState(new Date());
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Sync Timer Logic
  useEffect(() => {
    if (!loading) setLastSync(new Date());
  }, [loading]);

  const role = (currentUser?.profile?.user_type || '').toLowerCase();
  const highCommandRoles = [
    'ceo', 'cto', 'cfo', 'coo', 'cmo', 'cio', 'cso', 'owner', 'co-founder',
    'aceo', 'acto', 'acfo', 'acoo', 'acmo', 'acio',
    'aeo', 'ato', 'afo', 'aoo', 'amo', 'aio', 'superadmin'
  ];
  const isHighCommand = highCommandRoles.includes(role);

  const fetchUserDetails = async (userId: string) => {
    if (!isHighCommand || !userId) return;
    setIsLoadingDetails(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setUserDetails(data);
    } catch (err) {
      console.error('Failed to fetch dossier:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (selectedTicket?.user_id) {
      fetchUserDetails(selectedTicket.user_id);
    } else {
      setUserDetails(null);
    }
  }, [selectedTicket]);

  const filteredTickets = tickets.filter(t => {
    if (filter === 'open') return t.status === 'open';
    if (filter === 'escalated') return t.status === 'escalated';
    return true;
  });

  const handleAction = async (action: 'respond' | 'resolve' | 'escalate') => {
    if (!selectedTicket) return;
    setIsProcessing(true);
    
    try {
      const table = selectedTicket.type === 'ticket' ? 'support_tickets' : 'contact_messages';
      let status = selectedTicket.status;
      
      if (action === 'resolve') status = 'completed';
      if (action === 'escalate') status = 'escalated';

      const { error } = await supabase
        .from(table)
        .update({ 
          status,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', selectedTicket.id);

      if (error) throw error;

      toast.success(`Mission Success: ${action.toUpperCase()} PROTOCOL COMPLETE`);
      setSelectedTicket(null);
      setResponse('');
      refresh();
    } catch (err: any) {
      toast.error('Mission failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen space-y-12 py-8">
        
        {/* NEXUS HEADER */}
        <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full shadow-2xl"
            >
              <LifeBuoy className="w-4 h-4 text-blue-500 animate-spin-slow" />
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic">
                {isHighCommand ? 'High-Command Overwatch Active' : 'Tactical Support Nexus Active'}
              </span>
            </motion.div>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
              Support <span className="text-blue-500">Nexus</span>
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-3 h-3 text-zinc-600 ${loading ? 'animate-spin text-blue-500' : ''}`} />
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Neural Pulse: {lastSync instanceof Date ? lastSync.toLocaleTimeString() : 'SYNCHRONIZING...'}</p>
              </div>
              <span className="text-zinc-800">|</span>
              <p className="text-[8px] font-black text-blue-500/50 uppercase tracking-[0.3em] italic">Grade: {role.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="flex items-center gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-2xl">
              {['all', 'open', 'escalated'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest italic transition-all ${
                    filter === f ? 'bg-blue-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* MAIN INTERFACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* TICKET FEED (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic ml-4">Signal Stream</h3>
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredTickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-6 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden ${
                    selectedTicket?.id === ticket.id 
                    ? 'bg-blue-500/10 border-blue-500/30' 
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${ticket.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        <h4 className="text-xs font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                          {ticket.subject || `${ticket.first_name || 'SIGNAL'} ${ticket.last_name || ''}`}
                        </h4>
                      </div>
                      <p className="text-[9px] text-zinc-600 line-clamp-1 italic">{ticket.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* COMMUNICATION HUB (6 cols) */}
          <div className="lg:col-span-6">
            <AnimatePresence mode="wait">
              {selectedTicket ? (
                <motion.div
                  key={selectedTicket.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="bg-[#050505] border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden"
                >
                  {/* TICKET HEADER */}
                  <div className="flex flex-col md:flex-row justify-between gap-8 pb-8 border-b border-white/5">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner">
                          <User size={24} />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                            {selectedTicket.subject || 'Inbound Signal'}
                          </h2>
                          <div className="flex items-center gap-3 mt-1">
                             <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">{selectedTicket.email}</p>
                             {isHighCommand && (
                               <span className="text-[8px] font-mono text-blue-500/30 uppercase tracking-tighter">{selectedTicket.user_id?.substring(0, 8)}...</span>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className={`px-4 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest italic ${
                        selectedTicket.status === 'open' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      }`}>
                        {selectedTicket.status} PROTOCOL
                      </span>
                      <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* USER MESSAGE */}
                  <div className="p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 relative group">
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-[#050505] border border-white/10 rounded-full text-[7px] font-black text-zinc-500 uppercase tracking-[0.3em]">Student Signal</div>
                    <p className="text-sm text-zinc-300 leading-relaxed italic">
                      "{selectedTicket.message}"
                    </p>
                  </div>

                  {/* OFFICER RESPONSE PANEL */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h4 className="text-[8px] font-black text-white uppercase tracking-[0.4em] italic flex items-center gap-2">
                        <Terminal size={12} className="text-blue-500" /> Response Terminal
                      </h4>
                    </div>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Establish communication protocol..."
                      className="w-full h-40 bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 text-white text-xs font-medium focus:outline-none focus:border-blue-500/50 transition-all placeholder-zinc-800 custom-scrollbar"
                    />
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction('respond')}
                          disabled={isProcessing || !response}
                          className="px-6 py-4 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all disabled:opacity-30 flex items-center gap-2"
                        >
                          <Send size={12} /> Transmit
                        </button>
                        <button
                          onClick={() => handleAction('resolve')}
                          disabled={isProcessing}
                          className="px-6 py-4 bg-blue-500 text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-30 flex items-center gap-2"
                        >
                          <CheckCircle2 size={12} /> Resolve
                        </button>
                      </div>
                      <button
                        onClick={() => handleAction('escalate')}
                        disabled={isProcessing}
                        className="px-6 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-30 flex items-center gap-2"
                      >
                        <ArrowUpRight size={12} /> Escalate
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 bg-white/[0.01] border border-white/5 border-dashed rounded-[4rem] text-center gap-6">
                   <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
                    <MessageSquare size={48} className="text-blue-500/20 relative z-10" />
                  </div>
                  <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em] italic">Awaiting tactical node selection</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* INTELLIGENCE PANE (3 cols) - High Command Only */}
          <div className="lg:col-span-3 space-y-8">
            {isHighCommand ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 px-4">
                  <Shield size={14} className="text-blue-500" />
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">Intelligence Dossier</h3>
                </div>

                <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
                  
                  {isLoadingDetails ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500/30" />
                    </div>
                  ) : userDetails ? (
                    <div className="space-y-6 relative z-10">
                      <div className="space-y-4">
                         <div className="flex flex-col gap-1">
                            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Full Identity</span>
                            <span className="text-xs font-black text-white uppercase italic">{userDetails.full_name || 'N/A'}</span>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Access Node</span>
                            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-tighter">{userDetails.student_id || 'NOT_SYNCED'}</span>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Account Grade</span>
                            <span className="text-[10px] font-black text-white uppercase italic">{userDetails.user_type || 'STANDARD'}</span>
                         </div>
                      </div>
                      
                      <div className="pt-6 border-t border-white/5 space-y-4">
                        <div className="flex items-center gap-2">
                          <Fingerprint size={12} className="text-zinc-700" />
                          <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Secure Handshake: OK</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity size={12} className="text-zinc-700" />
                          <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Latency: 24ms</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-[8px] font-black text-zinc-800 uppercase tracking-widest italic">Select a ticket to reveal student dossier.</p>
                    </div>
                  )}
                </div>

                <div className="p-6 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10 space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap size={12} className="text-blue-500" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Tactical Advantage</span>
                  </div>
                  <p className="text-[9px] text-zinc-500 italic leading-relaxed">
                    As High Command, your response bypasses front-line moderation. Use "Intervene" to take absolute control of this communication node.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="p-8 text-center opacity-20 grayscale scale-95 pointer-events-none border border-white/5 rounded-[3rem]">
                <Lock size={24} className="mx-auto mb-4" />
                <p className="text-[8px] font-black uppercase tracking-widest">Restricted Grade Intelligence</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SupportNexus;
