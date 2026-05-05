
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Honeypot trap - this endpoint should never be called by real users
  console.warn('[SECURITY] Honeypot endpoint triggered!', {
    ip: event.headers['x-nf-client-connection-ip'],
    userAgent: event.headers['user-agent'],
    method: event.httpMethod
  });

  return {
    statusCode: 403,
    body: JSON.stringify({ 
      error: 'Access Denied', 
      message: 'This security incident has been logged. Your access may be restricted.' 
    }),
    headers: { 'Content-Type': 'application/json' }
  };
};
