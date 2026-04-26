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
    <div className="min-h-screen bg-[#050505] text-slate-100 overflow-hidden font-sans selection:bg-red-500/30 flex relative">
      
      {/* Admin Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,10,10,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/10 to-transparent" />
        
        <motion.div 
          animate={{ opacity: [0.1, 0.15, 0.1], scale: [1, 1.1, 1], x: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[150px]"
        />
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <AdminSidebar />
      
      <div className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden">
        <AdminHeader />
        
        <ScrollArea className="flex-1">
          <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full min-h-[calc(100vh-80px)] flex flex-col">
            <div className="flex-1">
              {children}
            </div>

            {/* Admin Footer */}
            <footer className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                © 2025 <span className="text-white">VSAV GYANTAPA</span>. Administrative Panel.
              </p>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 rounded-full border border-red-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                <span className="text-red-400 text-[8px] font-black uppercase tracking-[0.2em]">Live Status Active</span>
              </div>
            </footer>
          </main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AdminLayout;
