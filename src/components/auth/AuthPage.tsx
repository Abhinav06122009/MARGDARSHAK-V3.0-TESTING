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
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setIsLogin(mode !== 'signup');
  }, [mode]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-y-auto overflow-x-hidden">
      {/* Premium Background Elements - Optimized for visibility */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`,
            backgroundSize: isMobile ? '40px 40px' : '50px 50px',
            maskImage: 'radial-gradient(ellipse at center, black, transparent 90%)'
          }}
        />
        
        {!isMobile && (
          <>
            <motion.div 
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]" 
            />
            <motion.div 
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" 
            />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/30 to-[#050505]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[480px] relative z-10 my-8"
      >
        <div className="text-center mb-8 md:mb-12">
          <Link to="/" className="inline-block mb-8 relative group">
            <div className="absolute -inset-6 bg-blue-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-full" />
            <div className="p-4 md:p-6 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 relative z-10 shadow-2xl group-hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] transition-all duration-500">
              <img src={logo} alt="Logo" className="w-20 h-20 md:w-24 md:h-24 object-contain brightness-125" />
            </div>
          </Link>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase italic mb-3 leading-none">
              <span className="text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">Margdarshak</span>
            </h1>
            <p className="text-zinc-300 text-[10px] md:text-sm font-bold uppercase tracking-[0.3em] opacity-90">
              {isLogin ? 'Access your academic command center' : 'Join the elite student ecosystem'}
            </p>
          </motion.div>
        </div>

        <div className="clerk-container rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/20 bg-white/[0.03] backdrop-blur-md shadow-[0_0_80px_rgba(0,0,0,0.5)] relative">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-blue-500/10 to-purple-500/10" />
          
          {isLogin ? (
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent border-none shadow-none w-full p-6 md:p-10",
                  headerTitle: "text-white font-black uppercase tracking-widest text-xl md:text-2xl",
                  headerSubtitle: "text-zinc-300 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8 opacity-80",
                  socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-blue-500 transition-all py-3 md:py-4",
                  socialButtonsBlockButtonText: "text-white font-black text-xs md:text-sm uppercase tracking-widest",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-xs md:text-sm font-black uppercase tracking-widest py-4 md:py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]",
                  footerActionLink: "text-blue-400 hover:text-blue-300 font-black",
                  formFieldLabel: "text-zinc-200 text-[10px] md:text-xs font-black uppercase tracking-widest mb-2 opacity-90",
                  formFieldInput: "bg-white/10 border-white/20 text-white rounded-xl md:rounded-2xl py-3 md:py-4 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                  dividerText: "text-zinc-400 text-[10px] md:text-xs font-black uppercase tracking-widest",
                  footer: "bg-transparent",
                  identityPreviewText: "text-white text-sm font-bold",
                  identityPreviewEditButton: "text-blue-400 font-black",
                  formFieldAction: "text-blue-400 hover:text-blue-300 font-black text-[10px] md:text-xs uppercase tracking-widest",
                  providerIcon: "brightness-200 scale-125"
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
                  card: "bg-transparent border-none shadow-none w-full p-6 md:p-10",
                  headerTitle: "text-white font-black uppercase tracking-widest text-xl md:text-2xl",
                  headerSubtitle: "text-zinc-300 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8 opacity-80",
                  socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-blue-500 transition-all py-3 md:py-4",
                  socialButtonsBlockButtonText: "text-white font-black text-xs md:text-sm uppercase tracking-widest",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-xs md:text-sm font-black uppercase tracking-widest py-4 md:py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]",
                  footerActionLink: "text-blue-400 hover:text-blue-300 font-black",
                  formFieldLabel: "text-zinc-200 text-[10px] md:text-xs font-black uppercase tracking-widest mb-2 opacity-90",
                  formFieldInput: "bg-white/10 border-white/20 text-white rounded-xl md:rounded-2xl py-3 md:py-4 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                  dividerText: "text-zinc-400 text-[10px] md:text-xs font-black uppercase tracking-widest",
                  footer: "bg-transparent",
                  providerIcon: "brightness-200 scale-125"
                }
              }}
              signInUrl="/auth?mode=signin"
              fallbackRedirectUrl="/dashboard"
              allowedCountries={['IN']}
            />
          )}
        </div>

        <div className="mt-10 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-white transition-all hover:tracking-[0.4em]"
          >
            {isLogin ? "Need an account? Join the elite" : "Already a member? Sign in here"}
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-zinc-500"
      >
        <Shield className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
        <span className="opacity-80">Security Protocol Alpha Active</span>
      </motion.div>
    </div>
  );
};

export default AuthPage;

