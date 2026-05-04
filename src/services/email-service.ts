
/**
 * TACTICAL EMAIL DISPATCH SERVICE
 * High-stability fetch-based implementation for browser compatibility.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';

// TACTICAL KEY RESOLUTION: Try primary ENV -> then Netlify ENV -> then LocalStorage
const getApiKey = () => {
  // Check primary Resend key
  const resendKey = import.meta.env.VITE_RESEND_API_KEY;
  if (resendKey && resendKey !== 'undefined' && resendKey !== '') return resendKey;
  
  // Check Netlify-specific email key found in logs
  const emailKey = import.meta.env.VITE_EMAIL_API_KEY;
  if (emailKey && emailKey !== 'undefined' && emailKey !== '') return emailKey;

  // Check LocalStorage fallback for runtime injection
  const localKey = localStorage.getItem('VITE_RESEND_API_KEY');
  if (localKey) return localKey;

  return null;
};

const API_KEY = getApiKey();

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const emailService = {
  sendDirect: async (payload: EmailPayload) => {
    if (!API_KEY) {
      console.warn('⚠️ [EMAIL-SERVICE] No API key detected. Please add VITE_RESEND_API_KEY to Netlify environment variables.');
      return { success: false, error: 'NO_API_KEY' };
    }

    try {
      console.log('🛰️ [EMAIL-SERVICE] Dispatching via Resend API...');
      
      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: payload.from || 'onboarding@resend.dev',
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ [RESEND_ERROR_CODE]:', response.status);
        console.error('❌ [RESEND_ERROR_BODY]:', JSON.stringify(data, null, 2));
        throw new Error(data.message || 'API_RESPONSE_ERROR');
      }

      console.log('🛰️ [EMAIL-SERVICE] Automated dispatch successful:', data.id);
      return { success: true, data };
    } catch (error: any) {
      console.error('❌ [EMAIL-SERVICE] Critical failure:', error);
      return { success: false, error: error.message };
    }
  }
};
