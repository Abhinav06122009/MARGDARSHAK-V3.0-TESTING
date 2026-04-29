import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { securityFeatures, advancedSecurity } from '@/components/auth/AuthSecurity';
import { useToast } from '@/hooks/use-toast';
import { useSignIn, useSignUp as useClerkSignUp } from '@clerk/react';

export interface UserData {
  full_name?: string;
  user_type?: string;
  phone_number?: string;
  country_code?: string;
}

export const useSecureAuth = () => {
  const { toast } = useToast();
  const { signIn: clerkSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp: clerkSignUp, isLoaded: signUpLoaded } = useClerkSignUp();

  const updateSecureUserProfile = async (userId: string) => {
    try {
      const fingerprint = await securityFeatures.generateDeviceFingerprint();
      
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, security_settings')
        .eq('id', userId)
        .maybeSingle();

      if (existingProfile) { 
        const anomalies = advancedSecurity.checkForAnomalies(fingerprint, existingProfile.security_settings?.device_fingerprints?.[0]);
        if (anomalies.length > 0) {
          securityFeatures.logSecurityEvent('login_anomaly_detected', { userId, anomalies });
        }
        
        const updatedFingerprints = [fingerprint, ...(existingProfile.security_settings?.device_fingerprints || [])].slice(0, 5);
        
        await supabase
          .from('profiles')
          .update({ security_settings: { ...existingProfile.security_settings, device_fingerprints: updatedFingerprints } })
          .eq('id', userId);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const signInWithSSO = async (provider: 'oauth_google' | 'oauth_github' | 'oauth_microsoft') => {
    if (!signInLoaded) return;
    
    try {
      securityFeatures.logSecurityEvent(`${provider}_signin_attempt`, {});
      await clerkSignIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (error: any) {
      securityFeatures.logSecurityEvent(`${provider}_signin_failed`, { error: error.message });
      toast({
        title: "Connection Failed",
        description: "Could not establish SSO connection. Please try again.",
        variant: "destructive"
      });
    }
  };

  const signUpWithSSO = async (provider: 'oauth_google' | 'oauth_github' | 'oauth_microsoft') => {
    if (!signUpLoaded) return;
    
    try {
      securityFeatures.logSecurityEvent(`${provider}_signup_attempt`, {});
      await clerkSignUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (error: any) {
      securityFeatures.logSecurityEvent(`${provider}_signup_failed`, { error: error.message });
      toast({
        title: "Registration Failed",
        description: "Could not complete SSO registration.",
        variant: "destructive"
      });
    }
  };

  return {
    signInWithSSO,
    signUpWithSSO,
    updateSecureUserProfile
  };
};

