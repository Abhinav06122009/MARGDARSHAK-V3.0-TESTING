import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, Users, FileSearch, BarChart3, Settings, Bell, LifeBuoy, Lock, ArrowLeft, LayoutGrid, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from "@/components/logo/logo.png";

const navItems = [
  { to: '/admin', label: 'Command Center', icon: Shield },
  { to: '/admin/users', label: 'Vanguard Registry', icon: Users },
  { to: '/admin/security', label: 'Security Protocols', icon: Lock },
  { to: '/admin/reports', label: 'Investigations', icon: FileSearch },
  { to: '/admin/content', label: 'Moderation Unit', icon: Bell },
  { to: '/admin/analytics', label: 'Neural Analytics', icon: BarChart3 },
  { to: '/admin/support', label: 'Support Uplink', icon: LifeBuoy },
  { to: '/admin/settings', label: 'System Config', icon: Settings },
];

const AdminSidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex w-72 flex-col p-8 border-r border-white/5 bg-[#050505]/50 backdrop-blur-3xl relative z-20 overflow-hidden">
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent" />
      
      <div className="mb-12 space-y-6">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-3 text-[10px] font-black text-zinc-600 hover:text-emerald-400 uppercase tracking-[0.3em] transition-all group/exit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Exit Admin
        </button>
        
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white rounded-xl shadow-lg">
            <img src={logo} alt="Margdarshak" className="h-6 w-6 object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">
              Zenith <span className="text-emerald-500">Core</span>
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <p className="text-[8px] uppercase tracking-[0.3em] font-black text-emerald-500">System Root</p>
            </div>
          </div>
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
                `group flex items-center gap-4 rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden ${
                  isActive 
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-2xl italic' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/[0.02] border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="activeAdminTab" 
                      className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)]" 
                    />
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-600 group-hover:text-emerald-400 transition-colors'}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-8 border-t border-white/5">
        <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5 shadow-2xl group cursor-help transition-all hover:border-emerald-500/20">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform">
            <Lock className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest italic">Global Admin</p>
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-1 opacity-60">Verified Access</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
