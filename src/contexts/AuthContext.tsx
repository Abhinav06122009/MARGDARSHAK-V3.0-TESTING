import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, useUser } from '@clerk/react';
import { supabase, setClerkTokenProvider, setClerkUser } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextValue {
  session: any | null;
  loading: boolean;
  user: any | null;
}

export const AuthContext = createContext<AuthContextValue>({ session: null, loading: true, user: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { session: clerkSession, isLoaded: sessionLoaded } = useSession();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const [loading, setLoading] = useState(true);

  // Sync Clerk Session with Supabase Client
  useEffect(() => {
    if (sessionLoaded && clerkSession) {
      setClerkTokenProvider(() => clerkSession.getToken({ template: 'supabase' }));
    }
    if (userLoaded && clerkUser) {
      setClerkUser(clerkUser);
    }
  }, [clerkSession, sessionLoaded, clerkUser, userLoaded]);

  // Sync Profile with Supabase Database
  useEffect(() => {
    const syncProfile = async () => {
      if (sessionLoaded && userLoaded && clerkUser) {
        try {
          console.log('Supabase Sync: Syncing profile for', clerkUser.id);
          
          const metadata = clerkUser.publicMetadata || {};
          const subscription = metadata.subscription || {};

          const profileData: any = {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            full_name: clerkUser.fullName || clerkUser.username || 'Scholar',
            avatar_url: clerkUser.imageUrl,
            user_type: metadata.role || 'student',
            subscription_tier: subscription.tier || 'free',
            subscription_status: subscription.status || 'inactive',
            subscription_period_end: subscription.period_end ? new Date(subscription.period_end).toISOString() : null,
            updated_at: new Date().toISOString()
          };

          // Upsert profile in Supabase
          const { error } = await supabase.from('profiles').upsert(profileData);
          
          if (error) {
            console.error('Supabase Sync Error:', error.message);
            // We don't block the UI for sync errors, but we log them
          } else {
            console.log('Supabase Sync: Profile synced successfully');
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
