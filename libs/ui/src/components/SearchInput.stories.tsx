import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { SearchInput } from './SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Primitives/SearchInput',
  component: SearchInput,
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }]
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Empty: Story = {
  render: () => {
    const [val, setVal] = useState('');
    return (
      <View style={{ padding: 16 }}>
        <SearchInput value={val} onChangeText={setVal} />
      </View>
    );
  }
};

export const WithValue: Story = {
  render: () => {
    const [val, setVal] = useState('Whitechapel, London');
    return (
      <View style={{ padding: 16 }}>
        <SearchInput value={val} onChangeText={setVal} />
      </View>
    );
  }
};

