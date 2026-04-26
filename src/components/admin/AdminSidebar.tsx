import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, Users, FileSearch, BarChart3, Settings, Bell, LifeBuoy, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: Shield },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/security', label: 'Security Center', icon: Lock },
  { to: '/admin/reports', label: 'Investigations', icon: FileSearch },
  { to: '/admin/content', label: 'Content Moderation', icon: Bell },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/support', label: 'Support', icon: LifeBuoy },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminSidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex w-72 flex-col p-6 border-r border-white/5 bg-black/20 backdrop-blur-3xl relative z-20">
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-red-500/20 to-transparent" />
      
      <div className="mb-10 space-y-4">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Admin Mode
        </button>
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
            <Shield className="w-5 h-5 text-red-500" /> System Admin
          </h2>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-500 mt-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live
          </p>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold tracking-wide transition-all relative overflow-hidden ${
                  isActive 
                    ? 'text-red-400 bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="activeAdminTab" 
                      className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" 
                    />
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-zinc-500 group-hover:text-white transition-colors'}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <Lock className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Full Administrator</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Admin Workspace</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
