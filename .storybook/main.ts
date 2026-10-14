import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../libs/ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native': 'react-native-web',
      '@react-native/assets-registry/registry': path.resolve(
        __dirname,
        '../node_modules/react-native-web/dist/modules/AssetRegistry'
      )
    };
    return config;
  }
};

export default config;

