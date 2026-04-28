import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CreditCard, Cpu, QrCode, Sparkles } from 'lucide-react';
import { SecureUser } from '@/hooks/useSettings';

interface PremiumIDCardProps {
  user: SecureUser;
}

const PremiumIDCard: React.FC<PremiumIDCardProps> = ({ user }) => {
  const joinDate = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'APR 2024';
  const tier = user.profile?.user_type === 'admin' ? 'SYSTEM ADMIN' : (user.profile?.subscription_tier?.toUpperCase() || 'STANDARD SCHOLAR');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-2xl mx-auto aspect-[1.6/1] rounded-[2rem] overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      {/* Holographic Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-purple-500/10" />
      <motion.div 
        animate={{ 
          x: [0, 100, 0],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
      />

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 p-8">
        <Sparkles className="text-emerald-500/40 w-12 h-12" />
      </div>

      <div className="relative h-full p-8 flex flex-col justify-between">
        {/* Top Section */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter italic uppercase">MARGDARSHAK</h2>
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black tracking-[0.3em] text-emerald-500/60 uppercase">Identity Verified</span>
              </div>
            </div>
          </div>
          <div className="text-right">
             <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Authorization Tier</div>
             <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-black text-white tracking-widest italic">
                {tier}
             </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex items-center gap-8">
          <div className="relative group/avatar">
            <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-2xl opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
            <div className="w-32 h-32 rounded-3xl border-2 border-white/10 overflow-hidden relative z-10 bg-black/40 backdrop-blur-md">
              <img 
                src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                alt="Profile" 
                className="w-full h-full object-cover grayscale group-hover/avatar:grayscale-0 transition-all duration-500"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-xl shadow-lg border-4 border-[#0a0a0a] z-20">
               <Cpu className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Scholar Identity</div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none uppercase">
                {user.profile?.full_name || 'System User'}
              </h1>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Issue ID</div>
                <div className="font-mono text-sm text-white/80 tracking-wider">
                  #{user.id.substring(0, 12).toUpperCase()}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Since</div>
                <div className="font-mono text-sm text-white/80 tracking-wider uppercase">
                  {joinDate}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex items-end justify-between">
           <div className="space-y-1">
             <div className="flex items-center gap-3">
                <QrCode className="w-10 h-10 text-white/20" />
                <div className="h-8 w-[200px] bg-[url('https://www.transparenttextures.com/patterns/barcode-1.png')] opacity-20" />
             </div>
             <p className="text-[8px] font-mono text-white/20 tracking-[0.5em] uppercase">Security Clearance Level Alpha-01</p>
           </div>
           <CreditCard className="w-8 h-8 text-white/10" />
        </div>
      </div>
      
      {/* Edge Shine */}
      <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-[2rem] shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]" />
    </motion.div>
  );
};

export default PremiumIDCard;
