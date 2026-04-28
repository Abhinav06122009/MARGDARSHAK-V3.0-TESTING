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

  // Sync Profile with Supabase Database through a server-side function.
  useEffect(() => {
    const syncProfile = async () => {
      if (sessionLoaded && userLoaded && clerkUser) {
        try {
          console.log('Supabase Sync: Syncing profile for', clerkUser.id);
          
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
          const syncResponse = await fetch('/.netlify/functions/profile-sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(profileData),
          });

          if (!syncResponse.ok) {
            const payload = await syncResponse.json().catch(() => ({}));
            console.error('Supabase Sync Error:', payload?.error || syncResponse.statusText);
          } else {
            console.log('Supabase Sync: Profile synced successfully');
          }

          // Check if blocked in Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_blocked, blocked_reason')
            .eq('id', clerkUser.id)
            .maybeSingle();

          if (profile?.is_blocked) {
            setIsBlocked(true);
            setBlockedReason(profile.blocked_reason || 'Access restricted for security reasons.');
          }
          
        } catch (err) {
          console.error('Unexpected sync error:', err);
        } finally {
          setLoading(false);
        }
      } else if (sessionLoaded && userLoaded && !clerkUser) {
        setLoading(false);
      }
    };

    if (sessionLoaded && userLoaded) {
      syncProfile();
    }
  }, [sessionLoaded, userLoaded, clerkUser]);

  // Provide the session and user globally
  const value = {
    session: clerkSession || null,
    user: clerkUser || null,
    loading: !sessionLoaded || !userLoaded || loading,
    isBlocked,
    blockedReason
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
