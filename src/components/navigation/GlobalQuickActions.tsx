import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BarChart3, 
  BookOpen, 
  CheckSquare, 
  Search,
  Zap
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const GlobalQuickActions: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, path: '/dashboard', label: 'Dashboard' },
    { id: 'analytics', icon: BarChart3, path: '/ai-analytics', label: 'Analytics' },
    { id: 'courses', icon: BookOpen, path: '/courses', label: 'Courses' },
    { id: 'tasks', icon: CheckSquare, path: '/tasks', label: 'Tasks' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1.5 p-1.5 bg-[#141414]/70 backdrop-blur-md border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] pointer-events-auto"
    >
      {/* Lightning Logo in Purple Circle */}
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.3)] cursor-pointer"
        onClick={() => navigate('/')}
      >
        <Zap className="w-5 h-5 text-white fill-white" />
      </motion.div>

      {/* Navigation Icons */}
      <div className="flex items-center px-1 border-l border-white/5 ml-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.id}
              whileHover={{ y: -4, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className={`p-3 rounded-full transition-colors relative group ${
                isActive ? 'text-purple-400 bg-white/5' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-[#1A1A1A] text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none border border-white/10 shadow-2xl whitespace-nowrap">
                {item.label}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Search Button at the end */}
      <motion.button
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
        whileTap={{ scale: 0.95 }}
        className="p-3 text-zinc-500 hover:text-white rounded-full transition-all"
        onClick={() => window.dispatchEvent(new CustomEvent('open-global-search'))}
      >
        <Search className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
};

export default GlobalQuickActions;
