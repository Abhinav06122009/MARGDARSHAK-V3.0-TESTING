import AdminLayout from '@/components/admin/AdminLayout';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { BarChart3, Activity, Loader2, Zap, Sparkles, TrendingUp, Cpu } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { motion } from 'framer-motion';

const Analytics = () => {
  const { analyticsData, loading } = useAdmin();

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
              <TrendingUp className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Neural Telemetry Streams Active</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">Global <span className="text-emerald-500">Analytics</span></h2>
            <p className="text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase mt-4 opacity-60 italic">Monitor threat frequency, login volumes, and high-fidelity behavioral signals.</p>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 shadow-2xl group">
              <Cpu className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest group-hover:text-emerald-500 transition-colors italic">Core Throughput: 4.2 TB/s</span>
            </div>
          </div>
        </div>

        {/* Analytics Matrix */}
        <div className="rounded-[3.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-12 shadow-[0_60px_100px_-30px_rgba(0,0,0,0.9)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                <BarChart3 className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Weekly <span className="text-emerald-500">Trends</span></h3>
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em] mt-2 opacity-60 italic">High-fidelity visualization of system activity and threat vectors.</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Threat Signals</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">System Logins</span>
               </div>
            </div>
          </div>
          
          <div className="h-[500px] w-full relative z-10 p-10 bg-black/40 rounded-[3rem] border border-white/5 shadow-inner group-hover:border-emerald-500/10 transition-colors duration-700">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-8">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 flex items-center justify-center">
                   <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 animate-pulse italic">Accessing Telemetry Database...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <defs>
                    <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#27272a" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: '900', fill: '#52525b', textTransform: 'uppercase' }} 
                    dy={20} 
                  />
                  <YAxis 
                    stroke="#27272a" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: '900', fill: '#52525b' }} 
                    dx={-20} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(5,5,5,0.9)', 
                      borderColor: 'rgba(255,255,255,0.05)', 
                      borderRadius: '1.5rem', 
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                      padding: '20px'
                    }} 
                    itemStyle={{ fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    labelStyle={{ fontWeight: '900', fontSize: '12px', color: '#fff', marginBottom: '10px', textTransform: 'uppercase' }}
                  />
                  <Area type="monotone" dataKey="threats" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorThreats)" />
                  <Area type="monotone" dataKey="logins" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorLogins)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Tactical Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           {[
             { label: 'Neural Throughput', value: '98.4%', sub: 'Global Efficiency', icon: Activity, color: 'text-emerald-500' },
             { label: 'Security Buffer', value: '4.2ms', sub: 'Detection Latency', icon: Zap, color: 'text-blue-500' },
             { label: 'Matrix Integrity', value: 'NOMINAL', sub: 'System Status', icon: Sparkles, color: 'text-emerald-400' }
           ].map((card, i) => (
             <div key={i} className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-10 shadow-2xl group hover:bg-white/[0.03] transition-all duration-700">
               <card.icon className={`w-8 h-8 ${card.color} mb-6 group-hover:scale-125 transition-transform duration-700`} />
               <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2">{card.label}</p>
               <h4 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{card.value}</h4>
               <p className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.2em] mt-4 italic">{card.sub}</p>
             </div>
           ))}
        </div>

      </div>
    </AdminLayout>
  );
};

export default Analytics;
