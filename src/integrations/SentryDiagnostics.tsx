import React from 'react';
import * as Sentry from '@sentry/react';

/**
 * Minimal Sentry Test Button.
 * Replicated exactly from the verification snippet.
 */
export function SentryTestButton() {
  return (
    <button
      onClick={() => {
        throw new Error('This is your first error!');
      }}
      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95"
    >
      Break the world
    </button>
  );
}
