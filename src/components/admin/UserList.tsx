import React from 'react';
import { Loader2, Search } from 'lucide-react';
import UserRow from './UserRow';

interface UserListProps {
  loading: boolean;
  users: any[];
  onAction: (action: 'block' | 'unblock' | 'set_tier', userId: string, extra?: any) => void;
}

const UserList: React.FC<UserListProps> = ({ loading, users, onAction }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-500 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-red-500" />
        <p className="text-sm font-black tracking-widest uppercase animate-pulse">Syncing Global Identity Database...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-500 text-center">
        <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
          <Search className="w-10 h-10 text-zinc-700" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Zero Matches Found</h3>
        <p className="text-sm font-medium text-zinc-600 max-w-xs">
          No identities match your current search criteria in the Matrix.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto] gap-6 px-6 pb-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Identity Details</span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hidden md:block">Access Controls</span>
      </div>
      
      <div className="space-y-3">
        {users.map((user) => (
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
