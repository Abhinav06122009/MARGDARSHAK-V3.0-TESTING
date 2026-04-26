import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, useUser } from '@clerk/react';
import { supabase, setClerkTokenProvider, setClerkUser } from '@/integrations/supabase/client';

interface AuthContextValue {
  session: any | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({ session: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { session: clerkSession, isLoaded: sessionLoaded } = useSession();
  const { user, isLoaded: userLoaded } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoaded && clerkSession) {
      setClerkTokenProvider(() => clerkSession.getToken({ template: 'supabase' }));
    }
    if (userLoaded && user) {
      setClerkUser(user);
    }
  }, [clerkSession, sessionLoaded, user, userLoaded]);

  useEffect(() => {
    const syncProfile = async () => {
      if (sessionLoaded && userLoaded && user) {
        try {
          // 1. Check if profile exists
          const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          // 2. If it doesn't exist (PGRST116), or if there was an error, try to create/sync it
          if (fetchError && fetchError.code === 'PGRST116') {
            console.log('Lazy Sync: Creating profile for user:', user.id);
            await supabase.from('profiles').upsert({
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress || '',
              full_name: user.fullName || '',
              user_type: 'student',
              subscription_tier: 'free',
              updated_at: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('Lazy Sync Error:', err);
        } finally {
          setLoading(false);
        }
      } else if (sessionLoaded && userLoaded && !user) {
        setLoading(false);
      }
    };

    syncProfile();
  }, [sessionLoaded, userLoaded, user]);

  // Mock a Supabase-like session object for backward compatibility if needed,
  // or just pass the Clerk session.
  const session = clerkSession ? (clerkSession as any) : null;

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
