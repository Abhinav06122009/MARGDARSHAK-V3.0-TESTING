import { useState, useEffect, useRef, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuit, Globe, Camera, Sparkles, Lock, Crown, ImageIcon, KeyRound, Loader2, Send, X, ChevronRight } from "lucide-react";
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AI_GATEWAY_NOT_CONFIGURED_MESSAGE, getConfiguredAIGatewayUrl } from '@/lib/ai/constants';
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from 'framer-motion';

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

/**
 * AI Assistant Page - "Margdarshak Saarthi"
 * A multimodal AI interface for academic assistance, document analysis, and creative generation.
 */
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
      const unsafeMetadata = clerkUser.unsafeMetadata || {};
      const subscription = (metadata.subscription as any) || (unsafeMetadata.subscription as any) || {};
      let tier = (subscription.tier || (metadata as any).subscription_tier || (unsafeMetadata as any).subscription_tier || (metadata as any).tier || (unsafeMetadata as any).tier || 'free').toLowerCase();
      
      // FUZZY FALLBACK
      const rawMetadataStr = JSON.stringify(metadata).toLowerCase() + JSON.stringify(unsafeMetadata).toLowerCase();
      if (tier === 'free') {
        if (rawMetadataStr.includes('elite')) tier = 'premium_elite';
        else if (rawMetadataStr.includes('premium')) tier = 'premium';
      }

      // SUPER OVERRIDE for Abhinav Jha
      if (clerkUser.id === 'user_3CwM4tADcqKhELg4ZX9r2xIRC4L') {
        tier = 'premium_elite';
      }

      console.log('[AI Page] Live Clerk Subscription:', tier);
      setSubscriptionTier(tier);
    }
  }, [clerkUser, clerkLoaded]);

  // Helpers
  const isEliteUser = () => ELITE_TIERS.includes(subscriptionTier);
  const isPremiumPlusUser = () => subscriptionTier === 'premium_plus' || subscriptionTier === 'extra_plus';
  const isPremiumUser = () => subscriptionTier === 'premium';
  const isFreeUser = () => !isEliteUser() && !isPremiumUser() && !isPremiumPlusUser();
  const getUserApiKey = () => (isPremiumUser() || isPremiumPlusUser()) ? byokKey || null : null;

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

  // AI Interaction Logic
  const handleGatewayResponseCode = (code: unknown): boolean => {
    if (code === GATEWAY_RESPONSE.AUTH_REQUIRED) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Please sign in to use AI features.' }]);
      return true;
    }
    if (code === GATEWAY_RESPONSE.UPGRADE_TO_EXTRA) {
      setShowUpgradeModal(true);
      return true;
    }
    if (code === GATEWAY_RESPONSE.KEY_REQUIRED) {
      setShowByokModal(true);
      return true;
    }
    return false;
  };

  async function executeSend(textToSend: string, modeToUse: Mode, imageToSend: File | null = null) {
    if (isFreeUser()) return;
    const isVision = !!imageToSend;
    const userApiKey = getUserApiKey();

    // Enforce BYOK for Premium members (Elite can use inbuilt)
    if (!isEliteUser() && !userApiKey) {
      setMessages(prev => [...prev, { role: 'assistant', content: '🔑 **API Key Required**: Premium members must provide an OpenRouter API key to use Saarthi. Elite members have inbuilt access.' }]);
      setShowByokModal(true);
      return;
    }

    setLoading(true);
    setMessages(prev => [...prev, {
      role: 'user',
      content: textToSend,
      userImage: imageToSend ? URL.createObjectURL(imageToSend) : undefined
    }]);

    // Identity intercept
    const identityTriggers = ["who are you", "what is your name", "who made you", "your name", "tell me about yourself"];
    if (identityTriggers.some(t => textToSend.toLowerCase().includes(t)) && !imageToSend) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I am **Margdarshak Saarthi**, your elite AI study companion and cognitive orchestrator. I have been meticulously engineered to assist students within the **Margdarshak Ecosystem** with advanced academic synthesis, multimodal document analysis, and creative problem-solving.\n\nMy mission is to empower your learning journey with state-of-the-art intelligence, ensuring you achieve academic excellence with precision and clarity.",
          agent: "Margdarshak Saarthi",
        }]);
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      
      // Local API Path (supports Vision if no Gateway)
      if (!AI_GATEWAY_URL) {
        const { authedFetch, readErrorMessage } = await import('@/lib/ai/authedFetch');
        
        let content: any = textToSend;
        if (isVision && imageToSend) {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(imageToSend);
          });
          const base64 = await base64Promise;
          content = [
            { type: "text", text: textToSend || "Describe this image." },
            { type: "image_url", image_url: { url: base64 } }
          ];
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (userApiKey) headers['X-User-API-Key'] = userApiKey;

        const res = await authedFetch('/api/ai-chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({ 
            messages: [...chatHistory, { role: 'user', content }] 
          }),
        });

        if (!res.ok) throw new Error(await readErrorMessage(res));
        const data = await res.json();
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response, 
          agent: isVision ? VISION_MODEL_LABEL : TEXT_MODEL_LABEL 
        }]);
        return;
      }

      // Gateway path (Legacy/External)
      const { data: { session } } = await supabase.auth.getSession();
      const headers: any = { Authorization: `Bearer ${session?.access_token}` };
      if (userApiKey) headers['X-User-API-Key'] = userApiKey;

      let res: Response;
      if (isVision && imageToSend) {
        const formData = new FormData();
        formData.append('mode', REQUEST_MODE.CHAT);
        formData.append('messages', JSON.stringify([...chatHistory, { role: 'user', content: textToSend || 'Describe this image.' }]));
        formData.append('image', imageToSend);
        res = await fetch(AI_GATEWAY_URL!, { method: 'POST', headers, body: formData });
      } else {
        res = await fetch(AI_GATEWAY_URL!, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: REQUEST_MODE.CHAT, messages: [...chatHistory, { role: 'user', content: textToSend }] }),
        });
      }

      const data = await res.json();
      if (handleGatewayResponseCode(data.response)) return;
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, diagram: data.image, agent: isVision ? VISION_MODEL_LABEL : TEXT_MODEL_LABEL }]);
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
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans relative overflow-x-hidden">
      {/* Visual Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,20,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
      <ByokModal 
        isOpen={showByokModal} onOpenChange={setShowByokModal} 
        byokInput={byokInput} setByokInput={setByokInput} 
        onSave={saveByokKey} byokKey={byokKey} onClear={clearByokKey} 
      />

      <div className="relative z-10 max-w-6xl mx-auto min-h-screen flex flex-col p-2 sm:p-4 gap-4">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between p-3 md:p-4 rounded-2xl md:rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10">
              <BrainCircuit className="text-amber-500 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black italic text-white">MARGDARSHAK <span className="text-amber-500">SAARTHI</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 md:mt-0">
            {isPremiumUser() && (
              <button onClick={() => setShowByokModal(true)} className={`h-9 px-3 border rounded-lg text-xs font-semibold flex items-center gap-2 ${byokKey ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400 animate-pulse'}`}>
                <KeyRound size={12} /> {byokKey ? 'Key Active' : 'Add Key'}
              </button>
            )}
            <div className="h-9 px-4 flex items-center border border-white/10 rounded-lg text-xs font-bold text-amber-400 bg-black/40">
              <Sparkles size={12} className="mr-2" /> {mode === 'imagine' ? IMAGE_GEN_LABEL : selectedImage ? VISION_MODEL_LABEL : TEXT_MODEL_LABEL}
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <ScrollArea className="flex-1 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative" ref={scrollRef}>
          <div className="p-4 md:p-8 space-y-8 pb-32">
            {isFreeUser() ? (
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
        {!isFreeUser() && (
          <div className="sticky bottom-4 w-full max-w-4xl mx-auto px-4">
            <div className="relative bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[3rem] p-1.5 md:p-2 flex items-center gap-1 md:gap-2 shadow-2xl">
              {preview && (
                <div className="absolute -top-24 left-4 p-2 bg-zinc-900 border border-white/10 rounded-xl flex items-center gap-2">
                  <img src={preview} className="h-16 w-16 object-cover rounded-lg" alt="Preview" />
                  <button onClick={() => { setSelectedImage(null); setPreview(null); }} className="p-1 bg-red-500/20 text-red-400 rounded-full"><X size={14} /></button>
                </div>
              )}
              <label className="p-2 md:p-3 text-gray-400 hover:text-white cursor-pointer transition-colors">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { setSelectedImage(file); setPreview(URL.createObjectURL(file)); }
                }} />
              </label>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Saarthi anything..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base text-white placeholder:text-gray-600"
              />
              <Button onClick={handleSend} disabled={loading || (!input.trim() && !selectedImage)} className="rounded-full h-10 w-10 md:h-12 md:w-12 p-0 bg-amber-500 hover:bg-amber-600 text-black">
                {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-components for cleaner structure
const EmptyState = ({ label }: { label: string }) => (
  <div className="h-[50vh] flex flex-col items-center justify-center opacity-30">
    <Sparkles size={64} className="mb-4 animate-pulse text-amber-500" />
    <p className="font-bold tracking-widest text-xs uppercase">Saarthi Active</p>
    <p className="text-[10px] text-amber-400 mt-2">{label}</p>
  </div>
);

const LockState = () => (
  <div className="h-[55vh] flex flex-col items-center justify-center text-center px-6">
    <div className="w-20 h-20 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center mb-6">
      <Lock className="w-10 h-10 text-gray-500" />
    </div>
    <h2 className="text-2xl font-black text-white mb-2">Saarthi is Locked</h2>
    <p className="text-gray-400 text-sm max-w-xs mb-8">Upgrade to Premium or Elite to activate your AI study companion.</p>
    <Link to="/upgrade">
      <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold px-8 py-6 rounded-full text-lg">View Plans</Button>
    </Link>
  </div>
);

const LoadingIndicator = ({ mode, isVision }: { mode: string, isVision: boolean }) => (
  <div className="flex items-center gap-3 ml-6 font-bold text-[10px] uppercase tracking-widest text-amber-500 animate-pulse">
    <Loader2 className="animate-spin" size={14} />
    {mode === 'imagine' ? 'Generating Image...' : isVision ? 'Analyzing Image...' : 'Thinking...'}
  </div>
);

export default SmartTutorPage;
