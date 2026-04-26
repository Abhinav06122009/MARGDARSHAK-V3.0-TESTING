import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

interface SoundContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playSound: (type: 'hover' | 'click' | 'toggleOn' | 'toggleOff') => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    
    // Initialize on first click to satisfy browser policies
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  const playSound = useCallback((type: 'hover' | 'click' | 'toggleOn' | 'toggleOff') => {
    if (!soundEnabled || !audioContextRef.current) return;

    const context = audioContextRef.current;
    if (context.state === 'suspended') {
      context.resume();
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    gainNode.connect(context.destination);
    oscillator.connect(gainNode);

    const now = context.currentTime;
    gainNode.gain.setValueAtTime(0.3, now);

    switch (type) {
      case 'hover':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        break;
      case 'click':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(400, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        break;
      case 'toggleOn':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(800, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        break;
      case 'toggleOff':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(300, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        break;
    }

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const newState = !prev;
      if (newState) playSound('toggleOn');
      else playSound('toggleOff');
      return newState;
    });
  };

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
