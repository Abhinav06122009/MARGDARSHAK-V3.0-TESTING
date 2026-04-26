import AdminLayout from '@/components/admin/AdminLayout';
import EvidenceViewer from '@/components/admin/EvidenceViewer';
import ActionButtons from '@/components/admin/ActionButtons';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { FileSearch, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const ReportsInvestigation = () => {
  const { reports, loading, refresh } = useAdmin();

  const handleAction = async (id: string, action: 'resolve' | 'escalate') => {
    try {
      const { error } = await supabase
        .from('admin_reports')
        .update({ status: action === 'resolve' ? 'resolved' : 'escalated' })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Report marked as ${action === 'resolve' ? 'resolved' : 'escalated'}`);
      refresh();
    } catch (error: any) {
      toast.error(`Failed to update report: ${error.message}`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 uppercase italic">
              <FileSearch className="w-8 h-8 text-red-500" /> Investigations
            </h2>
            <p className="text-sm font-bold text-zinc-500 tracking-wide mt-2">Review reports, compile evidence, and close cases.</p>
          </div>
          <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <AlertCircle className="w-4 h-4" /> Action Required: {reports.filter(r => r.status !== 'resolved').length} Open
          </div>
        </div>

        <div className="min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Case Files...</p>
            </div>
          ) : reports.filter(r => r.status !== 'resolved').length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-sm font-bold tracking-widest uppercase text-emerald-400">No Open Reports</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {reports.filter(r => r.status !== 'resolved').map((report, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: index * 0.1 }}
                  key={report.id} 
                  className="rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-6 shadow-xl relative overflow-hidden group hover:bg-white/[0.03] transition-colors"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-red-500/10 transition-colors" />
                  
                  <div className="flex flex-col space-y-6 relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="px-2 py-1 bg-white/5 rounded border border-white/10 inline-block mb-3">
                          <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">ID: {report.id}</p>
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500" /> {report.category.replace(/_/g, ' ')}
                        </h3>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                        report.severity === 'high' || report.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {report.severity || 'unknown'}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                      <EvidenceViewer title="Investigation Log" details="Review the linked evidence, analyze security logs, and attach investigator notes here." />
                    </div>
                    
                    <div className="pt-2 border-t border-white/5">
                      <ActionButtons 
                        primaryLabel="Mark Resolved" 
                        secondaryLabel="Escalate" 
                        onPrimary={() => handleAction(report.id, 'resolve')}
                        onSecondary={() => handleAction(report.id, 'escalate')}
                      />
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

export default ReportsInvestigation;
