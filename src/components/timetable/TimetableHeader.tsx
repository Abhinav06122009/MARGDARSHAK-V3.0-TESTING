// src/components/timetable/TimetableHeader.tsx

import React from 'react';
import { ArrowLeft, BrainCircuit, Calendar, ChevronLeft, ChevronRight, Clock, Palette, Plus, Shield, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimetableHeaderProps {
  onBack: () => void;
  currentDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onAddEvent: () => void;
  onSmartAction: (action: 'balance' | 'breaks') => void;
  eventCount?: number;
  userName?: string;
  hasPremiumAccess: boolean;
}

const TimetableHeader = ({
  onBack,
  currentDate,
  onPreviousWeek,
  onNextWeek,
  onAddEvent,
  onSmartAction,
  eventCount = 0,
  userName = 'User',
  hasPremiumAccess
}: TimetableHeaderProps) => {

  const formatWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: startOfWeek.getFullYear() !== endOfWeek.getFullYear() ? 'numeric' : undefined
    };

    return `${startOfWeek.toLocaleDateString('en-US', options)} - ${endOfWeek.toLocaleDateString('en-US', options)}`;
  };

  const getCurrentWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(currentDate.getDate() - day);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Multi-color day system
  const getDayColors = () => [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#F7DC6F'
  ];

  const getDayNames = () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const weekColors = getDayColors();
  const dayNames = getDayNames();
  const today = new Date();
  const currentWeekDates = getCurrentWeekDates();

  return (
    <motion.div
      className="relative overflow-hidden border-b border-white/10"
      style={{
        background: `linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.4))`,
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)'
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Animated Aurora Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"
        />
      </div>

      {/* Multi-color accent strips with pulse */}
      <div className="absolute top-0 left-0 right-0 h-[3px] flex">
        {weekColors.map((color, index) => (
          <motion.div
            key={index}
            className="flex-1 h-full"
            style={{ backgroundColor: color }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
          >
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
              className="w-full h-full bg-white/20"
            />
          </motion.div>
        ))}
      </div>

      <div className="relative px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Main header row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
            {/* Left section */}
            <div className="flex items-start space-x-6">
              <motion.button
                onClick={onBack}
                className="group p-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-2xl transition-all duration-300 border border-white/10 hover:border-white/20 shadow-xl"
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-6 h-6 text-white/80 group-hover:text-white transition-colors" />
              </motion.button>

              <div>
                <motion.div
                  className="flex items-center gap-3 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Scheduler System</span>
                </motion.div>

                <div className="flex flex-wrap items-center gap-6 mb-3">
                  <motion.h1
                    className="text-4xl md:text-6xl font-black text-white flex items-center gap-4 tracking-tighter"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">Timetable</span>
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent italic">Scheduler</span>
                  </motion.h1>

                  <motion.button
                    onClick={(e) => onAddEvent(e as any)}
                    className="group relative h-12 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 px-6 py-3 font-black text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all duration-500 hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] active:scale-95"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000" />
                    <div className="relative z-10 flex items-center gap-2">
                      <div className="p-1 bg-white/20 rounded-md">
                        <Plus className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180" />
                      </div>
                      <span className="text-sm tracking-tight uppercase">New Schedule</span>
                    </div>
                  </motion.button>
                </div>

                <motion.div
                  className="flex flex-wrap items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-zinc-400 text-lg">
                    Personalized flow for <span className="font-bold text-white tracking-tight">{userName}</span>
                  </p>

                  <div className="h-4 w-px bg-white/10 hidden sm:block" />

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-zinc-300 text-xs font-bold uppercase tracking-wider">{eventCount} Active Events</span>
                    </div>


                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right section - Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
                <motion.button
                  onClick={onPreviousWeek}
                  className="p-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <div className="px-4 flex items-center justify-center min-w-[180px]">
                  <span className="text-sm font-black text-white tracking-tight">{formatWeekRange(currentDate)}</span>
                </div>
                <motion.button
                  onClick={onNextWeek}
                  className="p-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>

              <motion.button
                onClick={() => onSmartAction('balance')}
                className="group relative p-4 bg-indigo-500/10 hover:bg-indigo-500/20 backdrop-blur-xl rounded-2xl transition-all duration-300 border border-indigo-500/20 hover:border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                title="AI Smart Balance"
              >
                <BrainCircuit className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-indigo-400/20 rounded-2xl"
                />
              </motion.button>


            </div>
          </div>

          {/* Enhanced Day Indicators */}
          <div className="grid grid-cols-7 gap-3">
            {dayNames.map((day, index) => {
              const weekDate = currentWeekDates[index];
              const isToday = today.toDateString() === weekDate.toDateString();
              const isPast = weekDate < today && !isToday;
              const dayColor = weekColors[index];

              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index + 0.4 }}
                  whileHover={!isPast ? { y: -5, scale: 1.02 } : {}}
                  className={`relative group p-4 rounded-2xl transition-all duration-500 border overflow-hidden ${isToday
                      ? 'bg-white/10 text-white border-white/30 shadow-[0_0_25px_rgba(255,255,255,0.1)]'
                      : isPast
                        ? 'bg-white/[0.02] text-zinc-600 border-white/[0.05]'
                        : 'bg-white/[0.05] text-zinc-400 hover:text-white border-white/10 hover:border-white/20'
                    }`}
                >
                  {/* Active Indicator Strip */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: isPast ? '#333' : dayColor }}
                  />

                  {/* Hover Glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at top center, ${dayColor}20, transparent 70%)` }}
                  />

                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <span className={`text-xs font-black uppercase tracking-[0.2em] ${isToday ? 'text-white' : ''}`}>{day}</span>
                    <span className={`text-2xl font-black tabular-nums ${isToday ? 'text-white' : 'group-hover:text-white transition-colors'}`}>{weekDate.getDate()}</span>
                  </div>

                  {isToday && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modern thin multi-color separator */}
      <div className="h-px w-full bg-white/10" />
    </motion.div>
  );
};

export default TimetableHeader;
