import { type LucideIcon, Sparkles, Trophy, Medal, Star, Shield, Zap, GraduationCap } from 'lucide-react';

export type UserRank = 'a+class' | 'aclass' | 'bclass' | 'cclass' | 'premium_elite' | 'premium' | 'standard';

export interface RankTheme {
  id: UserRank;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    border: string;
    bg: string;
  };
  gradients: {
    main: string;
    card: string;
    text: string;
    shimmer: string;
  };
  effects: {
    glowIntensity: string;
    blurAmount: string;
    animationSpeed: string;
  };
  icons: {
    rank: LucideIcon;
  };
}

export const RANK_THEMES: Record<UserRank, RankTheme> = {
  'a+class': {
    id: 'a+class',
    name: 'Rhodium Crystalline',
    colors: {
      primary: '#ffffff',
      secondary: '#e2e8f0',
      accent: '#00ffff',
      glow: 'rgba(0, 255, 255, 0.4)',
      border: 'rgba(255, 255, 255, 0.2)',
      bg: 'rgba(0, 0, 0, 0.8)',
    },
    gradients: {
      main: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 50%, #00ffff 100%)',
      card: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.6) 100%)',
      text: 'linear-gradient(to right, #ffffff, #94a3b8, #00ffff)',
      shimmer: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.2), transparent)',
    },
    effects: {
      glowIntensity: '0 0 40px rgba(0, 255, 255, 0.3)',
      blurAmount: 'blur-3xl',
      animationSpeed: '8s',
    },
    icons: {
      rank: Sparkles,
    },
  },
  'aclass': {
    id: 'aclass',
    name: 'Platinum Elite',
    colors: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
      accent: '#cbd5e1',
      glow: 'rgba(226, 232, 240, 0.3)',
      border: 'rgba(226, 232, 240, 0.15)',
      bg: 'rgba(10, 10, 10, 0.8)',
    },
    gradients: {
      main: 'linear-gradient(135deg, #e2e8f0 0%, #64748b 100%)',
      card: 'linear-gradient(135deg, rgba(226,232,240,0.05) 0%, rgba(0,0,0,0.7) 100%)',
      text: 'linear-gradient(to right, #f1f5f9, #94a3b8)',
      shimmer: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    },
    effects: {
      glowIntensity: '0 0 30px rgba(255, 255, 255, 0.15)',
      blurAmount: 'blur-2xl',
      animationSpeed: '10s',
    },
    icons: {
      rank: Trophy,
    },
  },
  'bclass': {
    id: 'bclass',
    name: 'Gilded Sovereign',
    colors: {
      primary: '#fbbf24',
      secondary: '#f59e0b',
      accent: '#d97706',
      glow: 'rgba(251, 191, 36, 0.3)',
      border: 'rgba(251, 191, 36, 0.2)',
      bg: 'rgba(15, 10, 5, 0.8)',
    },
    gradients: {
      main: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)',
      card: 'linear-gradient(135deg, rgba(251,191,36,0.05) 0%, rgba(0,0,0,0.8) 100%)',
      text: 'linear-gradient(to right, #fbbf24, #f59e0b)',
      shimmer: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.15), transparent)',
    },
    effects: {
      glowIntensity: '0 0 25px rgba(251, 191, 36, 0.2)',
      blurAmount: 'blur-xl',
      animationSpeed: '12s',
    },
    icons: {
      rank: Medal,
    },
  },
  'cclass': {
    id: 'cclass',
    name: 'Steel Vanguard',
    colors: {
      primary: '#94a3b8',
      secondary: '#64748b',
      accent: '#475569',
      glow: 'rgba(148, 163, 184, 0.2)',
      border: 'rgba(148, 163, 184, 0.1)',
      bg: 'rgba(20, 20, 20, 0.8)',
    },
    gradients: {
      main: 'linear-gradient(135deg, #94a3b8 0%, #334155 100%)',
      card: 'linear-gradient(135deg, rgba(148,163,184,0.05) 0%, rgba(0,0,0,0.85) 100%)',
      text: 'linear-gradient(to right, #cbd5e1, #64748b)',
      shimmer: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)',
    },
    effects: {
      glowIntensity: '0 0 20px rgba(148, 163, 184, 0.1)',
      blurAmount: 'blur-lg',
      animationSpeed: '15s',
    },
    icons: {
      rank: Shield,
    },
  },
  'premium_elite': {
    id: 'premium_elite',
    name: 'Aurora Elite',
    colors: {
      primary: '#22d3ee',
      secondary: '#818cf8',
      accent: '#c084fc',
      glow: 'rgba(34, 211, 238, 0.3)',
      border: 'rgba(34, 211, 238, 0.2)',
      bg: 'rgba(5, 5, 15, 0.8)',
    },
    gradients: {
      main: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 50%, #c084fc 100%)',
      card: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(0,0,0,0.8) 100%)',
      text: 'linear-gradient(to right, #22d3ee, #818cf8, #c084fc)',
      shimmer: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.2), transparent)',
    },
    effects: {
      glowIntensity: '0 0 35px rgba(34, 211, 238, 0.25)',
      blurAmount: 'blur-2xl',
      animationSpeed: '7s',
    },
    icons: {
      rank: Zap,
    },
  },
  'premium': {
    id: 'premium',
    name: 'Imperial Premium',
    colors: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: '#4338ca',
      glow: 'rgba(99, 102, 241, 0.25)',
      border: 'rgba(99, 102, 241, 0.15)',
      bg: 'rgba(10, 10, 20, 0.8)',
    },
    gradients: {
      main: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
      card: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(0,0,0,0.85) 100%)',
      text: 'linear-gradient(to right, #818cf8, #4f46e5)',
      shimmer: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent)',
    },
    effects: {
      glowIntensity: '0 0 20px rgba(99, 102, 241, 0.15)',
      blurAmount: 'blur-xl',
      animationSpeed: '10s',
    },
    icons: {
      rank: Star,
    },
  },
  'standard': {
    id: 'standard',
    name: 'Academic Standard',
    colors: {
      primary: '#71717a',
      secondary: '#52525b',
      accent: '#3f3f46',
      glow: 'rgba(113, 113, 122, 0.1)',
      border: 'rgba(255, 255, 255, 0.05)',
      bg: 'rgba(24, 24, 27, 0.8)',
    },
    gradients: {
      main: 'linear-gradient(135deg, #71717a 0%, #27272a 100%)',
      card: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.9) 100%)',
      text: 'linear-gradient(to right, #a1a1aa, #52525b)',
      shimmer: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.02), transparent)',
    },
    effects: {
      glowIntensity: 'none',
      blurAmount: 'blur-md',
      animationSpeed: '20s',
    },
    icons: {
      rank: GraduationCap,
    },
  },
};

export const getThemeByRank = (role: string, tier: string): RankTheme => {
  const normalizedRole = role.toLowerCase();
  const normalizedTier = tier.toLowerCase();

  if (normalizedRole.includes('a+')) return RANK_THEMES['a+class'];
  if (normalizedRole.includes('a-class') || normalizedRole === 'a') return RANK_THEMES['aclass'];
  if (normalizedRole.includes('b-class') || normalizedRole === 'b') return RANK_THEMES['bclass'];
  if (normalizedRole.includes('c-class') || normalizedRole === 'c') return RANK_THEMES['cclass'];
  
  if (normalizedTier === 'premium_elite') return RANK_THEMES['premium_elite'];
  if (normalizedTier === 'premium') return RANK_THEMES['premium'];
  
  return RANK_THEMES['standard'];
};
