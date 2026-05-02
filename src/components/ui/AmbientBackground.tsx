import React from 'react';
import { NOISE_TEXTURE_DATA_URI } from '@/lib/noiseTexture';

export const AmbientBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    {/* Noise Overlay */}
    <div
      className="absolute inset-0 opacity-20 mix-blend-overlay"
      style={{ backgroundImage: `url("${NOISE_TEXTURE_DATA_URI}")` }}
    />
    
    {/* Gradient Blobs */}
    <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px]" />
    <div className="absolute -bottom-[20%] -right-[10%] w-[800px] h-[800px] bg-amber-900/10 rounded-full blur-[120px]" />
  </div>
);
