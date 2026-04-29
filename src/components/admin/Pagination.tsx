import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const Pagination = ({ page, totalPages, onChange }: PaginationProps) => {
  return (
    <div className="flex items-center justify-between px-10 py-6 bg-white/[0.01] border border-white/5 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.01] to-transparent pointer-events-none" />
      
      <div className="flex items-center gap-4 relative z-10">
        <Activity className="w-4 h-4 text-emerald-500/40" />
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic">
          INDEX_SECTOR <span className="text-white opacity-40">{page}</span> / <span className="text-white opacity-40">{totalPages}</span>
        </span>
      </div>
      
      <div className="flex gap-4 relative z-10">
        <button 
          disabled={page <= 1} 
          onClick={() => onChange(page - 1)}
          className="flex items-center gap-2 px-6 py-3 bg-white/[0.02] hover:bg-emerald-500/10 text-zinc-600 hover:text-emerald-500 border border-white/5 hover:border-emerald-500/20 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:pointer-events-none group/btn"
        >
          <ChevronLeft className="w-4 h-4 group-hover/btn:translate-x-[-2px] transition-transform" /> PREV_SECTOR
        </button>
        <button 
          disabled={page >= totalPages} 
          onClick={() => onChange(page + 1)}
          className="flex items-center gap-2 px-6 py-3 bg-white/[0.02] hover:bg-emerald-500/10 text-zinc-600 hover:text-emerald-500 border border-white/5 hover:border-emerald-500/20 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:pointer-events-none group/btn2"
        >
          NEXT_SECTOR <ChevronRight className="w-4 h-4 group-hover/btn2:translate-x-[2px] transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
