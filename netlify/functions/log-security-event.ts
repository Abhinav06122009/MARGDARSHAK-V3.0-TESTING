import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Silent security event logger for Brand VSAV Gyantapa Protocol
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    console.log('[SECURITY EVENT]', data);

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'logged', timestamp: new Date().toISOString() }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    return { statusCode: 400, body: 'Bad Request' };
  }
};
