import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Typography } from './Typography';
import { Badge } from './Badge';

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }]
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card>
      <Typography variant="h3">Bethnal Green KFC</Typography>
      <Typography variant="body-sm" style={{ marginTop: 4 }}>
        377-379 Cambridge Heath Road, London, E2 9RA
      </Typography>
      <Badge label="✓ 100% HALAL CERTIFIED" variant="success" style={{ marginTop: 8 }} />
    </Card>
  )
};

export const Flat: Story = {
  render: () => (
    <Card elevated={false}>
      <Typography variant="h3">Card without drop shadow</Typography>
      <Typography variant="muted" style={{ marginTop: 4 }}>
        Clean border-only card container.
      </Typography>
    </Card>
  )
};

