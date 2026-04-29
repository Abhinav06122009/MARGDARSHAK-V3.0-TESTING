import { Search, Filter, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface FilterBarProps {
  placeholder?: string;
  onChange?: (value: string) => void;
}

const FilterBar = ({ placeholder = 'SCAN_SYSTEM...', onChange }: FilterBarProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 rounded-[1.5rem] border border-white/5 bg-white/[0.01] px-6 py-4 backdrop-blur-3xl group hover:bg-white/[0.03] transition-all duration-700 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <Search className="h-5 w-5 text-zinc-700 group-hover:text-emerald-500 transition-colors duration-700 relative z-10" />
      <Input
        className="border-none bg-transparent text-[10px] font-black uppercase tracking-[0.3em] text-white focus-visible:ring-0 placeholder-zinc-800 focus:placeholder-zinc-600 transition-all h-auto py-0 relative z-10 italic"
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
      />
      <Filter className="h-4 w-4 text-zinc-800 opacity-20 group-hover:opacity-60 transition-opacity duration-700 relative z-10" />
    </motion.div>
  );
};

export default FilterBar;
