import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, useUser } from '@clerk/react';
import { supabase, setClerkTokenProvider, setClerkUser } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextValue {
  session: any | null;
  loading: boolean;
  user: any | null;
  isBlocked: boolean;
  blockedReason: string | null;
}

export const AuthContext = createContext<AuthContextValue>({ session: null, loading: true, user: null, isBlocked: false, blockedReason: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { session: clerkSession, isLoaded: sessionLoaded } = useSession();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  // Sync Clerk Session with Supabase Client
  useEffect(() => {
    if (sessionLoaded && clerkSession) {
      setClerkTokenProvider(() => clerkSession.getToken({ template: 'supabase' }));
    }
    if (userLoaded && clerkUser) {
      setClerkUser(clerkUser);
    }
  }, [clerkSession, sessionLoaded, clerkUser, userLoaded]);

  // Initial loading state resolution - FAST BOOT
  useEffect(() => {
    if (sessionLoaded && userLoaded) {
      // If no user, we are definitely not loading anymore
      if (!clerkUser) {
        setLoading(false);
      } else {
        // If we have a user, check cache for block status to show immediately
        const cachedBlock = localStorage.getItem(`blocked_${clerkUser.id}`);
        if (cachedBlock) {
          const { blocked, reason } = JSON.parse(cachedBlock);
          setIsBlocked(blocked);
          setBlockedReason(reason);
        }
        // Set loading to false early - we use Clerk data while Supabase syncs in background
        setLoading(false);
      }
    }
  }, [sessionLoaded, userLoaded, clerkUser]);

  // Background Sync Profile
  useEffect(() => {
    const syncProfile = async () => {
      if (sessionLoaded && userLoaded && clerkUser) {
        try {
          console.log('⚡ Background Sync: Syncing profile for', clerkUser.id);
          
          const metadata = clerkUser.publicMetadata || {};
          const subscription = (metadata.subscription as any) || {};

          const profileData: any = {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            full_name: clerkUser.fullName || clerkUser.username || 'Scholar',
            avatar_url: clerkUser.imageUrl,
            user_type: metadata.role || (metadata as any).user_type || 'student',
            subscription_tier: subscription.tier || (metadata as any).subscription_tier || 'free',
            subscription: {
              tier: subscription.tier || (metadata as any).subscription_tier || 'free',
              status: subscription.status || (metadata as any).subscription_status || 'inactive',
              period_end: subscription.period_end || (metadata as any).subscription_period_end || null,
            },
            updated_at: new Date().toISOString()
          };

          const token = clerkSession ? await clerkSession.getToken({ template: 'supabase' }) : null;
          
          // Fire and forget sync (mostly)
          fetch('/.netlify/functions/profile-sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(profileData),
          }).catch(err => console.error('Sync Fetch Error:', err));

          // Check if blocked in Supabase - Keep this fast
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_blocked, blocked_reason')
            .eq('id', clerkUser.id)
            .maybeSingle();

          if (profile?.is_blocked) {
            setIsBlocked(true);
            const reason = profile.blocked_reason || 'Access restricted for security reasons.';
            setBlockedReason(reason);
            localStorage.setItem(`blocked_${clerkUser.id}`, JSON.stringify({ blocked: true, reason }));
          } else if (clerkUser) {
            setIsBlocked(false);
            localStorage.removeItem(`blocked_${clerkUser.id}`);
          }
          
        } catch (err) {
          console.error('Unexpected sync error:', err);
        }
      }
    };

    if (sessionLoaded && userLoaded && clerkUser) {
      syncProfile();
    }
  }, [sessionLoaded, userLoaded, clerkUser, clerkSession]);

  const value = useMemo(() => ({
    session: clerkSession || null,
    user: clerkUser || null,
    loading,
    isBlocked,
    blockedReason
  }), [clerkSession, clerkUser, loading, isBlocked, blockedReason]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
