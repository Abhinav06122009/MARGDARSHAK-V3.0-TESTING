import React, { useState, useEffect } from 'react';
import { SignIn, SignUp, useUser } from '@clerk/react';
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
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsLogin(mode !== 'signup');
  }, [mode]);

  // BREAK RELOAD LOOP: Escape if authenticated
  useEffect(() => {
    if (userLoaded && isSignedIn && user && isMounted) {
      if (window.location.pathname.includes('/auth')) {
        console.log('🛡️ Identity confirmed. Escaping auth loop...');
        window.location.href = '/dashboard';
      }
    }
  }, [userLoaded, isSignedIn, user, isMounted]);

  if (!isMounted) return <div className="min-h-screen bg-[#050505]" />;

  const clerkAppearance = {
    elements: {
      rootBox: "w-full flex justify-center",
      card: "bg-transparent border-none shadow-none w-full p-0 flex flex-col items-center",
      header: "hidden",
      headerTitle: "hidden",
      headerSubtitle: "hidden",
      socialButtonsBlockButton: "bg-white/[0.03] border-white/10 hover:bg-white/10 text-white rounded-2xl h-14 w-full transition-all duration-500 border hover:border-blue-500/50 flex justify-center items-center mb-2",
      socialButtonsBlockButtonText: "text-white text-[10px] font-black uppercase tracking-[0.2em] w-full text-center",
      dividerRow: "my-10 w-full",
      dividerLine: "bg-white/5",
      dividerText: "text-zinc-700 text-[8px] font-black uppercase tracking-[0.5em]",
      formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-[10px] font-black uppercase tracking-[0.3em] h-14 w-full rounded-2xl transition-all active:scale-[0.98] shadow-2xl shadow-blue-500/20 mt-4",
      formFieldLabel: "text-zinc-500 text-[8px] font-black uppercase tracking-[0.3em] mb-3 ml-1",
      formFieldInput: "bg-white/[0.03] border-white/10 text-white rounded-2xl h-14 text-sm focus:border-blue-500/50 focus:bg-white/5 transition-all w-full px-5",
      footerActionText: "text-zinc-600 text-[9px] font-bold uppercase tracking-widest",
      footerActionLink: "text-blue-400 hover:text-blue-300 font-black uppercase tracking-widest transition-colors ml-2",
      identityPreviewText: "text-white font-medium",
      identityPreviewEditButtonIcon: "text-blue-400",
      formResendCodeLink: "text-blue-400 font-bold uppercase text-[10px]",
      otpCodeFieldInput: "bg-white/5 border-white/10 text-white rounded-2xl h-14 focus:border-blue-500/50",
      formFieldAction: "text-blue-400 hover:text-blue-300 text-[10px] font-bold uppercase tracking-tighter",
      internal: "hidden"
    },
    layout: {
      shorthand: true,
      socialButtonsPlacement: "bottom"
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] grid place-items-center p-6 relative overflow-hidden selection:bg-blue-500/30">
      {/* Precision Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Centered Identity Block */}
        <div className="flex flex-col items-center mb-10">
          <Link to="/" className="group relative mb-8">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full group-hover:bg-blue-500/40 transition-all duration-700 scale-110" />
            <div className="p-5 rounded-[2.8rem] bg-white border border-white/20 relative z-10 shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-all duration-700 group-hover:scale-105 group-hover:-translate-y-1">
              <img src={logo} alt="Margdarshak" className="w-16 h-16 object-contain" loading="eager" />
            </div>
          </Link>

          <div className="text-center space-y-4">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
                Margdarshak
              </span>
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-[1px] w-10 bg-gradient-to-r from-transparent via-zinc-800 to-zinc-800" />
              <span className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] whitespace-nowrap">
                {isLogin ? 'Establish Identity' : 'Initialize Protocol'}
              </span>
              <div className="h-[1px] w-10 bg-gradient-to-l from-transparent via-zinc-800 to-zinc-800" />
            </div>
          </div>
        </div>

        {/* Unified Card Architecture */}
        <div className="w-full bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] border border-white/5 p-10 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
          
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

        <GlobalFooter />
      </motion.div>
    </div>
  );
};

import GlobalFooter from '@/components/layout/GlobalFooter';

export default AuthPage;

