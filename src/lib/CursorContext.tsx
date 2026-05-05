import React, { createContext, useState, ReactNode, useMemo } from 'react';

type CursorVariant = 'default' | 'text' | 'link';

interface CursorContextType {
  cursorVariant: CursorVariant;
  setCursorVariant: (variant: CursorVariant) => void;
}

export const CursorContext = createContext<CursorContextType>({
  cursorVariant: 'default',
  setCursorVariant: () => {},
});

export const CursorProvider = ({ children }: { children: ReactNode }) => {
  // Use React.useState directly to avoid potential dispatcher null issues
  const [cursorVariant, setCursorVariant] = React.useState<CursorVariant>('default');

  const value = useMemo(() => ({
    cursorVariant,
    setCursorVariant
  }), [cursorVariant]);

  return (
    <CursorContext.Provider value={value}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = React.useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};