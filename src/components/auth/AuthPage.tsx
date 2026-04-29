import React, { useState, useEffect } from 'react';
import { SignIn, SignUp } from '@clerk/react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import logo from "@/components/logo/logo.png";

interface AuthPageProps {
  onLogin?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsLogin(mode !== 'signup');
  }, [mode]);

  if (!isMounted) return <div className="min-h-screen bg-[#050505]" />;

  const clerkAppearance = {
    elements: {
      rootBox: "w-full",
      card: "bg-transparent border-none shadow-none w-full p-0",
      headerTitle: "hidden",
      headerSubtitle: "hidden",
      socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl h-14 transition-all duration-300 border hover:border-blue-500/50",
      socialButtonsBlockButtonText: "text-white text-[10px] font-black uppercase tracking-[0.2em]",
      dividerRow: "my-8",
      dividerLine: "bg-white/5",
      dividerText: "text-zinc-600 text-[8px] font-black uppercase tracking-[0.4em]",
      formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-[10px] font-black uppercase tracking-[0.2em] h-14 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20",
      formFieldLabel: "text-zinc-500 text-[8px] font-bold uppercase tracking-widest mb-3",
      formFieldInput: "bg-white/5 border-white/10 text-white rounded-2xl h-12 text-sm focus:border-blue-500/50 transition-all",
      footerActionText: "text-zinc-500 text-[10px] font-bold uppercase tracking-wider",
      footerActionLink: "text-blue-400 hover:text-blue-300 font-black uppercase tracking-wider transition-colors ml-1",
      identityPreviewText: "text-white",
      identityPreviewEditButtonIcon: "text-blue-400",
      formResendCodeLink: "text-blue-400",
      otpCodeFieldInput: "bg-white/5 border-white/10 text-white rounded-xl focus:border-blue-500/50",
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background - Ultra Lightweight */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Identity Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6 group">
            <div className="p-4 rounded-[2rem] bg-white/5 backdrop-blur-3xl border border-white/10 relative z-10 shadow-2xl transition-transform duration-500 group-hover:scale-110">
              <img src={logo} alt="Logo" className="w-14 h-14 object-contain" loading="eager" />
            </div>
          </Link>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                Margdarshak
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.5em]">
                {isLogin ? 'Establish Identity' : 'Initialize Protocol'}
              </p>
            </div>
          </div>
        </div>

        {/* Unified Clerk Interface */}
        <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] border border-white/10 p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          {/* Subtle Glow Effect */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/15 transition-colors duration-700" />
          
          <div className="relative z-10">
            {isLogin ? (
              <SignIn 
                appearance={clerkAppearance}
                signUpUrl="/auth?mode=signup"
                fallbackRedirectUrl="/dashboard"
              />
            ) : (
              <SignUp 
                appearance={clerkAppearance}
                signInUrl="/auth?mode=signin"
                fallbackRedirectUrl="/dashboard"
              />
            )}
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-500">End-to-End Encrypted Tunnel</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


export default AuthPage;

