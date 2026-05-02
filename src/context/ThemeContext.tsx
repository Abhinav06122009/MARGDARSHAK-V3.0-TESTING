import React, { createContext, useContext, useMemo } from 'react';
import { getThemeByRank, type RankTheme, RANK_THEMES } from '@/lib/themeRegistry';

interface ThemeContextType {
  theme: RankTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ role: string; tier: string; children: React.ReactNode }> = ({ role, tier, children }) => {
  const theme = useMemo(() => getThemeByRank(role, tier), [role, tier]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useRankTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Fallback to standard theme if outside provider to prevent crashes
    return { theme: RANK_THEMES['standard'] };
  }
  return context;
};

