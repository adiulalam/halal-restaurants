import React, { createContext, useContext } from 'react';

export type Brand = 'KFC' | 'NANDOS';

export interface BrandTheme {
  brand: Brand;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBackground: string;
  textColor: string;
  mutedTextColor: string;
  halalBadgeColor: string;
  halalBadgeTextColor: string;
}

export const KFC_THEME: BrandTheme = {
  brand: 'KFC',
  primaryColor: '#E4002B', // Colonel Red
  secondaryColor: '#202124',
  accentColor: '#D32F2F',
  backgroundColor: '#F8F9FA',
  cardBackground: '#FFFFFF',
  textColor: '#1A1A1A',
  mutedTextColor: '#666666',
  halalBadgeColor: '#008751', // Verified Halal Green
  halalBadgeTextColor: '#FFFFFF'
};

export const NANDOS_THEME: BrandTheme = {
  brand: 'NANDOS',
  primaryColor: '#BA1B1D', // Peri-Peri Red
  secondaryColor: '#F5B041', // Warm Rooster Yellow
  accentColor: '#2E7D32',
  backgroundColor: '#FFFDF9',
  cardBackground: '#FFFFFF',
  textColor: '#1C1917',
  mutedTextColor: '#78716C',
  halalBadgeColor: '#008751',
  halalBadgeTextColor: '#FFFFFF'
};

const ThemeContext = createContext<BrandTheme>(KFC_THEME);

export function BrandThemeProvider({
  theme,
  children
}: {
  theme: BrandTheme;
  children: React.ReactNode;
}): React.JSX.Element {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export const useBrandTheme = (): BrandTheme => useContext(ThemeContext);
