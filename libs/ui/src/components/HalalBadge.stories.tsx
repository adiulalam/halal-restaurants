import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { HalalBadge } from './HalalBadge';

const meta: Meta<typeof HalalBadge> = {
  title: 'Domain/HalalBadge',
  component: HalalBadge,
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }]
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof HalalBadge>;

export const HalalCertified: Story = {
  args: {
    isHalal: true,
    label: '100% HALAL CERTIFIED'
  }
};

export const StandardNonHalal: Story = {
  args: {
    isHalal: false
  }
};

export const SideBySide: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12, padding: 16 }}>
      <HalalBadge isHalal={true} />
      <HalalBadge isHalal={false} />
    </View>
  )
};

