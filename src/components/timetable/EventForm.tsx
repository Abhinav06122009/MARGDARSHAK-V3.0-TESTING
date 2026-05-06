import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, Clock, GraduationCap, Palette, Save, X, Zap, 
  MapPin, User, Sparkles, LayoutGrid, CalendarDays
} from 'lucide-react';
import { EventFormData, timetableHelpers } from './timetableUtils';
import { useToast } from '@/hooks/use-toast';

interface EventFormProps {
  formData: EventFormData;
  setFormData: React.Dispatch<React.SetStateAction<EventFormData>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  editingEvent: any | null;
  hasPremiumAccess: boolean;
  onSuggestTime: () => void;
  onClose: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10,
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

const EventForm: React.FC<EventFormProps> = ({
  formData,
  setFormData,
  handleSubmit,
  editingEvent,
  hasPremiumAccess,
  onSuggestTime,
  onClose,
}) => {
  const { toast } = useToast();
  const categories = timetableHelpers.getEventCategories();

  const handleSuggestTime = () => {
    if (!hasPremiumAccess) {
        toast({
            title: (
              <span className="bg-gradient-to-r from-red-400 to-rose-600 bg-clip-text text-transparent font-bold">
                Premium Feature
              </span>
            ),
            description: "Upgrade to premium_elite to use AI-powered scheduling.",
            className: "bg-[#0A0A0A] border border-white/10 shadow-2xl",
            variant: "destructive",
        });
        return;
    }
    onSuggestTime();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Dynamic Background Blur */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#050505]/60 backdrop-blur-md cursor-pointer"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative w-full max-w-3xl max-h-[85vh] bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/20 blur-[100px] pointer-events-none" />

        {/* Floating Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/5 backdrop-blur-xl relative z-10">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20"
            >
              <CalendarDays className="w-6 h-6 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {editingEvent ? 'Edit Expedition' : 'New Expedition'}
              </h2>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Timetable Command Center</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </motion.button>
        </div>
        
        {/* Scrollable Command Body */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar relative z-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* --- PRIMARY INTEL --- */}
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Primary Intel</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <Label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Event Designation</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Quantum Mechanics Lab"
                    className="h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-zinc-600 focus:bg-white/[0.08] focus:border-indigo-500/50 transition-all duration-300 shadow-xl"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Classification</Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:border-indigo-500/50 shadow-xl">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="rounded-xl focus:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{cat.icon}</span>
                            <span className="font-medium text-sm">{cat.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Tactical Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional briefing details..."
                  className="min-h-[100px] bg-white/5 border-white/10 rounded-2xl text-white resize-none focus:bg-white/[0.08] transition-all shadow-xl"
                />
              </div>
            </motion.section>

            {/* --- TEMPORAL COORDINATES --- */}
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Temporal Coordinates</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Operation Day</Label>
                  <Select value={formData.day.toString()} onValueChange={(v) => setFormData({ ...formData, day: parseInt(v) })}>
                    <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white rounded-2xl shadow-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl">
                      {timetableHelpers.getDayNames().map((day, i) => (
                        <SelectItem key={i} value={i.toString()} className="rounded-xl">{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Start Time</Label>
                  <Input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-2xl text-white shadow-xl" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">End Time</Label>
                  <Input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-2xl text-white shadow-xl" />
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSuggestTime}
                className={`w-full h-14 rounded-2xl border flex items-center justify-center gap-3 transition-all duration-300 ${
                  hasPremiumAccess 
                    ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20' 
                    : 'border-white/5 bg-white/5 text-zinc-500 grayscale opacity-60'
                }`}
              >
                <Zap className={`w-5 h-5 ${hasPremiumAccess ? 'text-indigo-400 animate-pulse' : ''}`} />
                <span className="text-sm font-black uppercase tracking-widest">
                  {hasPremiumAccess ? 'Saarthi AI: Optimize Slot' : 'AI Suggestion (Pro)'}
                </span>
              </motion.button>
            </motion.section>

            {/* --- SPATIAL & ACADEMIC --- */}
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">Spatial & Academic</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Location / Terminal</Label>
                  <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Sector 7G, Computer Hub" className="h-14 bg-white/5 border-white/10 rounded-2xl text-white shadow-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Lead Instructor</Label>
                  <Input value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} placeholder="e.g., Prof. Xavier" className="h-14 bg-white/5 border-white/10 rounded-2xl text-white shadow-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Course Code</Label>
                  <Input value={formData.course_code} onChange={(e) => setFormData({ ...formData, course_code: e.target.value })} placeholder="e.g., CS-101" className="h-14 bg-white/5 border-white/10 rounded-2xl font-mono text-white shadow-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Credits Value</Label>
                  <Input type="number" value={formData.credits || ''} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || undefined })} placeholder="0" className="h-14 bg-white/5 border-white/10 rounded-2xl text-white shadow-xl" />
                </div>
              </div>
            </motion.section>
          </form>
        </div>

        {/* Integrated Action Bar */}
        <div className="p-8 border-t border-white/5 bg-white/5 backdrop-blur-xl relative z-10 flex items-center justify-end gap-4">
          <motion.button
            whileHover={{ scale: 1.02, x: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-8 h-14 text-sm font-black text-zinc-400 uppercase tracking-widest hover:text-white transition-colors"
          >
            Abort Operation
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2, shadow: "0 20px 40px rgba(79, 70, 229, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={(e: any) => handleSubmit(e)}
            className="px-10 h-14 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] hover:bg-[100%_0] text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-indigo-500/20 transition-all duration-500 flex items-center gap-3"
          >
            <Save size={18} />
            {editingEvent ? 'Synchronize' : 'Initialize'} Event
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default EventForm;