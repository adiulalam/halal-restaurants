import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';
import { ThemeToggleButton } from './ThemeToggleButton';

const meta: Meta<typeof Header> = {
  title: 'Primitives/Header',
  component: Header,
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }]
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof Header>;

export const KFCHeader: Story = {
  args: {
    title: 'HALAL KFC UK',
    subtitle: 'Official Directory • 225 Certified Halal Branches',
    badge: 'HFA',
    rightAction: <ThemeToggleButton />
  }
};

export const NandosHeader: Story = {
  args: {
    title: "HALAL NANDO'S UK",
    subtitle: 'Official Directory • 107 Certified Halal Branches',
    badge: 'HMC',
    rightAction: <ThemeToggleButton />
  }
};

