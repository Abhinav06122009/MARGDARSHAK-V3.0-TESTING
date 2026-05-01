import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Upload, Image as ImageIcon, Sparkles, Loader2, Target, Lightbulb,
  CheckCircle2, BrainCircuit, X, Download, Camera, Facebook, Twitter, Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { modelRouter } from '@/lib/ai/modelRouter';
import { useAI } from '@/contexts/AIContext';
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

interface SolutionStep {
  step: number;
  title: string;
  explanation: string;
  calculation?: string;
}

interface Solution {
  problem_understanding: string;
  steps: SolutionStep[];
  final_answer: string;
  key_concept: string;
}

const DoubtSolver: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textQuery, setTextQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [solution, setSolution] = useState<Solution | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isAIReady } = useAI();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const solveProblem = async () => {
    if (!isAIReady) {
      toast({ title: 'AI not ready', description: 'Please wait for AI to initialize.', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    setSolution(null);

    try {
      const prompt = `Act as an expert Math, Physics, and Chemistry tutor.
${textQuery ? `The user's question is: "${textQuery}"` : "Analyze the attached image and solve the problem shown."}
Analyze all provided data carefully and provide a detailed, step-by-step solution.
Return ONLY a valid JSON object with this exact structure:
{
  "problem_understanding": "Brief restatement of what we are trying to solve and given values",
  "steps": [
    {
      "step": 1,
      "title": "Identify the formula",
      "explanation": "Explain why we use this formula",
      "calculation": "v^2 = u^2 + 2as (optional math representation)"
    }
  ],
  "final_answer": "The final highlighted answer",
  "key_concept": "What is the core physics/math concept learned here?"
}`;

      let rawResponse = await modelRouter.chat([{ role: 'user', content: prompt }], { 
        imageFile: selectedFile,
        task: 'research',
        jsonMode: true
      });

      if (rawResponse.startsWith('![Generated Image]')) {
        setSolution({
          problem_understanding: "Image Generated via Pollinations AI",
          steps: [],
          final_answer: rawResponse,
          key_concept: "FLUX.2 Klein 4B"
        });
        return;
      }

      const cleanJson = rawResponse.replace(/```json\n?|\n?```/g, '').trim();
      const generatedSolution = JSON.parse(cleanJson) as Solution;

      if (generatedSolution && generatedSolution.steps) {
        setSolution(generatedSolution);
      } else {
        throw new Error('Invalid solution structure from AI');
      }
    } catch (e: any) {
      toast({ title: 'Solver failed', description: e.message || 'Could not solve the problem.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,20,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Animated Neural Orbs */}
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]"
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
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
          {/* HEADER */}
          <header className="flex flex-col md:flex-row items-center justify-between p-6 glass-card rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative z-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.05] to-transparent pointer-events-none" />

            <div className="flex items-center gap-6">
              <Link to="/dashboard">
                <motion.div whileHover={{ scale: 1.1, x: -4 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="ghost" size="icon" className="h-12 w-12 text-zinc-400 hover:text-white hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                </motion.div>
              </Link>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-500/20 rounded-2xl border border-indigo-500/30 shadow-lg shadow-indigo-500/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-indigo-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Target className="w-8 h-8 text-indigo-400 relative z-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Doubt<span className="text-indigo-400">solver</span></h1>
                  <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-0.5">Advanced Visual Problem Resolver</p>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex items-center gap-3">
              <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Vision Mode Active</span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Side: Upload Area (lg:span-5) */}
            <div className="lg:col-span-5 flex flex-col gap-6 sticky top-8">
              <div className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-[3rem] p-8 relative overflow-hidden flex flex-col gap-6 shadow-2xl transition-all hover:border-indigo-500/20 group">
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">Describe your Doubt</h3>
                  <div className="relative">
                    <textarea
                      placeholder="Type your question here or upload an image below..."
                      className="w-full h-32 bg-zinc-950/50 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500/50 outline-none transition-all resize-none"
                      value={textQuery}
                      onChange={(e) => setTextQuery(e.target.value)}
                    />
                    <div className="absolute bottom-3 right-3">
                      <Button 
                        onClick={() => solveProblem()} 
                        disabled={isProcessing || (!textQuery.trim() && !image)}
                        className="bg-indigo-500 hover:bg-indigo-400 text-white font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all"
                      >
                        {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Solve Now'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">OR ATTACH IMAGE</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                {!image ? (
                  <>
                    <motion.div
                      layout
                      onClick={() => fileInputRef.current?.click()}
                      className="relative z-10 w-full min-h-[250px] border-2 border-dashed border-indigo-500/20 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center hover:bg-indigo-500/[0.03] hover:border-indigo-500/40 transition-all cursor-pointer group/upload"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center mb-4 group-hover/upload:scale-110 transition-all duration-500 shadow-2xl relative">
                        <ImageIcon className="w-8 h-8 text-indigo-400 relative z-10" />
                      </div>
                      <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                        Precision-scan math equations, physics diagrams, or chemistry structures.
                      </p>
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </motion.div>
                  </>
                ) : (
                  <div className="relative w-full flex flex-col animate-in fade-in zoom-in-95 duration-500">
                    <div className="relative w-full h-48 rounded-[2rem] overflow-hidden border border-white/10 bg-zinc-950/50 shadow-inner group/img">
                      <img src={image} alt="Problem" className="w-full h-full object-contain p-4" />
                      {isProcessing && (
                        <div className="absolute inset-0 z-20">
                          <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-[2px]" />
                          <motion.div
                            className="absolute left-0 right-0 h-1 bg-indigo-400 shadow-[0_0_30px_10px_rgba(129,140,248,0.4)] z-30"
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                          />
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => { setImage(null); setSolution(null); setSelectedFile(null); }}
                      className="mt-4 h-10 rounded-xl border border-white/5 text-zinc-500 hover:text-red-400 transition-all font-black uppercase tracking-widest text-[9px]"
                    >
                      <X className="w-3 h-3 mr-2" /> Discard Scan
                    </Button>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {solution && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-indigo-500/5 border border-indigo-500/20 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <BrainCircuit size={80} className="text-indigo-400" />
                    </div>
                    <div className="flex items-start gap-5 relative z-10">
                      <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                        <Lightbulb className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                      </div>
                      <div>
                        <h4 className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-2">Core Insight</h4>
                        <p className="text-zinc-300 text-sm leading-relaxed font-medium">{solution.key_concept}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Side: Solution Area (lg:span-7) */}
            <div className="lg:col-span-7 flex flex-col h-full min-h-[600px]">
              <div className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 flex flex-col h-full shadow-2xl relative overflow-hidden transition-all hover:border-white/20">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.02] to-transparent pointer-events-none" />

                {!image && !isProcessing && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-24 h-24 rounded-full bg-zinc-950 border border-white/5 flex items-center justify-center mb-8 shadow-2xl"
                    >
                      <Sparkles className="w-10 h-10 text-zinc-700" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-white mb-3 tracking-tight">AWAITING INPUT</h3>
                    <p className="text-zinc-500 max-w-sm font-medium leading-relaxed">
                      Scan a vision scan on the left. Our high-precision model will orchestrate a multi-step cognitive resolution.
                    </p>
                  </div>
                )}

                {isProcessing && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                    <div className="relative mb-12 scale-125">
                      <div className="w-24 h-24 rounded-full border-2 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <BrainCircuit className="w-10 h-10 text-indigo-500" />
                        </motion.div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-6 tracking-tight uppercase tracking-[0.2em]">Synthesizing Logic</h3>
                    <div className="space-y-4 w-full max-w-xs mx-auto">
                      {[
                        "Deconstructing visual tensors...",
                        "Identifying academic domain...",
                        "Mapping cognitive pathways...",
                        "Generating step-wise synthesis..."
                      ].map((text, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.8 }}
                            className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden"
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 1.5, delay: i * 0.8 }}
                              className="h-full bg-indigo-500/40"
                            />
                          </motion.div>
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.8 }}
                            className="text-[10px] font-black uppercase tracking-widest text-zinc-600 w-40 text-left"
                          >
                            {text}
                          </motion.span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {solution && !isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col h-full relative z-10"
                  >
                    <div className="mb-12">
                      <div className="inline-flex items-center gap-3 px-5 py-2 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-6">
                        <Target className="w-5 h-5 text-indigo-400" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">Problem Synthesis</span>
                      </div>
                      <p className="text-slate-300 text-lg leading-relaxed font-medium bg-white/[0.03] p-8 rounded-[2rem] border border-white/5 shadow-inner italic">
                        \"{solution.problem_understanding}\"
                      </p>
                    </div>

                    <div className="flex-1 space-y-10 relative">
                      {/* Vertical line connector */}
                      <div className="absolute left-[23px] top-6 bottom-6 w-px bg-gradient-to-b from-indigo-500/50 via-indigo-500/10 to-transparent pointer-events-none" />

                      {solution.steps.map((step, idx) => (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: idx * 0.15 }}
                          key={idx}
                          className="relative pl-16 group/step"
                        >
                          <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-zinc-950 border border-indigo-500/40 shadow-[0_0_20px_rgba(129,140,248,0.2)] flex items-center justify-center text-sm font-black text-indigo-400 group-hover/step:scale-110 group-hover/step:bg-indigo-500 group-hover/step:text-black transition-all duration-500">
                            {step.step}
                          </div>
                          <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 transition-all duration-500 hover:bg-white/[0.05] hover:border-indigo-500/20 group-hover/step:translate-x-2">
                            <h4 className="text-xl font-black text-white mb-4 tracking-tight uppercase tracking-widest text-sm">{step.title}</h4>
                            <p className="text-base text-zinc-400 mb-6 leading-relaxed font-medium">{step.explanation}</p>
                            {step.calculation && (
                              <div className="bg-zinc-950/80 border border-indigo-500/20 text-indigo-200 px-6 py-5 rounded-2xl font-mono text-sm overflow-x-auto shadow-2xl relative overflow-hidden group/calc">
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover/calc:opacity-100 transition-opacity">
                                  <Sparkles size={12} className="text-indigo-400" />
                                </div>
                                {step.calculation}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-[2.5rem] p-10 mt-16 shadow-2xl shadow-emerald-500/10 relative overflow-hidden group/final"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover/final:opacity-100 transition-opacity duration-1000" />
                      <h3 className="text-emerald-400 font-black text-xs uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5" />
                        Final Resolution
                      </h3>
                      <p className="text-3xl md:text-4xl font-black text-white tracking-tighter italic">
                        {solution.final_answer}
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};

export default DoubtSolver;
