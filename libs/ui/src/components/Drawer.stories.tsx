import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from './Drawer';
import { BrandThemeProvider } from '../theme';
import type { ViewMode } from './ViewModeTabs';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  decorators: [
    (Story) => (
      <BrandThemeProvider brand="KFC">
        <div style={{ maxWidth: 420, height: 700, margin: '0 auto', border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
          <Story />
        </div>
      </BrandThemeProvider>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof Drawer>;

function InteractiveDrawer(props: { initialOpen?: boolean; brand?: 'KFC' | 'NANDOS' }) {
  const [isOpen, setIsOpen] = useState(props.initialOpen ?? false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [query, setQuery] = useState('');

  return (
    <BrandThemeProvider brand={props.brand || 'KFC'}>
      <Drawer
        title={props.brand === 'NANDOS' ? "HALAL NANDO'S UK" : 'HALAL KFC UK'}
        subtitle="Offline-Ready • 225 Verified Halal"
        badge={props.brand === 'NANDOS' ? 'HMC' : 'HFA'}
        isOpen={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        listCount={225}
        searchQuery={query}
        onSearchChange={setQuery}
      />
    </BrandThemeProvider>
  );
}

export const ClosedState: Story = {
  render: () => <InteractiveDrawer initialOpen={false} />
};

export const OpenState: Story = {
  render: () => <InteractiveDrawer initialOpen={true} />
};

export const NandosBrand: Story = {
  render: () => <InteractiveDrawer initialOpen={true} brand="NANDOS" />
};

