// supabase/functions/_shared/cors.ts
export const PRODUCTION_ORIGIN = 'https://margdarshan.tech';
const PREVIEW_ORIGIN_REGEX = /^https:\/\/[a-zA-Z0-9-]+--margdarshak-ai\.netlify\.app$/;

const isAllowedOrigin = (origin: string) =>
  origin === PRODUCTION_ORIGIN ||
  PREVIEW_ORIGIN_REGEX.test(origin) ||
  origin.startsWith('http://localhost:');

export const resolveCorsOrigin = (origin: string | null): string => {
  if (!origin) return PRODUCTION_ORIGIN;
  return isAllowedOrigin(origin) ? origin : PRODUCTION_ORIGIN;
};

export const getCorsHeaders = (origin: string | null = null) => ({
  'Access-Control-Allow-Origin': resolveCorsOrigin(origin),
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, Origin, X-Requested-With, Accept',
  Vary: 'Origin',
});

export const corsHeaders = getCorsHeaders();
