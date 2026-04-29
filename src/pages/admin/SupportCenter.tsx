import AdminLayout from '@/components/admin/AdminLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { LifeBuoy, Loader2, CheckCircle2, Clock, AlertCircle, Sparkles, Zap, MessageSquare, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const SupportCenter = () => {
  const { tickets, loading, refresh } = useAdmin();

  const activeTickets = tickets.filter(t => t.status !== 'completed');

  const handleComplete = async (id: string, type: 'contact' | 'ticket') => {
    try {
      const table = type === 'contact' ? 'contact_messages' : 'support_tickets';
      const { error } = await supabase
        .from(table)
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Ticket marked as completed');
      refresh();
    } catch (error: any) {
      toast.error(`Failed to complete ticket: ${error.message}`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-16 py-6">
        
        {/* Page Header Architecture */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] to-transparent pointer-events-none" />
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6 shadow-2xl"
            >
              <LifeBuoy className="w-4 h-4 text-blue-500 animate-spin-slow" />
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic">Communications Hub Active</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">Support <span className="text-emerald-500">Uplink</span></h2>
            <p className="text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase mt-4 opacity-60 italic">Orchestrating user escalations and mission-critical support flows.</p>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 shadow-2xl group">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest group-hover:text-emerald-500 transition-colors">{activeTickets.length} Active Missions</span>
            </div>
          </div>
        </div>

        {/* Content Matrix */}
        <div className="min-h-[600px] relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[500px] text-zinc-500 gap-8 bg-white/[0.01] border border-white/5 rounded-[4rem] backdrop-blur-3xl shadow-[0_60px_100px_-30px_rgba(0,0,0,0.9)]">
              <div className="w-24 h-24 bg-blue-500/10 rounded-[2.5rem] border border-blue-500/20 flex items-center justify-center shadow-2xl">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 animate-pulse italic">Synchronizing Neural Uplinks...</p>
            </div>
          ) : activeTickets.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-[500px] bg-white/[0.01] border border-white/5 rounded-[4rem] backdrop-blur-3xl shadow-[0_60px_100px_-30px_rgba(0,0,0,0.9)] text-center group"
            >
              <div className="w-32 h-32 rounded-[3rem] bg-emerald-500/10 flex items-center justify-center mb-10 border border-emerald-500/20 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              </div>
              <div className="space-y-3">
                <p className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Tactical <span className="text-emerald-500">Zero</span></p>
                <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.4em] italic">All communication channels cleared and secured.</p>
              </div>
            </motion.div>
          ) : (
            <div className="grid gap-8">
              {activeTickets.map((ticket, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  key={ticket.id} 
                  className="rounded-[3rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] backdrop-blur-3xl p-10 transition-all duration-700 group relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/[0.05] transition-colors duration-700" />
                  
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 relative z-10">
                    <div className="flex items-start gap-8 flex-1">
                      <div className="w-20 h-20 rounded-[2rem] bg-white/[0.02] border border-white/10 flex items-center justify-center flex-shrink-0 text-emerald-500 font-black italic text-3xl shadow-2xl group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all duration-700">
                        {ticket.type === 'ticket' ? <MessageSquare className="w-10 h-10" /> : (ticket.first_name?.[0]?.toUpperCase() || <AlertCircle className="w-10 h-10" />)}
                      </div>
                      <div className="space-y-6 flex-1">
                        <div className="space-y-2">
                          <div className="flex items-center gap-4 flex-wrap">
                            <h4 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none group-hover:text-emerald-400 transition-colors">
                              {ticket.type === 'ticket' ? ticket.subject : `${ticket.first_name} ${ticket.last_name}`}
                            </h4>
                            <span className={`px-4 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] italic ${ticket.type === 'ticket' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                              {ticket.type} protocol
                            </span>
                          </div>
                          <div className="flex items-center gap-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic opacity-70">
                            <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {new Date(ticket.created_at).toLocaleString()}</span>
                            {ticket.email && <span className="flex items-center gap-2 text-zinc-500"><Send className="w-3.5 h-3.5" /> {ticket.email}</span>}
                          </div>
                        </div>
                        <div className="bg-black/30 p-8 rounded-[2.5rem] border border-white/5 text-zinc-400 text-sm leading-relaxed font-medium italic group-hover:text-zinc-200 transition-colors shadow-inner">
                          {ticket.message}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row xl:flex-col items-center justify-end gap-6">
                      <div className={`px-6 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] italic transition-all duration-700 ${
                        ticket.status === 'open' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      }`}>
                        {ticket.status || 'pending'} signal
                      </div>
                      <button 
                        onClick={() => handleComplete(ticket.id, ticket.type)}
                        className="flex items-center gap-4 px-8 py-4 bg-white text-black hover:bg-emerald-500 hover:text-black border border-transparent rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.3em] italic transition-all hover:translate-y-[-4px] active:scale-95 shadow-2xl group/btn"
                      >
                        <CheckCircle2 className="w-4 h-4 group-hover/btn:scale-125 transition-transform" /> Mark Orchestrated
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SupportCenter;
