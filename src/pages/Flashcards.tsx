import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, ArrowLeft, RefreshCw, Plus, Check, X as XIcon, Settings, Calendar, Library, Sparkles, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { modelRouter } from '@/lib/ai/modelRouter';
import { useAI } from '@/contexts/AIContext';

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

interface Flashcard {
  id: string;
  front: string;
  back: string;
  // SRS properties (SuperMemo-2 based)
  interval: number; // in days
  repetition: number;
  easeFactor: number;
  nextReviewDate: number; // timestamp
}

type ViewState = 'decks' | 'generate' | 'review';

const Flashcards: React.FC = () => {
  const [view, setView] = useState<ViewState>('decks');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [sourceText, setSourceText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Review State
  const [reviewQueue, setReviewQueue] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const { toast } = useToast();
  const { isAIReady } = useAI();

  useEffect(() => {
    const saved = localStorage.getItem('margdarshak_flashcards');
    if (saved) {
      try {
        setCards(JSON.parse(saved));
      } catch (e) { console.error("Failed to parse flashcards"); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('margdarshak_flashcards', JSON.stringify(cards));
  }, [cards]);

  const dueCards = cards.filter(c => c.nextReviewDate <= Date.now());

  const generateFlashcards = async () => {
    if (!sourceText.trim()) {
      toast({ title: 'Input Required', description: 'Please provide study material for analysis.', variant: 'destructive' });
      return;
    }
    setIsGenerating(true);
    try {
      const prompt = `Synthesize exactly 8 high-utility flashcards from this content for a Spaced Repetition System. Focus on fundamental principles, critical definitions, and conceptual links.
      
      STRUCTURE:
      [{"front": "Concise Question/Concept", "back": "Direct Answer/Explanation"}]

      CONTENT:
      ${sourceText}`;

      const generatedCards = await modelRouter.generateJSON<{ front: string, back: string }[]>(prompt);

      if (generatedCards && Array.isArray(generatedCards)) {
        const newCards: Flashcard[] = generatedCards.map(c => ({
          id: crypto.randomUUID(),
          front: c.front,
          back: c.back,
          interval: 0,
          repetition: 0,
          easeFactor: 2.5,
          nextReviewDate: Date.now()
        }));

        setCards(prev => [...prev, ...newCards]);
        toast({ title: 'Synthesis Complete', description: `Injected ${newCards.length} new pathways.` });
        setSourceText('');
        setView('decks');
      }
    } catch (e) {
      toast({ title: 'Flashcard Error', description: 'Flashcard synthesis failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const startReview = () => {
    if (dueCards.length === 0) {
      toast({ title: 'Target Achieved', description: 'No cards are currently due for review.' });
      return;
    }
    setReviewQueue([...dueCards].sort(() => Math.random() - 0.5));
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setView('review');
  };

  const processSRS = (quality: number) => {
    const card = reviewQueue[currentCardIndex];
    let { interval, repetition, easeFactor } = card;

    if (quality < 2) {
      repetition = 0;
      interval = 1;
    } else {
      if (repetition === 0) interval = 1;
      else if (repetition === 1) interval = 6;
      else interval = Math.round(interval * easeFactor);
      repetition += 1;
    }

    easeFactor = Math.max(1.3, easeFactor + (0.1 - (4 - quality) * (0.08 + (4 - quality) * 0.02)));
    const nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;
    const updatedCard = { ...card, interval, repetition, easeFactor, nextReviewDate };

    setCards(prev => prev.map(c => c.id === card.id ? updatedCard : c));

    if (currentCardIndex + 1 < reviewQueue.length) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      toast({ title: 'Memory Optimized', description: 'Review cycle complete. Daily goals met.' });
      setView('decks');
    }
  };

  const deleteCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    toast({ title: 'Path Removed', description: 'Flashcard deleted from vault.' });
  };

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-300 selection:bg-amber-500/30 selection:text-amber-200">

      {/* ── Background Infrastructure ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-indigo-500/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-4 mb-6">
              <Link to="/dashboard" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group">
                <ArrowLeft className="w-5 h-5 text-zinc-500 group-hover:text-white" />
              </Link>
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Flashcard Vault</span>
              </div>
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-white mb-2 italic">
              AI <span className="text-amber-400 not-italic">Flashcards</span>
            </h1>
            <p className="text-zinc-500 font-medium text-lg max-w-md">
            </p>
          </motion.div>

          {view !== 'decks' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              onClick={() => setView('decks')}
              className="px-8 h-14 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-2xl text-zinc-400 hover:text-white font-bold uppercase tracking-widest transition-all"
            >
              Back to Vault
            </motion.button>
          )}
        </header>

        <AnimatePresence mode="wait">
          {view === 'decks' && (
            <motion.div key="decks" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-16">

              {/* Main Interface Hub */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Status Column */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="p-8 rounded-[2.5rem] bg-zinc-900/40 backdrop-blur-3xl border border-white/10 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform">
                      <Library className="w-32 h-32" />
                    </div>
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Total capacity</p>
                    <div className="flex items-baseline gap-2 mb-8">
                      <span className="text-5xl font-black text-white">{cards.length}</span>
                      <span className="text-sm font-bold text-zinc-600">UNITS</span>
                    </div>
                    <Button
                      onClick={() => setView('generate')}
                      className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest transition-all group"
                    >
                      <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                      Add flashcards
                    </Button>
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-amber-500/10 backdrop-blur-3xl border border-amber-500/20 relative overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.05] -rotate-12 group-hover:scale-110 transition-transform">
                      <Calendar className="w-32 h-32 text-amber-500" />
                    </div>
                    <p className="text-xs font-black text-amber-500/60 uppercase tracking-widest mb-2">Due to Revise</p>
                    <div className="flex items-baseline gap-2 mb-8">
                      <span className="text-5xl font-black text-amber-400">{dueCards.length}</span>
                      <span className="text-sm font-bold text-amber-500/40">READY</span>
                    </div>
                    <Button
                      disabled={dueCards.length === 0}
                      onClick={startReview}
                      className="w-full h-14 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                    >
                      <Play className="w-4 h-4 mr-2 fill-current" /> Optimize Memory
                    </Button>
                  </div>
                </div>

                {/* Collection Preview */}
                <div className="lg:col-span-8">
                  <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-xl font-black text-white uppercase tracking-widest">Flashcards vault</h2>
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Visualizing {Math.min(cards.length, 12)} Flashcards</span>
                  </div>

                  {cards.length === 0 ? (
                    <div className="h-[400px] rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-12 bg-zinc-900/20">
                      <div className="p-6 bg-white/5 rounded-3xl mb-6">
                        <BrainCircuit className="w-12 h-12 text-zinc-700" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-400 mb-2">No flashcards</h3>
                      <p className="text-zinc-600 max-w-xs font-medium">Use AI Synthesis to extract key concepts from your study materials.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cards.slice(0, 12).map((card, i) => (
                        <motion.div
                          key={card.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-6 rounded-[2rem] bg-zinc-900/60 border border-white/5 hover:border-amber-500/20 transition-all group relative overflow-hidden"
                        >
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">ID: {card.id.slice(0, 8)}</span>
                              <button onClick={() => deleteCard(card.id)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-500/10 text-zinc-600 hover:text-rose-400 rounded-xl transition-all">
                                <XIcon className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-white font-bold leading-tight mb-4 line-clamp-2">{card.front}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] font-black uppercase tracking-widest">
                              <span className="text-amber-500/60">Ease {card.easeFactor.toFixed(2)}</span>
                              <span className="text-zinc-600">Rep {card.repetition}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'generate' && (
            <motion.div key="generate" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-2xl mx-auto">
              <div className="p-10 rounded-[3rem] bg-zinc-900/60 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full" />

                <div className="relative z-10 text-center mb-10">
                  <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6 border border-amber-500/20 rotate-3">
                    <Sparkles className="w-10 h-10 text-amber-500" />
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight mb-2">Flashcard Revision</h2>
                  <p className="text-zinc-500 font-medium">Inject raw data to extract optimized flashcards using our AI.</p>
                </div>

                <Textarea
                  value={sourceText}
                  onChange={e => setSourceText(e.target.value)}
                  placeholder="Paste syllabus, textbook chapters, or focus notes here..."
                  className="min-h-[300px] rounded-[2rem] bg-black/40 border-white/10 text-white placeholder:text-zinc-700 mb-8 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/40 p-8 text-lg font-medium resize-none transition-all"
                />

                <Button
                  onClick={generateFlashcards}
                  disabled={!sourceText.trim() || isGenerating}
                  className="w-full h-16 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_20px_40px_rgba(245,158,11,0.2)] disabled:opacity-50 transition-all"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Synthesizing Paths...</>
                  ) : (
                    <><BrainCircuit className="w-5 h-5 mr-3" /> Generate</>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {view === 'review' && reviewQueue.length > 0 && (
            <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center max-w-2xl mx-auto pt-6 min-h-[600px] pb-20 relative">

              {/* Progress System */}
              <div className="w-full mb-8">
                <div className="flex justify-between items-end mb-4 px-2">
                  <div>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Flashcards loading</p>
                    <h3 className="text-2xl font-black text-white">Path {currentCardIndex + 1} <span className="text-zinc-700">/ {reviewQueue.length}</span></h3>
                  </div>
                  <span className="text-xs font-black text-zinc-500">{Math.round(((currentCardIndex + 1) / reviewQueue.length) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentCardIndex + 1) / reviewQueue.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  />
                </div>
              </div>

              {/* 3D Neural Card */}
              <div className="w-full h-[400px] max-w-md perspective-2000 mb-12 relative z-10">
                <motion.div
                  className="w-full h-full relative preserve-3d cursor-pointer group"
                  onClick={() => setIsFlipped(!isFlipped)}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ type: "tween", duration: 0.6, ease: "easeInOut" }}
                >
                  {/* Front: Stimulus */}
                  <div className="absolute w-full h-full backface-hidden bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-[3rem]" />
                    <p className="text-[10px] font-black text-amber-500/40 uppercase tracking-[0.5em] absolute top-10">Flashcard Stimulus</p>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight relative z-10">
                      {reviewQueue[currentCardIndex].front}
                    </h2>
                    <div className="absolute bottom-10 flex items-center gap-3 text-zinc-600 group-hover:text-amber-500/50 transition-colors">
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Flip Card</span>
                    </div>
                  </div>

                  {/* Back: Synthesis */}
                  <div
                    className="absolute inset-0 backface-hidden bg-[#0a0a0a] border border-amber-500/20 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center shadow-[0_40px_80px_-15px_rgba(245,158,11,0.15)]"
                    style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent rounded-[3rem]" />
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em] absolute top-10">flashcards Response</p>
                    <h2 className="text-xl md:text-2xl font-bold text-zinc-200 leading-relaxed overflow-y-auto max-h-[70%] pr-4 custom-scrollbar relative z-10">
                      {reviewQueue[currentCardIndex].back}
                    </h2>
                  </div>
                </motion.div>
              </div>

              {/* Spaced Repetition Protocol - Reserved Slot to prevent layout shift */}
              <div className="w-full max-w-md h-32">
                <AnimatePresence>
                  {isFlipped && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="grid grid-cols-4 gap-3 w-full"
                    >
                      {[
                        { q: 0, label: 'Review Again', sub: 'Recall', color: 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10' },
                        { q: 1, label: 'Difficult', sub: 'Critical', color: 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10' },
                        { q: 3, label: 'Good', sub: 'OK', color: 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' },
                        { q: 4, label: 'Excellent', sub: 'OK', color: 'bg-amber-500 text-black border-amber-500 hover:bg-amber-400' }
                      ].map((btn) => (
                        <button
                          key={btn.q}
                          onClick={() => processSRS(btn.q)}
                          className={`flex flex-col items-center justify-center py-4 rounded-2xl border transition-all duration-300 group/btn ${btn.color}`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest mb-1">{btn.label}</span>
                          <span className="text-[8px] font-bold opacity-40 uppercase group-hover/btn:opacity-100 transition-opacity">{btn.sub}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      <footer className="relative mt-32 border-t border-white/5 bg-black/40 backdrop-blur-3xl overflow-hidden">
        {/* Footer Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Branding Column */}
            <div className="space-y-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-block"
              >
                <h3 className="text-3xl font-black tracking-tighter text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">MARGDARSHAK</span>
                </h3>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.3em] mt-1">by VSAV GYANTAPA</p>
              </motion.div>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                Empowering students with AI-driven scheduling and intelligent academic orchestration. Built for the next generation of learners.
              </p>
              <div className="flex items-center gap-4">
                {[
                  { icon: TwitterLogo, href: "https://x.com/gyantappas", label: "Twitter" },
                  { icon: FacebookLogo, href: "https://www.facebook.com/profile.php?id=61584618795158", label: "Facebook" },
                  { icon: linkedinLogo, href: "https://www.linkedin.com/in/vsav-gyantapa-33893a399/", label: "LinkedIn" }
                ].map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-zinc-400 hover:text-white"
                  >
                    <social.icon />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            {[
              {
                title: "Platform",
                links: [
                  { name: "Scheduler", href: "/timetable" },
                  { name: "AI Assistant", href: "/ai-assistant" },
                  { name: "Quiz Gen", href: "/quiz" },
                  { name: "Wellness", href: "/wellness" }
                ]
              },
              {
                title: "Legal",
                links: [
                  { name: "Terms of Service", href: "/terms" },
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Cookie Policy", href: "/cookies" },
                  { name: "GDPR Compliance", href: "/gdpr" }
                ]
              },
              {
                title: "Support",
                links: [
                  { name: "Help Center", href: "/help" },
                  { name: "Contact Us", href: "mailto:support@margdarshan.tech" }
                ]
              }
            ].map((section, i) => (
              <div key={i} className="space-y-6">
                <h4 className="text-white font-black text-sm uppercase tracking-widest">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        to={link.href}
                        className="text-zinc-500 hover:text-white transition-colors text-sm font-medium flex items-center group"
                      >
                        <motion.span
                          whileHover={{ x: 4 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 group-hover:bg-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                          {link.name}
                        </motion.span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-zinc-500 text-sm">
              © 2026 <span className="text-white font-bold">VSAV GYANTAPA</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-6">

              <p className="text-zinc-600 text-xs font-medium">Version 3.0</p>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .perspective-2000 { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Flashcards;
