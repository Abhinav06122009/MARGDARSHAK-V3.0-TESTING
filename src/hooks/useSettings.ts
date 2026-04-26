import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SecureUser {
  id: string;
  email: string;
  profile?: {
    full_name: string;
    user_type: string;
    student_id?: string;
  };
  last_sign_in_at?: string;
}

export const useSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SecureUser | null>(null);
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passkeyCount, setPasskeyCount] = useState(0);
  
  const [dyslexiaMode, setDyslexiaMode] = useState(() => {
    return localStorage.getItem('dyslexiaMode') === 'true';
  });

  // Apply dyslexia mode globally
  useEffect(() => {
    if (dyslexiaMode) {
      document.body.classList.add('dyslexia-mode');
      localStorage.setItem('dyslexiaMode', 'true');
    } else {
      document.body.classList.remove('dyslexia-mode');
      localStorage.setItem('dyslexiaMode', 'false');
    }
  }, [dyslexiaMode]);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (error || !authUser) {
        toast({ title: "Error", description: "Could not fetch user information.", variant: "destructive" });
        throw error || new Error("User not found");
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, user_type, student_id')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        toast({ title: "Error", description: "Could not fetch user profile.", variant: "destructive" });
        throw profileError;
      }

      const secureUser: SecureUser = {
        id: authUser.id,
        email: authUser.email || '',
        last_sign_in_at: authUser.last_sign_in_at,
        profile: {
          full_name: profile.full_name || '',
          user_type: profile.user_type || 'student',
          student_id: profile.student_id || ''
        }
      };
      
      setUser(secureUser);
      setFullName(secureUser.profile?.full_name || '');
      setStudentId(secureUser.profile?.student_id || '');
      
      const pks = (authUser.user_metadata?.passkeys as unknown[] | undefined) || [];
      setPasskeyCount(Array.isArray(pks) ? pks.length : 0);

    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmittingProfile(true);

    try {
      const { error: userError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (userError) throw userError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, student_id: studentId })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        className: "bg-gray-900/50 backdrop-blur-md border border-emerald-500/60 shadow-lg rounded-xl p-4 text-emerald-300 font-semibold"
      });

      await fetchUser();

    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update your profile.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters long.", variant: "destructive" });
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
        className: "bg-gray-900/50 backdrop-blur-md border border-emerald-500/60 shadow-lg rounded-xl p-4 text-emerald-300 font-semibold"
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Password Update Failed",
        description: error.message || "Could not update your password.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return {
    user,
    loading,
    fullName,
    setFullName,
    studentId,
    setStudentId,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isSubmittingProfile,
    isSubmittingPassword,
    showPassword,
    setShowPassword,
    dyslexiaMode,
    setDyslexiaMode,
    passkeyCount,
    handleProfileUpdate,
    handlePasswordUpdate,
    refreshUser: fetchUser
  };
};
