import React from 'react';
import type { Preview } from '@storybook/react';
import { View } from 'react-native';
import { BrandThemeProvider, useBrandTheme, type Brand, type ThemeMode } from '../libs/ui/src/theme';

function ThemeWrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
  const theme = useBrandTheme();
  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        backgroundColor: theme.backgroundColor,
        minHeight: '100vh' as any
      }}
    >
      {children}
    </View>
  );
}

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'link-name', enabled: true }
        ]
      }
    }
  },
  globalTypes: {
    brand: {
      name: 'Brand',
      description: 'Brand theme (KFC or Nando\'s)',
      defaultValue: 'KFC',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'KFC', title: 'KFC Theme' },
          { value: 'NANDOS', title: 'Nando\'s Theme' }
        ]
      }
    },
    mode: {
      name: 'Theme Mode',
      description: 'Color theme (Light or Dark)',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: '☀️ Light Mode' },
          { value: 'dark', title: '🌙 Dark Mode' }
        ]
      }
    }
  },
  decorators: [
    (Story, context) => {
      const brand = (context.globals.brand as Brand) || 'KFC';
      const mode = (context.globals.mode as ThemeMode) || 'light';

      return (
        <BrandThemeProvider brand={brand} initialMode={mode}>
          <ThemeWrapper>
            <Story />
          </ThemeWrapper>
        </BrandThemeProvider>
      );
    }
  ]
};

export default preview;

