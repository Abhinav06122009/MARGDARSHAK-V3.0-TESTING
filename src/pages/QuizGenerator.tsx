import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, Sparkles, RefreshCw, CheckCircle, XCircle, ChevronRight,
  BookOpen, Target, Trophy, Loader2, ArrowLeft, Download, Volume2, VolumeX,
  X, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { modelRouter } from '@/lib/ai/modelRouter';
import { useAI } from '@/contexts/AIContext';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';

// Social Icons (Unified)
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

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizConfig {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  type: 'mcq' | 'truefalse';
  timeLimit: number; // in minutes, 0 means no limit
  syllabusId?: string;
}

type QuizState = 'config' | 'loading' | 'playing' | 'results';

const QuizGenerator: React.FC = () => {
  const [state, setState] = useState<QuizState>('config');
  const [config, setConfig] = useState<QuizConfig>({
    topic: '',
    difficulty: 'medium',
    count: 5,
    type: 'mcq',
    timeLimit: 0,
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [syllabi, setSyllabi] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { isAIReady } = useAI();
  const { toast } = useToast();
  const { session } = React.useContext(AuthContext);

  React.useEffect(() => {
    if (session?.user?.id) {
      supabase.from('syllabi')
        .select('id, course_name, topics, objectives')
        .eq('user_id', session.user.id)
        .eq('is_deleted', false)
        .then(({ data }) => {
          if (data) setSyllabi(data);
        });
    }
  }, [session]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state === 'playing' && config.timeLimit > 0 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setState('results'); // Auto-submit when time is up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state, timeLeft, config.timeLimit]);

  const generateQuiz = useCallback(async () => {
    if (!config.topic.trim()) {
      toast({ title: 'Topic required', description: 'Please enter a topic for your quiz.', variant: 'destructive' });
      return;
    }
    if (!isAIReady) {
      toast({ title: 'AI not ready', description: 'Please wait for AI to initialize.', variant: 'destructive' });
      return;
    }

    setState('loading');

    let syllabusContext = '';
    if (config.syllabusId) {
      const selected = syllabi.find(s => s.id === config.syllabusId);
      if (selected) {
        syllabusContext = `Use this syllabus context to inform the questions:\nCourse: ${selected.course_name}\nTopics: ${selected.topics.join(', ')}\nObjectives: ${selected.objectives.join(', ')}\n\n`;
      }
    }

    const prompt = `${syllabusContext}Generate ${config.count} ${config.type === 'truefalse' ? 'True/False' : 'multiple choice'} quiz questions about "${config.topic}" at ${config.difficulty} difficulty level for a student.

Return ONLY valid JSON array with this exact structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation of why this answer is correct"
  }
]

For True/False questions, options should be ["True", "False"].
The "correct" field is the index (0-based) of the correct option.
Make questions academically accurate and educational.`;

    try {
      const result = await modelRouter.generateJSON<QuizQuestion[]>(prompt);
      if (result && Array.isArray(result) && result.length > 0) {
        setQuestions(result.slice(0, config.count));
        setCurrentIndex(0);
        setAnswers([]);
        setSelectedAnswer(null);
        setShowExplanation(false);
        if (config.timeLimit > 0) {
          setTimeLeft(config.timeLimit * 60);
        }
        setState('playing');
      } else {
        throw new Error('Invalid quiz data returned');
      }
    } catch {
      toast({ title: 'Generation failed', description: 'Could not generate quiz. Please try again.', variant: 'destructive' });
      setState('config');
    }
  }, [config, isAIReady, toast, syllabi]);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (selectedAnswer === null) return;
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentIndex + 1 >= questions.length) {
      setState('results');
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const score = answers.filter((ans, i) => ans === questions[i]?.correct).length;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-amber-500/30 overflow-x-hidden relative">
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,20,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Animated Neural Orbs */}
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
          {/* HEADER */}
          <header className="flex flex-col md:flex-row items-center justify-between p-6 glass-card rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative z-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.05] to-transparent pointer-events-none" />

            <div className="flex items-center gap-6">
              <Link to="/dashboard">
                <motion.div whileHover={{ scale: 1.1, x: -4 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="ghost" size="icon" className="h-12 w-12 text-zinc-400 hover:text-white hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                </motion.div>
              </Link>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-amber-500/20 rounded-2xl border border-amber-500/30 shadow-lg shadow-amber-500/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-amber-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <BrainCircuit className="w-8 h-8 text-amber-400 relative z-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Quiz <span className="text-amber-400">generator</span></h1>
                  <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-0.5">Automated Question Papers</p>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex items-center gap-3">

            </div>
          </header>

          <AnimatePresence mode="wait">
            {state === 'config' && (
              <motion.div
                key="config"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <div className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent pointer-events-none" />

                  <div className="relative z-10 space-y-10">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-8 bg-amber-500 rounded-full" />
                      <h2 className="text-2xl font-black text-white tracking-tight uppercase">Mission Details</h2>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] ml-1">Target Subject</Label>
                      <div className="relative group/input">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-transform group-focus-within/input:scale-110">
                          <BookOpen className="w-5 h-5 text-zinc-600 group-focus-within/input:text-amber-400" />
                        </div>
                        <Input
                          placeholder="Deconstruct any academic topic..."
                          value={config.topic}
                          onChange={e => setConfig(c => ({ ...c, topic: e.target.value }))}
                          className="bg-zinc-950/50 border-white/5 h-16 pl-14 pr-6 rounded-2xl text-white placeholder:text-zinc-700 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/40 transition-all font-medium text-lg"
                          onKeyDown={e => e.key === 'Enter' && generateQuiz()}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] ml-1">Contextual Syllabus</Label>
                        <Select value={config.syllabusId || 'none'} onValueChange={v => {
                          const id = v === 'none' ? undefined : v;
                          const selected = syllabi.find(s => s.id === id);
                          setConfig(c => ({ ...c, syllabusId: id, topic: selected ? selected.course_name : c.topic }));
                        }}>
                          <SelectTrigger className="bg-zinc-950/50 border-white/5 h-16 px-6 rounded-2xl text-white focus:ring-amber-500/20 transition-all font-bold">
                            <SelectValue placeholder="Select a cognitive anchor" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                            <SelectItem value="none" className="focus:bg-amber-500/20">Independent Search</SelectItem>
                            {syllabi.map(s => (
                              <SelectItem key={s.id} value={s.id} className="focus:bg-amber-500/20">{s.course_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] ml-1">Difficulty</Label>
                          <Select value={config.difficulty} onValueChange={(v: 'easy' | 'medium' | 'hard') => setConfig(c => ({ ...c, difficulty: v }))}>
                            <SelectTrigger className="bg-zinc-950/50 border-white/5 h-16 px-6 rounded-2xl text-white font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                              <SelectItem value="easy">Linear</SelectItem>
                              <SelectItem value="medium">Adaptive</SelectItem>
                              <SelectItem value="hard">Complex</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-4">
                          <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] ml-1">Questions</Label>
                          <Select value={String(config.count)} onValueChange={v => setConfig(c => ({ ...c, count: Number(v) }))}>
                            <SelectTrigger className="bg-zinc-950/50 border-white/5 h-16 px-6 rounded-2xl text-white font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                              {[3, 5, 8, 10].map(n => (
                                <SelectItem key={n} value={String(n)}>{n} Units</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] ml-1">Format</Label>
                        <div className="flex p-1 bg-zinc-950/50 rounded-2xl border border-white/5">
                          <button
                            onClick={() => setConfig(c => ({ ...c, type: 'mcq' }))}
                            className={`flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${config.type === 'mcq' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-white'}`}
                          >
                            MCQ Core
                          </button>
                          <button
                            onClick={() => setConfig(c => ({ ...c, type: 'truefalse' }))}
                            className={`flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${config.type === 'truefalse' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-white'}`}
                          >
                            True/False
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] ml-1">Time Limit</Label>
                        <Select value={String(config.timeLimit)} onValueChange={v => setConfig(c => ({ ...c, timeLimit: Number(v) }))}>
                          <SelectTrigger className="bg-zinc-950/50 border-white/5 h-16 px-6 rounded-2xl text-white font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                            <SelectItem value="0">Unrestricted</SelectItem>
                            <SelectItem value="5">Rapid (5m)</SelectItem>
                            <SelectItem value="10">Standard (10m)</SelectItem>
                            <SelectItem value="30">Endurance (30m)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={generateQuiz}
                      disabled={!config.topic.trim()}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black h-20 rounded-[2rem] shadow-2xl shadow-amber-500/20 uppercase tracking-[0.3em] text-sm transition-all hover:translate-y-[-4px] active:scale-95 group/btn overflow-hidden relative"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                      <Sparkles className="w-5 h-5 mr-3 relative z-10" />
                      <span className="relative z-10">Start</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {state === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 gap-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-amber-500/20 animate-ping absolute inset-0" />
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  </div>
                </div>
                <p className="text-zinc-400 text-sm">Generating your quiz on "{config.topic}"...</p>
              </motion.div>
            )}

            {state === 'playing' && currentQuestion && (
              <motion.div
                key={`question-${currentIndex}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Unit {currentIndex + 1} of {questions.length}</span>
                      <div className="w-1 h-1 rounded-full bg-zinc-800" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{config.topic}</span>
                    </div>
                  </div>
                  {config.timeLimit > 0 && (
                    <motion.div
                      animate={timeLeft < 60 ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className={`font-mono font-black px-5 py-2 rounded-2xl border flex items-center gap-3 ${timeLeft < 60 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-white/5 text-amber-400 border-amber-500/20'}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${timeLeft < 60 ? 'bg-red-400 animate-pulse' : 'bg-amber-400'}`} />
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </motion.div>
                  )}
                </div>

                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                  />
                </div>

                <div className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <BrainCircuit size={150} />
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-10 tracking-tight italic">
                    \"{currentQuestion.question}\"
                  </h3>

                  <div className="space-y-4">
                    {currentQuestion.options.map((option, i) => {
                      const isSelected = selectedAnswer === i;
                      const isCorrect = i === currentQuestion.correct;
                      const showResult = selectedAnswer !== null;

                      let optionClass = 'border-white/5 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:border-white/10 hover:translate-x-2';
                      if (showResult) {
                        if (isCorrect) optionClass = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10';
                        else if (isSelected && !isCorrect) optionClass = 'border-red-500/40 bg-red-500/10 text-red-400 shadow-lg shadow-red-500/10';
                        else optionClass = 'border-white/5 bg-white/[0.01] text-zinc-600 opacity-50';
                      }

                      return (
                        <motion.button
                          key={i}
                          whileHover={!showResult ? { x: 8 } : {}}
                          onClick={() => handleAnswer(i)}
                          disabled={selectedAnswer !== null}
                          className={`w-full text-left px-8 py-6 rounded-[2rem] border flex items-center gap-6 transition-all duration-500 group ${optionClass} ${selectedAnswer === null ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          <span className={`w-10 h-10 rounded-2xl border flex-shrink-0 flex items-center justify-center text-xs font-black transition-colors ${isSelected ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/10 text-zinc-500 group-hover:border-amber-500/40 group-hover:text-amber-400'}`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="text-lg font-bold tracking-tight">{option}</span>
                          {showResult && isCorrect && (
                            <div className="ml-auto w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 animate-in zoom-in duration-500">
                              <CheckCircle className="w-5 h-5 text-emerald-400" />
                            </div>
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <div className="ml-auto w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 animate-in zoom-in duration-500">
                              <XCircle className="w-5 h-5 text-red-400" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {showExplanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-8 rounded-[2.5rem] bg-amber-500/[0.03] border border-amber-500/20 relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                          <Target size={40} className="text-amber-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">Answer</span>
                        </div>
                        <p className="text-zinc-300 leading-relaxed font-medium">{currentQuestion.explanation}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {selectedAnswer !== null && (
                    <Button
                      onClick={nextQuestion}
                      className="w-full mt-10 bg-amber-500 hover:bg-amber-400 text-black font-black h-20 rounded-[2rem] shadow-xl shadow-amber-500/20 uppercase tracking-[0.3em] text-xs transition-all hover:translate-y-[-4px]"
                    >
                      {currentIndex + 1 >= questions.length ? 'Finalize Session' : 'Next Unit'}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {state === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[3.5rem] p-12 md:p-16 text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.05] to-transparent pointer-events-none" />

                  <div className="relative z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12 }}
                      className="mb-8"
                    >
                      {percentage >= 80 ? (
                        <div className="w-32 h-32 bg-amber-500/20 rounded-[2.5rem] border border-amber-500/30 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/20 relative">
                          <Trophy className="w-16 h-16 text-amber-400" />
                          <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 border-2 border-amber-500/50 rounded-[2.5rem]"
                          />
                        </div>
                      ) : percentage >= 60 ? (
                        <div className="w-32 h-32 bg-blue-500/20 rounded-[2.5rem] border border-blue-500/30 flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20">
                          <Target className="w-16 h-16 text-blue-400" />
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-zinc-800/50 rounded-[2.5rem] border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
                          <RefreshCw className="w-16 h-16 text-zinc-500" />
                        </div>
                      )}
                    </motion.div>

                    <h2 className="text-6xl font-black text-white tracking-tighter mb-2 italic">{percentage}%</h2>
                    <p className="text-zinc-500 font-black text-xs uppercase tracking-[0.4em] mb-8">
                      Accuracy Synthesis: <span className="text-white">{score} / {questions.length} Units</span>
                    </p>

                    <p className="text-zinc-300 text-lg max-w-md mx-auto leading-relaxed font-medium mb-12">
                      {percentage >= 80
                        ? 'Exceptional mastery achieved. Cognitive retention metrics are within optimal parameters.'
                        : percentage >= 60
                          ? 'Solid performance. Recommend deconstructing missed units to stabilize pathways.'
                          : 'Retention Marks not met. Initialize rapid re-learning sequence for this Subject.'}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                      {questions.map((q, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-[1.5rem] border flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 ${answers[i] === q.correct
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/5 border-red-500/20 text-red-400'
                            }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-50">UNIT {i + 1}</span>
                          {answers[i] === q.correct ? <CheckCircle size={18} /> : <XCircle size={18} />}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                      <Button
                        onClick={() => { setState('config'); setQuestions([]); setAnswers([]); }}
                        variant="ghost"
                        className="flex-1 h-16 rounded-2xl border border-white/5 text-zinc-500 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
                      >
                        New Mission
                      </Button>
                      <Button
                        onClick={() => { setCurrentIndex(0); setAnswers([]); setSelectedAnswer(null); setShowExplanation(false); setState('playing'); }}
                        className="flex-1 h-16 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-[10px] shadow-xl shadow-amber-500/20"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Practice again
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* ── Footer ── */}
          <footer className="relative mt-32 border-t border-white/5 bg-black/40 backdrop-blur-3xl overflow-hidden rounded-[2.5rem]">
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

            <div className="relative max-w-7xl mx-auto px-10 py-20 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {/* Branding Column */}
                <div className="space-y-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-block"
                  >
                    <h3 className="text-4xl font-black tracking-tighter text-white flex items-center gap-2">
                      <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent uppercase italic">Margdarshak</span>
                    </h3>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2 ml-1">by VSAV GYANTAPA</p>
                  </motion.div>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-medium">
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
                        whileHover={{ scale: 1.2, y: -4, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        className="p-4 bg-white/5 rounded-2xl border border-white/10 transition-all text-zinc-400 hover:text-white"
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
                  <div key={i} className="space-y-8">
                    <h4 className="text-white font-black text-[10px] uppercase tracking-[0.4em]">{section.title}</h4>
                    <ul className="space-y-5">
                      {section.links.map((link, j) => (
                        <li key={j}>
                          <Link
                            to={link.href}
                            className="text-zinc-500 hover:text-white transition-colors text-sm font-bold flex items-center group"
                          >
                            <motion.span
                              whileHover={{ x: 6 }}
                              className="flex items-center gap-3"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] opacity-0 group-hover:opacity-100 transition-all" />
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
              <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  © 2025 <span className="text-white">VSAV GYANTAPA</span>. All rights reserved.
                </p>
                <div className="flex items-center gap-8">

                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest italic">V3.0</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </ScrollArea>
    </div>
  );
};

export default QuizGenerator;
