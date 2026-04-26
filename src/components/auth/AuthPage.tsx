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
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
              <img src={logo} alt="Logo" className="w-16 h-16 relative z-10" />
            </div>
            <div className="space-y-2">
              <p className="text-white font-bold tracking-tight">Initializing Secure Session</p>
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <Cpu className="w-4 h-4 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Protection Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src={logo} alt="Logo" className="w-16 h-16 mx-auto hover:scale-110 transition-transform duration-500" />
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-2">
            Welcome to <span className="text-blue-500">Margdarshak</span>
          </h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
            {isLogin ? 'Access your academic command center' : 'Join the elite student ecosystem'}
          </p>
        </div>

        <div className="clerk-container rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
          {isLogin ? (
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-white/[0.03] backdrop-blur-3xl border-none shadow-none w-full p-8",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors",
                  socialButtonsBlockButtonText: "text-white font-bold text-xs uppercase tracking-widest",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-sm font-bold uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20",
                  footerActionLink: "text-blue-400 hover:text-blue-300 font-bold",
                  formFieldLabel: "text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2",
                  formFieldInput: "bg-white/5 border-white/10 text-white rounded-xl py-3 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all",
                  dividerText: "text-zinc-500 text-[10px] font-black uppercase tracking-widest",
                  footer: "bg-transparent",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-blue-400",
                  formFieldAction: "text-blue-400 hover:text-blue-300 font-bold text-[10px] uppercase tracking-widest"
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
                  card: "bg-white/[0.03] backdrop-blur-3xl border-none shadow-none w-full p-8",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors",
                  socialButtonsBlockButtonText: "text-white font-bold text-xs uppercase tracking-widest",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-sm font-bold uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20",
                  footerActionLink: "text-blue-400 hover:text-blue-300 font-bold",
                  formFieldLabel: "text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2",
                  formFieldInput: "bg-white/5 border-white/10 text-white rounded-xl py-3 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all",
                  dividerText: "text-zinc-500 text-[10px] font-black uppercase tracking-widest",
                  footer: "bg-transparent"
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
            className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>

      {/* Footer Security Note */}
      <div className="mt-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
        <Shield className="w-3 h-3 text-emerald-500" />
        <span>End-to-End Encrypted Authentication</span>
      </div>
    </div>
  );
};

export default AuthPage;
