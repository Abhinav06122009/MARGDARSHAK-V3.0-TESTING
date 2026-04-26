import AdminLayout from '@/components/admin/AdminLayout';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BarChart3, Activity, Loader2 } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';

const Analytics = () => {
  const { analyticsData, loading } = useAdmin();

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="border-b border-white/5 pb-8">
          <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 uppercase italic">
            <BarChart3 className="w-8 h-8 text-red-500" /> Security Analytics
          </h2>
          <p className="text-sm font-bold text-zinc-500 tracking-wide mt-2">Monitor threat frequency, login volumes, and behavioral signals.</p>
        </div>

        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <h3 className="text-xl font-black text-white flex items-center gap-3 relative z-10 mb-8">
            <Activity className="w-6 h-6 text-red-500" /> Weekly Threat Trends
          </h3>
          
          <div className="h-80 w-full relative z-10 p-6 bg-black/40 rounded-3xl border border-white/5 flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4 text-zinc-500">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Telemetry...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} dy={10} />
                  <YAxis stroke="#52525b" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ background: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(10px)' }} 
                    itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, fill: '#ef4444' }} />
                  <Line type="monotone" dataKey="logins" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
