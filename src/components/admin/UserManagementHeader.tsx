import React from 'react';
import { Users, Search } from 'lucide-react';

interface UserManagementHeaderProps {
  query: string;
  setQuery: (query: string) => void;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({ query, setQuery }) => {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-white/5 pb-8">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 uppercase italic">
          <Users className="w-8 h-8 text-red-500" /> Identity Matrix
        </h2>
        <p className="text-sm font-bold text-zinc-500 tracking-wide mt-2">
          Audit, restricted access, and review global identity policies.
        </p>
      </div>
      
      <div className="relative w-full md:w-96 group">
        <div className="absolute inset-0 bg-red-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative flex items-center bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 backdrop-blur-md transition-all duration-300 focus-within:border-red-500/50">
          <Search className="w-4 h-4 text-zinc-500 mr-3" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search identities (Name or Email)..." 
            className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder-zinc-600 font-bold"
          />
        </div>
      </div>
    </div>
  );
};

export default UserManagementHeader;
