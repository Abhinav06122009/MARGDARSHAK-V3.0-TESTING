import React, { useState, useEffect } from 'react';
import { SignIn, SignUp } from '@clerk/react';
import { motion } from 'framer-motion';
import { Shield, Cpu } from 'lucide-react';
import logo from "@/components/logo/logo.png";
import { Link, useSearchParams } from 'react-router-dom';

interface AuthPageProps {
  onLogin?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setIsLogin(mode !== 'signup');
  }, [mode]);

  if (!isMounted) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-y-auto overflow-x-hidden">
      {/* Optimized Background - Reduced layers for speed */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`,
            backgroundSize: isMobile ? '60px 60px' : '80px 80px',
            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
          }}
        />
        
        {!isMobile && (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15)_0%,transparent_50%)]"
            />
            <motion.div 
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 1 }}
              className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(147,51,234,0.15)_0%,transparent_50%)]"
            />
          </div>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[460px] relative z-10 my-4 md:my-8"
      >
        <div className="text-center mb-6 md:mb-10">
          <Link to="/" className="inline-block mb-6 relative group transition-transform hover:scale-105 duration-300">
            <div className="absolute -inset-8 bg-blue-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-full" />
            <div className="p-4 md:p-5 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 relative z-10 shadow-2xl border-b-blue-500/50">
              <img 
                src={logo} 
                alt="Logo" 
                className="w-16 h-16 md:w-20 md:h-20 object-contain brightness-110" 
                loading="eager"
              />
            </div>
          </Link>
          
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                Margdarshak
              </span>
            </h1>
            <p className="text-zinc-400 text-[9px] md:text-xs font-bold uppercase tracking-[0.4em] opacity-80">
              {isLogin ? 'Security Protocol Alpha Active' : 'Begin Elite Synchronization'}
            </p>
          </div>
        </div>

        <div className="clerk-container rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative group">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-blue-500/5 to-purple-500/5 opacity-50" />
          
          <div className="relative z-10">
            {isLogin ? (
              <SignIn 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent border-none shadow-none w-full p-6 md:p-8",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-blue-500/50 transition-all h-12 md:h-14 rounded-2xl",
                    socialButtonsBlockButtonText: "text-white font-bold text-[10px] md:text-xs uppercase tracking-widest",
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] h-12 md:h-14 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]",
                    footerActionLink: "text-blue-400 hover:text-blue-300 font-bold",
                    formFieldLabel: "text-zinc-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-2",
                    formFieldInput: "bg-white/5 border-white/10 text-white rounded-xl md:rounded-2xl h-11 md:h-12 text-sm focus:border-blue-500/50 focus:ring-0 transition-all",
                    dividerText: "text-zinc-500 text-[9px] font-bold uppercase tracking-widest",
                    footer: "bg-transparent mt-4",
                    identityPreviewText: "text-white text-xs font-bold",
                    identityPreviewEditButton: "text-blue-400 font-bold",
                    formFieldAction: "text-blue-400 hover:text-blue-300 font-bold text-[10px] uppercase",
                    providerIcon: "brightness-125 scale-110"
                  }
                }}
                signUpUrl="/auth?mode=signup"
                fallbackRedirectUrl="/dashboard"
              />
            ) : (
              <SignUp 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent border-none shadow-none w-full p-6 md:p-8",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-blue-500/50 transition-all h-12 md:h-14 rounded-2xl",
                    socialButtonsBlockButtonText: "text-white font-bold text-[10px] md:text-xs uppercase tracking-widest",
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] h-12 md:h-14 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]",
                    footerActionLink: "text-blue-400 hover:text-blue-300 font-bold",
                    formFieldLabel: "text-zinc-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-2",
                    formFieldInput: "bg-white/5 border-white/10 text-white rounded-xl md:rounded-2xl h-11 md:h-12 text-sm focus:border-blue-500/50 focus:ring-0 transition-all",
                    dividerText: "text-zinc-500 text-[9px] font-bold uppercase tracking-widest",
                    footer: "bg-transparent mt-4",
                    providerIcon: "brightness-125 scale-110"
                  }
                }}
                signInUrl="/auth?mode=signin"
                fallbackRedirectUrl="/dashboard"
              />
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 hover:text-blue-400 transition-all hover:tracking-[0.4em] px-4 py-2"
          >
            {isLogin ? "Need an account? Join the elite" : "Already a member? Sign in here"}
          </button>
        </div>
      </motion.div>

      <div className="mt-12 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-600 select-none">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Quantum Encryption Active</span>
      </div>
    </div>
  );
};

export default AuthPage;

