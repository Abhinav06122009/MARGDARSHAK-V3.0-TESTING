import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, GraduationCap, TrendingUp, Palette, Zap, 
  Youtube, FileText, Code, Edit, Plus 
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Course, CourseFormData, CuratedContent } from '@/components/dashboard/course';
import { courseService } from '@/components/dashboard/courseService';

interface CourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: CourseFormData;
  setFormData: React.Dispatch<React.SetStateAction<CourseFormData>>;
  editingCourse: Course | null;
  curatedContent: CuratedContent[];
}

const CourseForm: React.FC<CourseFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingCourse,
  curatedContent,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 w-full max-w-xl h-fit max-h-screen bg-zinc-950 border-l border-white/10 z-[101] shadow-2xl flex flex-col overflow-y-auto custom-scrollbar"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-xl shrink-0">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">
                  {editingCourse ? editingCourse.name : 'Academic Integration'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6">
              <form id="course-form" onSubmit={onSubmit} className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Course Name</Label>
                    <Input 
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Advanced Mathematics"
                      className="h-12 bg-zinc-900/50 border-white/5 rounded-2xl text-white placeholder:text-zinc-700 focus:border-indigo-500/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Course Code</Label>
                      <Input 
                        required
                        value={formData.code}
                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                        placeholder="MATH401"
                        className="h-12 bg-zinc-900/50 border-white/5 rounded-2xl text-white font-mono"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Credits</Label>
                      <Input 
                        type="number"
                        value={formData.credits}
                        onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                        className="h-12 bg-zinc-900/50 border-white/5 rounded-2xl text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Description</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[100px] bg-zinc-900/50 border-white/5 rounded-2xl text-white resize-none"
                  />
                </div>

                {/* Classification */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Priority</Label>
                    <Select value={formData.priority} onValueChange={(v: any) => setFormData({ ...formData, priority: v })}>
                      <SelectTrigger className="h-12 bg-zinc-900/50 border-white/5 rounded-2xl text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        <SelectItem value="low">📝 Low</SelectItem>
                        <SelectItem value="medium">📋 Medium</SelectItem>
                        <SelectItem value="high">⚡ High</SelectItem>
                        <SelectItem value="urgent">🔥 Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Difficulty</Label>
                    <Select value={formData.difficulty} onValueChange={(v: any) => setFormData({ ...formData, difficulty: v })}>
                      <SelectTrigger className="h-12 bg-zinc-900/50 border-white/5 rounded-2xl text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        <SelectItem value="beginner">🌱 Beginner</SelectItem>
                        <SelectItem value="intermediate">🚀 Intermediate</SelectItem>
                        <SelectItem value="advanced">🎯 Advanced</SelectItem>
                        <SelectItem value="expert">💎 Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Color & Visuals */}
                <div className="p-4 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-4">
                  <Label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Palette className="w-3 h-3" /> Course Identity
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="color" 
                      value={formData.color}
                      onChange={e => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-12 p-1 rounded-xl bg-transparent border-white/10 cursor-pointer"
                    />
                    <div className="flex-1 p-3 rounded-xl border border-white/5 bg-zinc-950 flex items-center justify-between">
                      <span className="text-xs font-mono text-zinc-500">{formData.color}</span>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: formData.color }} />
                    </div>
                  </div>
                </div>

                {/* AI Curated Content */}
                {editingCourse && curatedContent.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-xs font-black text-teal-400 uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-3 h-3" /> AI Suggested Resources
                    </Label>
                    <div className="space-y-2">
                      {curatedContent.map((content, idx) => (
                        <a 
                          key={idx} 
                          href={content.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 rounded-2xl bg-teal-500/5 border border-teal-500/10 hover:border-teal-500/30 transition-all group"
                        >
                          <div className="p-2 rounded-xl bg-teal-500/10">
                            {content.type === 'video' ? <Youtube className="w-4 h-4 text-teal-400" /> : <FileText className="w-4 h-4 text-teal-400" />}
                          </div>
                          <span className="text-xs font-bold text-white group-hover:text-teal-400 transition-colors truncate">{content.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons Snapped to Content */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 h-12 rounded-2xl text-xs font-black text-zinc-500 hover:text-white transition-all"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {editingCourse ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingCourse ? 'Save Changes' : 'Initialize Course'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CourseForm;
