import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { AmenityChip } from './AmenityChip';

const meta: Meta<typeof AmenityChip> = {
  title: 'Domain/AmenityChip',
  component: AmenityChip,
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }]
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof AmenityChip>;

export const Default: Story = {
  args: {
    label: 'Drive Thru',
    active: false,
    onPress: () => {}
  }
};

export const ActiveWithCount: Story = {
  args: {
    label: '✓ Halal Only',
    count: 225,
    active: true,
    onPress: () => {}
  }
};

export const InteractiveGroup: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['Halal Only']);
    const amenities = [
      { name: 'Halal Only', count: 225 },
      { name: 'Drive Thru' },
      { name: 'Delivery' },
      { name: 'Baby Changing' },
      { name: 'Free Wifi' }
    ];

    const toggle = (name: string) => {
      setSelected((prev) =>
        prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
      );
    };

    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 16 }}>
        {amenities.map((a) => (
          <AmenityChip
            key={a.name}
            label={selected.includes(a.name) ? `✓ ${a.name}` : a.name}
            count={a.count}
            active={selected.includes(a.name)}
            onPress={() => toggle(a.name)}
          />
        ))}
      </View>
    );
  }
};

