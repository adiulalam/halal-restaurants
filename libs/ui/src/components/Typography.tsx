import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useBrandTheme } from '../theme';

export interface TypographyProps extends RNTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'body-sm' | 'caption' | 'muted';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  color?: string;
}

export const Typography: React.FC<TypographyProps> = React.memo(function Typography({
  children,
  variant = 'body',
  weight,
  align,
  color,
  style,
  ...rest
}) {
  const theme = useBrandTheme();

  const variantStyles = {
    h1: { fontSize: 24, fontWeight: '800' as const, color: theme.textColor, lineHeight: 30 },
    h2: { fontSize: 19, fontWeight: '700' as const, color: theme.textColor, lineHeight: 24 },
    h3: { fontSize: 16, fontWeight: '700' as const, color: theme.textColor, lineHeight: 22 },
    body: { fontSize: 14, fontWeight: '400' as const, color: theme.textColor, lineHeight: 20 },
    'body-sm': { fontSize: 13, fontWeight: '400' as const, color: theme.textColor, lineHeight: 18 },
    caption: { fontSize: 11, fontWeight: '600' as const, color: theme.mutedTextColor, lineHeight: 14 },
    muted: { fontSize: 13, fontWeight: '400' as const, color: theme.mutedTextColor, lineHeight: 18 }
  };

  const weightStyles = {
    normal: { fontWeight: '400' as const },
    medium: { fontWeight: '500' as const },
    semibold: { fontWeight: '600' as const },
    bold: { fontWeight: '700' as const }
  };

  return (
    <RNText
      style={[
        styles.base,
        variantStyles[variant],
        weight && weightStyles[weight],
        align && { textAlign: align },
        color ? { color } : undefined,
        style
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
});

const styles = StyleSheet.create({
  base: {
    letterSpacing: -0.1
  }
});

