import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Plus, FileText, Play, Pause, Square, Save, Trash2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { dashboardService } from '@/lib/dashboardService';
import { translateClerkIdToUUID } from '@/lib/id-translator';

// Social Icons
const linkedinLogo = () => (
  <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const TwitterLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z" />
  </svg>
);

interface Note {
  id: string;
  title: string;
  content: string;
  lastEdited: number;
}

const SmartNotes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // --- UTILITIES & CALLBACKS (Must be defined before useEffect) ---
  const stopSpeaking = React.useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  const pauseSpeaking = React.useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  }, []);

  const loadNote = React.useCallback((note: Note) => {
    stopSpeaking();
    setActiveNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
  }, [stopSpeaking]);

  const createNewNote = React.useCallback(() => {
    stopSpeaking();
    setActiveNoteId(null);
    setTitle('');
    setContent('');
  }, [stopSpeaking]);

  const speakText = React.useCallback(() => {
    if (!content) return;

    if ('speechSynthesis' in window) {
      try {
        if (isPaused) {
          window.speechSynthesis.resume();
          setIsPaused(false);
          setIsSpeaking(true);
          return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(content);

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || voices[0];
          if (preferredVoice) utterance.voice = preferredVoice;
        }

        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          setIsPaused(false);
        };

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        setIsPaused(false);
      } catch (err) {
        setIsSpeaking(false);
        setIsPaused(false);
      }
    } else {
      toast({ title: "TTS Unavailable", description: "Your browser does not support Text-to-Speech.", variant: "destructive" });
    }
  }, [content, isPaused, toast]);

  const handleSave = async () => {
    if (!userId) {
      toast({ title: "Login Required", description: "You must be logged in to save notes.", variant: "destructive" });
      return;
    }
    if (!title.trim() && !content.trim()) return;

    const translatedId = await translateClerkIdToUUID(userId);
    const noteId = activeNoteId || crypto.randomUUID();
    const newNoteData = {
      id: noteId,
      user_id: translatedId,
      title: title || 'Untitled Note',
      content,
      updated_at: new Date().toISOString()
    };

    try {
      if (activeNoteId) {
        await supabase
          .from('smart_notes')
          .update(newNoteData)
          .match({ id: noteId, user_id: userId });
      } else {
        await supabase
          .from('smart_notes')
          .insert({ ...newNoteData, created_at: new Date().toISOString() });
        setActiveNoteId(noteId);
      }

      const updatedNotes = activeNoteId 
        ? notes.map(n => n.id === activeNoteId ? { ...n, title: newNoteData.title, content, lastEdited: Date.now() } : n)
        : [{ id: noteId, title: newNoteData.title, content, lastEdited: Date.now() }, ...notes];
      
      setNotes(updatedNotes);
      toast({ title: "Note Saved", description: "Your note has been saved." });
    } catch (err) {
      toast({ title: "Save Failed", description: "Could not save note.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    const translatedId = await translateClerkIdToUUID(userId);
    try {
      await supabase.from('smart_notes').delete().match({ id: id, user_id: translatedId });
      const updatedNotes = notes.filter(n => n.id !== id);
      setNotes(updatedNotes);
      if (activeNoteId === id) createNewNote();
      toast({ title: "Note Deleted", description: "Note removed successfully." });
    } catch (err) {
      toast({ title: "Delete Failed", description: "Could not delete note.", variant: "destructive" });
    }
  };

  // Load user and notes from Supabase
  useEffect(() => {
    const init = async () => {
      const user = await dashboardService.getCurrentUser();
      if (user) {
        setUserId(user.id);
        const translatedId = await translateClerkIdToUUID(user.id);
        const { data, error } = await supabase
          .from('smart_notes')
          .select('*')
          .eq('user_id', translatedId);
        if (!error && data) {
          const formattedNotes = data.map((n: any) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            lastEdited: new Date(n.updated_at || n.created_at).getTime()
          }));
          setNotes(formattedNotes);
          if (formattedNotes.length > 0) {
            loadNote(formattedNotes[0]);
          }
        }
      }
    };
    init();
  }, [loadNote]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 overflow-x-hidden font-sans selection:bg-indigo-500/30 relative">
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,15,30,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <motion.div
          animate={{ opacity: [0.1, 0.15, 0.1], scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'easeInOut' }}
          className="absolute top-0 -left-40 w-[800px] h-[800px] bg-sky-500/10 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.1, 0.05], scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 -right-40 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col min-h-screen">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-4 rounded-[2rem] shadow-2xl"
          >
            <div className="flex items-center gap-5">
              <button onClick={() => navigate('/dashboard')} className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all shadow-lg shadow-black/20">
                <ArrowLeft className="w-5 h-5 text-zinc-300" />
              </button>
              <div>
                <h1 className="text-xl font-black flex items-center gap-3 tracking-tighter uppercase italic text-white">
                  <div className="p-2 bg-sky-500/20 rounded-lg border border-sky-500/30">
                    <FileText className="w-5 h-5 text-sky-400" />
                  </div>
                  Smart Notes
                </h1>
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold mt-1 ml-1">
                  AI-Powered Audio Notes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pr-2">
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-white/5 text-zinc-300 rounded-xl font-black text-xs uppercase tracking-widest border border-white/10 hover:bg-white/10 hover:text-white transition-colors">
                <Save className="w-4 h-4" /> Save
              </button>
              <button onClick={createNewNote} className="flex items-center gap-2 px-6 py-3 bg-sky-500 text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-sky-400 transition-colors shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                <Plus className="w-4 h-4" /> New Note
              </button>
            </div>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-8 flex-1 mb-16">

            {/* Sidebar */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full md:w-80 bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-6 overflow-y-auto flex flex-col gap-4 flex-shrink-0 shadow-2xl h-[calc(100vh-16rem)]">
              <h3 className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2 px-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Your Notes
              </h3>
              {notes.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-sm font-bold uppercase tracking-widest">No notes yet.</div>
              ) : (
                notes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => loadNote(note)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all flex justify-between items-center group shadow-lg ${activeNoteId === note.id ? 'bg-sky-500/10 border border-sky-500/30 shadow-[0_0_20px_rgba(56,189,248,0.15)]' : 'bg-black/40 border border-white/5 hover:bg-white/5'}`}
                  >
                    <div className="overflow-hidden">
                      <h4 className={`font-bold truncate ${activeNoteId === note.id ? 'text-sky-400' : 'text-white'}`}>{note.title}</h4>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate mt-1">{new Date(note.lastEdited).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                      className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </motion.div>

            {/* Editor Area */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden relative shadow-2xl h-[calc(100vh-16rem)]">

              {/* Editor Toolbar / TTS Controls */}
              <div className="h-20 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-8 flex-shrink-0">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note Title..."
                  className="bg-transparent border-none text-xl font-black text-white focus:outline-none focus:ring-0 placeholder-zinc-700 flex-1"
                />

                <div className="flex items-center gap-3 pl-6 border-l border-white/5">
                  <div className="mr-4 flex items-center gap-2 text-sky-400 bg-sky-500/10 px-4 py-2 rounded-xl border border-sky-500/20">
                    <Headphones className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Audio Engine</span>
                  </div>

                  {isSpeaking ? (
                    <button onClick={pauseSpeaking} className="p-3 bg-amber-500/20 text-amber-400 rounded-xl hover:bg-amber-500/30 transition-colors shadow-lg" title="Pause Reading">
                      <Pause className="w-5 h-5 fill-current" />
                    </button>
                  ) : (
                    <button onClick={speakText} className="p-3 bg-sky-500/20 text-sky-400 rounded-xl hover:bg-sky-500/30 transition-colors shadow-lg shadow-sky-500/10" title={isPaused ? "Resume Reading" : "Read Aloud"}>
                      <Play className="w-5 h-5 fill-current" />
                    </button>
                  )}

                  <button onClick={stopSpeaking} disabled={!isSpeaking && !isPaused} className={`p-3 rounded-xl transition-colors ${isSpeaking || isPaused ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 shadow-lg' : 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5'}`} title="Stop Reading">
                    <Square className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </div>

              {/* Text Area */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start typing your notes here..."
                className="flex-1 w-full bg-transparent border-none resize-none p-8 text-zinc-300 font-medium focus:outline-none focus:ring-0 leading-relaxed text-lg"
              />

              {/* Visualizer overlay when speaking */}
              {isSpeaking && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-sky-500/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-sky-400 shadow-[0_0_15px_theme('colors.sky.400')]"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  />
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SmartNotes;
