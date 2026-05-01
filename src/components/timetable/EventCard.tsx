// src/components/timetable/EventCard.tsx

import React from 'react';
import { Clock, MapPin, User, Edit, Trash2, AlertTriangle, Star, Eye, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  color?: string;
  location?: string;
  instructor?: string;
  category?: 'class' | 'meeting' | 'exam' | 'lab' | 'seminar' | 'break' | 'personal' | 'event';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  day?: number; 
  course_code?: string;
  tags?: string[];
  attendance_required?: boolean;
  is_exam?: boolean;
  credits?: number;
}

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string, title: string) => void;
  dayIndex?: number;
  onDragStart: (e: React.DragEvent, event: Event) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  isHighlighted?: boolean;
  hasPremiumAccess: boolean;
}

const colorHelpers = {
  getEventCategories: () => [
    { id: 'class', name: 'Class', color: '#3B82F6', icon: '📚' },
    { id: 'lab', name: 'Lab', color: '#10B981', icon: '🔬' },
    { id: 'exam', name: 'Exam', color: '#EF4444', icon: '📝' },
    { id: 'seminar', name: 'Seminar', color: '#8B5CF6', icon: '💭' },
    { id: 'meeting', name: 'Meeting', color: '#F59E0B', icon: '🤝' },
    { id: 'break', name: 'Break', color: '#6B7280', icon: '☕' },
    { id: 'personal', name: 'Personal', color: '#EC4899', icon: '👤' },
    { id: 'event', name: 'Event', color: '#14B8A6', icon: '🎉' },
  ],

  getSlotBackgroundColor: (event: Event) => {
    if (event.color) return event.color;
    const categories = colorHelpers.getEventCategories();
    const category = categories.find(c => c.id === event.category);
    return category?.color || '#3B82F6';
  },

  getCategoryIcon: (category?: string) => {
    const categories = colorHelpers.getEventCategories();
    const cat = categories.find(c => c.id === category);
    return cat?.icon || '📅';
  },

  getDayAccentColor: (dayIndex?: number) => {
    const dayColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#F7DC6F'];
    return dayIndex !== undefined ? dayColors[dayIndex] : null;
  },

  getContrastTextColor: (backgroundColor: string) => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }
};

const EventCard = ({ event, onEdit, onDelete, dayIndex, onDragStart, onSelect, isSelected, isHighlighted = false, hasPremiumAccess }: EventCardProps) => {
  const getEventHeight = (startTime: string, endTime: string) => {
    const start = new Date(`2024-01-01T${startTime}`);
    const end = new Date(`2024-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(diffHours * 100, 60);
  };

  const getEventTop = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startHour = 3; 
    const position = (hours - startHour) * 100 + (minutes / 60) * 100;
    return Math.max(position, 0);
  };

  const baseColor = event.color || colorHelpers.getSlotBackgroundColor(event);
  const textColor = colorHelpers.getContrastTextColor(baseColor);
  const dayAccent = colorHelpers.getDayAccentColor(dayIndex);

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleClick = (e: React.MouseEvent) => {
    // ZENITH FIX: Prevent card click if a button inside was clicked
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      onSelect(event.id);
    } else {
      onEdit(event);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${baseColor}40`
      }}
      whileTap={{ scale: 0.98 }}
      className={`
        absolute left-1.5 right-1.5 rounded-2xl p-3
        cursor-pointer group overflow-hidden transition-all duration-500
        backdrop-blur-xl border border-white/10
        ${isSelected ? 'ring-2 ring-white/60 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : ''}
      `}
      style={{
        top: `${getEventTop(event.start_time)}px`,
        height: `${getEventHeight(event.start_time, event.end_time)}px`,
        backgroundColor: `${baseColor}20`,
        borderLeft: `4px solid ${baseColor}`,
        color: 'white',
        zIndex: isSelected ? 30 : 10
      }}
      onClick={handleClick}
      draggable={hasPremiumAccess}
      onDragStart={(e) => onDragStart(e, event)}
    >
      {/* Dynamic Background Glow */}
      <div 
        className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${baseColor}, transparent)` }}
      />

      {/* Header: Title & Icon */}
      <div className="relative z-10 flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-base">{colorHelpers.getCategoryIcon(event.category)}</span>
            <h4 className="text-sm font-black truncate tracking-tight group-hover:text-white transition-colors">
              {event.title}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-200 transition-colors">
              {formatTime(event.start_time)}
            </span>
            {event.priority === 'urgent' && (
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="relative z-10 space-y-1.5">
        {(event.location || event.course_code) && (
          <div className="flex flex-wrap gap-1.5">
            {event.course_code && (
              <span className="px-1.5 py-0.5 bg-white/5 rounded-md text-[9px] font-black border border-white/10 text-zinc-400">
                {event.course_code}
              </span>
            )}
            {event.location && (
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 truncate group-hover:text-zinc-300">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
        )}

        {event.instructor && (
          <div className="flex items-center gap-1 text-[10px] text-zinc-500 group-hover:text-zinc-300">
            <User className="w-3 h-3" />
            <span className="truncate">{event.instructor}</span>
          </div>
        )}
      </div>

      {/* Action Hover Overlays */}
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-[40]">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(event); }}
          className="p-2 bg-white/10 hover:bg-white/25 rounded-xl border border-white/20 backdrop-blur-md transition-all shadow-lg hover:scale-110 active:scale-95"
        >
          <Edit className="w-3.5 h-3.5 text-white" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(event.id, event.title); }}
          className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-xl border border-red-500/30 backdrop-blur-md transition-all shadow-lg hover:scale-110 active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </button>
      </div>

      {/* Bottom Priority Bar */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 opacity-60"
        style={{ 
          background: `linear-gradient(90deg, transparent, ${baseColor}, transparent)`
        }} 
      />

      {/* Side Accent */}
      {dayAccent && (
        <div 
          className="absolute top-2 right-2 w-1 h-4 rounded-full opacity-40"
          style={{ backgroundColor: dayAccent }}
        />
      )}
    </motion.div>
  );
};

export default EventCard;
