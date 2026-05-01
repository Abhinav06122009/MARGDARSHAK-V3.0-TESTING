import React, { useEffect } from 'react';
import { useSession, useUser, ClerkProvider } from '@clerk/react';
import { setClerkTokenProvider, setClerkUser } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');
}

export const ClerkSupabaseBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <ClerkSupabaseBridgeContent>{children}</ClerkSupabaseBridgeContent>
    </ClerkProvider>
  );
};

const ClerkSupabaseBridgeContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useSession();
  const { user } = useUser();

  useEffect(() => {
    if (session) {
      setClerkTokenProvider(async () => {
        try {
          // Try custom template first
          const token = await session.getToken({ template: 'supabase' });
          if (token) return token;
          
          // Fallback to default if template not found or returns null
          console.warn('⚠️ Clerk "supabase" template not found. Falling back to default token.');
          return await session.getToken();
        } catch (err) {
          console.error('❌ Clerk token retrieval failed:', err);
          return await session.getToken();
        }
      });
    } else {
      setClerkTokenProvider(async () => null);
    }
  }, [session]);

  useEffect(() => {
    setClerkUser(user);
  }, [user]);

  return <>{children}</>;
};
