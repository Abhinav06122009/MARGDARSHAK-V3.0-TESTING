import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save, ShieldAlert, Cpu } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';

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
      <div className="space-y-10 max-w-4xl">
        <div className="border-b border-white/5 pb-8">
          <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 uppercase italic">
            <Settings className="w-8 h-8 text-red-500" /> Core Configurations
          </h2>
          <p className="text-sm font-bold text-zinc-500 tracking-wide mt-2">Configure global security thresholds and neural engine parameters.</p>
        </div>

        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="grid gap-10 md:grid-cols-2 relative z-10">
            
            {/* Security Parameters */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Firewall Rules</h3>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Rate Limit / Min</label>
                <div className="relative">
                  <Input 
                    value={rateLimit} 
                    onChange={(event) => setRateLimit(event.target.value)} 
                    disabled={loading}
                    className="bg-black/40 border-white/10 text-white font-mono text-lg h-14 rounded-xl focus-visible:ring-red-500/50 pl-4 disabled:opacity-50"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Req/Min</div>
                </div>
                <p className="text-[10px] text-zinc-600 font-medium">Maximum requests allowed per IP before temporary automated ban.</p>
              </div>
            </div>

            {/* Neural Engine Parameters */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Cpu className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Neural Engine</h3>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Moderation Sensitivity</label>
                <div className="relative">
                  <Input 
                    value={aiSensitivity} 
                    onChange={(event) => setAiSensitivity(event.target.value)} 
                    disabled={loading}
                    className="bg-black/40 border-white/10 text-white font-mono text-lg h-14 rounded-xl focus-visible:ring-indigo-500/50 pl-4 disabled:opacity-50"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">0.0 - 1.0</div>
                </div>
                <p className="text-[10px] text-zinc-600 font-medium">Lower values trigger flags more easily. 0.7 recommended for balanced moderation.</p>
              </div>
            </div>

          </div>

          <div className="mt-10 pt-8 border-t border-white/5 relative z-10 flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={submitting || loading}
              className="h-12 px-8 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center gap-2"
            >
              {submitting ? 'Committing...' : 'Commit Changes'}
              {!submitting && <Save className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
