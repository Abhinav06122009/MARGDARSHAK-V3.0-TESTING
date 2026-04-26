import React, { useMemo } from 'react';
import { generateHeatmapData } from '@/lib/gamification/streakService';
import { Calendar as CalendarIcon } from 'lucide-react';

interface StudyHeatmapProps {
  tasks: any[];
}

export const StudyHeatmap: React.FC<StudyHeatmapProps> = ({ tasks }) => {
  const heatmapData = useMemo(() => generateHeatmapData(tasks), [tasks]);
  
  // Group by weeks for the CSS Grid
  const weeks = useMemo(() => {
    const weeksArr: any[][] = [];
    let currentWeek: any[] = [];
    
    // Pad the first week to align with Sunday
    const firstDate = new Date(heatmapData[0].date);
    const firstDay = firstDate.getDay();
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }

    heatmapData.forEach((day, i) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || i === heatmapData.length - 1) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeksArr;
  }, [heatmapData]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-zinc-800/50 border-white/5';
    if (count === 1) return 'bg-emerald-900/40 border-emerald-500/20';
    if (count === 2) return 'bg-emerald-700/60 border-emerald-400/30 text-emerald-100';
    if (count === 3) return 'bg-emerald-500/80 border-emerald-300/40 text-emerald-50';
    return 'bg-emerald-400 border-emerald-300 text-black shadow-[0_0_10px_rgba(52,211,153,0.4)]';
  };

  return (
    <div className="w-full flex flex-col items-center overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
      <div className="flex items-center gap-2 mb-4 w-full text-zinc-400 text-xs font-bold uppercase tracking-wider">
        <CalendarIcon size={14} /> Annual Contributions
      </div>
      
      <div className="flex gap-1.5 justify-end w-max min-w-full pl-6">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1.5">
            {week.map((day, dayIndex) => {
              if (!day) return <div key={`empty-${dayIndex}`} className="w-3 h-3 sm:w-4 sm:h-4" />;
              
              return (
                <div 
                  key={day.date} 
                  title={`${day.count} tasks on ${day.date}`}
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-[3px] border transition-colors duration-300 cursor-help ${getColor(day.count)} hover:scale-125 hover:z-10`}
                />
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="w-full flex justify-end items-center gap-2 mt-4 text-[10px] text-zinc-500 font-medium">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-[2px] bg-zinc-800/50" />
          <div className="w-3 h-3 rounded-[2px] bg-emerald-900/40" />
          <div className="w-3 h-3 rounded-[2px] bg-emerald-700/60" />
          <div className="w-3 h-3 rounded-[2px] bg-emerald-500/80" />
          <div className="w-3 h-3 rounded-[2px] bg-emerald-400" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
