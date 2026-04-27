import AdminLayout from '@/components/admin/AdminLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { LifeBuoy, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const SupportCenter = () => {
  const { tickets, loading, refresh } = useAdmin();

  const activeTickets = tickets.filter(t => t.status !== 'completed');

  const handleComplete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
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
      <div className="space-y-10">
        <div className="border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 uppercase italic">
              <LifeBuoy className="w-8 h-8 text-indigo-500" /> Support Core
            </h2>
            <p className="text-sm font-bold text-zinc-500 tracking-wide mt-2">Manage incoming tickets and user escalation workflows.</p>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {activeTickets.length} Active
            </div>
          </div>
        </div>

        <div className="min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Syncing Communications...</p>
            </div>
          ) : activeTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-sm font-bold tracking-widest uppercase text-emerald-400">Inbox Zero</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeTickets.map((ticket, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={ticket.id} 
                  className="rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-3xl p-5 transition-colors group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
                  
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold uppercase">
                        {ticket.first_name?.[0] || <AlertCircle className="w-5 h-5" />}
                      </div>
                      <div className="max-w-2xl">
                        <p className="text-sm font-bold text-white tracking-wide">{ticket.first_name} {ticket.last_name} <span className="text-zinc-500 font-normal">({ticket.email})</span></p>
                        <p className="text-[10px] font-mono text-zinc-500 mt-1 mb-2 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> {new Date(ticket.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm text-zinc-300 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">{ticket.message}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <span className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest text-center whitespace-nowrap">
                        {ticket.status || 'open'}
                      </span>
                      <button 
                        onClick={() => handleComplete(ticket.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Mark Completed
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
