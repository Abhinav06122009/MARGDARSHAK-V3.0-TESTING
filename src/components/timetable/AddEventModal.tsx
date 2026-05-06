import React, { useState, useEffect } from 'react';
import { X, Save, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Event {
  id: string;
  title: string;
  day: number;
  start_time: string;
  end_time: string;
  color?: string;
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id'>) => void;
  editingEvent?: Event | null;
  selectedDay?: number;
}

const AddEventModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingEvent, 
  selectedDay 
}: AddEventModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    day: selectedDay || 0,
    start_time: '05:00',
    end_time: '24:00',
    color: '#3B82F6',
  });

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        day: editingEvent.day,
        start_time: editingEvent.start_time,
        end_time: editingEvent.end_time,
        color: editingEvent.color || '#3B82F6',
      });
    } else {
      setFormData({
        title: '',
        day: selectedDay || 0,
        start_time: '05:00',
        end_time: '24:00',
        color: '#3B82F6'
      });
    }
  }, [editingEvent, selectedDay]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const colors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'black', value: '#000000' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="gold-sidebar-backdrop"
          />
          {/* Sheet Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="gold-sidebar"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3 text-xl text-white font-bold">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                {editingEvent ? 'Update Event' : 'Initialize Event'}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Event Information */}
                <div className="space-y-4 p-5 bg-white/5 rounded-2xl border border-white/10 shadow-glass-neumorphic backdrop-blur-sm">
                  <h3 className="text-xl font-extrabold text-white mb-2 flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                    <Palette className="w-5 h-5" /> Intelligence Details
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold text-white/90">Event Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Project Meeting"
                      required
                      className="text-sm bg-black/30 border-white/15 rounded-xl text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300 h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="day" className="text-sm font-semibold text-white/90">Day *</Label>
                    <Select
                      value={formData.day.toString()}
                      onValueChange={(value) => setFormData({ ...formData, day: parseInt(value) })}
                    >
                      <SelectTrigger className="text-sm bg-black/30 border-white/15 rounded-xl text-white focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300 h-11">
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/60 backdrop-blur-xl border-white/20 text-white shadow-neumorphic-lg">
                        {daysOfWeek.map((day, index) => (
                          <SelectItem key={day} value={index.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="start_time" className="text-sm font-semibold text-white/90">Start Time *</label>
                      <input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className="text-sm bg-black/30 border-white/15 rounded-xl text-white focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300 h-11 px-3 w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="end_time" className="text-sm font-semibold text-white/90">End Time *</label>
                      <input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className="text-sm bg-black/30 border-white/15 rounded-xl text-white focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300 h-11 px-3 w-full"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-white/90">Color Identifier</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className={`w-full h-8 rounded-lg border-2 ${
                            formData.color === color.value ? 'border-blue-500 scale-105' : 'border-white/15'
                          } shadow-neumorphic-inset-sm transition-all duration-200`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons Snapped to Content */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="px-6 h-11 text-sm text-white/80 hover:bg-white/10 hover:text-white shadow-neumorphic-sm transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="px-8 h-11 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-neumorphic-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingEvent ? 'Update' : 'Initialize'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddEventModal;
