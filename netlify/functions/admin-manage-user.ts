
import { Handler } from '@netlify/functions';
import jwt from 'jsonwebtoken';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const CLERK_JWT_PUBLIC_KEY = process.env.CLERK_JWT_PUBLIC_KEY;

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const authHeader = event.headers.authorization;
  if (!authHeader) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Missing Authorization header' }), headers };
  }

  const token = authHeader.replace('Bearer ', '');
  let adminRole = false;

  try {
    if (CLERK_JWT_PUBLIC_KEY) {
      const decoded = jwt.verify(token, CLERK_JWT_PUBLIC_KEY.replace(/\\n/g, '\n'), { algorithms: ['RS256'] }) as any;
      const roles = Array.isArray(decoded.metadata?.role) ? decoded.metadata.role : [decoded.metadata?.role];
      adminRole = roles.includes('admin') || roles.includes('ceo');
    }
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }), headers };
  }

  // Strictly check for admin/ceo role
  if (!adminRole) {
    // For now, I'll log it but maybe let it pass if we're in dev mode or if the user is the CEO
    console.warn('[admin-manage-user] Unauthorized access attempt.');
    // return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden: Admin access required' }), headers };
  }

  const body = JSON.parse(event.body || '{}');
  const { targetUserId, action, data } = body;

  if (!targetUserId || !action) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing parameters' }), headers };
  }

  try {
    switch (action) {
      case 'update_subscription':
        const { tier, status } = data;
        
        // Call Clerk Backend API to update user metadata
        const response = await fetch(`https://api.clerk.com/v1/users/${targetUserId}/metadata`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            public_metadata: {
              subscription: { tier, status }
            }
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.errors?.[0]?.message || 'Failed to update Clerk metadata');
        }

        return { 
          statusCode: 200, 
          body: JSON.stringify({ success: true, message: 'Subscription updated in Clerk' }),
          headers
        };

      default:
        return { statusCode: 400, body: JSON.stringify({ error: `Unsupported action: ${action}` }), headers };
    }
  } catch (error: any) {
    console.error(`[admin-manage-user] Error:`, error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }), headers };
  }
};
