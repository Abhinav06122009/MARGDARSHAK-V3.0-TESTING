import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSignIn } from '@clerk/react';
import { AdminContext } from '@/contexts/AdminContext';
import { toast } from 'sonner';
import { ShieldAlert, Terminal, ArrowRight, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminAuthPage = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useContext(AdminContext);
  const { isLoaded, signIn, setActive } = useSignIn();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, adminLoading, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoaded) return;

    setSubmitting(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        toast.success('Access Granted. Initializing Admin Session...');
      } else {
        console.log(result);
        toast.error('Admin authentication requires additional steps.');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      toast.error(err.errors?.[0]?.message || 'Authorization Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-red-500/30 text-white">
      {/* Background Aesthetics */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,5,5,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[100px]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-black/40 backdrop-blur-3xl border border-red-500/20 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(239,68,68,0.05)]">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 relative overflow-hidden group">
              <motion.div animate={{ y: [0, 64, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute top-0 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_10px_rgba(239,68,68,1)]" />
              <Fingerprint className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-white">ADMIN ACCESS</h1>
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              <ShieldAlert className="w-3 h-3" /> ADMINS ONLY
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Terminal className="w-3 h-3" /> Operator ID
              </label>
              <Input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                className="bg-black/50 border-white/10 text-white placeholder:text-zinc-700 h-12 rounded-xl focus-visible:ring-red-500/50 font-mono text-sm"
                placeholder="admin@system.local"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Terminal className="w-3 h-3" /> Authorization Key
              </label>
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                className="bg-black/50 border-white/10 text-white placeholder:text-zinc-700 h-12 rounded-xl focus-visible:ring-red-500/50 font-mono text-sm"
                placeholder="••••••••••••"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={submitting || !isLoaded}
                className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all group"
              >
                {submitting ? 'Verifying Credentials...' : 'Initialize Access'}
                {!submitting && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
              Unauthorized access is strictly prohibited and will be logged.<br />
              IP address and biometric telemetry are currently being monitored.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAuthPage;
