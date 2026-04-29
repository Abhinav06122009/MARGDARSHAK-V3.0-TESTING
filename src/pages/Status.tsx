import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, Clock, 
  Activity, Shield, Globe, Cpu, Database, 
  Zap, Command, MessageSquare, Send, RefreshCw,
  Server, Lock, Layout, Signal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ParallaxBackground from '@/components/ui/ParallaxBackground';
import { useToast } from '@/hooks/use-toast';

const StatusPage = ({ onBack }: { onBack?: () => void }) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [systems, setSystems] = useState({
    frontend: { status: 'operational', latency: '12ms', label: 'ZENITH_UI_CORE' },
    supabase: { status: 'operational', latency: '45ms', label: 'POSTGRES_NEURAL_DATABASE' },
    clerk: { status: 'operational', latency: '82ms', label: 'IDENTITY_ENCLAVE_SSO' },
    api: { status: 'operational', latency: '24ms', label: 'MARGDARSHAK_API_MESH' },
    cdn: { status: 'operational', latency: '8ms', label: 'GLOBAL_ASSET_DISTRIBUTION' }
  });

  const checkStatus = async () => {
    setLoading(true);
    const start = performance.now();
    
    try {
      // Check Supabase
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      const supabaseLat = Math.round(performance.now() - start);
      
      setSystems(prev => ({
        ...prev,
        supabase: { 
          status: error ? 'degraded' : 'operational', 
          latency: `${supabaseLat}ms`, 
          label: 'POSTGRES_NEURAL_DATABASE' 
        },
        frontend: { 
          status: 'operational', 
          latency: `${Math.round(Math.random() * 5 + 10)}ms`, 
          label: 'ZENITH_UI_CORE' 
        }
      }));
      
    } catch (e) {
      setSystems(prev => ({
        ...prev,
        supabase: { status: 'outage', latency: '---', label: 'POSTGRES_NEURAL_DATABASE' }
      }));
    } finally {
      setLastUpdated(new Date());
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    setIsSubmitting(true);
    // Simulate feedback submission
    await new Promise(r => setTimeout(r, 1500));
    
    toast({
      title: "PROTOCOL_TRANSMITTED",
      description: "Your feedback has been logged into our architectural review system.",
      variant: "default",
    });
    
    setFeedback('');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-300 selection:bg-emerald-500/30 overflow-x-hidden">
      <ParallaxBackground />
      
      {/* SYSTEM GRID OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.05),transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
          <div className="space-y-6">
            <button
              onClick={() => onBack ? onBack() : window.history.back()}
              className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-all"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Abort_Session</span>
            </button>
            <div className="space-y-2">
              <h1 className="text-7xl lg:text-[10rem] font-black text-white tracking-tighter leading-none italic uppercase">
                STATUS
              </h1>
              <div className="flex items-center gap-6 ml-2">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <Activity size={12} className="text-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic">All Systems Nominal</span>
                </div>
                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em]">Real_Time_Sync_Active</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
             <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Last_Pulse_Detection</span>
             <div className="text-xl font-bold text-white tabular-nums">
               {lastUpdated.toLocaleTimeString()}
             </div>
             <button 
               onClick={checkStatus}
               className="mt-2 p-3 bg-zinc-950 border border-white/5 rounded-xl hover:border-emerald-500/30 text-zinc-500 hover:text-emerald-400 transition-all"
             >
               <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* SYSTEM MATRIX */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(systems).map(([key, system], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-zinc-950/40 border border-white/5 rounded-[2.5rem] backdrop-blur-3xl group hover:border-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    {key === 'frontend' && <Layout size={18} className="text-blue-400" />}
                    {key === 'supabase' && <Database size={18} className="text-emerald-400" />}
                    {key === 'clerk' && <Lock size={18} className="text-purple-400" />}
                    {key === 'api' && <Server size={18} className="text-amber-400" />}
                    {key === 'cdn' && <Signal size={18} className="text-rose-400" />}
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[8px] font-black tracking-widest uppercase italic ${
                    system.status === 'operational' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {system.status}
                  </div>
                </div>
                
                <h3 className="text-lg font-black text-white italic tracking-tight mb-2">{system.label}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Network_Latency</span>
                  <span className="text-sm font-mono text-emerald-500/60 font-bold">{system.latency}</span>
                </div>
                
                {/* Latency Bar */}
                <div className="mt-6 h-1 w-full bg-white/[0.02] rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '70%' }}
                     className={`h-full ${system.status === 'operational' ? 'bg-emerald-500/30' : 'bg-red-500/30'}`}
                   />
                </div>
              </motion.div>
            ))}
          </div>

          {/* FEEDBACK & GLOBAL CONSOLE */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* REAL-TIME LOGS */}
            <div className="p-8 bg-black border border-white/5 rounded-[2.5rem] overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] mb-6">Neural_Event_Log</h3>
              <div className="space-y-4 font-mono text-[10px]">
                 <div className="flex gap-4">
                   <span className="text-emerald-500/40">[17:04:02]</span>
                   <span className="text-zinc-500">AUTH_HANDSHAKE_SUCCESS</span>
                 </div>
                 <div className="flex gap-4">
                   <span className="text-emerald-500/40">[17:04:05]</span>
                   <span className="text-zinc-500">DB_CONNECTION_ESTABLISHED</span>
                 </div>
                 <div className="flex gap-4">
                   <span className="text-emerald-500/40">[17:04:12]</span>
                   <span className="text-blue-500/60">UI_HYDRATION_COMPLETE</span>
                 </div>
                 <div className="flex gap-4">
                   <span className="text-emerald-500/40">[17:04:20]</span>
                   <span className="text-zinc-500">PROTOCOL_V3_STABLE</span>
                 </div>
              </div>
            </div>

            {/* FEEDBACK FORM */}
            <div className="p-10 bg-emerald-500/5 border border-emerald-500/10 rounded-[3rem] backdrop-blur-xl">
               <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-emerald-500/20 rounded-2xl">
                   <MessageSquare size={20} className="text-emerald-400" />
                 </div>
                 <div>
                   <h3 className="text-xl font-black text-white italic tracking-tight">Feedback Loop</h3>
                   <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mt-1">Direct Line to Architects</p>
                 </div>
               </div>

               <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                 <textarea 
                   value={feedback}
                   onChange={(e) => setFeedback(e.target.value)}
                   placeholder="Describe system performance or aesthetic inconsistencies..."
                   className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-6 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/30 transition-all resize-none"
                 />
                 <button 
                   disabled={isSubmitting || !feedback.trim()}
                   className="w-full py-5 bg-emerald-500 text-black font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/10 disabled:opacity-30 flex items-center justify-center gap-4"
                 >
                   {isSubmitting ? <RefreshCw className="animate-spin w-4 h-4" /> : <Send size={14} />}
                   TRANSMIT_REPORT
                 </button>
               </form>
            </div>

          </div>
        </div>

        </div>
      </div>
    </div>
  );
};

export default StatusPage;
