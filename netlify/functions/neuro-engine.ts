
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const POLLINATIONS_API_KEY = process.env.VITE_POLLINATIONS_API_KEY || process.env.POLLINATIONS_API_KEY;
const CLERK_JWT_PUBLIC_KEY = process.env.CLERK_JWT_PUBLIC_KEY;

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-API-Key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const authHeader = event.headers.authorization;
  if (!authHeader) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Auth Required' }), headers };
  }

  const token = authHeader.replace('Bearer ', '');
  let userId: string;

  try {
    if (CLERK_JWT_PUBLIC_KEY) {
      const decoded = jwt.verify(token, CLERK_JWT_PUBLIC_KEY.replace(/\\n/g, '\n'), { algorithms: ['RS256'] }) as any;
      userId = decoded.sub;
    } else {
      const decoded = jwt.decode(token) as any;
      userId = decoded.sub;
    }
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid Session' }), headers };
  }

  const body = JSON.parse(event.body || '{}');
  const { messages, model, task } = body;

  if (!messages || !messages.length) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing messages' }), headers };
  }

  try {
    // Determine which AI provider to use
    // For this implementation, we'll use Pollinations as the primary engine for 'qwen-safety'
    const aiModel = model === 'qwen-safety' ? 'qwen-7b-chat' : 'openai';
    
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POLLINATIONS_API_KEY}`
      },
      body: JSON.stringify({
        messages,
        model: aiModel,
        seed: Math.floor(Math.random() * 1000000),
        jsonMode: task === 'research' // Simplified logic
      })
    });

    if (!response.ok) {
      throw new Error(`AI Provider Error: ${response.status}`);
    }

    const aiText = await response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        response: aiText,
        model: aiModel,
        timestamp: new Date().toISOString()
      }),
      headers
    };
  } catch (error: any) {
    console.error(`[neuro-engine] Error:`, error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }), headers };
  }
};
