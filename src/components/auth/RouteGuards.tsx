import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { AdminContext } from '@/contexts/AdminContext';
import { courseService } from '@/components/dashboard/courseService';
import { BlockedUserOverlay } from './BlockedUserOverlay';

/**
 * Standard loading indicator for protected routes.
 */
export const PageLoader = () => (
  <div className="fixed top-4 right-4 z-[100]">
    <div className="w-6 h-6 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
  </div>
);

- /**
-  * Displayed when a user is blocked for security reasons.
-  */
- export const BlockedUserScreen = ({ reason }: { reason: string | null }) => (
-   <div className="fixed inset-0 z-[9999999] bg-black flex items-center justify-center p-6 text-center">
-     <div className="max-w-md w-full bg-zinc-900 border border-red-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
-       <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
-         <span className="text-4xl">🚫</span>
-       </div>
-       <h1 className="text-3xl font-bold text-white mb-4">Account Restricted</h1>
-       <p className="text-zinc-400 mb-6">
-         Your access to MARGDARSHAK has been restricted due to a security violation or administrative action.
-       </p>
-       {reason && (
-         <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6">
-           <p className="text-xs uppercase tracking-widest text-red-400 font-bold mb-1">Reason</p>
-           <p className="text-red-200 text-sm font-mono">{reason}</p>
-         </div>
-       )}
-       <p className="text-zinc-500 text-sm">
-         If you believe this is an error, please contact support@margdarshan.tech with your User ID.
-       </p>
-     </div>
-   </div>
- );

/**
 * Ensures user is authenticated before allowing access.
 */
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, isBlocked, blockedReason } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !session) navigate('/auth', { replace: true });
  }, [session, loading, navigate]);
  
  if (loading) return null;
  if (isBlocked) return <BlockedUserOverlay reason={blockedReason} />;
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
