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
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden selection:bg-blue-500/30">
      {/* Dynamic Background - Premium Cosmic Aesthetic */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(99,102,241,0.05),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {/* Animated Orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[420px] relative z-10 flex flex-col items-center"
      >
        {/* Identity Header - Centered & Premium */}
        <div className="text-center mb-8 flex flex-col items-center w-full">
          <Link to="/" className="inline-block mb-6 group relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/40 transition-colors duration-500" />
            <div className="p-4 rounded-[2.5rem] bg-black/40 backdrop-blur-3xl border border-white/10 relative z-10 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-1">
              <img src={logo} alt="Logo" className="w-14 h-14 object-contain" loading="eager" />
            </div>
          </Link>

          <div className="space-y-3">
            <h1 className="text-4xl font-black text-white tracking-tight uppercase italic flex items-center justify-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                Margdarshak
              </span>
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-zinc-800" />
              <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em] whitespace-nowrap">
                {isLogin ? 'Establish Identity' : 'Initialize Protocol'}
              </p>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-zinc-800" />
            </div>
          </div>
        </div>

        {/* Unified Clerk Interface Card */}
        <div className="w-full bg-white/[0.01] backdrop-blur-3xl rounded-[3.5rem] border border-white/5 p-8 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

          <div className="relative z-10 w-full flex flex-col items-center">
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400">End-to-End Encrypted Tunnel</span>
          </div>

          <p className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest text-center max-w-[280px] leading-relaxed">
            By proceeding, you authorize a secure handshake with the Margdarshak Neural Core.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};


export default AuthPage;

