import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Plus, 
  Calendar as CalendarIcon, Trash2, Edit3, 
  Sparkles, Star, Clock, AlertCircle, CheckCircle2,
  PartyPopper, MapPin, Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dashboardService } from '@/lib/dashboardService';
import { holidayService, Holiday } from '@/lib/holidayService';
import { RealCalendarEvent, RealTask } from '@/lib/dashboard';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarProps {
  onBack?: () => void;
}

const EnhancedCalendar = ({ onBack }: CalendarProps) => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<RealCalendarEvent[]>([]);
  const [tasks, setTasks] = useState<RealTask[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'personal' as 'personal' | 'academic' | 'exam' | 'holiday',
    priority: 'medium' as 'low' | 'medium' | 'high',
    is_all_day: true
  });

  const { toast } = useToast();

  const year = date.getFullYear();
  const month = date.getMonth();

  const prevMonth = () => setDate(new Date(year, month - 1, 1));
  const nextMonth = () => setDate(new Date(year, month + 1, 1));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarDays = [
    ...Array(firstDayIndex).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date();

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getFullYear() === d2.getFullYear();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const user = await dashboardService.getCurrentUser();
      if (!user) return;

      const userData = await dashboardService.fetchAllUserData(user.id);
      setEvents(userData.calendarEvents || []);
      setTasks((userData.tasks || []).map((t: any) => ({
        ...t,
        priority: t.priority || 'medium'
      })));

      const holidayData = await holidayService.fetchHolidays(year);
      setHolidays(holidayData);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveEvent = async () => {
    if (!selectedDay || !newEvent.title) return;
    
    try {
      const user = await dashboardService.getCurrentUser();
      if (!user) return;

      const eventData: Partial<RealCalendarEvent> = {
        title: newEvent.title,
        description: newEvent.description,
        category: newEvent.category,
        priority: newEvent.priority,
        is_all_day: newEvent.is_all_day,
        event_date: selectedDay.toISOString()
      };

      if (isEditing) {
        await dashboardService.updateCalendarEvent(isEditing, eventData, user.id);
        toast({ title: "Event Sync", description: "Event updated in memory banks." });
      } else {
        await dashboardService.createCalendarEvent(eventData, user.id);
        toast({ title: "Add Event", description: "New event Added." });
      }
      
      setIsAddDialogOpen(false);
      setIsEditing(null);
      setNewEvent({ title: '', description: '', category: 'personal', priority: 'medium', is_all_day: true });
      loadData();
    } catch (error) {
      toast({ title: "Synchronization Failed", variant: "destructive" });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const user = await dashboardService.getCurrentUser();
      if (!user) return;
      await dashboardService.deleteCalendarEvent(eventId, user.id);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast({ title: "Event Redacted", description: "Removed from Event sequence." });
    } catch (error) {
      toast({ title: "Redaction Failed", variant: "destructive" });
    }
  };

  const filteredDaysEvents = events.filter(e => {
    if (!selectedDay || !e.event_date) return false;
    return isSameDay(new Date(e.event_date), selectedDay);
  });

  const filteredDaysTasks = tasks.filter(t => {
    if (!selectedDay || !t.due_date) return false;
    return isSameDay(new Date(t.due_date), selectedDay);
  });

  const dayHolidays = holidays.filter(h => {
    if (!selectedDay) return false;
    return isSameDay(new Date(h.date), selectedDay);
  });

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-300 selection:bg-emerald-500/30 overflow-x-hidden p-6 lg:p-12">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-16">
          <button
            onClick={onBack}
            className="group flex items-center gap-4 px-6 py-3 bg-zinc-950/50 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all backdrop-blur-xl"
          >
            <ArrowLeft size={18} className="text-zinc-500 group-hover:text-emerald-400 group-hover:-translate-x-1 transition-all" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Back_to_Dashbaord</span>
          </button>

          <div className="flex items-center gap-4 sm:gap-8">
            <button 
              onClick={() => { resetForm(); setIsAddDialogOpen(true); }}
              className="px-6 py-3 bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-[1.05] active:scale-[0.95] transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center gap-2"
            >
              <Plus size={14} /> Add_Event
            </button>
            
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Calendar_Active</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">MARGDARSHAK V3.0</span>
            </div>
          </div>
        </nav>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
          {/* Left Column: Calendar Grid */}
          <div className="xl:col-span-8 space-y-8">
            <div className="p-8 bg-zinc-950/40 border border-white/5 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                    {monthLabel.split(' ')[0]} <span className="text-emerald-500 not-italic font-light">{monthLabel.split(' ')[1]}</span>
                  </h2>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Academic_Cycle</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button onClick={prevMonth} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all active:scale-95">
                    <ChevronLeft className="w-5 h-5 text-zinc-400" />
                  </button>
                  <button onClick={nextMonth} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all active:scale-95">
                    <ChevronRight className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-4 mb-4">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest pb-4 border-b border-white/5">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-4">
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={i} className="aspect-square" />;

                  const isToday = isSameDay(day, today);
                  const isSelected = selectedDay && isSameDay(day, selectedDay);
                  const hasEvents = events.some(e => e.event_date && isSameDay(new Date(e.event_date), day));
                  const hasTasks = tasks.some(t => t.due_date && isSameDay(new Date(t.due_date), day));
                  const hasHolidays = holidays.some(h => isSameDay(new Date(h.date), day));
                  
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDay(day)}
                      className={`
                        relative aspect-square rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all p-2
                        ${isSelected ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-white/[0.02] border-white/5 hover:border-emerald-500/30'}
                        ${isToday && !isSelected ? 'border-blue-500/50 bg-blue-500/5' : ''}
                      `}
                    >
                      <span className={`text-lg font-black tracking-tighter ${isSelected ? 'text-black' : isToday ? 'text-blue-400' : 'text-zinc-400'}`}>
                        {day.getDate()}
                      </span>
                      
                      <div className="absolute bottom-2 flex gap-1">
                        {hasHolidays && (
                          <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-black' : 'bg-amber-400 animate-pulse'}`} />
                        )}
                        {hasEvents && (
                          <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-black' : 'bg-emerald-400'}`} />
                        )}
                        {hasTasks && (
                          <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-black' : 'bg-blue-400'}`} />
                        )}
                      </div>

                      {isSelected && (
                        <motion.div layoutId="day-highlight" className="absolute inset-0 bg-white/10 rounded-2xl pointer-events-none" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="p-8 bg-zinc-950/40 border border-white/5 rounded-3xl backdrop-blur-3xl flex items-center gap-6 group hover:border-emerald-500/20 transition-all">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Active_Events</p>
                    <p className="text-2xl font-black text-white">{events.length}</p>
                  </div>
               </div>
               <div className="p-8 bg-zinc-950/40 border border-white/5 rounded-3xl backdrop-blur-3xl flex items-center gap-6 group hover:border-amber-500/20 transition-all">
                  <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform">
                    <PartyPopper size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Global_Holidays</p>
                    <p className="text-2xl font-black text-white">{holidays.length}</p>
                  </div>
               </div>
               <div className="p-8 bg-zinc-950/40 border border-white/5 rounded-3xl backdrop-blur-3xl flex items-center gap-6 group hover:border-blue-500/20 transition-all">
                  <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Upcoming_Deadlines</p>
                    <p className="text-2xl font-black text-white">{tasks.filter(t => t.status !== 'completed').length}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Day Details */}
          <div className="xl:col-span-4 space-y-8 lg:sticky lg:top-12">
            <div className="p-10 bg-zinc-950/40 border border-white/5 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="flex flex-col mb-10">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-4">Daily_Resolution</span>
                <h3 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">
                  {selectedDay?.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                </h3>
              </div>

              <div className="space-y-6">
                {/* Add Event Button */}
                <button 
                  onClick={() => { resetForm(); setIsAddDialogOpen(true); }}
                  className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
                >
                  <Plus size={16} /> Add_Event
                </button>

                {/* Day Content List */}
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {/* Holidays */}
                    {dayHolidays.map((h, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={`holiday-${idx}`}
                        className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <PartyPopper className="w-8 h-8 text-amber-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                           <Badge className="bg-amber-500/20 text-amber-400 border-none text-[8px] uppercase tracking-widest">Global_Holiday</Badge>
                           <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">System_Event</span>
                        </div>
                        <h4 className="text-lg font-black text-amber-100 uppercase tracking-tighter italic">{h.localName}</h4>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Ref: {h.name}</p>
                      </motion.div>
                    ))}

                    {/* User Events */}
                    {filteredDaysEvents.map((event) => (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={event.id}
                        className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-emerald-500/30 transition-all group relative"
                      >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                event.priority === 'high' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                event.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{event.category} | {event.priority}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  setIsEditing(event.id);
                                  setNewEvent({
                                    title: event.title,
                                    description: event.description || '',
                                    category: event.category,
                                    priority: event.priority,
                                    is_all_day: event.is_all_day
                                  });
                                  setIsAddDialogOpen(true);
                                }} 
                                className="p-2 hover:text-blue-400 transition-colors"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button onClick={() => handleDeleteEvent(event.id)} className="p-2 hover:text-red-400 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                        </div>
                        
                        <h4 className="text-xl font-black text-white tracking-tighter uppercase mb-2 italic group-hover:text-emerald-400 transition-colors">
                          {event.title}
                        </h4>
                        
                        {event.description && (
                          <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mb-4">
                            {event.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
                            Synced
                          </span>
                          <div className="flex items-center gap-2 text-zinc-700">
                              <Clock size={12} />
                              <span className="text-[9px] font-black uppercase tracking-widest">Calendar System</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* User Tasks (Deadlines) */}
                    {filteredDaysTasks.map((task) => (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={`task-${task.id}`}
                        className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl group relative"
                      >
                        <div className="flex items-center gap-3 mb-2">
                           <Badge className="bg-blue-500/20 text-blue-400 border-none text-[8px] uppercase tracking-widest">Deadline</Badge>
                           <span className={`text-[8px] font-black uppercase tracking-widest ${task.status === 'completed' ? 'text-emerald-500' : 'text-zinc-600'}`}>
                             {task.status}
                           </span>
                        </div>
                        <h4 className="text-lg font-black text-blue-100 uppercase tracking-tighter italic">{task.title}</h4>
                        {task.description && <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 truncate">{task.description}</p>}
                      </motion.div>
                    ))}

                    {filteredDaysEvents.length === 0 && dayHolidays.length === 0 && filteredDaysTasks.length === 0 && (
                      <div className="py-20 flex flex-col items-center justify-center text-center">
                        <CalendarIcon className="w-12 h-12 text-zinc-800 mb-4" />
                        <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">No_Event_Detected</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) {
          setIsEditing(null);
          setNewEvent({ title: '', description: '', category: 'personal', priority: 'medium', is_all_day: true });
        }
      }}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white backdrop-blur-2xl rounded-[2rem] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
              {isEditing ? 'Modify_Event' : 'Add_Event'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Event_Title</label>
              <Input 
                placeholder="e.g., Final Exam Preparation" 
                className="bg-white/5 border-white/10 rounded-xl h-14 text-white focus:border-emerald-500/50 transition-all font-bold"
                value={newEvent.title}
                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Details</label>
              <Textarea 
                placeholder="Event metadata..." 
                className="bg-white/5 border-white/10 rounded-xl min-h-[100px] text-white focus:border-emerald-500/50 transition-all"
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Category</label>
                <Select 
                  value={newEvent.category} 
                  onValueChange={(val: any) => setNewEvent({...newEvent, category: val})}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-14 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white font-bold">
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Priority</label>
                <Select 
                  value={newEvent.priority} 
                  onValueChange={(val: any) => setNewEvent({...newEvent, priority: val})}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-14 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white font-bold">
                    <SelectItem value="low">Low_Tier</SelectItem>
                    <SelectItem value="medium">Standard</SelectItem>
                    <SelectItem value="high">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEvent} className="w-full h-16 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-emerald-500 transition-all">
              {isEditing ? 'Update Event' : 'Add_Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { resetForm(); setIsAddDialogOpen(true); }}
        className="fixed bottom-10 right-10 w-20 h-20 bg-emerald-500 text-black rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.4)] z-[100] group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <Plus size={32} className="relative z-10" />
      </motion.button>
    </div>
  );
};

export default EnhancedCalendar;