import { Bell, LogOut, ShieldAlert, Activity, Command, Search, Sparkles } from 'lucide-react';
import { useClerk } from '@clerk/react';
import { Button } from '@/components/ui/button';
import { useContext } from 'react';
import { AdminContext } from '@/contexts/AdminContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import logo from "@/components/logo/logo.png";

const AdminHeader = () => {
  const { profile } = useContext(AdminContext);
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-[#050505]/50 backdrop-blur-3xl px-10 py-6 relative z-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent pointer-events-none" />
      
      <div className="flex items-center gap-6 relative z-10">
        <div className="w-12 h-12 rounded-[1.2rem] bg-white border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden group">
          <img src={logo} alt="Margdarshak" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-700" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-1">Mission Control</p>
          <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">
            Welcome, <span className="text-emerald-500">{profile?.full_name?.split(' ')[0] || 'Administrator'}</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-6 relative z-10">
        <div className="hidden md:flex items-center gap-4 px-5 py-2.5 bg-white/[0.02] border border-white/5 rounded-2xl shadow-inner group transition-all hover:border-emerald-500/20">
          <Search className="w-4 h-4 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="SCAN SYSTEM NODES..." 
            className="bg-transparent border-none text-[9px] font-black uppercase tracking-widest text-white focus:outline-none w-48 placeholder-zinc-800"
          />
        </div>

        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button className="relative p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-zinc-500 hover:text-emerald-400 transition-all shadow-xl group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <div className="absolute inset-0 bg-emerald-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </motion.div>
          
          <div className="w-px h-8 bg-white/5 mx-2" />
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 px-6 py-3 bg-white/[0.02] hover:bg-red-500/10 text-zinc-500 hover:text-red-500 border border-white/5 hover:border-red-500/30 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-xl"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
