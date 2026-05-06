import { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 overflow-hidden font-sans selection:bg-emerald-500/30 flex relative">
      
      {/* Zenith Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,20,15,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        
        {/* Animated Neural Orbs */}
        <motion.div 
          animate={{ opacity: [0.1, 0.15, 0.1], scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute top-0 -left-40 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ opacity: [0.05, 0.1, 0.05], scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 -right-40 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px]"
        />
        
        {/* Neural Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <AdminSidebar />
      
      <div className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden">
        <AdminHeader />
        
        <ScrollArea className="flex-1">
          <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full min-h-[calc(100vh-80px)] flex flex-col">
            <div className="flex-1">
              {children}
            </div>
          </main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AdminLayout;
