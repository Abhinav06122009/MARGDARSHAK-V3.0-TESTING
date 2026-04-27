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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsLogin(mode !== 'signup');
  }, [mode]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-12 border border-white/10 text-center">
          <div className="flex flex-col items-center gap-8">
            <div className="relative group">
              {/* Spinning outer ring */}
              <div className="absolute -inset-4 border-t-2 border-b-2 border-blue-500/30 rounded-full animate-spin duration-[3000ms]" />
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
              
              {/* Glass Logo Container */}
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 relative z-10 shadow-2xl">
                <img src={logo} alt="Logo" className="w-16 h-16 object-contain brightness-125" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-white text-lg font-black tracking-tighter uppercase italic">Initializing Secure Session</p>
              <div className="flex items-center justify-center gap-3 text-blue-400">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.1s]" />
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.2s]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Protection Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Animated Grid */}
        <div 
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
          }}
        />
        
        {/* Floating Orbs */}
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[15%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-8 relative group">
            <div className="absolute -inset-6 bg-blue-600/30 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-full scale-75 group-hover:scale-100" />
            <div className="p-4 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 relative z-10 shadow-[0_0_50px_rgba(59,130,246,0.15)] group-hover:shadow-[0_0_60px_rgba(59,130,246,0.3)] transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-1">
              <img src={logo} alt="Logo" className="w-20 h-20 object-contain brightness-125" />
            </div>
          </Link>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic mb-3">
              Welcome to <span className="text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]">Margdarshak</span>
            </h1>
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-[0.3em] opacity-80">
              {isLogin ? 'Access your academic command center' : 'Join the elite student ecosystem'}
            </p>
          </motion.div>
        </div>

        <div className="clerk-container rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-2xl shadow-2xl relative">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-blue-500/5 to-purple-500/5" />
          
          {isLogin ? (
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent border-none shadow-none w-full p-8",
                  headerTitle: "text-white font-black uppercase tracking-widest text-lg",
                  headerSubtitle: "text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-6",
                  socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-blue-500/50 transition-all shadow-lg",
                  socialButtonsBlockButtonText: "text-white font-bold text-xs uppercase tracking-widest",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-sm font-bold uppercase tracking-widest py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]",
                  footerActionLink: "text-blue-400 hover:text-blue-300 font-bold",
                  formFieldLabel: "text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2",
                  formFieldInput: "bg-white/5 border-white/10 text-white rounded-xl py-3 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all",
                  dividerText: "text-zinc-500 text-[10px] font-black uppercase tracking-widest",
                  footer: "bg-transparent",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-blue-400",
                  formFieldAction: "text-blue-400 hover:text-blue-300 font-bold text-[10px] uppercase tracking-widest",
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
                  card: "bg-transparent border-none shadow-none w-full p-8",
                  headerTitle: "text-white font-black uppercase tracking-widest text-lg",
                  headerSubtitle: "text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-6",
                  socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-blue-500/50 transition-all shadow-lg",
                  socialButtonsBlockButtonText: "text-white font-bold text-xs uppercase tracking-widest",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-sm font-bold uppercase tracking-widest py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]",
                  footerActionLink: "text-blue-400 hover:text-blue-300 font-bold",
                  formFieldLabel: "text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2",
                  formFieldInput: "bg-white/5 border-white/10 text-white rounded-xl py-3 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all",
                  dividerText: "text-zinc-500 text-[10px] font-black uppercase tracking-widest",
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

        <div className="mt-10 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all hover:tracking-[0.4em]"
          >
            {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>

      {/* Footer Security Note */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600"
      >
        <Shield className="w-4 h-4 text-emerald-500 animate-pulse" />
        <span className="opacity-60">End-to-End Encrypted Authentication Platform</span>
      </motion.div>
    </div>
  );
};

export default AuthPage;
