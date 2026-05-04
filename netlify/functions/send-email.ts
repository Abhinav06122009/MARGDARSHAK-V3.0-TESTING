
import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

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

    const resend = new Resend(apiKey);
    console.log('🛰️ [SERVER-EMAIL] Dispatching via Official Resend SDK...');

    const { data, error } = await resend.emails.send({
      from: payload.from || 'support@margdarshan.tech',
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
    });

    if (error) {
      console.error('❌ [SERVER-RESEND-SDK-ERROR]:', error);
      return { 
        statusCode: 400, 
        body: JSON.stringify(error) 
      };
    }

    console.log('🛰️ [SERVER-EMAIL] SDK dispatch successful:', data?.id);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id: data?.id }),
    };
  } catch (error: any) {
    console.error('❌ [SERVER-EMAIL] Critical failure:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
