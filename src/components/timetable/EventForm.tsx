import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, Save, X, Zap, 
  MapPin, Sparkles, CalendarDays, CalendarPlus, Edit3
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
  clickPosition?: { x: number, y: number } | null;
}

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
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
  clickPosition,
}) => {
  const { toast } = useToast();
  const categories = timetableHelpers.getEventCategories();

  const sidebarVariants = {
    hidden: { 
      x: '100%',
      opacity: 0.5,
      filter: 'blur(10px)'
    },
    visible: { 
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: { 
        type: "spring" as const, 
        damping: 30, 
        stiffness: 300,
        mass: 0.8,
        staggerChildren: 0.05
      }
    },
    exit: { 
      x: '100%',
      opacity: 0,
      filter: 'blur(10px)',
      transition: { 
        duration: 0.3,
        ease: "easeInOut" as const
      }
    }
  };

  const handleSuggestTime = () => {
    if (!hasPremiumAccess) {
        toast({
            title: "Premium Feature",
            description: "Upgrade to premium_elite for AI-powered scheduling.",
            className: "bg-[#0A0A0A] border border-white/10",
            variant: "destructive",
        });
        return;
    }
    onSuggestTime();
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex justify-end overflow-hidden">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
      />

      <motion.div
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative w-full max-w-[550px] h-full bg-zinc-950/98 backdrop-blur-3xl border-l border-white/10 shadow-[-20px_0_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden pointer-events-auto"
      >
        {/* Animated Glow Border */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.02] backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {editingEvent ? 'Edit Event' : 'Create Event'}
              </h2>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Timetable Command Sheet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Scrollable Command Body */}
        <div className="overflow-y-auto p-8 custom-scrollbar space-y-12">
          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* --- PRIMARY INTEL --- */}
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Basic Information</span>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Event Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Advanced Mathematics"
                    className="h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-zinc-600 focus:bg-white/[0.08] focus:border-indigo-500/50 transition-all duration-300"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Classification</Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:border-indigo-500/50">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900/95 backdrop-blur-3xl border-white/10 text-white rounded-2xl">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{cat.icon}</span>
                            <span className="font-medium text-sm">{cat.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Briefing / Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe this session..."
                    className="min-h-[100px] bg-white/5 border-white/10 rounded-2xl text-white resize-none focus:bg-white/[0.08] transition-all"
                  />
                </div>
              </div>
            </motion.section>

            {/* --- TEMPORAL COORDINATES --- */}
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Schedule Logistics</span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Day of Week</Label>
                  <Select value={formData.day.toString()} onValueChange={(v) => setFormData({ ...formData, day: parseInt(v) })}>
                    <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900/95 backdrop-blur-3xl border-white/10 text-white rounded-2xl">
                      {timetableHelpers.getDayNames().map((day, i) => (
                        <SelectItem key={i} value={i.toString()} className="rounded-xl">{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Commencement</Label>
                    <Input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-2xl text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Conclusion</Label>
                    <Input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-2xl text-white" />
                  </div>
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
                <span className="text-xs font-black uppercase tracking-[0.2em]">
                  {hasPremiumAccess ? 'AI Time Suggestion' : 'AI Optimization (Locked)'}
                </span>
              </motion.button>
            </motion.section>

            {/* --- LOCATION & ACADEMICS --- */}
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">Location & Academic</span>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Terminal / Room</Label>
                    <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Room 402" className="h-14 bg-white/5 border-white/10 rounded-2xl text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Instructor</Label>
                    <Input value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} placeholder="Prof. Smith" className="h-14 bg-white/5 border-white/10 rounded-2xl text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Course Code</Label>
                    <Input value={formData.course_code} onChange={(e) => setFormData({ ...formData, course_code: e.target.value })} placeholder="MAT401" className="h-14 bg-white/5 border-white/10 rounded-2xl font-mono text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Credits</Label>
                    <Input type="number" value={formData.credits || ''} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || undefined })} placeholder="3" className="h-14 bg-white/5 border-white/10 rounded-2xl text-white" />
                  </div>
                </div>
              </div>
            </motion.section>
          </form>
        </div>

        {/* Footer Action Bar */}
        <div className="p-8 border-t border-white/5 bg-white/[0.02] backdrop-blur-xl shrink-0 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="px-6 h-14 text-xs font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            Cancel
          </Button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e: any) => handleSubmit(e)}
            className="px-8 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-indigo-500/20 transition-all duration-300 flex items-center gap-3"
          >
            <Save size={18} />
            {editingEvent ? 'Update Record' : 'Create Record'}
          </motion.button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default EventForm;