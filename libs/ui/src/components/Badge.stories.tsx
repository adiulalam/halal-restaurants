import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }]
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Variants: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', padding: 16 }}>
      <Badge label="DEFAULT / STATUS" variant="default" />
      <Badge label="✓ 100% HALAL CERTIFIED" variant="success" />
      <Badge label="STANDARD" variant="secondary" />
      <Badge label="OUTLINE BADGE" variant="outline" />
    </View>
  )
};

export const HalalStatus: Story = {
  args: {
    label: '✓ 100% HALAL CERTIFIED',
    variant: 'success'
  }
};

