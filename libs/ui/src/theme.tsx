import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';

export type Brand = 'KFC' | 'NANDOS';
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  appBackground: string;
  cardBackground: string;
  surfaceBackground: string;
  borderColor: string;
  borderSubtleColor: string;
  textColor: string;
  mutedTextColor: string;
  inputBackground: string;
  inputBorderColor: string;
  chipBackground: string;
  chipBorderColor: string;
  chipTextColor: string;
  chipActiveBackground: string;
  chipActiveTextColor: string;
  chipActionColor: string;
  statusBadgeBackground: string;
  statusBadgeTextColor: string;
  halalBadgeColor: string;
  halalBadgeTextColor: string;
  nonHalalBadgeColor: string;
  nonHalalBadgeTextColor: string;
  headerBackground: string;
  headerTextColor: string;
  headerSubtitleColor: string;
}

export interface BrandThemeContextValue extends ThemeColors {
  brand: Brand;
  mode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

// WCAG AA Compliant Palettes (Contrast Ratio >= 4.5:1 for text, >= 3:1 for graphical UI)
export const KFC_LIGHT_COLORS: ThemeColors = {
  primaryColor: '#C40024', // WCAG AA compliant on white (4.6+:1)
  secondaryColor: '#1F2937',
  accentColor: '#B91C1C',
  backgroundColor: '#F8F9FA',
  appBackground: '#F8F9FA',
  cardBackground: '#FFFFFF',
  surfaceBackground: '#FFFFFF',
  borderColor: '#E5E7EB',
  borderSubtleColor: '#F3F4F6',
  textColor: '#111827', // 16.1:1 on white
  mutedTextColor: '#4B5563', // 7.0:1 on white (exceeds 4.5:1)
  inputBackground: '#F3F4F6',
  inputBorderColor: '#D1D5DB',
  chipBackground: '#F3F4F6',
  chipBorderColor: '#D1D5DB',
  chipTextColor: '#1F2937',
  chipActiveBackground: '#C40024',
  chipActiveTextColor: '#FFFFFF',
  chipActionColor: '#C40024', // 5.62:1 on chipBackground
  statusBadgeBackground: '#F3F4F6',
  statusBadgeTextColor: '#374151', // 6.5:1
  halalBadgeColor: '#15803D', // 4.7:1 with white
  halalBadgeTextColor: '#FFFFFF',
  nonHalalBadgeColor: '#E5E7EB',
  nonHalalBadgeTextColor: '#374151', // 6.5:1
  headerBackground: '#C40024',
  headerTextColor: '#FFFFFF',
  headerSubtitleColor: '#FEE2E2'
};

export const KFC_DARK_COLORS: ThemeColors = {
  primaryColor: '#F87171', // 5.08:1 on #1E293B (card/surface background)
  secondaryColor: '#E5E7EB',
  accentColor: '#FCA5A5',
  backgroundColor: '#0F172A', // Slate 900
  appBackground: '#0B1120',
  cardBackground: '#1E293B', // Slate 800
  surfaceBackground: '#1E293B',
  borderColor: '#334155', // Slate 700
  borderSubtleColor: '#1E293B',
  textColor: '#F8FAFC', // 14.2:1 on slate 800
  mutedTextColor: '#94A3B8', // 5.5:1 on slate 800 (exceeds 4.5:1)
  inputBackground: '#0F172A',
  inputBorderColor: '#475569',
  chipBackground: '#334155',
  chipBorderColor: '#475569',
  chipTextColor: '#F8FAFC',
  chipActiveBackground: '#F87171',
  chipActiveTextColor: '#0F172A', // 6.28:1 on #F87171
  chipActionColor: '#FECACA', // 7.13:1 on chipBackground (#334155)
  statusBadgeBackground: '#334155',
  statusBadgeTextColor: '#F8FAFC', // 9.94:1 on #334155
  halalBadgeColor: '#166534', // Green 800
  halalBadgeTextColor: '#FFFFFF',
  nonHalalBadgeColor: '#334155',
  nonHalalBadgeTextColor: '#E2E8F0',
  headerBackground: '#1E293B',
  headerTextColor: '#F8FAFC',
  headerSubtitleColor: '#FCA5A5'
};

export const NANDOS_LIGHT_COLORS: ThemeColors = {
  primaryColor: '#BA1B1D', // Peri-Peri Red, 5.8:1 on white
  secondaryColor: '#D97706',
  accentColor: '#15803D',
  backgroundColor: '#FFFDF9',
  appBackground: '#FFFDF9',
  cardBackground: '#FFFFFF',
  surfaceBackground: '#FFFFFF',
  borderColor: '#E7E5E4',
  borderSubtleColor: '#F5F5F4',
  textColor: '#1C1917', // 15.5:1 on white
  mutedTextColor: '#57534E', // 5.5:1 on white
  inputBackground: '#F5F5F4',
  inputBorderColor: '#D6D3D1',
  chipBackground: '#F5F5F4',
  chipBorderColor: '#D6D3D1',
  chipTextColor: '#1C1917',
  chipActiveBackground: '#BA1B1D',
  chipActiveTextColor: '#FFFFFF',
  chipActionColor: '#BA1B1D', // 5.8:1 on #F5F5F4
  statusBadgeBackground: '#F5F5F4',
  statusBadgeTextColor: '#44403C', // 6.2:1 on #F5F5F4
  halalBadgeColor: '#15803D',
  halalBadgeTextColor: '#FFFFFF',
  nonHalalBadgeColor: '#E7E5E4',
  nonHalalBadgeTextColor: '#44403C',
  headerBackground: '#BA1B1D',
  headerTextColor: '#FFFFFF',
  headerSubtitleColor: '#FED7AA'
};

export const NANDOS_DARK_COLORS: ThemeColors = {
  primaryColor: '#F87171', // Warm red on dark (5.47:1 on #292524)
  secondaryColor: '#FBBF24',
  accentColor: '#22C55E',
  backgroundColor: '#1C1917', // Stone 900
  appBackground: '#141211',
  cardBackground: '#292524', // Stone 800
  surfaceBackground: '#292524',
  borderColor: '#44403C',
  borderSubtleColor: '#292524',
  textColor: '#FAFAF9', // 14.8:1 on stone 800
  mutedTextColor: '#A8A29E', // 6.02:1 on stone 800
  inputBackground: '#1C1917',
  inputBorderColor: '#57534E',
  chipBackground: '#44403C',
  chipBorderColor: '#57534E',
  chipTextColor: '#FAFAF9',
  chipActiveBackground: '#F87171',
  chipActiveTextColor: '#1C1917',
  chipActionColor: '#FED7AA', // 7.55:1 on chipBackground (#44403C)
  statusBadgeBackground: '#44403C',
  statusBadgeTextColor: '#FAFAF9', // 9.87:1 on #44403C
  halalBadgeColor: '#166534',
  halalBadgeTextColor: '#FFFFFF',
  nonHalalBadgeColor: '#44403C',
  nonHalalBadgeTextColor: '#F5F5F4',
  headerBackground: '#292524',
  headerTextColor: '#FAFAF9',
  headerSubtitleColor: '#FDBA74'
};

const DEFAULT_THEME_VALUE: BrandThemeContextValue = {
  ...KFC_LIGHT_COLORS,
  brand: 'KFC',
  mode: 'light',
  isDark: false,
  toggleTheme: () => {},
  setMode: () => {}
};

const ThemeContext = createContext<BrandThemeContextValue>(DEFAULT_THEME_VALUE);

export function BrandThemeProvider({
  brand = 'KFC',
  initialMode,
  children
}: {
  brand: Brand;
  initialMode?: ThemeMode;
  children: React.ReactNode;
}): React.JSX.Element {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(
    initialMode || (systemColorScheme === 'dark' ? 'dark' : 'light')
  );

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo<BrandThemeContextValue>(() => {
    const isDark = mode === 'dark';
    let colors: ThemeColors;

    if (brand === 'KFC') {
      colors = isDark ? KFC_DARK_COLORS : KFC_LIGHT_COLORS;
    } else {
      colors = isDark ? NANDOS_DARK_COLORS : NANDOS_LIGHT_COLORS;
    }

    return {
      ...colors,
      brand,
      mode,
      isDark,
      toggleTheme,
      setMode
    };
  }, [brand, mode, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useBrandTheme = (): BrandThemeContextValue => useContext(ThemeContext);
