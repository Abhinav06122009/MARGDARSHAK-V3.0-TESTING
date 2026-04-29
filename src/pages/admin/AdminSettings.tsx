import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save, ShieldAlert, Cpu, Activity, Zap, Sparkles, Database } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { motion } from 'framer-motion';

const AdminSettings = () => {
  const { settings, loading } = useAdmin();
  const [rateLimit, setRateLimit] = useState('120');
  const [aiSensitivity, setAiSensitivity] = useState('0.7');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (settings) {
      setRateLimit(settings.rate_limit.toString());
      setAiSensitivity(settings.ai_sensitivity.toString());
    }
  }, [settings]);

  const handleSave = async () => {
    setSubmitting(true);
    const { error } = await supabase
      .from('security_settings')
      .update({
        rate_limit: Number(rateLimit),
        ai_sensitivity: Number(aiSensitivity),
        updated_at: new Date().toISOString()
      })
      .eq('id', 'global');

    setSubmitting(false);

    if (error) {
      toast.error('Failed to save settings');
      return;
    }

    toast.success('Security settings updated');
  };

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
              <Settings className="w-4 h-4 text-emerald-500 animate-spin-slow" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Core Configurator Active</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">System <span className="text-emerald-500">Config</span></h2>
            <p className="text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase mt-4 opacity-60 italic">Configure global security thresholds and neural engine parameters for the Margdarshak Network.</p>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 shadow-2xl group">
              <Database className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest group-hover:text-emerald-500 transition-colors italic">Global Registry v3.0.5</span>
            </div>
          </div>
        </div>

        {/* Configuration Matrix */}
        <div className="rounded-[3.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-12 shadow-[0_60px_100px_-30px_rgba(0,0,0,0.9)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
          
          <div className="grid gap-16 md:grid-cols-2 relative z-10">
            
            {/* Security Parameters */}
            <div className="space-y-10">
              <div className="flex items-center gap-6 border-b border-white/5 pb-8">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <ShieldAlert className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Security Protocols</h3>
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-1">Managed Firewall Thresholds</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] ml-1">Rate Limit Intensity</label>
                <div className="relative group/input">
                  <Input 
                    value={rateLimit} 
                    onChange={(event) => setRateLimit(event.target.value)} 
                    disabled={loading}
                    className="bg-black/40 border-white/5 text-white font-black italic tracking-tighter text-2xl h-20 rounded-[1.5rem] focus-visible:ring-emerald-500/30 pl-8 transition-all duration-500 group-hover/input:bg-black/60 group-hover/input:border-emerald-500/20 disabled:opacity-50 shadow-inner"
                  />
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">REQ/MIN</div>
                </div>
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] italic opacity-60 pl-2">Maximum requests authorized per IP before automated protocol restriction.</p>
              </div>
            </div>

            {/* Neural Engine Parameters */}
            <div className="space-y-10">
              <div className="flex items-center gap-6 border-b border-white/5 pb-8">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                  <Cpu className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Neural Engine</h3>
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-1">AI Moderation Sensitivity</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] ml-1">Cognitive Sensitivity</label>
                <div className="relative group/input">
                  <Input 
                    value={aiSensitivity} 
                    onChange={(event) => setAiSensitivity(event.target.value)} 
                    disabled={loading}
                    className="bg-black/40 border-white/5 text-white font-black italic tracking-tighter text-2xl h-20 rounded-[1.5rem] focus-visible:ring-blue-500/30 pl-8 transition-all duration-500 group-hover/input:bg-black/60 group-hover/input:border-blue-500/20 disabled:opacity-50 shadow-inner"
                  />
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] text-blue-500 font-black uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">INDEX: 0.0 - 1.0</div>
                </div>
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] italic opacity-60 pl-2">Lower indices trigger detection protocols more aggressively. 0.7 is the Zenith standard.</p>
              </div>
            </div>

          </div>

          <div className="mt-16 pt-10 border-t border-white/5 relative z-10 flex justify-end">
            <button 
              onClick={handleSave} 
              disabled={submitting || loading}
              className="h-16 px-12 bg-white text-black hover:bg-emerald-500 hover:text-black transition-all duration-700 font-black uppercase tracking-[0.3em] text-[10px] rounded-[1.5rem] shadow-2xl flex items-center gap-4 group active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Committing Changes...
                </>
              ) : (
                <>
                  Commit System Config <Save className="w-4 h-4 group-hover:scale-125 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Advisory */}
        <div className="flex items-center gap-6 px-10 py-6 bg-white/[0.01] border border-white/5 rounded-[2.5rem] backdrop-blur-3xl">
           <Activity className="w-6 h-6 text-zinc-700" />
           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic">Note: Protocol changes are applied globally across all system nodes upon commitment.</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
