import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Primitives/Chip',
  component: Chip,
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }]
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: {
    label: 'Drive Thru',
    active: false,
    onPress: () => {}
  }
};

export const Active: Story = {
  args: {
    label: '✓ Halal Only',
    count: 225,
    active: true,
    onPress: () => {}
  }
};

export const FilterRow: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['Drive Thru']);
    const items = ['Halal Only (225)', 'Drive Thru', 'Delivery', 'Free Wifi', 'Halal Chicken Only'];

    const toggle = (item: string) => {
      setSelected((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    };

    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 16 }}>
        {items.map((item) => (
          <Chip
            key={item}
            label={item}
            active={selected.includes(item)}
            onPress={() => toggle(item)}
          />
        ))}
      </View>
    );
  }
};

