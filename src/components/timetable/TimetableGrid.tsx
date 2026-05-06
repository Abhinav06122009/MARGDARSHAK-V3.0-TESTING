// src/components/timetable/TimetableGrid.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/timetable/EventCard';

interface TimetableEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  day: number;
  [key: string]: any;
}

interface TimetableGridProps {
  currentWeekDates: Date[];
  events: TimetableEvent[];
  onEditEvent: (event: TimetableEvent) => void;
  onDeleteEvent: (id: string, title: string) => void;
  onDayClick: (day: number) => void;
  colorHelpers: any;
  onEventDrop: (eventId: string, newDay: number, newStartTime: string) => void;
  draggedEvent: TimetableEvent | null;
  setDraggedEvent: (event: TimetableEvent | null) => void;
  selectedEvents: string[];
  onEventSelect: (id: string) => void;
  hasPremiumAccess: boolean;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({
  currentWeekDates,
  events,
  onEditEvent,
  onDeleteEvent,
  onDayClick,
  colorHelpers,
  onEventDrop,
  draggedEvent,
  setDraggedEvent,
  selectedEvents,
  onEventSelect,
  hasPremiumAccess,
}) => {
  const [dropIndicator, setDropIndicator] = useState<{ day: number; top: number } | null>(null);

  const timeSlots = [];
  for (let hour = 3; hour < 24; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  const handleDragStart = (e: React.DragEvent, event: TimetableEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';

    const card = e.currentTarget as HTMLElement;
    const ghost = card.cloneNode(true) as HTMLElement;
    ghost.style.opacity = '0.4';
    ghost.style.position = 'absolute';
    ghost.style.left = '-9999px';
    ghost.style.scale = '0.8';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, card.offsetWidth / 2, 20);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleDragOver = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    if (!draggedEvent || !hasPremiumAccess) return;

    const dayColumn = e.currentTarget as HTMLElement;
    const rect = dayColumn.getBoundingClientRect();
    const dropY = e.clientY - rect.top;

    const totalMinutesFromTop = (dropY / 100) * 60;
    const snappedMinutes = Math.round(totalMinutesFromTop / 15) * 15;
    const snappedTop = (snappedMinutes / 60) * 100;

    setDropIndicator({ day, top: snappedTop });
  };

  const handleDrop = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    if (!draggedEvent || !dropIndicator || !hasPremiumAccess) return;

    const startHourOffset = 3; 
    const totalMinutes = (dropIndicator.top / 100) * 60;
    const newStartHour = Math.floor(totalMinutes / 60) + startHourOffset;
    const newStartMinute = totalMinutes % 60;
    const newStartTime = `${String(newStartHour).padStart(2, '0')}:${String(newStartMinute).padStart(2, '0')}`;

    onEventDrop(draggedEvent.id, day, newStartTime);
    setDropIndicator(null);
    setDraggedEvent(null);
  };

  return (
    <div className="flex-1 grid grid-cols-7 relative bg-white/[0.02]">
      {currentWeekDates.map((_, dayIndex) => (
        <div
          key={dayIndex}
          className="relative border-l border-white/[0.05] first:border-l-0"
          onDragOver={(e) => handleDragOver(e, dayIndex)}
          onDrop={(e) => handleDrop(e, dayIndex)}
          onDragLeave={() => setDropIndicator(null)}
        >
          {/* Subtle Column Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />

          {/* Background Grid Lines */}
          {timeSlots.map((timeSlot) => (
            <div
              key={timeSlot}
              className={`h-[100px] border-b border-white/[0.03] group relative transition-colors duration-300 ${
                hasPremiumAccess ? 'hover:bg-white/[0.02] cursor-crosshair' : 'cursor-default'
              }`}
              onClick={(e) => hasPremiumAccess && onDayClick(dayIndex, e as any)}
            >
              {hasPremiumAccess && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                      <Plus className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Add Here</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Drop Indicator */}
          <AnimatePresence>
            {dropIndicator && dropIndicator.day === dayIndex && draggedEvent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute left-2 right-2 rounded-2xl z-20 pointer-events-none overflow-hidden"
                style={{
                  top: `${dropIndicator.top}px`,
                  height: `${colorHelpers.getEventHeight(draggedEvent.start_time, draggedEvent.end_time)}px`,
                  backgroundColor: `${draggedEvent.color || '#3B82F6'}30`,
                  border: `2px dashed ${draggedEvent.color || '#3B82F6'}80`,
                  boxShadow: `0 0 30px ${draggedEvent.color || '#3B82F6'}20`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent animate-pulse" />
                <div className="p-3">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">New Position</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute inset-0 z-30 pointer-events-none">
            <AnimatePresence>
              {events
                .filter((event) => Number(event.day) === dayIndex)
                .map((event) => (
                  <div key={event.id} className="pointer-events-auto">
                    <EventCard
                      event={event}
                      onEdit={onEditEvent}
                      onDelete={onDeleteEvent}
                      dayIndex={dayIndex}
                      onDragStart={handleDragStart}
                      isHighlighted={false}
                      isSelected={selectedEvents.includes(event.id)}
                      onSelect={onEventSelect}
                      hasPremiumAccess={hasPremiumAccess}
                    />
                  </div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimetableGrid;