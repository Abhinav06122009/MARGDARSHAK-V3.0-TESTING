// src/components/timetable/Timetable.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar, Clock, MapPin, BookOpen,
  Search, Filter, Edit, Trash2, Shield, Eye, BarChart3, CheckCircle,
  AlertCircle, Users, GraduationCap, Palette, X, Zap, CalendarPlus, CalendarCheck, Edit3
} from 'lucide-react';
import TimetableHeader from './TimetableHeader';
import TimeSlots from './TimeSlots';
import TimetableGrid from './TimetableGrid';
import EventForm from './EventForm';
import { timetableHelpers, smartScheduler, TimetableEvent, ConflictInfo, WorkloadSuggestion, TimetableStats, SecureUser, EventFormData } from './timetableUtils';
import ParallaxBackground from '@/components/ui/ParallaxBackground';
import { TiltCard } from '@/components/ui/TiltCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Link, useNavigate } from 'react-router-dom';
import logo from "@/components/logo/logo.png";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUser } from '@clerk/react';
import { authedFetch } from '@/lib/ai/authedFetch';
import { useAuth } from '@/contexts/AuthContext';

// src/components/timetable/Timetable.tsx


interface TimetableProps {
  onBack?: () => void;
}

const Timetable: React.FC<TimetableProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [events, setEvents] = useState<TimetableEvent[]>([]);
  const [timetableStats, setTimetableStats] = useState<TimetableStats | null>(null);
  const [categories] = useState(timetableHelpers.getEventCategories());
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimetableEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | undefined>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDay, setFilterDay] = useState('all');

  // State for Drag and Drop & Multi-select
  const [draggedEvent, setDraggedEvent] = useState<TimetableEvent | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);
  const [workloadSuggestions, setWorkloadSuggestions] = useState<WorkloadSuggestion[] | null>(null);
  const { user: authUser, loading: authLoading } = useAuth();
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    day: 1,
    start_time: '09:00',
    end_time: '10:00',
    location: '',
    instructor: '',
    course_code: '',
    room_number: '',
    building: '',
    category: 'class',
    semester: '',
    credits: undefined,
    attendance_required: true,
    online_meeting_link: '',
    meeting_password: '',
    notes: '',
    reminder_minutes: 15,
    reminder_enabled: true,
    is_public: false,
    is_exam: false,
    exam_type: '',
    preparation_time: 0,
    tags: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      initializeSecureTimetable();
    }
  }, [authLoading, authUser]);

  useEffect(() => {
    const stats = timetableHelpers.getTimetableStatistics(events);
    setTimetableStats(stats);
  }, [events]);

  const initializeSecureTimetable = async () => {
    try {
      if (authLoading) return;
      setLoading(true);

      if (!authUser) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access your timetable.",
          variant: "destructive",
        });
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      setCurrentUser({
        id: authUser.id,
        email: authUser.primaryEmailAddress?.emailAddress || '',
        profile: {
          full_name: authUser.fullName || 'User',
          role: authUser.profile?.role || 'student',
          student_id: authUser.id.substring(0, 8),
          subscription_tier: authUser.profile?.subscription_tier || 'free'
        }
      } as any);
      
      setSecurityVerified(true);

      // --- CLERK SUBSCRIPTION RESOLUTION ---
      const userTier = authUser.profile?.subscription_tier || 'free';
      const userRole = authUser.profile?.role || 'student';
      const isPremiumTier = ['premium', 'premium_elite', 'extra_plus', 'premium_plus'].includes(userTier);
      const isAdminRole = ['admin', 'superadmin', 'ceo', 'bdo'].includes(userRole);
      
      setHasPremiumAccess(isPremiumTier || isAdminRole);

      const userTimetable = await timetableHelpers.fetchUserTimetable(authUser.id);
      setEvents(userTimetable);

      toast({
        title: (
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
            Timetable Ready!
          </span>
        ) as any,
        description: (
          <span className="text-white font-medium">
            Welcome Back <span className="text-emerald-400 font-semibold">{authUser.fullName || 'User'}</span>! Your schedule is synchronized.
          </span>
        ) as any,
        className: "bg-black border border-blue-400/50 shadow-xl",
        icon: <CalendarCheck className="text-emerald-400" />
      });

    } catch (error) {
      console.error('Error initializing secure timetable:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize timetable system.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler functions
  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      day: 1,
      start_time: '09:00',
      end_time: '10:00',
      location: '',
      instructor: '',
      course_code: '',
      room_number: '',
      building: '',
      category: 'class',
      semester: '',
      credits: undefined,
      attendance_required: true,
      online_meeting_link: '',
      meeting_password: '',
      notes: '',
      reminder_minutes: 15,
      reminder_enabled: true,
      is_public: false,
      is_exam: false,
      exam_type: '',
      preparation_time: 0,
      tags: '',
    });
  };

  const handleAddEvent = () => {
    resetForm();
    setEditingEvent(null);
    setSelectedDay(undefined);
    setIsSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to manage your timetable.',
        variant: 'destructive',
      });
      return;
    }

    try {
      let savedEvent;
      if (editingEvent) {
        savedEvent = await timetableHelpers.updateEvent(editingEvent.id, formData, currentUser.id);
        setEvents(events.map(e => e.id === savedEvent.id ? savedEvent : e));
        toast({
          title: "Event Updated",
          description: `"${savedEvent.title}" has been successfully modified.`,
          variant: "success"
        });
      } else {
        savedEvent = await timetableHelpers.createEvent(formData, currentUser.id);
        setEvents([...events, savedEvent]);
        toast({
          title: "Event Created",
          description: `"${savedEvent.title}" added to your schedule.`,
          variant: "success"
        });
      }

      setIsSheetOpen(false);
      setEditingEvent(null);
      resetForm();

    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Save Failed",
        description: "Could not save event. Check your connection.",
        variant: "destructive"
      });
    }
  };

  const handleEditEvent = (event: TimetableEvent) => {
    setEditingEvent(event);
    // Use spread to ensure all existing data is carried over to the form
    setFormData({
      ...formData, // Keep defaults for fields not in event
      ...event,
      description: event.description || '', // Ensure non-nullable fields have defaults
      credits: event.credits ?? undefined,
      tags: event.tags?.join(', ') || '',
      online_meeting_link: event.online_meeting_link || '',
      meeting_password: event.meeting_password || '',
      notes: event.notes || '',
      reminder_minutes: event.reminder_minutes,
      reminder_enabled: event.reminder_enabled,
      is_public: event.is_public,
      is_exam: event.is_exam,
    });
    setIsSheetOpen(true);
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    if (!currentUser) return;

    try {
      setEvents(events.filter(e => e.id !== id)); // Optimistic update
      await timetableHelpers.deleteEvent(id, currentUser.id);

      toast({
        title: (
          <span className="bg-gradient-to-r from-red-500 via-pink-600 to-rose-400 bg-clip-text text-transparent font-bold">
            Event Deleted Successfully
          </span>
        ) as any,
        description: (
          <span className="text-white font-medium">
            "<span className="text-rose-400 font-semibold">{title}</span>" has been removed from your timetable.
          </span>
        ) as any,
        className: "bg-black border border-red-500/50 shadow-2xl",
        icon: <Trash2 className="text-rose-400" />,
        duration: 5000,
        isClosable: true
      });


    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error Deleting Event",
        description: `Failed to delete event: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setEditingEvent(null);
    setFormData({
      ...formData,
      day: day
    });
    setIsSheetOpen(true);
  };

  const handleSuggestTime = async () => {
    if (!hasPremiumAccess) {
      toast({ title: "Premium Feature", description: "Upgrade to premium_elite to use AI scheduling.", variant: "destructive" });
      return;
    }

    toast({
      title: "🧠 Saarthi is analyzing your schedule...",
      description: "Reading your courses, tasks and timetable for the best slot.",
      className: "bg-black border border-blue-500/50 shadow-xl",
    });

    try {
      // 1. Fetch full context from backend
      const ctxRes = await authedFetch('/.netlify/functions/timetable-crud', {
        method: 'POST',
        body: JSON.stringify({ action: 'fetch-context', userId: currentUser?.id })
      });
      const ctx = ctxRes.ok ? await ctxRes.json() : { events: [], tasks: [], syllabi: [], studyPlans: [] };

      const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      // 2. Build context strings
      const timetableCtx = (ctx.events || events).map((e: any) =>
        `  • ${e.title} | ${DAY_NAMES[e.day]} ${e.start_time}–${e.end_time} | ${e.category}${e.instructor ? ` | ${e.instructor}` : ''}`
      ).join('\n') || '  (No events yet)';

      const tasksCtx = (ctx.tasks || []).slice(0, 10).map((t: any) =>
        `  • [${t.priority || 'medium'}] ${t.title}${t.due_date ? ` — due ${t.due_date}` : ''}${t.subject ? ` | ${t.subject}` : ''}`
      ).join('\n') || '  (No pending tasks)';

      const coursesCtx = (ctx.syllabi || []).slice(0, 10).map((s: any) =>
        `  • ${s.course_name}${s.exam_date ? ` | Exam: ${s.exam_date}` : ''}${s.topics?.length ? ` | Topics: ${s.topics.slice(0, 4).join(', ')}` : ''}`
      ).join('\n') || '  (No courses added)';

      const studyCtx = (ctx.studyPlans || []).slice(0, 5).map((p: any) =>
        `  • ${p.subject || p.title || 'Study session'} | ${p.daily_hours || 2}h/day`
      ).join('\n') || '  (No study plans)';

      const prompt = `You are Saarthi, an elite academic schedule optimizer. Use ALL context below to suggest the BEST available time slot.

📅 CURRENT TIMETABLE:
${timetableCtx}

📚 PENDING TASKS & DEADLINES:
${tasksCtx}

🎓 ENROLLED COURSES:
${coursesCtx}

📖 STUDY PLANS:
${studyCtx}

🎯 NEW EVENT TO SCHEDULE:
Title: "${formData.title || 'New Event'}"
Category: ${formData.category}
Duration needed: ~1 hour

INSTRUCTIONS:
- Avoid time conflicts with existing events
- For study/class events, prefer morning/afternoon (08:00–17:00)
- For personal/break, prefer gaps between heavy sessions
- If there are upcoming exam dates, prioritize study slots before them
- Consider task deadlines when suggesting priority slots

Return ONLY this JSON: {"day": <0-6, 0=Sunday>, "start_time": "HH:MM", "end_time": "HH:MM", "reason": "1-2 sentence explanation referencing specific context (tasks, courses, or exam dates)"}`;

      // 3. Call qwen-safety
      const res = await authedFetch('/.netlify/functions/neuro-engine', {
        method: 'POST',
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], model: 'qwen-safety', jsonMode: true, task: 'research' })
      });

      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();
      const suggestion = typeof data.response === 'string' ? JSON.parse(data.response) : data.response;

      if (suggestion?.day !== undefined && suggestion?.start_time) {
        setFormData(prev => ({ ...prev, day: suggestion.day, start_time: suggestion.start_time, end_time: suggestion.end_time }));
        toast({
          title: (<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-bold">✨ AI Time Suggested!</span>) as any,
          description: suggestion.reason || `Best slot: ${DAY_NAMES[suggestion.day]} at ${suggestion.start_time}.`,
          className: "bg-black border border-blue-500/50 shadow-xl",
          icon: <Zap className="text-blue-400" />,
        });
      } else throw new Error('Invalid AI response');

    } catch (err: any) {
      console.error('[AI Suggest] Failed:', err);
      const tempEvent = { ...formData, start_time: '09:00', end_time: '10:00' } as any;
      const suggestion = smartScheduler.findNextAvailableSlot(events, tempEvent, new Date().getDay());
      if (suggestion) {
        setFormData(prev => ({ ...prev, day: suggestion.day, start_time: suggestion.start_time, end_time: suggestion.end_time }));
        toast({ title: "Slot Found", description: `Suggested: ${timetableHelpers.getDayNames()[suggestion.day]} at ${suggestion.start_time}.`, className: "bg-black border border-amber-500/50" });
      } else {
        toast({ title: "No Slots Found", description: "Your schedule looks full!", className: "bg-black border border-red-500/50" });
      }
    }
  };

  const handleEventDrop = async (eventId: string, newDay: number, newStartTime: string) => {
    if (!currentUser || !draggedEvent) return;

    const eventToUpdate = events.find(e => e.id === eventId);
    if (!eventToUpdate) return;

    // Calculate new end time based on original duration
    const start = new Date(`2000-01-01T${eventToUpdate.start_time}`);
    const end = new Date(`2000-01-01T${eventToUpdate.end_time}`);
    const durationMs = end.getTime() - start.getTime();

    const newStart = new Date(`2000-01-01T${newStartTime}`);
    const newEnd = new Date(newStart.getTime() + durationMs);

    const newEndTime = `${String(newEnd.getHours()).padStart(2, '0')}:${String(newEnd.getMinutes()).padStart(2, '0')}`;

    const updatedEventData = {
      ...eventToUpdate,
      day: newDay,
      start_time: newStartTime,
      end_time: newEndTime,
    };

    // Conflict detection
    const conflicts = events.filter(e =>
      e.id !== eventId &&
      e.day === newDay &&
      (
        (newStartTime >= e.start_time && newStartTime < e.end_time) ||
        (newEndTime > e.start_time && newEndTime <= e.end_time) ||
        (newStartTime <= e.start_time && newEndTime >= e.end_time)
      )
    );

    if (conflicts.length > 0) {
      const suggestion = smartScheduler.findNextAvailableSlot(events, updatedEventData, newDay);
      setConflictInfo({
        conflictingEvent: conflicts[0],
        eventToSchedule: updatedEventData,
        suggestedSlot: suggestion,
      });
      setDraggedEvent(null); // Reset dragged event
      return;
    }

    // Optimistic update
    setEvents(events.map(e => e.id === eventId ? updatedEventData : e));
    setDraggedEvent(null);

    // Actual update
    await timetableHelpers.updateEvent(eventId, updatedEventData, currentUser.id);
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleBulkDelete = async () => {
    if (!currentUser || selectedEvents.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedEvents.length} selected events?`)) return;
    try {
      await Promise.all(selectedEvents.map(id => timetableHelpers.deleteEvent(id, currentUser.id)));
      toast({ title: "Bulk Delete Successful", description: `${selectedEvents.length} events have been removed.` });
    } catch (error) {
      toast({ title: "Bulk Delete Failed", description: "Could not delete all selected events.", variant: "destructive" });
    }
    setEvents(events.filter(e => !selectedEvents.includes(e.id)));
    setSelectedEvents([]);
  };

  const handleSearch = async () => {
    if (!currentUser) return;

    try {
      if (searchTerm.trim()) {
        const results = await timetableHelpers.searchTimetableEvents(
          searchTerm,
          currentUser.id,
          filterDay !== 'all' ? parseInt(filterDay) : undefined,
          filterCategory !== 'all' ? filterCategory : undefined
        );
        setEvents(results);
      } else {
        const userTimetable = await timetableHelpers.fetchUserTimetable(currentUser.id);
        setEvents(userTimetable);
      }
    } catch (error) {
      console.error('Error searching timetable events:', error);
    }
  };

  const getCurrentWeekDates = () => {
    return timetableHelpers.getCurrentWeekDates(currentDate);
  };

  const handleSmartAction = async (action: 'balance' | 'breaks') => {
    if (!hasPremiumAccess) {
      toast({ title: "Premium Feature", description: "Upgrade to premium_elite to use Smart Actions.", variant: "destructive" });
      return;
    }

    if (action === 'balance') {
      toast({
        title: "🧠 Saarthi is deep-analyzing...",
        description: "Reading your courses, tasks and entire schedule to balance workload.",
        variant: "premium",
      });

      try {
        // Fetch full context
        const ctxRes = await authedFetch('/.netlify/functions/timetable-crud', {
          method: 'POST',
          body: JSON.stringify({ action: 'fetch-context', userId: currentUser?.id })
        });
        const ctx = ctxRes.ok ? await ctxRes.json() : { events: [], tasks: [], syllabi: [], studyPlans: [] };

        const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const workload = smartScheduler.analyzeWorkload(events);

        const timetableCtx = (ctx.events || events).map((e: any) =>
          `  • ${e.title} | ${DAY_NAMES[e.day]} ${e.start_time}–${e.end_time} | ${e.category}`
        ).join('\n') || '  (empty)';

        const tasksCtx = (ctx.tasks || []).slice(0, 15).map((t: any) =>
          `  • [${t.priority || 'medium'}] ${t.title}${t.due_date ? ` — due ${t.due_date}` : ''}`
        ).join('\n') || '  (none)';

        const coursesCtx = (ctx.syllabi || []).map((s: any) =>
          `  • ${s.course_name}${s.exam_date ? ` | Exam: ${s.exam_date}` : ''}`
        ).join('\n') || '  (none)';

        const workloadCtx = Object.entries(workload)
          .map(([day, hours]) => `  ${DAY_NAMES[parseInt(day)]}: ${(hours as number).toFixed(1)}h`).join('\n');

        const prompt = `You are Saarthi, an elite academic schedule optimizer. Analyze ALL context below to find the BEST schedule rebalancing suggestion.

📅 CURRENT TIMETABLE:
${timetableCtx}

⏱ WORKLOAD PER DAY:
${workloadCtx}

📚 PENDING TASKS:
${tasksCtx}

🎓 COURSES & EXAM DATES:
${coursesCtx}

INSTRUCTIONS:
- Find the most overloaded day vs the lightest day
- Suggest moving ONE specific event (prefer personal/seminar/break category) to balance the schedule
- Consider upcoming exam dates: days before an exam should be lighter
- Consider task deadlines when deciding what to move
- Provide a meaningful reason that references specific courses or tasks

Return ONLY this JSON: {"eventTitle": "exact event title", "fromDay": <0-6>, "toDay": <0-6>, "newStartTime": "HH:MM", "newEndTime": "HH:MM", "reason": "1-2 sentences referencing specific tasks or exam dates"}`;

        const res = await authedFetch('/.netlify/functions/neuro-engine', {
          method: 'POST',
          body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], model: 'qwen-safety', jsonMode: true, task: 'research' })
        });

        if (!res.ok) throw new Error('AI request failed');
        const data = await res.json();
        const suggestion = typeof data.response === 'string' ? JSON.parse(data.response) : data.response;

        if (suggestion?.eventTitle) {
          const matchedEvent = events.find(e => e.title.toLowerCase().includes(suggestion.eventTitle.toLowerCase()));
          if (matchedEvent) {
            const wkLoad = smartScheduler.analyzeWorkload(events);
            setWorkloadSuggestions([{
              eventToMove: matchedEvent,
              newSlot: { day: suggestion.toDay, start_time: suggestion.newStartTime, end_time: suggestion.newEndTime },
              fromDay: suggestion.fromDay,
              toDay: suggestion.toDay,
              workloadBefore: wkLoad[suggestion.fromDay] || 0,
              workloadAfter: wkLoad[suggestion.toDay] || 0,
              reason: suggestion.reason
            }]);
            return;
          }
        }
        throw new Error('AI could not match a specific event');
      } catch (err: any) {
        console.error('[AI Balance] Fallback:', err);
        const currentWorkload = smartScheduler.analyzeWorkload(events);
        const suggestions = smartScheduler.balanceWorkload(events, currentWorkload);
        if (suggestions && suggestions.length > 0) {
          setWorkloadSuggestions(suggestions);
        } else {
          toast({
            title: "Schedule is Balanced",
            description: "Your workload is well-distributed across the week.",
            variant: "success"
          });
        }
      }
    } else {
      console.log('Smart action:', action);
    }
  };

  const handleConflictResolution = async (resolution: 'override' | 'reschedule' | 'cancel') => {
    if (!conflictInfo || !currentUser) return;

    const { eventToSchedule } = conflictInfo;
    const isNewEvent = !events.some(e => e.id === eventToSchedule.id);

    if (resolution === 'reschedule' && conflictInfo.suggestedSlot) {
      const rescheduledEvent: TimetableEvent = {
        ...eventToSchedule,
        day: conflictInfo.suggestedSlot.day,
        start_time: conflictInfo.suggestedSlot.start_time,
        end_time: conflictInfo.suggestedSlot.end_time,
      };
      if (isNewEvent) {
        const newEvent = await timetableHelpers.createEvent(rescheduledEvent, currentUser.id);
        setEvents(prev => [...prev, newEvent]);
      } else {
        const updatedEvent = await timetableHelpers.updateEvent(rescheduledEvent.id, rescheduledEvent, currentUser.id);
        setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      }
    } else if (resolution === 'override') {
      if (isNewEvent) {
        const newEvent = await timetableHelpers.createEvent(eventToSchedule, currentUser.id);
        setEvents(prev => [...prev, newEvent]);
      } else {
        const updatedEvent = await timetableHelpers.updateEvent(eventToSchedule.id, eventToSchedule, currentUser.id);
        setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      }
    }
    // 'cancel' does nothing to the backend, and if it was a new event, it's just discarded.

    setConflictInfo(null);
    setIsSheetOpen(false); // Close the form if it was open
  };

  const handleWorkloadBalanceAccept = async () => {
    if (!workloadSuggestions || !currentUser) return;

    // For now, we handle one suggestion at a time. This can be extended.
    const suggestion = workloadSuggestions[0];
    const { eventToMove, newSlot } = suggestion;

    const updatedEventData = {
      ...eventToMove,
      day: newSlot.day,
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
    };

    await timetableHelpers.updateEvent(eventToMove.id, updatedEventData, currentUser.id);
    setEvents(events.map(e => e.id === eventToMove.id ? updatedEventData : e));

    toast({
      title: "AI Workload Balanced!",
      description: `Moved "${eventToMove.title}" to a less busy day to improve your schedule.`,
      variant: "success"
    });

    setWorkloadSuggestions(null);
  };

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 z-10 animate-pulse">
          <div className="h-24 bg-black/20 rounded-2xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            {[...Array(5)].map(i => <div key={i} className="h-32 bg-black/20 rounded-3xl"></div>)}
          </div>
          <div className="h-16 bg-black/20 rounded-2xl mb-4"></div>
          <div className="h-[60vh] bg-black/20 rounded-2xl"></div>
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="h-20 bg-black/20 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="bg-black/50 backdrop-blur-md rounded-3xl p-12 border border-red-400/20 text-center relative z-10 max-w-md mx-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-white/70 mb-8">Please log in to access your secure timetable.</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-white/60">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4" /><span>Private & Secure</span></div>
            <div className="flex items-center gap-2"><Palette className="w-4 h-4" /><span>Fully Customizable</span></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center relative overflow-hidden">
      {/* Slide-over Panel for Event Creation/Edit - Moved to top for viewport anchoring */}
      <AnimatePresence>
        {isSheetOpen && (
            <EventForm
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              editingEvent={editingEvent}
              hasPremiumAccess={hasPremiumAccess}
              onSuggestTime={handleSuggestTime}
              onClose={() => {
                setIsSheetOpen(false);
                resetForm();
                setEditingEvent(null);
              }}
            />
        )}
      </AnimatePresence>

      {/* Enhanced Animated Background */}
      <ParallaxBackground />
      <div className="w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 z-10">
        {/* Enhanced Multi-Color Header */}
        <TimetableHeader
          onBack={onBack || (() => navigate('/dashboard'))}
          currentDate={currentDate}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
          onAddEvent={handleAddEvent}
          onSmartAction={handleSmartAction}
          hasPremiumAccess={hasPremiumAccess}
          eventCount={events.length}
          userName={currentUser?.profile?.full_name || 'User'}
        />

        {/* Enhanced Statistics Dashboard */}
        {timetableStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="px-8 py-10"
          >
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  icon: Calendar,
                  value: timetableStats.total_events,
                  label: 'Total Events',
                  gradient: 'from-blue-500/20 to-indigo-500/20',
                  accent: 'text-blue-400'
                },
                {
                  icon: BookOpen,
                  value: timetableStats.classes,
                  label: 'Classes',
                  gradient: 'from-emerald-500/20 to-teal-500/20',
                  accent: 'text-emerald-400'
                },
                {
                  icon: AlertCircle,
                  value: timetableStats.exams,
                  label: 'Exams',
                  gradient: 'from-rose-500/20 to-red-500/20',
                  accent: 'text-rose-400'
                },
                {
                  icon: Clock,
                  value: `${Math.round(timetableStats.total_weekly_hours)}h`,
                  label: 'Weekly Hours',
                  gradient: 'from-violet-500/20 to-purple-500/20',
                  accent: 'text-violet-400'
                },
                {
                  icon: MapPin,
                  value: timetableStats.most_common_location || 'N/A',
                  label: 'Top Location',
                  gradient: 'from-amber-500/20 to-orange-500/20',
                  accent: 'text-amber-400'
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index + 0.5 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative bg-white/[0.03] backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden shadow-2xl"
                >
                  {/* Inner Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${stat.accent} group-hover:scale-110 transition-transform duration-500`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-3xl font-black text-white tracking-tighter group-hover:tracking-normal transition-all duration-500">
                          {stat.value}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em] group-hover:text-zinc-300 transition-colors">{stat.label}</h3>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Zap className={`w-3 h-3 ${stat.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Advanced Search & Filter System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-8 py-6 mb-8"
        >
          <div className="max-w-7xl mx-auto p-4 bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 h-4 w-4 transition-colors" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-zinc-600 focus:bg-white/[0.08] focus:border-indigo-500/50 focus:ring-0 transition-all duration-300"
                />
              </div>

              <div className="group">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 text-zinc-300 rounded-2xl focus:border-indigo-500/50 transition-all">
                    <div className="flex items-center gap-3">
                      <Filter className="h-4 w-4 text-zinc-500" />
                      <SelectValue placeholder="All Categories" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white shadow-2xl rounded-2xl">
                    <SelectItem value="all" className="rounded-xl">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="rounded-xl">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium">{category.icon} {category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="group">
                <Select value={filterDay} onValueChange={setFilterDay}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 text-zinc-300 rounded-2xl focus:border-indigo-500/50 transition-all">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-zinc-500" />
                      <SelectValue placeholder="All Days" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white shadow-2xl rounded-2xl">
                    <SelectItem value="all" className="rounded-xl">All Days</SelectItem>
                    {timetableHelpers.getDayNames().map((day, index) => (
                      <SelectItem key={index} value={index.toString()} className="rounded-xl">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: timetableHelpers.getDayColors()[index]?.color }}
                          />
                          <span className="font-medium">{day}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <motion.button
                onClick={handleSearch}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="h-14 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                <Search className="h-5 w-5" />
                Analyze Schedule
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Multi-Color Timetable Grid */}
        <div className="flex-1 flex overflow-hidden mt-4 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
          <TimeSlots colorHelpers={timetableHelpers} />
          <TimetableGrid
            currentWeekDates={getCurrentWeekDates()}
            events={events}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onDayClick={handleDayClick}
            colorHelpers={timetableHelpers}
            onEventDrop={handleEventDrop}
            draggedEvent={draggedEvent}
            setDraggedEvent={(e: any) => setDraggedEvent(e)}
            selectedEvents={selectedEvents}
            hasPremiumAccess={hasPremiumAccess}
            onEventSelect={handleEventSelect}
          />
        </div>

        {/* Batch Operations Bar */}
        <AnimatePresence>
          {selectedEvents.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto bg-black/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-2 flex items-center gap-2 z-50"
            >
              <span className="text-white font-semibold px-3 text-sm">{selectedEvents.length} selected</span>
              <div className="h-6 w-px bg-white/20" />
              {hasPremiumAccess ? (
                <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm rounded-xl" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" className="text-red-400/50 cursor-not-allowed text-sm rounded-xl"><Trash2 className="w-4 h-4 mr-2" /> Delete</Button></TooltipTrigger>
                    <TooltipContent><p>Bulk Delete is a Pro feature.</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white" onClick={() => setSelectedEvents([])}>
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Workload Balancing Dialog */}
        <Dialog open={!!workloadSuggestions} onOpenChange={() => setWorkloadSuggestions(null)}>
          <DialogContent className="bg-black/80 backdrop-blur-2xl border-white/20 text-white">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2 text-2xl text-yellow-400">
                <Zap className="w-7 h-7" /> Smart Schedule Suggestion
              </DialogTitle>
              {workloadSuggestions && workloadSuggestions.length > 0 && (
                <DialogDescription className="text-white/80 pt-2">
                  Your schedule on <span className="font-bold text-white">{timetableHelpers.getDayNames()[workloadSuggestions[0].fromDay]}</span> seems a bit heavy
                  ({Math.round(workloadSuggestions[0].workloadBefore)} hours).
                  <br />
                  We can move "<span className="font-bold text-white">{workloadSuggestions[0].eventToMove.title}</span>" to a quieter slot on <span className="font-bold text-white">{timetableHelpers.getDayNames()[workloadSuggestions[0].toDay]}</span> to balance things out.
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="space-y-4">
              <div className="border border-white/10 rounded-lg p-4 bg-black/20">
                <p className="font-bold text-white">Proposed Change:</p>
                <p className="text-white/80">
                  Move <span className="text-cyan-400">{workloadSuggestions?.[0].eventToMove.title}</span>
                </p>
                <p className="text-white/80">
                  From: <span className="text-red-400">{timetableHelpers.getDayNames()[workloadSuggestions?.[0].fromDay ?? 0]}</span>
                </p>
                <p className="text-white/80">
                  To: <span className="text-green-400">{timetableHelpers.getDayNames()[workloadSuggestions?.[0].toDay ?? 0]} at {timetableHelpers.formatTime(workloadSuggestions?.[0].newSlot.start_time ?? '00:00')}</span>
                </p>
              </div>
              <Button
                onClick={handleWorkloadBalanceAccept}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-6 text-base rounded-xl"
              >
                <Zap className="w-5 h-5 mr-2" />
                Yes, Balance My Schedule
              </Button>
            </div>
            <DialogFooter className="pt-4">
              <Button onClick={() => setWorkloadSuggestions(null)} variant="ghost" className="w-full">No, Keep It As Is</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Conflict Resolution Dialog */}
        <Dialog open={!!conflictInfo} onOpenChange={() => setConflictInfo(null)}>
          <DialogContent className="bg-black/80 backdrop-blur-2xl border-white/20 text-white">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2 text-2xl text-orange-400">
                <AlertCircle className="w-7 h-7" /> Scheduling Conflict Detected
              </DialogTitle>
              <DialogDescription className="text-white/80 pt-2">
                The event "<span className="font-bold text-white">{conflictInfo?.eventToSchedule.title}</span>"
                overlaps with "<span className="font-bold text-white">{conflictInfo?.conflictingEvent.title}</span>".
                <br />
                How would you like to proceed?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {conflictInfo?.suggestedSlot && (
                <Button
                  onClick={() => handleConflictResolution('reschedule')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-6 text-base rounded-xl"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Reschedule to {timetableHelpers.getDayNames()[conflictInfo.suggestedSlot.day]} at {timetableHelpers.formatTime(conflictInfo.suggestedSlot.start_time)}
                </Button>
              )}
              <Button onClick={() => handleConflictResolution('override')} variant="destructive" className="w-full py-6 text-base rounded-xl">
                Override & Create Conflict Anyway
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => handleConflictResolution('cancel')} variant="ghost" className="w-full">
                Cancel Action
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>

    </div>
  );
};

export default Timetable;
