import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Primitives/Typography',
  component: Typography,
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }]
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Scale: Story = {
  render: () => (
    <View style={{ gap: 12, padding: 16 }}>
      <Typography variant="h1">Heading 1 — Halal Restaurants</Typography>
      <Typography variant="h2">Heading 2 — Popular Locations</Typography>
      <Typography variant="h3">Heading 3 — Store Amenities</Typography>
      <Typography variant="body">Body — Serving 100% certified Halal chicken across the UK.</Typography>
      <Typography variant="body-sm">Body Small — 128 Mile End Road, Tower Hamlets</Typography>
      <Typography variant="muted">Muted — Distance calculated from your current GPS location.</Typography>
      <Typography variant="caption">CAPTION / BADGE TEXT</Typography>
    </View>
  )
};

export const Weights: Story = {
  render: () => (
    <View style={{ gap: 8, padding: 16 }}>
      <Typography variant="body" weight="normal">Normal: Regular body text</Typography>
      <Typography variant="body" weight="medium">Medium: Slightly emphasized text</Typography>
      <Typography variant="body" weight="semibold">Semibold: Interactive buttons & filters</Typography>
      <Typography variant="body" weight="bold">Bold: Headers and badge labels</Typography>
    </View>
  )
};

