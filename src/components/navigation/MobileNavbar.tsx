import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  BrainCircuit, 
  CheckSquare, 
  Settings,
  Sparkles,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

const MobileNavbar = React.memo(() => {
  const location = useLocation();
  
  // Only show on mobile (md:hidden)
  // And only on dashboard-related pages
  const dashboardPages = [
    '/dashboard', '/ai-assistant', '/tasks', '/courses', '/settings', 
    '/grades', '/notes', '/calendar', '/timetable', 
    '/syllabus', '/progress', '/wellness', '/achievements'
  ];
  
  const isDashboardPage = dashboardPages.some(path => location.pathname.startsWith(path));
  
  if (!isDashboardPage) return null;

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: BrainCircuit, label: 'AI', path: '/ai-assistant' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Calendar, label: 'Schedule', path: '/timetable' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md">
      <nav className="bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex items-center justify-between shadow-2xl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                relative flex flex-col items-center justify-center py-2 px-4 rounded-full transition-all duration-300
                ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/30 rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-indigo-400' : ''}`} />
              <span className={`text-[10px] font-bold mt-1 relative z-10 ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
      {/* Floating Sparkle for Premium feel */}
      <div className="absolute -top-1 -right-1">
        <div className="relative">
           <div className="absolute inset-0 bg-amber-500 blur-md opacity-20 animate-pulse" />
           <Sparkles className="w-4 h-4 text-amber-500 relative z-10" />
        </div>
      </div>
    </div>
  );
});

export default MobileNavbar;
