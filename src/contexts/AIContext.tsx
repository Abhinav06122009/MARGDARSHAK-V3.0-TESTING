import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/react';
import { supabase } from '@/integrations/supabase/client';
import { isEliteTier, isPremiumTier } from '@/lib/ai/modelConfig';

interface AIContextValue {
  subscriptionTier: string;
  isElite: boolean;
  isPremium: boolean;
  userApiKey: string;
  setUserApiKey: (key: string) => void;
  isAIReady: boolean;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const AIContext = createContext<AIContextValue>({
  subscriptionTier: 'free',
  isElite: false,
  isPremium: false,
  userApiKey: '',
  setUserApiKey: () => {},
  isAIReady: false,
  currentPage: '',
  setCurrentPage: () => {},
});

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [userApiKey, setUserApiKeyState] = useState('');
  const [isAIReady, setIsAIReady] = useState(false);
  const [currentPage, setCurrentPage] = useState('');

  const { user: clerkUser, isLoaded } = useUser();

  useEffect(() => {
    const storedKey = localStorage.getItem('margdarshak_user_key') || '';
    setUserApiKeyState(storedKey);
    setIsAIReady(true);

    const fetchTier = async () => {
      if (clerkUser) {
        // PRIORITY 1: Check Clerk Public Metadata directly (Instant)
        const metadata = clerkUser.publicMetadata || {};
        const subscription = (metadata.subscription as any) || {};
        const tier = subscription.tier || (metadata as any).subscription_tier;

        if (tier) {
          console.log('[AI Context] Tier from Clerk:', tier);
          setSubscriptionTier(tier);
          return;
        }

        // PRIORITY 2: Check Supabase Profile (Fallback)
        const { data } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', clerkUser.id)
          .single();
        if (data?.subscription_tier) {
          setSubscriptionTier(data.subscription_tier);
        }
      }
    };
    if (isLoaded) {
      fetchTier();
    }
  }, [clerkUser, isLoaded]);

  const setUserApiKey = useCallback((key: string) => {
    setUserApiKeyState(key);
    localStorage.setItem('margdarshak_user_key', key);
  }, []);

  return (
    <AIContext.Provider
      value={{
        subscriptionTier,
        isElite: isEliteTier(subscriptionTier),
        isPremium: isPremiumTier(subscriptionTier),
        userApiKey,
        setUserApiKey,
        isAIReady,
        currentPage,
        setCurrentPage,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => useContext(AIContext);

export default AIContext;
