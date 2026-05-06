import React, { createContext, useContext, useMemo, useState } from 'react';

export type DockSection = string | null;

interface DockContextValue {
  activeSection: DockSection;
  setActiveSection: (section: DockSection) => void;
}

const DockContext = createContext<DockContextValue | undefined>(undefined);

export const DockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<DockSection>(null);

  const value = useMemo(() => ({ activeSection, setActiveSection }), [activeSection]);

  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
};

export const useDock = () => {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within a DockProvider');
  }
  return context;
};