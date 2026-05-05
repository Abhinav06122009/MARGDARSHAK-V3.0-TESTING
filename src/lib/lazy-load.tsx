import React, { lazy, ComponentType } from 'react';

/**
 * Enhanced Lazy Loading with Automatic Recovery
 * Solves the "Failed to fetch dynamically imported module" error common in Vite deployments.
 * When a new version is deployed, old chunk hashes are removed from the server. 
 * If a user has an old version of the app open, their browser tries to fetch old chunks and fails.
 * This helper catches that failure and forces a full page reload to get the latest manifest.
 */
export const safeLazy = (importFn: () => Promise<{ default: ComponentType<any> }>) => {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error('🛡️ CHUNK LOAD ERROR: Failed to fetch module. Recovering...', error);
      
      // Check if we've already tried to reload in the last 10 seconds to avoid infinite loops
      const lastReload = sessionStorage.getItem('last_chunk_error_reload');
      const now = Date.now();
      
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        sessionStorage.setItem('last_chunk_error_reload', now.toString());
        window.location.reload();
      }
      
      // Return a dummy component that shows a loading state while the page reloads
      return { default: () => <div className="min-h-screen bg-black flex items-center justify-center text-white/20 font-mono">RECOVERING SYSTEM...</div> };
    }
  });
};
