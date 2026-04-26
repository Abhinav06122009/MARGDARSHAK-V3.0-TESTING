import React from 'react';
import { useSound } from './SoundContext';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
}

/**
 * A custom link component that integrates with the global SoundProvider.
 * Supports smooth scrolling to IDs (e.g., #features).
 */
export const Link: React.FC<LinkProps> = ({ to, children, className = '', onClick, ...props }) => {
  const { playSound } = useSound();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (to.startsWith('#')) {
      e.preventDefault();
      const targetElement = document.getElementById(to.substring(1));
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    playSound('click');
    if (onClick) onClick(e);
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      onMouseEnter={() => playSound('hover')}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
};
