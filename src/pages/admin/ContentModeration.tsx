import AdminLayout from '@/components/admin/AdminLayout';
import { ThreatAlert } from '@/components/security/ThreatAlert';
import { Bell, Filter, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 uppercase italic">
              <Bell className="w-8 h-8 text-red-500" /> Content Filter
            </h2>
            <p className="text-sm font-bold text-zinc-500 tracking-wide mt-2">Review AI-flagged content and enforce community guidelines.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
            <Filter className="w-4 h-4" /> Filter Queue
          </button>
        </div>

        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-8 shadow-2xl relative overflow-hidden min-h-[400px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <h3 className="text-xl font-black text-white flex items-center gap-3 relative z-10 mb-6">
            <ShieldAlert className="w-6 h-6 text-red-500" /> Moderation Queue
          </h3>

          <div className="grid gap-6 relative z-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-zinc-500 gap-4 bg-black/20 rounded-3xl border border-white/5">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Queue...</p>
              </div>
            ) : moderationQueue.filter(item => item.status !== 'approved' && item.status !== 'deleted').length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-black/20 rounded-3xl border border-white/5 text-center">
                <CheckCircle2 className="w-10 h-10 mb-4 text-emerald-500" />
                <p className="text-sm font-bold tracking-widest uppercase text-emerald-400">Queue is Clear</p>
              </div>
            ) : (
              moderationQueue.filter(item => item.status !== 'approved' && item.status !== 'deleted').map((item) => (
                <div key={item.id} className="relative group">
                  <div className="absolute inset-0 bg-red-500/5 rounded-[2rem] blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="relative">
                    <ThreatAlert title={item.title} summary={item.summary} level={item.level} />
                    <div className="flex gap-2 mt-4 px-6 relative z-20">
                      <button 
                        onClick={() => handleAction(item.id, 'approve')}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                      >
                        Approve Content
                      </button>
                      <button 
                        onClick={() => handleAction(item.id, 'delete')}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                      >
                        Delete & Ban
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ContentModeration;
