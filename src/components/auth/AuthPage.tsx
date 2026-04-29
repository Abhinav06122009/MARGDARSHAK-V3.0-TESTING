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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const timer = setTimeout(() => setMounted(true), 600); // Reduced delay for snappier feel
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    setIsLogin(mode !== 'signup');
  }, [mode]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-8 md:p-12 border border-white/10 text-center w-full max-w-sm">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div
                className="absolute -inset-4 border-t-2 border-b-2 border-blue-500/30 rounded-full animate-spin"
                style={{ animationDuration: '2000ms' }}
              />
              <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full animate-pulse" />
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 relative z-10">
                <img src={logo} alt="Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain brightness-110" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-white text-sm md:text-lg font-black tracking-tighter uppercase italic">Secure Initializing</p>
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.1s]" />
                </div>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Protection Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Premium Background Elements - Optimized */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`,
            backgroundSize: isMobile ? '30px 30px' : '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
          }}
        />
        
        {/* Simplified Orbs for Mobile */}
        {!isMobile && (
          <>
            <motion.div 
              animate={{
                scale: [1, 1.1, 1],
                x: [0, 30, 0],
                y: [0, 20, 0],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[10%] left-[15%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px]" 
            />
            <motion.div 
              animate={{
                scale: [1, 1.2, 1],
                x: [0, -30, 0],
                y: [0, -20, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[80px]" 
            />
          </>
        )}
        {isMobile && (
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/5 blur-[100px] rounded-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="text-center mb-6 md:mb-10">
          <Link to="/" className="inline-block mb-6 md:mb-8 relative group">
            <div className="absolute -inset-4 bg-blue-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-full scale-75 group-hover:scale-100" />
            <div className="p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 relative z-10 shadow-xl group-hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] transition-all duration-500 group-hover:scale-105">
              <img src={logo} alt="Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain brightness-125" />
            </div>
          </Link>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase italic mb-2">
              <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">Margdarshak</span>
            </h1>
            <p className="text-zinc-400 text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-80">
              {isLogin ? 'Command Center Access' : 'Join Elite Ecosystem'}
            </p>
          </motion.div>
        </div>

        <div className="clerk-container rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl relative">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-blue-500/5 to-purple-500/5" />
          
          {isLogin ? (
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent border-none shadow-none w-full p-4 md:p-8",
                  headerTitle: "text-white font-black uppercase tracking-widest text-base md:text-lg",
                  headerSubtitle: "text-zinc-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-4 md:mb-6",
                  socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all",
                  socialButtonsBlockButtonText: "text-white font-bold text-[10px] md:text-xs uppercase tracking-widest",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-[10px] md:text-xs font-bold uppercase tracking-widest py-3 md:py-4 rounded-xl md:rounded-2xl transition-all shadow-lg",
                  footerActionLink: "text-blue-400 hover:text-blue-300 font-bold",
                  formFieldLabel: "text-zinc-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2",
                  formFieldInput: "bg-white/5 border-white/10 text-white rounded-lg md:rounded-xl py-2 md:py-3 text-sm focus:border-blue-500/50 transition-all",
                  dividerText: "text-zinc-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest",
                  footer: "bg-transparent",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-blue-400",
                  formFieldAction: "text-blue-400 hover:text-blue-300 font-bold text-[8px] md:text-[10px] uppercase tracking-widest",
                  providerIcon: "brightness-150"
                }
              }}
              signUpUrl="/auth?mode=signup"
              fallbackRedirectUrl="/dashboard"
              allowedCountries={['IN']}
            />
          ) : (
            <SignUp 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent border-none shadow-none w-full p-4 md:p-8",
                  headerTitle: "text-white font-black uppercase tracking-widest text-base md:text-lg",
                  headerSubtitle: "text-zinc-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-4 md:mb-6",
                  socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all",
                  socialButtonsBlockButtonText: "text-white font-bold text-[10px] md:text-xs uppercase tracking-widest",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-[10px] md:text-xs font-bold uppercase tracking-widest py-3 md:py-4 rounded-xl md:rounded-2xl transition-all shadow-lg",
                  footerActionLink: "text-blue-400 hover:text-blue-300 font-bold",
                  formFieldLabel: "text-zinc-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2",
                  formFieldInput: "bg-white/5 border-white/10 text-white rounded-lg md:rounded-xl py-2 md:py-3 text-sm focus:border-blue-500/50 transition-all",
                  dividerText: "text-zinc-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest",
                  footer: "bg-transparent",
                  providerIcon: "brightness-150"
                }
              }}
              signInUrl="/auth?mode=signin"
              fallbackRedirectUrl="/dashboard"
              allowedCountries={['IN']}
            />
          )}
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all"
          >
            {isLogin ? "New user? Join now" : "Member? Sign In"}
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600"
      >
        <Shield className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" />
        <span className="opacity-60">Secure Encrypted Platform</span>
      </motion.div>
    </div>
  );
};

export default AuthPage;
