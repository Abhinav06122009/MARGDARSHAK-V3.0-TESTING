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
        // ROBUST CLERK EXTRACTION
        const metadata = clerkUser.publicMetadata || {};
        const unsafeMetadata = clerkUser.unsafeMetadata || {};
        const subscription = (metadata.subscription as any) || (unsafeMetadata.subscription as any) || {};
        
        let tier = (
          subscription.tier || 
          (metadata as any).subscription_tier || 
          (unsafeMetadata as any).subscription_tier || 
          (metadata as any).tier || 
          (unsafeMetadata as any).tier || 
          'free'
        ).toLowerCase();

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
          'user_3CylWpMJnNbVpgJcpk9eSIf73gS'
        ];
        if (MASTER_IDS.includes(clerkUser.id)) {
          tier = 'premium_elite';
        }

        if (tier !== 'free') {
          console.log('[AI Context] Live Clerk Subscription:', tier);
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
