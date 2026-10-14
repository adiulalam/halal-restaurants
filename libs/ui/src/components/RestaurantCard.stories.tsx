import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { RestaurantCard } from './RestaurantCard';

const meta: Meta<typeof RestaurantCard> = {
  title: 'Domain/RestaurantCard',
  component: RestaurantCard,
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }]
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof RestaurantCard>;

export const HalalBranchWithAmenities: Story = {
  render: () => (
    <View style={{ maxWidth: 450, padding: 16 }}>
      <RestaurantCard
        name="Bethnal Green KFC"
        street="377-379 Cambridge Heath Road"
        city="London"
        postalCode="E2 9RA"
        distanceMiles={0.4}
        isHalal={true}
        status="Open"
        amenitiesList={['Drive Thru', 'Delivery', 'Free Wifi', 'Baby Changing', 'Disabled Access', 'Halal Chicken Only', 'Breakfast Served']}
        onOpenMap={() => {}}
      />
    </View>
  )
};

export const StandardNonHalalBranch: Story = {
  render: () => (
    <View style={{ maxWidth: 450, padding: 16 }}>
      <RestaurantCard
        name="London - Waterloo Station"
        street="Station Concourse"
        city="London"
        postalCode="SE1 7LY"
        distanceMiles={1.8}
        isHalal={false}
        status="Available"
        amenitiesList={['Order at Table', 'Free Wifi']}
        onOpenMap={() => {}}
      />
    </View>
  )
};

