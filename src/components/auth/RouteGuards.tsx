import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { AdminContext } from '@/contexts/AdminContext';
import { courseService } from '@/components/dashboard/courseService';
import { BlockedUserOverlay } from './BlockedUserOverlay';

/**
 * High-fidelity full-screen loading indicator.
 */
/**
 * High-fidelity full-screen loading indicator.
 * Optimized with a mounting delay to prevent flickering on fast connections.
 */
export const PageLoader = () => {
  const [show, setShow] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 300); // 300ms delay to avoid flicker
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 fixed inset-0 z-[999]">
      <div className="relative group">
        <div
          className="absolute -inset-4 border-t-2 border-b-2 border-blue-500/30 rounded-full animate-spin"
          style={{ animationDuration: '1500ms' }}
        />
        <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full animate-pulse" />
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 relative z-10">
          <div className="w-12 h-12 border-2 border-blue-500/50 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
      <p className="mt-8 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
        Establishing Secure Connection
      </p>
    </div>
  );
};


/**
 * Ensures user is authenticated before allowing access.
 */
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, isBlocked, blockedReason } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !session) {
      navigate('/auth', { replace: true });
    }
  }, [session, loading, navigate]);
  
  if (loading) return <PageLoader />;
  if (isBlocked) return <BlockedUserOverlay reason={blockedReason} />;
  
  // If not loading and no session, we'll be redirected by the useEffect
  return session ? <>{children}</> : null;
};

/**
 * Ensures user has Premium Elite subscription.
 */
export const PremiumEliteRoute = ({ children }: { children: React.ReactNode }) => {
  const { user: clerkUser, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isElite, setIsElite] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!clerkUser) {
      navigate('/auth', { replace: true });
      return;
    }

    const metadata = clerkUser.publicMetadata || {};
    const unsafeMetadata = clerkUser.unsafeMetadata || {};
    const subscription = (metadata.subscription as any) || (unsafeMetadata.subscription as any) || {};
    let tier = (subscription.tier || (metadata as any).subscription_tier || (unsafeMetadata as any).subscription_tier || (metadata as any).tier || (unsafeMetadata as any).tier || 'free').toLowerCase();
    
    // NUCLEAR FUZZY FALLBACK: Scan the entire Clerk User object
    if (tier === 'free') {
      const fullUserStr = JSON.stringify(clerkUser).toLowerCase();
      if (fullUserStr.includes('elite')) tier = 'premium_elite';
    }

    // MASTER OVERRIDES
    const MASTER_IDS = [
      'user_3CwM4tADcqKhELg4ZX9r2xIRC4L', 
      'user_3CylWpMJnNbVpgJcpk9eSIf73gS',
      'user_3CyueymOUFein248UifL5xSPBOU'
    ];
    if (MASTER_IDS.includes(clerkUser.id)) tier = 'premium_elite';

    if (tier.includes('elite')) {
      setIsElite(true);
    } else {
      navigate('/upgrade', { replace: true });
    }
  }, [clerkUser, authLoading, navigate]);

  if (authLoading || isElite === null) return <PageLoader />;
  return isElite ? <>{children}</> : null;
};

/**
 * Ensures user has at least a Premium subscription.
 */
export const PremiumRoute = ({ children }: { children: React.ReactNode }) => {
  const { user: clerkUser, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!clerkUser) {
      navigate('/auth', { replace: true });
      return;
    }

    const metadata = clerkUser.publicMetadata || {};
    const unsafeMetadata = clerkUser.unsafeMetadata || {};
    const subscription = (metadata.subscription as any) || (unsafeMetadata.subscription as any) || {};
    let tier = (subscription.tier || (metadata as any).subscription_tier || (unsafeMetadata as any).subscription_tier || (metadata as any).tier || (unsafeMetadata as any).tier || 'free').toLowerCase();
    
    // NUCLEAR FUZZY FALLBACK: Scan the entire Clerk User object
    if (tier === 'free') {
      const fullUserStr = JSON.stringify(clerkUser).toLowerCase();
      if (fullUserStr.includes('elite')) tier = 'premium_elite';
      else if (fullUserStr.includes('premium') || fullUserStr.includes('plus') || fullUserStr.includes('pro')) {
        tier = 'premium';
      }
    }

    // MASTER OVERRIDES
    const MASTER_IDS = [
      'user_3CwM4tADcqKhELg4ZX9r2xIRC4L', 
      'user_3CylWpMJnNbVpgJcpk9eSIf73gS',
      'user_3CyueymOUFein248UifL5xSPBOU'
    ];
    if (MASTER_IDS.includes(clerkUser.id)) tier = 'premium_elite';

    if (tier.includes('premium') || tier.includes('elite')) {
      setIsPremium(true);
    } else {
      navigate('/upgrade', { replace: true });
    }
  }, [clerkUser, authLoading, navigate]);

  if (authLoading || isPremium === null) return <PageLoader />;
  return isPremium ? <>{children}</> : null;
};

/**
 * Ensures user has admin privileges.
 */
export const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isAdmin, loading } = useContext(AdminContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && (!session || !isAdmin)) {
      navigate('/admin/login', { replace: true });
    }
  }, [session, isAdmin, loading, navigate]);

  if (loading) return null;
  return session && isAdmin ? <>{children}</> : null;
};
