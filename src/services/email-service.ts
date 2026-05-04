
/**
 * TACTICAL EMAIL DISPATCH SERVICE
 * Redirects requests through Netlify Functions to bypass CORS and secure API keys.
 */

// Netlify Function Proxy Endpoint
const PROXY_URL = '/api/send-email';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const emailService = {
  sendDirect: async (payload: EmailPayload) => {
    try {
      console.log('🛰️ [EMAIL-SERVICE] Dispatching via Netlify Proxy Bridge...');
      
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: payload.from || 'onboarding@resend.dev',
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ [PROXY_ERROR_CODE]:', response.status);
        console.error('❌ [PROXY_ERROR_BODY]:', JSON.stringify(data, null, 2));
        throw new Error(data.error || data.message || 'PROXY_RESPONSE_ERROR');
      }

      console.log('🛰️ [EMAIL-SERVICE] Automated dispatch successful via Proxy:', data.id);
      return { success: true, data };
    } catch (error: any) {
      console.error('❌ [EMAIL-SERVICE] Critical failure:', error);
      return { success: false, error: error.message };
    }
  }
};
