import { Bell, LogOut, ShieldAlert, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContext } from 'react';
import { AdminContext } from '@/contexts/AdminContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

const AdminHeader = () => {
  const { profile } = useContext(AdminContext);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-black/10 backdrop-blur-md px-8 py-5 relative z-20">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Activity className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Security Command Center</p>
          <h1 className="text-lg font-bold text-white tracking-tight">Welcome, {profile?.full_name || 'Administrator'}</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black" />
          </button>
        </motion.div>
        
        <div className="w-px h-6 bg-white/10 mx-2" />
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </motion.div>
      </div>
    </header>
  );
};

export default AdminHeader;
