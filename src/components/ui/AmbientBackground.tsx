import React from 'react';
import { NOISE_TEXTURE_DATA_URI } from '@/lib/noiseTexture';
import { useRankTheme } from '@/context/ThemeContext';

export const AmbientBackground = () => {
  const { theme } = useRankTheme();
  
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Noise Overlay */}
      <div
        className="absolute inset-0 opacity-10 mix-blend-overlay"
        style={{ backgroundImage: `url("${NOISE_TEXTURE_DATA_URI}")` }}
      />
      
      {/* Dynamic Theme Blobs */}
      <div 
        className="absolute -top-[20%] -left-[10%] w-[1000px] h-[1000px] rounded-full blur-[150px] opacity-20 transition-colors duration-1000"
        style={{ backgroundColor: theme.colors.primary }}
      />
      <div 
        className="absolute -bottom-[20%] -right-[10%] w-[1000px] h-[1000px] rounded-full blur-[150px] opacity-20 transition-colors duration-1000"
        style={{ backgroundColor: theme.colors.accent }}
      />
      
      {/* Rank Specific Center Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[180px] opacity-10 transition-all duration-1000"
        style={{ backgroundColor: theme.colors.glow }}
      />
    </div>
  );
};
