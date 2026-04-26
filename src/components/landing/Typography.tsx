import React from 'react';

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A text component that applies an animated gradient effect.
 */
export const AnimatedGradientText: React.FC<AnimatedGradientTextProps> = ({ children, className = '' }) => {
  return (
    <span className={`bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-shift ${className}`}>
      {children}
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% auto;
          animation: gradient-shift 6s ease-in-out infinite alternate;
          display: inline-block;
        }
      `}</style>
    </span>
  );
};
