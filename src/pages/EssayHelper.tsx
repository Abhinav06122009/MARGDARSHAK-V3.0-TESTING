import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Sparkles, Copy, Download, Loader2, ArrowLeft, BookOpen, List,
  ChevronDown, ChevronUp, BrainCircuit, X, Volume2, VolumeX, Camera,
  Facebook, Twitter, Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { modelRouter } from '@/lib/ai/modelRouter';
import { useAI } from '@/contexts/AIContext';
import { jsPDF } from 'jspdf';
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

type ToolType = 'outline' | 'introduction' | 'thesis' | 'conclusion';

interface EssayConfig {
  topic: string;
  type: string;
  wordCount: string;
  tone: string;
}

const ESSAY_TYPES = ['Argumentative', 'Expository', 'Analytical', 'Compare & Contrast', 'Narrative', 'Research'];
const TONES = ['Academic', 'Formal', 'Conversational', 'Persuasive'];

const EssayHelper: React.FC = () => {
  const [config, setConfig] = useState<EssayConfig>({
    topic: '',
    type: 'Argumentative',
    wordCount: '500',
    tone: 'Academic',
  });
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [outputs, setOutputs] = useState<Partial<Record<ToolType, string>>>({});
  const [loading, setLoading] = useState<ToolType | null>(null);
  const [expandedSection, setExpandedSection] = useState<ToolType | null>(null);
  const { isAIReady } = useAI();
  const { toast } = useToast();

  const generate = useCallback(async (tool: ToolType) => {
    if (!config.topic.trim()) {
      toast({ title: 'Topic required', description: 'Please enter your essay topic first.', variant: 'destructive' });
      return;
    }
    if (!isAIReady) {
      toast({ title: 'AI not ready', description: 'Please wait for AI to initialize.', variant: 'destructive' });
      return;
    }

    setLoading(tool);
    setActiveTool(tool);

    const prompts: Record<ToolType, string> = {
      outline: `Create a detailed essay outline for a ${config.wordCount}-word ${config.type} essay on "${config.topic}" with a ${config.tone} tone.

Format it as:
I. Introduction
   A. Hook
   B. Background
   C. Thesis Statement

II. Body Paragraph 1 - [Topic]
   A. Main Point
   B. Supporting Evidence
   C. Analysis

(continue for 2-3 more body paragraphs)

V. Conclusion
   A. Restatement of thesis
   B. Summary of main points
   C. Closing thought

Keep it structured and specific to the topic.`,

      introduction: `Write a compelling introduction paragraph for a ${config.wordCount}-word ${config.type} essay on "${config.topic}" with a ${config.tone} tone.

Include:
1. An engaging hook (question, statistic, or anecdote)
2. Brief background context (2-3 sentences)
3. A clear thesis statement

Keep it under 150 words. Write the actual paragraph, not instructions.`,

      thesis: `Generate 3 strong thesis statements for a ${config.type} essay on "${config.topic}" with a ${config.tone} tone.

For each thesis:
- Make it specific and arguable
- Keep it to 1-2 sentences
- Ensure it's appropriate for a ${config.wordCount}-word essay

Number them 1, 2, 3 and briefly explain (1 sentence) why each works.`,

      conclusion: `Write a strong conclusion paragraph for a ${config.type} essay on "${config.topic}" with a ${config.tone} tone.

Include:
1. Restatement of thesis (in new words)
2. Brief summary of key arguments
3. Broader significance or call to action
4. Memorable closing sentence

Keep it under 150 words. Write the actual paragraph, not instructions.`,
    };

    try {
      const result = await modelRouter.complete(prompts[tool], {
        systemPrompt: 'You are an expert academic writing assistant. Provide high-quality, structured writing assistance.',
        useCache: true,
        cacheKey: `essay_${tool}_${config.topic}_${config.type}`,
      });
      setOutputs(prev => ({ ...prev, [tool]: result }));
      setExpandedSection(tool);
    } catch {
      toast({ title: 'Generation failed', description: 'Could not generate content. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  }, [config, isAIReady, toast]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Content copied to clipboard.' });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`Essay Helper: ${config.topic}`, margin, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Type: ${config.type} | Tone: ${config.tone} | Word Count: ~${config.wordCount}`, margin, y);
    y += 15;

    (Object.entries(outputs) as [ToolType, string][]).forEach(([tool, content]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(tool.charAt(0).toUpperCase() + tool.slice(1), margin, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(content, pageWidth);
      lines.forEach((line: string) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, margin, y);
        y += 5;
      });
      y += 10;
    });

    doc.save(`essay-helper-${config.topic.substring(0, 20)}.pdf`);
  };

  const tools: { id: ToolType; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'outline', label: 'Essay Outline', icon: <List className="w-4 h-4" />, description: 'Full structured outline' },
    { id: 'thesis', label: 'Thesis Statements', icon: <BookOpen className="w-4 h-4" />, description: '3 strong thesis options' },
    { id: 'introduction', label: 'Introduction', icon: <FileText className="w-4 h-4" />, description: 'Compelling opening paragraph' },
    { id: 'conclusion', label: 'Conclusion', icon: <FileText className="w-4 h-4" />, description: 'Strong closing paragraph' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,20,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Animated Neural Orbs */}
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
          {/* HEADER */}
          <header className="flex flex-col md:flex-row items-center justify-between p-6 glass-card rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative z-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.05] to-transparent pointer-events-none" />

            <div className="flex items-center gap-6">
              <Link to="/dashboard">
                <motion.div whileHover={{ scale: 1.1, x: -4 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="ghost" size="icon" className="h-12 w-12 text-zinc-400 hover:text-white hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                </motion.div>
              </Link>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-500/20 rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <FileText className="w-8 h-8 text-blue-400 relative z-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Essay <span className="text-blue-400">Generator</span></h1>
                  <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-0.5">Advanced</p>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex items-center gap-3">
              {Object.keys(outputs).length > 0 && (
                <Button
                  onClick={exportToPDF}
                  className="h-12 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              )}
              <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3 ml-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Scribe Active</span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-6 bg-blue-500 rounded-full" />
                    <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">Context Details</h2>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Topic</Label>
                    <Textarea
                      placeholder="Enter your central thesis or topic..."
                      value={config.topic}
                      onChange={e => setConfig(c => ({ ...c, topic: e.target.value }))}
                      className="bg-zinc-950/50 border-white/5 text-white placeholder:text-zinc-700 focus-visible:ring-blue-500/20 focus-visible:border-blue-500/40 min-h-[120px] rounded-2xl text-sm p-4 leading-relaxed transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">type</Label>
                    <Select value={config.type} onValueChange={v => setConfig(c => ({ ...c, type: v }))}>
                      <SelectTrigger className="bg-zinc-950/50 border-white/5 h-12 rounded-2xl text-white focus:ring-blue-500/20 transition-all font-bold text-xs uppercase tracking-widest">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                        {ESSAY_TYPES.map(t => <SelectItem key={t} value={t} className="focus:bg-blue-500/20 uppercase text-[10px] font-black tracking-widest">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Magnitude</Label>
                      <Select value={config.wordCount} onValueChange={v => setConfig(c => ({ ...c, wordCount: v }))}>
                        <SelectTrigger className="bg-zinc-950/50 border-white/5 h-12 rounded-2xl text-white font-bold text-xs uppercase tracking-widest">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                          {['250', '500', '750', '1000', '1500', '2000'].map(n => (
                            <SelectItem key={n} value={n} className="focus:bg-blue-500/20 uppercase text-[10px] font-black tracking-widest">{n} WDS</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Resonance</Label>
                      <Select value={config.tone} onValueChange={v => setConfig(c => ({ ...c, tone: v }))}>
                        <SelectTrigger className="bg-zinc-950/50 border-white/5 h-12 rounded-2xl text-white font-bold text-xs uppercase tracking-widest">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                          {TONES.map(t => <SelectItem key={t} value={t} className="focus:bg-blue-500/20 uppercase text-[10px] font-black tracking-widest">{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-2 ml-1">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Modules</h2>
                </div>
                {tools.map(tool => (
                  <motion.button
                    key={tool.id}
                    whileHover={{ x: 8, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => generate(tool.id)}
                    disabled={loading !== null}
                    className="w-full flex items-center gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all text-left disabled:opacity-50 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.05] to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                    <div className={`p-3 rounded-2xl ${outputs[tool.id] ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'} relative z-10 transition-colors`}>
                      {loading === tool.id ? <Loader2 className="w-5 h-5 animate-spin" /> : tool.icon}
                    </div>
                    <div className="flex-1 min-w-0 relative z-10">
                      <p className="text-sm font-black text-white uppercase tracking-wider">{tool.label}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{tool.description}</p>
                    </div>
                    {outputs[tool.id] && (
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] relative z-10" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {Object.keys(outputs).length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center min-h-[500px] glass-card border border-white/5 rounded-[3rem] text-center p-12"
                >
                  <div className="p-8 bg-white/5 rounded-[2.5rem] mb-6 relative group">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-[2.5rem] scale-110 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <FileText className="w-16 h-16 text-zinc-700 relative z-10" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-widest mb-3">Awaiting Instructions</h3>
                  <p className="text-zinc-500 text-sm max-w-xs leading-relaxed font-medium uppercase tracking-wider">Configure your parameters and activate a synthesis module to begin.</p>
                </motion.div>
              )}

              <div className="space-y-6">
                {(Object.entries(outputs) as [ToolType, string][]).map(([tool, content]) => (
                  <motion.div
                    key={tool}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden group shadow-2xl"
                  >
                    <button
                      onClick={() => setExpandedSection(expandedSection === tool ? null : tool)}
                      className="w-full flex items-center justify-between px-8 py-6 hover:bg-white/[0.03] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        <span className="text-xs font-black text-white uppercase tracking-[0.3em]">{tool}</span>
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">Done</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={e => { e.stopPropagation(); copyToClipboard(content); }}
                          className="p-3 rounded-2xl hover:bg-blue-500/20 text-zinc-500 hover:text-blue-400 border border-white/5 transition-all"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <div className={`p-2 rounded-xl transition-transform duration-500 ${expandedSection === tool ? 'rotate-180 bg-white/10' : ''}`}>
                          <ChevronDown className="w-4 h-4 text-zinc-500" />
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedSection === tool && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: "circOut" }}
                        >
                          <div className="px-10 pb-10 pt-4 border-t border-white/5 bg-gradient-to-b from-blue-500/[0.02] to-transparent">
                            <div className="relative">
                              <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/20 via-transparent to-transparent" />
                              <pre className="text-sm md:text-base text-zinc-300 leading-[1.8] whitespace-pre-wrap font-sans font-medium italic">
                                {content}
                              </pre>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default EssayHelper;
