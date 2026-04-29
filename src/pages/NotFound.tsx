import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Ghost, ShieldAlert, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/components/logo/logo.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "🛡️ [ZENITH_CORE] Security Alert: Unauthorized route access detected:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white selection:bg-emerald-500/30 overflow-hidden relative">
      {/* Zenith Background Aesthetics */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,20,15,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[150px] opacity-50" />
        
        {/* Neural Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center relative z-10 px-6"
      >
        {/* Logo Block */}
        <Link to="/" className="inline-block group mb-16">
          <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="p-6 bg-white rounded-[2.5rem] border border-white/20 relative z-10 shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3">
            <img src={logo} alt="Margdarshak" className="w-16 h-16 object-contain" />
          </div>
        </Link>

        <div className="space-y-8 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-4">
            <ShieldAlert size={14} className="text-red-500" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Transmission Error 404</span>
          </div>
          
          <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter uppercase italic leading-none">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/20">
              Void
            </span>
          </h1>
          
          <div className="space-y-4">
            <p className="text-2xl md:text-3xl font-black uppercase italic tracking-tight text-white/80">
              Protocol Path <span className="text-emerald-500">Not Found</span>
            </p>
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-[0.4em] leading-relaxed max-w-md mx-auto">
              The requested neural coordinate <span className="text-zinc-300 font-black italic">[{location.pathname}]</span> does not exist within the Margdarshak Architectural Suite.
            </p>
          </div>

          <div className="pt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/">
              <Button className="h-16 px-12 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-zinc-200 transition-all shadow-2xl shadow-white/5 active:scale-95 group">
                <ArrowLeft className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" />
                Return to Hub
              </Button>
            </Link>
            <Link to="/help">
              <Button className="h-16 px-12 bg-white/[0.03] border border-white/10 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-white/5 transition-all">
                Access Help Desk
              </Button>
            </Link>
          </div>
        </div>

        {/* Diagnostic Footer */}
        <div className="mt-32 flex items-center justify-center gap-8 opacity-20">
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-emerald-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Neural Sync: Active</span>
          </div>
          <div className="w-px h-3 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <Ghost size={12} className="text-blue-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Ghost Protocol: Engaged</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
