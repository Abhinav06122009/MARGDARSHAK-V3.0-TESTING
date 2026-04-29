import AdminLayout from '@/components/admin/AdminLayout';
import { ThreatAlert } from '@/components/security/ThreatAlert';
import { Bell, Filter, ShieldAlert, Loader2, CheckCircle2, Activity, Sparkles, Zap, Trash2, Check } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ContentModeration = () => {
  const { moderationQueue, loading, refresh } = useAdmin();

  const handleAction = async (id: string, action: 'approve' | 'delete') => {
    try {
      const { error } = await supabase
        .from('moderation_queue')
        .update({ 
          status: action === 'approve' ? 'approved' : 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Content marked as ${action === 'approve' ? 'approved' : 'deleted'}`);
      refresh();
    } catch (error: any) {
      toast.error(`Failed to process moderation item: ${error.message}`);
    }
  };

  const activeQueue = moderationQueue.filter(item => item.status !== 'approved' && item.status !== 'deleted');

  return (
    <AdminLayout>
      <div className="space-y-16 py-6">
        
        {/* Page Header Architecture */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent pointer-events-none" />
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6 shadow-2xl"
            >
              <Bell className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Autonomous Moderation Hub Active</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">Content <span className="text-emerald-500">Filter</span></h2>
            <p className="text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase mt-4 opacity-60 italic">Review AI-flagged content and enforce global community integrity protocols.</p>
          </div>
          
          <button className="relative z-10 flex items-center gap-4 px-6 py-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-400 transition-all shadow-xl group">
            <Filter className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" /> Filter Queue
          </button>
        </div>

        {/* Moderation Queue Matrix */}
        <div className="rounded-[3.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-12 shadow-[0_60px_100px_-30px_rgba(0,0,0,0.9)] relative overflow-hidden group min-h-[500px]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                <ShieldAlert className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Vanguard <span className="text-emerald-500">Queue</span></h3>
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em] mt-2 opacity-60 italic">High-risk identities flagged by the neural detection subsystem.</p>
              </div>
            </div>
            <div className="px-5 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-[9px] font-black text-zinc-600 uppercase tracking-widest shadow-2xl">
              Queue Depth: {activeQueue.length} Units
            </div>
          </div>

          <div className="grid gap-10 relative z-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-24 text-zinc-700 gap-8 bg-black/20 rounded-[3rem] border border-white/5 shadow-inner">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 flex items-center justify-center">
                   <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 animate-pulse italic">Synchronizing Neural Queue...</p>
              </div>
            ) : activeQueue.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-24 bg-emerald-500/[0.02] rounded-[3rem] border border-emerald-500/10 text-center gap-8 group/secure"
              >
                <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 flex items-center justify-center shadow-2xl group-hover/secure:scale-110 transition-transform duration-700">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
                <div className="space-y-3">
                  <p className="text-2xl font-black text-white uppercase italic tracking-tighter">Queue Is <span className="text-emerald-500">Neutral</span></p>
                  <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.4em] italic">No flagged content requiring immediate orchestration.</p>
                </div>
              </motion.div>
            ) : (
              activeQueue.map((item, index) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, x: -30 }} 
                  whileInView={{ opacity: 1, x: 0 }} 
                  transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  className="relative group/item"
                >
                  <div className="absolute inset-0 bg-emerald-500/[0.01] rounded-[3.5rem] blur-xl opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none" />
                  <div className="relative bg-white/[0.01] border border-white/5 p-10 rounded-[3.5rem] shadow-2xl transition-all duration-700 group-hover/item:bg-white/[0.03] group-hover/item:border-emerald-500/20">
                    <ThreatAlert title={item.title} summary={item.summary} level={item.level} />
                    <div className="flex gap-6 mt-10 px-6 relative z-20">
                      <button 
                        onClick={() => handleAction(item.id, 'approve')}
                        className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-black border border-transparent rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.3em] italic transition-all hover:translate-y-[-4px] active:scale-95 shadow-2xl group/btn"
                      >
                        <Check className="w-4 h-4 group-hover/btn:scale-125 transition-transform" /> Authorize Content
                      </button>
                      <button 
                        onClick={() => handleAction(item.id, 'delete')}
                        className="flex items-center gap-3 px-8 py-4 bg-white/[0.02] hover:bg-red-500/10 text-zinc-500 hover:text-red-500 border border-white/5 hover:border-red-500/20 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.3em] italic transition-all hover:translate-y-[-4px] active:scale-95 shadow-2xl group/btn2"
                      >
                        <Trash2 className="w-4 h-4 group-hover/btn2:scale-125 transition-transform" /> Neutralize Unit
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ContentModeration;
