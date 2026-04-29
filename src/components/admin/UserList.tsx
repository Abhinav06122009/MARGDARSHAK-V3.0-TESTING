import React from 'react';
import { Loader2, Search, Database } from 'lucide-react';
import UserRow from './UserRow';
import { motion } from 'framer-motion';

interface UserListProps {
  loading: boolean;
  users: any[];
  onAction: (action: 'block' | 'unblock' | 'set_tier', userId: string, extra?: any) => void;
}

const UserList: React.FC<UserListProps> = ({ loading, users, onAction }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-zinc-500 gap-8">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 flex items-center justify-center shadow-2xl">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        </div>
        <p className="text-[10px] font-black tracking-[0.5em] uppercase animate-pulse italic">Synchronizing Global Identity Matrix...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[500px] text-zinc-500 text-center group"
      >
        <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.01] border border-white/5 flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-700">
          <Database className="w-12 h-12 text-zinc-800" />
        </div>
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Zero Matches Detected</h3>
        <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] max-w-xs leading-relaxed">
          No identities match your current diagnostic parameters in the Matrix.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between px-10 pb-4 border-b border-white/5">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 italic">Identity Diagnostics</span>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 italic hidden md:block">Permission Protocols</span>
      </div>
      
      <div className="space-y-6">
        {users.map((user, index) => (
          <UserRow
            key={user.id}
            id={user.id}
            name={user.full_name}
            email={user.email}
            role={user.user_type}
            risk={user.risk_level}
            blocked={user.is_blocked}
            tier={user.subscription_tier}
            lastIp={user.last_login_ip}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  );
};

export default UserList;
