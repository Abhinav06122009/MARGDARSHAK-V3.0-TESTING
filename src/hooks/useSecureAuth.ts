import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { securityFeatures, advancedSecurity } from '@/components/auth/AuthSecurity';
import { countries } from '@/components/auth/AuthData';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

export interface UserData {
  full_name?: string;
  user_type?: string;
  phone_number?: string;
  country_code?: string;
}

export const useSecureAuth = () => {
  const { toast } = useToast();

  const updateSecureUserProfile = async (user: User) => {
    try {
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, security_settings')
        .eq('id', user.id)
        .single();
      
      const fingerprint = await securityFeatures.generateDeviceFingerprint();

      if (checkError && checkError.code === 'PGRST116') {
        return { success: true };
      }

      if (existingProfile) { 
        const anomalies = advancedSecurity.checkForAnomalies(fingerprint, existingProfile.security_settings?.device_fingerprints?.[0]);
        if (anomalies.length > 0) {
          securityFeatures.logSecurityEvent('login_anomaly_detected', { userId: user.id, anomalies });
        }
        
        const updatedFingerprints = [fingerprint, ...(existingProfile.security_settings?.device_fingerprints || [])].slice(0, 5);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ security_settings: { ...existingProfile.security_settings, device_fingerprints: updatedFingerprints } })
          .eq('id', user.id);
        if (updateError) throw updateError;
      }
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const signUp = async (email: string, password: string, userData?: UserData) => {
    const rateLimitCheck = securityFeatures.checkRateLimit(email);
    if (!rateLimitCheck.allowed) {
      throw new Error(`Too many attempts. Please try again in ${rateLimitCheck.remainingTime} minutes.`);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData?.full_name,
          phone_number: userData?.phone_number,
          country_code: userData?.country_code,
          security_metadata: await securityFeatures.generateDeviceFingerprint()
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    if (error) {
      const attempts = parseInt(localStorage.getItem(`auth_attempts_${email}`) || '0') + 1;
      localStorage.setItem(`auth_attempts_${email}`, attempts.toString());
      localStorage.setItem(`last_attempt_${email}`, Date.now().toString());
      securityFeatures.logSecurityEvent('signup_failed', { email, error: error.message });
      throw error;
    }
    
    if (data.user) {
      securityFeatures.logSecurityEvent('signup_success', { email, userId: data.user.id });
      localStorage.removeItem(`auth_attempts_${email}`);
      localStorage.removeItem(`last_attempt_${email}`);
    }
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const rateLimitCheck = securityFeatures.checkRateLimit(email);
    if (!rateLimitCheck.allowed) {
      throw new Error(`Too many attempts. Please try again in ${rateLimitCheck.remainingTime} minutes.`);
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      const attempts = parseInt(localStorage.getItem(`auth_attempts_${email}`) || '0') + 1;
      localStorage.setItem(`auth_attempts_${email}`, attempts.toString());
      localStorage.setItem(`last_attempt_${email}`, Date.now().toString());
      securityFeatures.logSecurityEvent('signin_failed', { email, error: error.message });
      throw error;
    }
    
    if (data.user) {
      await updateSecureUserProfile(data.user);
      securityFeatures.logSecurityEvent('signin_success', { email, userId: data.user.id });
      localStorage.removeItem(`auth_attempts_${email}`);
      localStorage.removeItem(`last_attempt_${email}`);
    }
    
    return { data, error };
  };

  const signInWithGoogle = async () => {
    securityFeatures.logSecurityEvent('google_signin_attempt', {});
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    });
    if (error) securityFeatures.logSecurityEvent('google_signin_failed', { error: error.message });
    return { data, error };
  };

  const resetPassword = async (email: string) => {
    securityFeatures.logSecurityEvent('password_reset_requested', { email });
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
  };

  const signInWithGitHub = async () => {
    securityFeatures.logSecurityEvent('github_signin_attempt', {});
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) securityFeatures.logSecurityEvent('github_signin_failed', { error: error.message });
    return { data, error };
  };

  const sendPhoneOtp = async (phone: string) => {
    securityFeatures.logSecurityEvent('mfa_otp_sent_attempt', { phone });
    return await supabase.auth.signInWithOtp({ phone });
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
    securityFeatures.logSecurityEvent('mfa_otp_verify_attempt', { phone });
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) {
      securityFeatures.logSecurityEvent('mfa_otp_verify_failed', { phone, error: error.message });
      throw error;
    }
    securityFeatures.logSecurityEvent('mfa_otp_verify_success', { phone });
    return { data, error };
  };

  const updatePassword = async (newPassword: string) => {
    const strength = securityFeatures.checkPasswordStrength(newPassword);
    if (strength.score < 4) throw new Error('Password is too weak.');
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    securityFeatures.logSecurityEvent('password_updated', {});
    return { data, error };
  };

  const signInWithMagicLink = async (email: string) => {
    securityFeatures.logSecurityEvent('magic_link_requested', { email });
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) securityFeatures.logSecurityEvent('magic_link_failed', { email, error: error.message });
    return { data, error };
  };

  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user || error) return null;
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError && profileError.code === 'PGRST116') {
        const { data: newProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        return { user, profile: newProfile };
      }
      return { user, profile };
    } catch (err) {
      return { user, profile: null };
    }
  };

  return {
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGitHub,
    signInWithMagicLink,
    resetPassword,
    updatePassword,
    sendPhoneOtp,
    verifyPhoneOtp,
    updateSecureUserProfile,
    getCurrentUser
  };
};

