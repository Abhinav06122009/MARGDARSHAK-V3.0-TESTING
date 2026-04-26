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
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-black/80 backdrop-blur-2xl border-l border-white/20 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-10 border-b border-white/5 bg-zinc-950/20">
              <div className="flex items-center gap-4 text-2xl text-white font-black tracking-tighter uppercase">
                <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                  <StickyNote className="w-6 h-6 text-white" />
                </div>
                {editingNote ? 'Update Note' : 'Add Note'}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="w-12 h-12 text-white/50 hover:text-white hover:bg-white/10 rounded-2xl transition-all">
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="flex-grow overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="space-y-4">
                  <Label htmlFor="title" className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Objective Title *</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Note Title..." required className="bg-black/40 border-2 border-white/5 focus:border-indigo-500/50 text-white rounded-2xl h-14 transition-all" />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="folder" className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Folder</Label>
                  <Select value={formData.folder} onValueChange={(v) => setFormData({ ...formData, folder: v })}>
                    <SelectTrigger className="bg-black/40 border-2 border-white/5 text-white rounded-2xl h-14 focus:ring-2 focus:ring-indigo-500/20"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl">
                      {folders.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative space-y-4">
                  <Label htmlFor="content" className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Content</Label>
                  <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Write your notes here..." className="min-h-[300px] bg-black/40 border-2 border-white/5 focus:border-indigo-500/50 text-white rounded-2xl p-6 leading-relaxed transition-all" />
                  <div className="absolute top-12 right-4 flex gap-2">
                    <Button type="button" size="icon" variant="ghost" onClick={handleSummarize} disabled={!hasPremiumAccess || isProcessingAI} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 text-zinc-500 hover:text-white transition-all disabled:opacity-30" title={hasPremiumAccess ? "Summarize with AI" : "AI Summary (Premium Only)"}>
                      {isProcessingAI
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : hasPremiumAccess
                          ? <Sparkles className="w-4 h-4 text-yellow-400" />
                          : <Lock className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="tags" className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Data Tags</Label>
                  <Input id="tags" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="e.g. quantum, research, priority" className="bg-black/40 border-2 border-white/5 focus:border-indigo-500/50 text-white rounded-2xl h-14 transition-all" />
                </div>
                {formData.content && formData.content.length >= 50 && (
                  <NoteSummarizer
                    noteContent={formData.content}
                    noteTitle={formData.title || 'Note'}
                  />
                )}

                <div className="flex justify-end gap-6 pt-10 mt-10 border-t border-white/5">
                  <Button type="button" variant="ghost" onClick={onClose} className="px-10 py-6 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px]">
                    Delete
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 px-10 py-4 font-black text-sm text-white shadow-xl transition-all duration-300 hover:from-indigo-700 hover:to-blue-700 active:scale-95 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5 mr-3" />
                    <span className="uppercase tracking-widest">{isSubmitting ? 'Adding note...' : (editingNote ? 'Update Note' : 'Add note')}</span>
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
