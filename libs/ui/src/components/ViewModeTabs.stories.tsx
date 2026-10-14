import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { ViewModeTabs, ViewMode } from './ViewModeTabs';

const meta: Meta<typeof ViewModeTabs> = {
  title: 'Primitives/ViewModeTabs',
  component: ViewModeTabs,
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }]
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof ViewModeTabs>;

export const Interactive: Story = {
  render: () => {
    const [tab, setTab] = useState<ViewMode>('list');
    return (
      <View style={{ padding: 16 }}>
        <ViewModeTabs activeTab={tab} onTabChange={setTab} listCount={225} />
      </View>
    );
  }
};

export const MapActive: Story = {
  args: {
    activeTab: 'map',
    onTabChange: () => {},
    listCount: 107
  }
};

