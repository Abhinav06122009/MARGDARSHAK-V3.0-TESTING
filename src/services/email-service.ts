
/**
 * TACTICAL EMAIL DISPATCH SERVICE
 * Interfaces directly with Resend API for automated background mailing.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
const API_KEY = import.meta.env.VITE_RESEND_API_KEY;

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const emailService = {
  sendDirect: async (payload: EmailPayload) => {
    if (!API_KEY) {
      console.warn('⚠️ [EMAIL-SERVICE] No API key detected. Falling back to manual dispatch.');
      return { success: false, error: 'NO_API_KEY' };
    }

    try {
      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: payload.from || 'Margdarshak Support <support@margdarshan.tech>',
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API_RESPONSE_ERROR');
      }

      const data = await response.json();
      console.log('🛰️ [EMAIL-SERVICE] Automated dispatch successful:', data.id);
      return { success: true, data };
    } catch (error: any) {
      console.error('❌ [EMAIL-SERVICE] Automated dispatch failed:', error);
      return { success: false, error: error.message };
    }
  }
};
