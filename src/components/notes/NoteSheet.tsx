import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, StickyNote, Sparkles, BrainCircuit, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Note, NoteFolder, FormData } from './types';
import NoteSummarizer from './ai/NoteSummarizer';

interface NoteSheetProps {
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  editingNote: Note | null;
  folders: NoteFolder[];
  isProcessingAI: boolean;
  hasPremiumAccess: boolean;
  getAISummary: (content: string) => Promise<string | null>;
  isSubmitting: boolean;
}

export const NoteSheet: React.FC<NoteSheetProps> = ({
  isOpen,
  onClose,
  handleSubmit,
  formData,
  setFormData,
  editingNote,
  folders,
  isProcessingAI,
  hasPremiumAccess,
  getAISummary,
  isSubmitting
}) => {

  const handleSummarize = async () => {
    const summary = await getAISummary(formData.content);
    if (summary) {
      const newContent = `${formData.content}\n\n---\n\n**AI Summary:**\n${summary}`;
      setFormData({ ...formData, content: newContent });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-full max-w-2xl h-fit max-h-screen bg-zinc-950/40 backdrop-blur-3xl border-l border-white/10 shadow-2xl z-50 flex flex-col overflow-y-auto custom-scrollbar"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 shrink-0 flex items-center justify-between bg-zinc-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <StickyNote className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {editingNote ? 'Update Note' : 'Initialize Note'}
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form Body */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <h3 className="text-xl font-extrabold text-white mb-2 flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                    <BookOpen className="w-5 h-5" /> Thought Integration
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold text-white/90">Objective Title *</Label>
                    <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Note Title..." required className="h-11 bg-black/30 border border-white/15 rounded-xl text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 shadow-neumorphic-inset-lg transition-all duration-300" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="folder" className="text-sm font-semibold text-white/90">Folder</Label>
                    <Select value={formData.folder} onValueChange={(v) => setFormData({ ...formData, folder: v })}>
                      <SelectTrigger className="h-11 bg-black/30 border border-white/15 rounded-xl text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-black/80 backdrop-blur-xl border-white/20 text-white">
                        {folders.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative space-y-2">
                    <Label htmlFor="content" className="text-sm font-semibold text-white/90">Content</Label>
                    <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Write your notes here..." className="min-h-[200px] bg-black/30 border border-white/15 rounded-xl p-4 leading-relaxed transition-all text-sm resize-none" />
                    <div className="absolute top-10 right-3 flex gap-2">
                      <Button type="button" size="icon" variant="ghost" onClick={handleSummarize} disabled={!hasPremiumAccess || isProcessingAI} className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 hover:border-indigo-500/30 text-zinc-500 hover:text-white transition-all disabled:opacity-30" title={hasPremiumAccess ? "Summarize with AI" : "AI Summary (Premium Only)"}>
                        {isProcessingAI
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : hasPremiumAccess
                            ? <Sparkles className="w-3 h-3 text-yellow-400" />
                            : <Lock className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-sm font-semibold text-white/90">Data Tags</Label>
                    <Input id="tags" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="e.g. quantum, research, priority" className="h-11 bg-black/30 border border-white/15 rounded-xl text-white placeholder:text-white/60 focus:bg-black/40 focus:border-blue-500/70 transition-all duration-300" />
                  </div>
                </div>

                {formData.content && formData.content.length >= 50 && (
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <NoteSummarizer
                      noteContent={formData.content}
                      noteTitle={formData.title || 'Note'}
                    />
                  </div>
                )}

                {/* Action Buttons Snapped to Content */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                  <Button type="button" variant="ghost" onClick={onClose} className="px-6 h-11 text-sm text-white/80 hover:bg-white/10 rounded-xl">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 h-11 text-sm bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    <span>{isSubmitting ? 'Syncing...' : (editingNote ? 'Update' : 'Initialize')}</span>
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
