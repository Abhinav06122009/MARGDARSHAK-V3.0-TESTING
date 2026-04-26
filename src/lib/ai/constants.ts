export const AI_GATEWAY_NOT_CONFIGURED_MESSAGE = 'AI gateway is not configured. Set VITE_AI_GATEWAY_URL.';

/**
 * Returns the configured AI gateway URL from the VITE_AI_GATEWAY_URL environment variable.
 * Returns an empty string when not configured; callers check for a falsy value and surface
 * AI_GATEWAY_NOT_CONFIGURED_MESSAGE instead of making a request that would 404.
 *
 * An explicit VITE_AI_GATEWAY_URL pointing to the deployed Cloudflare Worker is required
 * for all environments (production, deploy previews, and local dev).
 */
export const getConfiguredAIGatewayUrl = (): string => {
  const configuredUrl = (import.meta.env.VITE_AI_GATEWAY_URL as string | undefined)?.trim();
  if (!configuredUrl) return '';
  return configuredUrl.replace(/\/+$/, '');
};
