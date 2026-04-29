import React from 'react';
import { Users, Search, Activity, Database } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserManagementHeaderProps {
  query: string;
  setQuery: (query: string) => void;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({ query, setQuery }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-10 border-b border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6 shadow-2xl"
        >
          <Database className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Global Identity Registry Active</span>
        </motion.div>
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">Identity <span className="text-emerald-500">Matrix</span></h2>
        <p className="text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase mt-4 opacity-60 italic">Audit, restricted access, and review global identity policies.</p>
      </div>
      
      <div className="relative w-full md:w-[28rem] group z-10">
        <div className="absolute inset-0 bg-emerald-500/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative flex items-center bg-white/[0.01] border border-white/5 rounded-[1.8rem] px-8 py-5 backdrop-blur-3xl transition-all duration-700 focus-within:border-emerald-500/30 group-hover:bg-white/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
          <Search className="w-5 h-5 text-zinc-700 mr-4 group-hover:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SCAN SYSTEM IDENTITIES..." 
            className="bg-transparent border-none text-[10px] font-black uppercase tracking-[0.2em] text-white focus:outline-none w-full placeholder-zinc-800"
          />
        </div>
      </div>
    </div>
  );
};

export default UserManagementHeader;
