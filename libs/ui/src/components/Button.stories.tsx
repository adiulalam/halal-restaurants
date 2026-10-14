import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }]
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Variants: Story = {
  render: () => (
    <View style={{ gap: 12, padding: 16, maxWidth: 300 }}>
      <Button title="Primary Button" variant="primary" onPress={() => {}} />
      <Button title="Outline Button" variant="outline" onPress={() => {}} icon="📍" />
      <Button title="Secondary Button" variant="secondary" onPress={() => {}} />
      <Button title="Ghost Button" variant="ghost" onPress={() => {}} />
      <Button title="+5 more" variant="chip-action" size="sm" onPress={() => {}} />
    </View>
  )
};

export const Sizes: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', padding: 16 }}>
      <Button title="Small" size="sm" onPress={() => {}} />
      <Button title="Medium" size="md" onPress={() => {}} />
      <Button title="Large" size="lg" onPress={() => {}} />
    </View>
  )
};

export const States: Story = {
  render: () => (
    <View style={{ gap: 12, padding: 16, maxWidth: 300 }}>
      <Button title="Loading Button" loading onPress={() => {}} />
      <Button title="Disabled Button" disabled onPress={() => {}} />
    </View>
  )
};

