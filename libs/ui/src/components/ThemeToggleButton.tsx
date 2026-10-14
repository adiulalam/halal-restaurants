import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useBrandTheme } from '../theme';

export function ThemeToggleButton(): React.JSX.Element {
  const theme = useBrandTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={theme.toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${theme.isDark ? 'light' : 'dark'} mode`}
      style={[
        styles.themeButton,
        {
          backgroundColor: theme.isDark ? '#334155' : 'rgba(255, 255, 255, 0.2)',
          borderColor: theme.isDark ? '#475569' : 'rgba(255, 255, 255, 0.4)'
        },
        Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
      ]}
    >
      <Text style={styles.themeButtonText}>
        {theme.isDark ? '☀️ Light' : '🌙 Dark'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1
  },
  themeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  }
});

