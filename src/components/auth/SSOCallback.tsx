import React, { useEffect } from 'react';
import { AuthenticateWithRedirectCallback } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import { PageLoader } from './RouteGuards';

const SSOCallback = () => {
  const navigate = useNavigate();

  // Safety fallback: if we're still here after 15 seconds, something went wrong
  useEffect(() => {
    const timer = setTimeout(() => {
      console.warn('SSO Callback timeout reached. Redirecting to dashboard...');
      navigate('/dashboard');
    }, 15000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AuthenticateWithRedirectCallback 
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <PageLoader />
    </AuthenticateWithRedirectCallback>
  );
};

export default SSOCallback;
