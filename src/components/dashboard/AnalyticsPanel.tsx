import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertCircle, Trophy, Calendar as CalendarIcon, Clock, Award, CheckCircle2, Zap, Folder, LineChart as LineChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import type { RealAnalytics, RealTask } from '@/types/dashboard';
import InteractiveCard from '@/components/ui/InteractiveCard';
import { cn } from '@/lib/utils';
import { useRankTheme } from '@/context/ThemeContext';

interface AnalyticsPanelProps {
  analytics: RealAnalytics;
  tasks: RealTask[];
  taskPriorityAnalytics: {
    high: number;
    medium: number;
    low: number;
    other: number;
  };
  taskCompletionTrend: { date: string; completed: number }[];
  categoryAnalytics: { name: string; color: string; completionRate: number; timeSpent: number }[];
  className?: string;
}

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ analytics, tasks, taskPriorityAnalytics, taskCompletionTrend, categoryAnalytics, className }) => {
  const { theme } = useRankTheme();
  
  const dailyStudyData = analytics.dailyStudyTime.slice(-7).map(d => ({
    name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    time: d.minutes,
  }));

  const subjectBreakdownData = analytics.subjectBreakdown.map(s => ({
    name: s.subject,
    value: s.time,
  }));

  const priorityCompletionData = [
    { name: 'High', value: taskPriorityAnalytics.high, color: '#EF4444' },
    { name: 'Medium', value: taskPriorityAnalytics.medium, color: '#F59E0B' },
    { name: 'Low', value: taskPriorityAnalytics.low, color: '#10B981' },
    { name: 'Other', value: taskPriorityAnalytics.other, color: '#6B7280' },
  ].filter(d => d.value > 0);

  const busiestDay = useMemo(() => {
    if (!tasks || tasks.length === 0) return 'N/A';
    const completionsByDay: Record<number, number> = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };
    tasks.forEach(task => {
      if (task.status === 'completed' && task.updated_at) {
        const dayIndex = new Date(task.updated_at).getDay();
        completionsByDay[dayIndex]++;
      }
    });
    const busiestDayIndex = Object.keys(completionsByDay).map(Number).reduce((a, b) =>
      completionsByDay[a] > completionsByDay[b] ? a : b
    );
    if (completionsByDay[busiestDayIndex] === 0) return 'N/A';
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[busiestDayIndex];
  }, [tasks]);

  const CHART_COLORS = [theme.colors.primary, theme.colors.accent, theme.colors.secondary, '#8884d8', '#ff4d4d'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("bg-zinc-950/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border shadow-2xl", className)}
      style={{ borderColor: theme.colors.border }}
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-white flex items-center gap-4 uppercase tracking-tighter">
          <BarChart3 className="w-7 h-7" style={{ color: theme.colors.primary }} />
          Neural Analytics
        </h3>
        <div className="px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest"
          style={{ backgroundColor: `${theme.colors.primary}15`, color: theme.colors.primary, borderColor: `${theme.colors.primary}30` }}>
          Real-Time
        </div>
      </div>

      <div className="space-y-10">
        {/* Cards */}
        <div className="grid grid-cols-2 gap-4">
          <InteractiveCard className="bg-white/[0.02] border-white/5 hover:border-red-500/30">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pending</span>
              <p className="text-2xl font-black text-white">{analytics.incompleteTasksCount}</p>
            </div>
          </InteractiveCard>
          <InteractiveCard className="bg-white/[0.02] border-white/5 hover:border-emerald-500/30">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Efficiency</span>
              <p className="text-2xl font-black text-white">
                {analytics.topGrades.length > 0 ? `${analytics.topGrades[0].percentage.toFixed(0)}%` : '94%'}
              </p>
            </div>
          </InteractiveCard>
        </div>

        {/* Study Chart */}
        <div>
          <h4 className="text-[11px] font-black text-zinc-400 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
            Cognitive Velocity
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStudyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.3)" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255, 255, 255, 0.3)" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Bar dataKey="time" radius={[6, 6, 0, 0]}>
                  {dailyStudyData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={i === dailyStudyData.length - 1 ? theme.colors.primary : `${theme.colors.primary}40`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Completion Trend */}
        <div>
          <h4 className="text-[11px] font-black text-zinc-400 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
            Operational Output
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={taskCompletionTrend}>
                <defs>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.colors.accent} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.colors.accent} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.3)" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="completed" stroke={theme.colors.accent} strokeWidth={3} fill="url(#colorOutput)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Breakdown */}
        {subjectBreakdownData.length > 0 && (
          <div>
            <h4 className="text-[11px] font-black text-zinc-400 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.colors.secondary }} />
              Resource Allocation
            </h4>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={subjectBreakdownData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {subjectBreakdownData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalyticsPanel;