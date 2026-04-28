import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { AdminContext } from '@/contexts/AdminContext';
import { courseService } from '@/components/dashboard/courseService';

/**
 * Standard loading indicator for protected routes.
 */
export const PageLoader = () => (
  <div className="fixed top-4 right-4 z-[100]">
    <div className="w-6 h-6 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
  </div>
);

/**
 * Ensures user is authenticated before allowing access.
 */
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !session) navigate('/auth', { replace: true });
  }, [session, loading, navigate]);
  
  if (loading) return null;
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
