import { useState, useEffect, useRef, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuit, Globe, Camera, Sparkles, Lock, Crown, ImageIcon, KeyRound, Loader2, Send, X, ChevronRight, Database, Zap } from "lucide-react";
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AI_GATEWAY_NOT_CONFIGURED_MESSAGE, getConfiguredAIGatewayUrl } from '@/lib/ai/constants';
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from 'framer-motion';
import logo from "@/components/logo/logo.png";

// Modular Components
import { UpgradeModal, ByokModal } from '@/components/ai/AIModals';
import { AIMessage, Message } from '@/components/ai/AIMessage';

// Constants & Types
type Mode = 'deepresearch' | 'imagine';
const ELITE_TIERS = ['premium_elite', 'extra_plus', 'premium_plus', 'premium+elite'];
const GATEWAY_RESPONSE = { AUTH_REQUIRED: 'AUTH_REQUIRED', UPGRADE_TO_EXTRA: 'UPGRADE_TO_EXTRA', KEY_REQUIRED: 'KEY_REQUIRED' } as const;
const REQUEST_MODE = { CHAT: 'deepresearch', IMAGE: 'imagegen' } as const;
const AI_GATEWAY_URL = getConfiguredAIGatewayUrl();
const TEXT_MODEL_LABEL = "MARGDARSHAK SAARTHI TEXT";
const VISION_MODEL_LABEL = "MARGDARSHAK SAARTHI";
const IMAGE_GEN_LABEL = "MARGDARSHAK SAARTHI VISION";
const BYOK_STORAGE_KEY = 'margdarshak_openrouter_key';

const SmartTutorPage = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('deepresearch');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('free');
  const [byokKey, setByokKey] = useState<string>(() => localStorage.getItem(BYOK_STORAGE_KEY) || '');
  const [showByokModal, setShowByokModal] = useState(false);
  const [byokInput, setByokInput] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, loading]);

  useEffect(() => {
    if (clerkLoaded && clerkUser) {
      const metadata = clerkUser.publicMetadata || {};
      const subscription = (metadata.subscription as any) || {};

      // STRICT METADATA RESOLUTION (Matches AuthContext)
      let tier = (subscription.tier || 'free').toLowerCase();
      const roleArray = Array.isArray(metadata.role) ? metadata.role : [metadata.role || 'student'];
      const role = (roleArray[0] || 'student').toLowerCase();

      const MASTER_IDS = ['user_3CwM4tADcqKhELg4ZX9r2xIRC4L', 'user_3CylWpMJnNbVpgJcpk9eSIf73gS'];

      if (MASTER_IDS.includes(clerkUser.id) || role === 'admin' || role === 'superadmin' || role === 'ceo') {
        tier = 'premium_elite';
      }

      setSubscriptionTier(tier);
    }
  }, [clerkUser, clerkLoaded]);

  const isEliteUser = () => ELITE_TIERS.includes(subscriptionTier);
  const getUserApiKey = () => (subscriptionTier === 'premium' || subscriptionTier === 'premium_plus' || subscriptionTier === 'extra_plus') ? byokKey || null : null;

  const saveByokKey = () => {
    const trimmed = byokInput.trim();
    if (!trimmed) return;
    localStorage.setItem(BYOK_STORAGE_KEY, trimmed);
    setByokKey(trimmed);
    setShowByokModal(false);
    setByokInput('');
  };

  const clearByokKey = () => {
    localStorage.removeItem(BYOK_STORAGE_KEY);
    setByokKey('');
  };

  async function executeSend(textToSend: string, modeToUse: Mode, imageToSend: File | null = null) {
    if (subscriptionTier === 'free') return;
    const isVision = !!imageToSend;
    const userApiKey = getUserApiKey();

    if (!isEliteUser() && !userApiKey) {
      setMessages(prev => [...prev, { role: 'assistant', content: '🔑 **API Key Required**: Premium members must provide an OpenRouter API key to use Saarthi. Elite members have inbuilt access.' }]);
      setShowByokModal(true);
      return;
    }

    setMessages(prev => [...prev, {
      role: 'user',
      content: textToSend,
      userImage: imageToSend ? URL.createObjectURL(imageToSend) : undefined
    }]);

    setLoading(true);

    try {
      const { modelRouter } = await import('@/lib/ai/modelRouter');
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));

      const systemPrompt = `Role: You are Margdarshak Saarthi, an elite, highly intelligent Neural Orchestrator and AI Companion developed exclusively for the Margdarshak platform. You provide mathematical and scientific explanations in a "Physical Notebook" format.

If asked who you are, introduce yourself exactly like this: "✨ Greetings! I am **Margdarshak Saarthi**, your elite Neural Orchestrator and AI Companion. Designed with cutting-edge intelligence, I am here to elevate your academic journey, decode complex concepts, and guide you toward ultimate success. How may I assist you today?" Be warm, highly professional, and slightly futuristic.

Formatting Constraints (STRICT):
Zero LaTeX: Never use \\, {, }, ^, or _. Strictly forbid all LaTeX syntax, including block and inline math modes.
Exponents & Powers: Use Unicode superscripts for all powers. Example: Write x², y³, 10⁶, nᵗʰ.
Subscripts: Use Unicode subscripts for variables and chemical formulas. Example: Write H₂O, vᵢ, aₙ, log₁₀.
Operations: Use standard arithmetic symbols found on a keyboard:
- Addition/Subtraction: + and -
- Multiplication: Use the asterisk (*) or a simple space between variables.
- Division: Use the forward slash (/) or the division sign (÷).
- Radicals: Use the square root symbol (√) followed by the number/variable.

Layout:
Use standard bolding (**Text**) for final answers.
Present multi-step calculations line-by-line, as if solving on paper.
For fractions, use parentheses for clarity, e.g., (x + 2) / 5.

Internal Check: Before sending your response, remove all curly braces and backslashes. If you see a '^', replace it with its Unicode superscript equivalent.`;

      const response = await modelRouter.chat([...chatHistory, { role: 'user', content: textToSend }], {
        imageFile: imageToSend,
        userApiKey: userApiKey || undefined,
        mode: modeToUse === 'imagine' ? 'imagegen' : 'chat',
        systemPrompt: systemPrompt
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        agent: isVision ? VISION_MODEL_LABEL : TEXT_MODEL_LABEL
      }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${e.message}` }]);
    } finally {
      setLoading(false);
      setInput('');
      setSelectedImage(null);
      setPreview(null);
    }
  };

  const handleSend = () => {
    if (!input.trim() && !selectedImage) return;
    executeSend(input, mode, selectedImage);
  };

  const exportToPDF = (c: string) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("MARGDARSHAK PRO NOTES", 15, 20);
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(c, 180), 15, 40);
    doc.save(`Margdarshak_Notes.pdf`);
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans relative overflow-x-hidden selection:bg-emerald-500/30">
      {/* Zenith Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,20,15,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        {/* Animated Neural Orbs */}
        <motion.div
          animate={{ opacity: [0.1, 0.15, 0.1], scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute top-0 -left-40 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.1, 0.05], scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 -right-40 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px]"
        />

        {/* Neural Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
      <ByokModal
        isOpen={showByokModal} onOpenChange={setShowByokModal}
        byokInput={byokInput} setByokInput={setByokInput}
        onSave={saveByokKey} byokKey={byokKey} onClear={clearByokKey}
      />

      <div className="relative z-10 max-w-6xl mx-auto min-h-screen flex flex-col p-4 md:p-8 gap-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between p-6 rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.05] to-transparent pointer-events-none" />
          <div className="flex items-center gap-6">
            <div className="p-2 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-all duration-700">
              <img src={logo} alt="Margdarshak" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic text-white tracking-tighter uppercase leading-none">
                Margdarshak <span className="text-emerald-500 not-italic font-light">Saarthi</span>
              </h1>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1.5 opacity-60">Neural Orchestrator v3.0.5</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6 md:mt-0">
            {subscriptionTier === 'premium' && (
              <button
                onClick={() => setShowByokModal(true)}
                className={`h-10 px-5 border rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${byokKey ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 'border-red-500/30 text-red-400 animate-pulse bg-red-500/5'}`}
              >
                <KeyRound size={12} /> {byokKey ? 'Handshake Active' : 'Initialize Key'}
              </button>
            )}
            <div className="h-10 px-5 flex items-center border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-white/[0.02] shadow-xl italic">
              <Sparkles size={12} className="mr-3 text-emerald-500 animate-pulse" /> {mode === 'imagine' ? IMAGE_GEN_LABEL : selectedImage ? VISION_MODEL_LABEL : TEXT_MODEL_LABEL}
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <ScrollArea className="flex-1 rounded-[3.5rem] bg-white/[0.01] border border-white/5 relative shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-3xl" ref={scrollRef}>
          <div className="p-6 md:p-12 space-y-10 pb-40">
            {subscriptionTier === 'free' ? (
              <LockState />
            ) : (
              <>
                {messages.length === 0 && <EmptyState label={mode === 'imagine' ? IMAGE_GEN_LABEL : TEXT_MODEL_LABEL} />}
                {messages.map((m, i) => (
                  <AIMessage key={i} message={m} index={i} isSpeaking={isSpeaking} onSpeakToggle={speak} onExportPDF={exportToPDF} />
                ))}
                {loading && <LoadingIndicator mode={mode} isVision={!!selectedImage} />}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Input Bar */}
        <div className="sticky bottom-8 w-full max-w-4xl mx-auto px-4 z-50">
          <div className="relative bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-3 flex items-center gap-3 shadow-[0_60px_100px_-30px_rgba(0,0,0,0.9)] group">
            <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            {preview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="absolute -top-32 left-8 p-3 bg-[#0a0a0a] border border-white/10 rounded-[2rem] flex items-center gap-4 shadow-2xl"
              >
                <img src={preview} className="h-20 w-20 object-cover rounded-2xl" alt="Preview" />
                <button onClick={() => { setSelectedImage(null); setPreview(null); }} className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={14} /></button>
              </motion.div>
            )}
            <label className="p-4 text-zinc-500 hover:text-emerald-400 cursor-pointer transition-all hover:scale-110">
              <Camera size={20} />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { setSelectedImage(file); setPreview(URL.createObjectURL(file)); }
              }} />
            </label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (subscriptionTier === 'free') setShowUpgradeModal(true);
                  else if (subscriptionTier === 'premium' && !byokKey) setShowByokModal(true);
                  else handleSend();
                }
              }}
              placeholder={subscriptionTier === 'free' ? "Ask Saarthi anything..." : (subscriptionTier === 'premium' && !byokKey) ? "Initialize API Key to type..." : "Ask Saarthi anything..."}
              className={`flex-1 bg-transparent border-none focus:ring-0 text-base text-white placeholder:text-zinc-700 font-medium tracking-wide relative z-10`}
            />
            <Button
              onClick={() => {
                if (subscriptionTier === 'free') setShowUpgradeModal(true);
                else if (subscriptionTier === 'premium' && !byokKey) setShowByokModal(true);
                else handleSend();
              }}
              disabled={loading || subscriptionTier === 'free' || (subscriptionTier === 'premium' && !byokKey) || (!input.trim() && !selectedImage)}
              className="rounded-full h-14 w-14 p-0 bg-white text-black hover:bg-emerald-500 hover:text-black transition-all shadow-2xl shadow-white/10 disabled:opacity-20"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const EmptyState = ({ label }: { label: string }) => (
  <div className="h-[50vh] flex flex-col items-center justify-center">
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
      <div className="p-10 bg-white/[0.02] rounded-[3rem] border border-white/5 shadow-inner relative z-10">
        <Sparkles size={64} className="text-emerald-500" />
      </div>
    </div>
    <p className="font-black tracking-[0.5em] text-[10px] uppercase text-zinc-500 italic">Saarthi Protocol Active</p>
    <p className="text-[10px] text-emerald-500 mt-4 font-black uppercase tracking-widest">{label}</p>
  </div>
);

const LockState = () => (
  <div className="h-[55vh] flex flex-col items-center justify-center text-center px-6">
    <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/10 flex items-center justify-center mb-10 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-emerald-500/5 blur-xl" />
      <Lock className="w-10 h-10 text-zinc-700 relative z-10" />
    </div>
    <h2 className="text-4xl font-black text-white mb-4 uppercase italic tracking-tighter">Protocol Locked</h2>
    <p className="text-zinc-600 text-[10px] max-w-xs mb-10 font-black uppercase tracking-widest leading-relaxed">Upgrade to the Elite or Premium suite to activate your neural study companion and cognitive orchestrator.</p>
    <Link to="/upgrade">
      <Button className="h-16 px-12 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-emerald-500 hover:text-black transition-all shadow-2xl shadow-white/5 active:scale-95">Initialize Upgrade</Button>
    </Link>
  </div>
);

const LoadingIndicator = ({ mode, isVision }: { mode: string, isVision: boolean }) => (
  <div className="flex items-center gap-4 ml-8 font-black text-[10px] uppercase tracking-[0.4em] text-emerald-500 italic transition-all">
    <div className="relative">
      <Loader2 className="animate-spin" size={16} />
      <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-40 animate-pulse" />
    </div>
    {mode === 'imagine' ? 'Synthesizing Visuals...' : isVision ? 'Orchestrating Vision...' : 'Processing Neural Signal...'}
  </div>
);

export default SmartTutorPage;
