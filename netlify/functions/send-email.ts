
import { Handler } from '@netlify/functions';

const RESEND_API_URL = 'https://api.resend.com/emails';

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const apiKey = process.env.VITE_EMAIL_API_KEY || process.env.VITE_RESEND_API_KEY;

    if (!apiKey) {
      console.error('❌ [SERVER-EMAIL] No API key found in environment');
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: 'Server configuration error: Missing API Key' }) 
      };
    }

    console.log('🛰️ [SERVER-EMAIL] Dispatching to Resend...');

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: payload.from || 'onboarding@resend.dev',
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [SERVER-RESEND-ERROR]:', response.status, data);
      return { 
        statusCode: response.status, 
        body: JSON.stringify(data) 
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id: data.id }),
    };
  } catch (error: any) {
    console.error('❌ [SERVER-EMAIL] Critical failure:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
