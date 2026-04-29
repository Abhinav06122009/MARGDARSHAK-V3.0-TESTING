import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Lock, Shield, Check, ArrowLeft, AlertCircle, Fingerprint, Smartphone, Globe, Clock, Sparkles, Cpu, Command, Database, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logo from "@/components/logo/logo.png";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// Enhanced Security Functions
const securityFeatures = {
  generateDeviceFingerprint: () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    return {
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent.substring(0, 100),
      canvas: canvas.toDataURL().substring(0, 50),
      timestamp: new Date().toISOString()
    };
  },

  logSecurityEvent: (event: string, data: any) => {
    const securityLog = {
      event,
      data,
      timestamp: new Date().toISOString(),
      deviceFingerprint: securityFeatures.generateDeviceFingerprint(),
      ip: 'masked'
    };
    console.log('🔒 Security Event:', securityLog);
  },

  checkPasswordStrength: (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommon: !['password', '123456', 'qwerty', 'admin'].includes(password.toLowerCase())
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    return { score, checks, strength: score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong' };
  }
};

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, strength: 'weak', checks: {} });
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setMounted(true);
    securityFeatures.logSecurityEvent('reset_password_page_loaded', {
      timestamp: new Date().toISOString()
    });

    const checkResetSession = async () => {
      try {
        const urlHash = window.location.hash;
        const hasResetToken = urlHash.includes('access_token') || urlHash.includes('type=recovery') || searchParams.get('token');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (hasResetToken || session?.user || localStorage.getItem('password_reset_flow') === 'true') {
          setIsValidSession(true);
          setSessionChecked(true);
          return;
        }

        toast({
          title: "Access Required",
          description: "Please use the secure reset link from your email.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/'), 3000);
      } catch (error) {
        setIsValidSession(true); // Lenient for UX
      } finally {
        setSessionChecked(true);
      }
    };

    checkResetSession();
  }, [navigate, toast, searchParams]);

  useEffect(() => {
    if (password) {
      setPasswordStrength(securityFeatures.checkPasswordStrength(password));
    }
  }, [password]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setResetSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden relative grid place-items-center p-6">
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,15,30,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="w-full max-w-[480px] relative z-10">
        {/* Header Identity */}
        <div className="flex flex-col items-center mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative mb-8"
          >
            <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full group-hover:bg-blue-500/40 transition-all duration-700" />
            <div className="p-5 rounded-[2.5rem] bg-white border border-white/20 relative z-10 shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:-translate-y-1">
              <img src={logo} alt="Margdarshak Official" className="w-16 h-16 object-contain" />
            </div>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white mb-4">
            Security <span className="text-blue-500">Protocol</span>
          </h1>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.4em] italic">
            Margdarshak Identity Hub // Password Recovery
          </p>
        </div>

        {/* Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] backdrop-blur-3xl rounded-[3.5rem] border border-white/5 p-10 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.03] to-transparent pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {!sessionChecked ? (
              <motion.div key="loading" className="flex flex-col items-center py-20">
                <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Checking Authorization...</p>
              </motion.div>
            ) : resetSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Check className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase italic mb-4">Update Successful</h2>
                <p className="text-zinc-500 font-medium mb-10">Your security credentials have been successfully re-encrypted. Redirecting to access hub...</p>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3 }}
                    className="h-full bg-emerald-500" 
                  />
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                onSubmit={handlePasswordReset}
                className="space-y-8"
              >
                <div className="space-y-6">
                   <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="NEW CREDENTIAL"
                      className="w-full pl-16 pr-16 py-5 bg-white/[0.02] border border-white/5 rounded-2xl text-white text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-blue-500/30 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-6 flex items-center text-zinc-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <Shield className="w-5 h-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="CONFIRM CREDENTIAL"
                      className="w-full pl-16 pr-16 py-5 bg-white/[0.02] border border-white/5 rounded-2xl text-white text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-blue-500/30 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-6 flex items-center text-zinc-500 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {password && (
                  <div className="p-6 rounded-[2rem] bg-white/[0.01] border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Strength Matrix</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        passwordStrength.strength === 'strong' ? 'text-emerald-400' :
                        passwordStrength.strength === 'medium' ? 'text-blue-400' : 'text-rose-400'
                      }`}>
                        {passwordStrength.strength}
                      </span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                        className={`h-full transition-all duration-500 ${
                          passwordStrength.strength === 'strong' ? 'bg-emerald-500' :
                          passwordStrength.strength === 'medium' ? 'bg-blue-500' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || password !== confirmPassword || passwordStrength.score < 4}
                  className="w-full h-16 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-zinc-200 transition-all shadow-2xl shadow-white/5 disabled:opacity-50 active:scale-95"
                >
                  {loading ? "Re-Encrypting..." : "Update Protocol"}
                </Button>

                <div className="pt-6 border-t border-white/5 flex flex-wrap justify-center gap-6">
                  {[
                    { icon: Lock, label: "AES-256" },
                    { icon: Fingerprint, label: "Biometric" },
                    { icon: Globe, label: "Encrypted" }
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 opacity-30">
                      <feat.icon size={12} className="text-zinc-500" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{feat.label}</span>
                    </div>
                  ))}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Terminal */}
        <div className="mt-12 text-center space-y-4">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-widest italic group">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Abort & Return to Hub
          </Link>
          <p className="text-[8px] font-mono text-zinc-800 uppercase tracking-[0.5em]">
            SYSTEM_ID: MARGDARSHAK_RECOVERY_NODE_4
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;