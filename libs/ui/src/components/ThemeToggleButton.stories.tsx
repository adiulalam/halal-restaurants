import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { ThemeToggleButton } from './ThemeToggleButton';

const meta: Meta<typeof ThemeToggleButton> = {
  title: 'Primitives/ThemeToggleButton',
  component: ThemeToggleButton,
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }]
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof ThemeToggleButton>;

export const Default: Story = {
  render: () => (
    <View style={{ padding: 16, backgroundColor: '#C40024', borderRadius: 8, alignItems: 'flex-start' }}>
      <ThemeToggleButton />
    </View>
  )
};

