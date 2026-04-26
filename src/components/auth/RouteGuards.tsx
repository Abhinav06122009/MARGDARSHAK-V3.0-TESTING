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
  const { session, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isElite, setIsElite] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      navigate('/auth', { replace: true });
      return;
    }

    const checkElite = async () => {
      try {
        const user = await courseService.getCurrentUser();
        if (user?.profile?.subscription_tier === 'premium_elite') {
          setIsElite(true);
        } else {
          navigate('/upgrade', { replace: true });
        }
      } catch (err) {
        navigate('/upgrade', { replace: true });
      }
    };
    checkElite();
  }, [session, authLoading, navigate]);

  if (authLoading || isElite === null) return <PageLoader />;
  return isElite ? <>{children}</> : null;
};

/**
 * Ensures user has at least a Premium subscription.
 */
export const PremiumRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      navigate('/auth', { replace: true });
      return;
    }

    const checkPremium = async () => {
      try {
        const user = await courseService.getCurrentUser();
        const tier = user?.profile?.subscription_tier;
        if (tier === 'premium' || tier === 'premium_elite') {
          setIsPremium(true);
        } else {
          navigate('/upgrade', { replace: true });
        }
      } catch (err) {
        navigate('/upgrade', { replace: true });
      }
    };
    checkPremium();
  }, [session, authLoading, navigate]);

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
