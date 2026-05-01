import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Download, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Button } from "@/components/ui/button";

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  diagram?: string;
  agent?: string;
  userImage?: string;
}

interface AIMessageProps {
  message: Message;
  index: number;
  isSpeaking: boolean;
  onSpeakToggle: (text: string) => void;
  onExportPDF: (content: string) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({ 
  message, index, isSpeaking, onSpeakToggle, onExportPDF 
}) => {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`flex ${!isAssistant ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`relative group max-w-[90%] md:max-w-[85%] p-6 rounded-[2.5rem] transition-all duration-500 border ${
        !isAssistant
          ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-black font-semibold border-amber-400 rounded-tr-none shadow-[0_10px_30px_rgba(245,158,11,0.2)]'
          : 'bg-zinc-900/60 backdrop-blur-xl text-slate-200 border-white/5 rounded-tl-none hover:border-amber-500/20 shadow-2xl'
      }`}>
        {isAssistant && (
          <div className="absolute -inset-[1px] rounded-[2.5rem] rounded-tl-none bg-gradient-to-br from-amber-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        )}

        {isAssistant && message.agent && (
          <div className="absolute -top-3 left-6 bg-zinc-950 border border-amber-500/40 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-10 flex items-center gap-1.5">
            <Sparkles size={10} className="animate-pulse" /> {message.agent}
          </div>
        )}

        {message.userImage && (
          <motion.div
            layoutId={`img-${index}`}
            className="mb-4 rounded-2xl overflow-hidden border border-white/10 shadow-lg"
          >
            <img src={message.userImage} alt="uploaded" className="max-h-60 w-full object-cover" />
          </motion.div>
        )}

        {isAssistant ? (
          <div className="prose prose-invert prose-sm max-w-none
            prose-headings:text-amber-400 prose-headings:font-black prose-headings:mt-6 prose-headings:mb-3
            prose-p:text-slate-300 prose-p:leading-relaxed prose-p:my-3 prose-p:text-[15px]
            prose-strong:text-white prose-strong:font-black
            prose-code:text-amber-400 prose-code:bg-black/50 prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-code:text-[13px]
            prose-pre:bg-zinc-950/80 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl
            prose-blockquote:border-l-4 prose-blockquote:border-amber-500/50 prose-blockquote:bg-white/5 prose-blockquote:py-2 prose-blockquote:px-5
            prose-a:text-amber-400 prose-a:font-bold">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkMath]} 
              rehypePlugins={[rehypeKatex]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="whitespace-pre-wrap leading-relaxed text-[16px] tracking-tight">{message.content}</div>
        )}

        {message.diagram && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group/img"
          >
            <img src={message.diagram} alt="generated content" className="w-full h-auto transition-transform duration-700 group-hover/img:scale-105" />
          </motion.div>
        )}

        {isAssistant && (
          <div className="flex gap-2 mt-6 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onExportPDF(message.content)}
              className="h-9 px-4 hover:bg-amber-500 hover:text-black rounded-xl gap-2 font-bold text-[10px] uppercase tracking-widest border border-white/5"
            >
              <Download size={12} /> Export PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSpeakToggle(message.content)}
              className="h-9 px-4 hover:bg-amber-500 hover:text-black rounded-xl gap-2 font-bold text-[10px] uppercase tracking-widest border border-white/5"
            >
              {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />} {isSpeaking ? 'Mute' : 'Listen'}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
