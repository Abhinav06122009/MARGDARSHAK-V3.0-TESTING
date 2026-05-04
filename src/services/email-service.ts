import { Resend } from 'resend';

/**
 * TACTICAL EMAIL DISPATCH SERVICE
 * Interfaces directly with the official Resend SDK.
 */

const API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const resend = API_KEY ? new Resend(API_KEY) : null;

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const emailService = {
  sendDirect: async (payload: EmailPayload) => {
    if (!resend) {
      console.warn('⚠️ [EMAIL-SERVICE] No API key detected or Resend SDK not initialized.');
      return { success: false, error: 'NO_API_KEY' };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: payload.from || 'onboarding@resend.dev',
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      });

      if (error) throw error;

      console.log('🛰️ [EMAIL-SERVICE] Automated dispatch successful:', data?.id);
      return { success: true, data };
    } catch (error: any) {
      console.error('❌ [EMAIL-SERVICE] Automated dispatch failed:', error);
      return { success: false, error: error.message };
    }
  }
};
