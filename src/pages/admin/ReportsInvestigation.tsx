import AdminLayout from '@/components/admin/AdminLayout';
import EvidenceViewer from '@/components/admin/EvidenceViewer';
import ActionButtons from '@/components/admin/ActionButtons';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { FileSearch, Loader2, AlertCircle, CheckCircle2, Shield, Activity, Zap, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const ReportsInvestigation = () => {
  const { reports, loading, refresh } = useAdmin();

  const handleAction = async (id: string, action: 'resolve' | 'escalate') => {
    try {
      const { error } = await supabase
        .from('admin_reports')
        .update({ 
          status: action === 'resolve' ? 'resolved' : 'escalated',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Report marked as ${action === 'resolve' ? 'resolved' : 'escalated'}`);
      refresh();
    } catch (error: any) {
      toast.error(`Failed to update report: ${error.message}`);
    }
  };

  const openReports = reports.filter(r => r.status !== 'resolved');

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
              <FileSearch className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Forensic Analysis Unit Active</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">Global <span className="text-emerald-500">Investigations</span></h2>
            <p className="text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase mt-4 opacity-60 italic">Review reports, compile evidence, and execute final case resolutions.</p>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 shadow-2xl group">
              <AlertCircle className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest group-hover:text-emerald-500 transition-colors italic">Action Required: {openReports.length} Units</span>
            </div>
          </div>
        </div>

        {/* Content Matrix */}
        <div className="min-h-[600px] relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[500px] text-zinc-500 gap-8 bg-white/[0.01] border border-white/5 rounded-[4rem] backdrop-blur-3xl shadow-[0_60px_100px_-30px_rgba(0,0,0,0.9)]">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 flex items-center justify-center shadow-2xl">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 animate-pulse italic">Accessing Case Files...</p>
            </div>
          ) : openReports.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-[500px] bg-white/[0.01] border border-white/5 rounded-[4rem] backdrop-blur-3xl shadow-[0_60px_100px_-30px_rgba(0,0,0,0.9)] text-center group"
            >
              <div className="w-32 h-32 rounded-[3rem] bg-emerald-500/10 flex items-center justify-center mb-10 border border-emerald-500/20 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              </div>
              <div className="space-y-3">
                <p className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Forensic <span className="text-emerald-500">Zero</span></p>
                <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.4em] italic">All security investigations are currently concluded.</p>
              </div>
            </motion.div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-2">
              {openReports.map((report, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  key={report.id} 
                  className="rounded-[3.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] backdrop-blur-3xl p-10 transition-all duration-700 group relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/[0.05] transition-colors duration-700" />
                  
                  <div className="flex flex-col space-y-10 relative z-10">
                    <div className="flex items-start justify-between gap-6">
                      <div className="space-y-4">
                        <div className="px-3 py-1 bg-black/40 rounded-xl border border-white/5 inline-block shadow-inner">
                          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic group-hover:text-emerald-500 transition-colors">Unit_ID: <span className="text-white opacity-40">{report.id.slice(0, 8)}...</span></p>
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-emerald-400 transition-colors flex items-center gap-4">
                          <AlertCircle className="w-6 h-6 text-emerald-500 group-hover:animate-pulse" /> {report.category.replace(/_/g, ' ')}
                        </h3>
                      </div>
                      <div className={`px-5 py-2 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] italic shadow-2xl ${
                        report.severity === 'high' || report.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      }`}>
                        {report.severity || 'unknown'} protocol
                      </div>
                    </div>
                    
                    <div className="p-8 rounded-[2.5rem] bg-black/30 border border-white/5 shadow-inner transition-colors group-hover:border-emerald-500/10">
                      <EvidenceViewer title="Investigation Log" details="Review the linked evidence, analyze security logs, and attach investigator notes for final resolution." />
                    </div>
                    
                    <div className="pt-8 border-t border-white/5">
                      <ActionButtons 
                        primaryLabel="Authorize Resolution" 
                        secondaryLabel="Escalate Protocol" 
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
