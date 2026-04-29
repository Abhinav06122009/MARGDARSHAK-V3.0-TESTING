import { FileText, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface EvidenceViewerProps {
  title: string;
  details?: string | null;
}

const EvidenceViewer = ({ title, details }: EvidenceViewerProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="rounded-[2rem] border border-white/5 bg-black/40 p-8 shadow-inner group overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] rounded-full blur-[40px] pointer-events-none group-hover:bg-emerald-500/[0.05] transition-colors duration-700" />
      
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-2xl group-hover:scale-110 transition-transform duration-700">
          <FileText className="w-4 h-4 text-emerald-500" />
        </div>
        <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic leading-none">{title}</p>
      </div>
      
      <div className="relative z-10">
        <p className="text-sm text-zinc-500 leading-relaxed font-medium italic group-hover:text-zinc-300 transition-colors duration-700 whitespace-pre-wrap">
          {details || 'No cryptographic evidence attached to this unit yet.'}
        </p>
      </div>
      
      <div className="mt-6 flex items-center gap-3 opacity-20 group-hover:opacity-40 transition-opacity duration-700 relative z-10">
         <div className="h-[1px] flex-1 bg-gradient-to-r from-emerald-500/0 to-emerald-500" />
         <Sparkles className="w-3 h-3 text-emerald-500" />
      </div>
    </motion.div>
  );
};

export default EvidenceViewer;
