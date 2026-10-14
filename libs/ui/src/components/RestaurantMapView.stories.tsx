import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { RestaurantMapView } from './RestaurantMapView';
import type { MobileRestaurantItem } from '@halal-restaurants/types';

const mockStores: MobileRestaurantItem[] = [
  {
    id: 'kfc-1',
    name: 'Bethnal Green KFC',
    street: '377-379 Cambridge Heath Road',
    city: 'London',
    postalCode: 'E2 9RA',
    latitude: 51.5305,
    longitude: -0.0558,
    isHalal: true,
    amenitiesList: ['Drive Thru', 'Delivery', 'Halal Chicken Only'],
    status: 'Open'
  },
  {
    id: 'kfc-2',
    name: 'Whitechapel KFC',
    street: '67-69 Mile End Rd',
    city: 'London',
    postalCode: 'E1 4TT',
    latitude: 51.5209,
    longitude: -0.0544,
    isHalal: true,
    amenitiesList: ['Delivery', 'Free Wifi'],
    status: 'Open'
  },
  {
    id: 'kfc-3',
    name: 'London - Waterloo Station',
    street: 'Station Concourse',
    city: 'London',
    postalCode: 'SE1 7LY',
    latitude: 51.5032,
    longitude: -0.1123,
    isHalal: false,
    amenitiesList: ['Free Wifi'],
    status: 'Available'
  }
];

const meta: Meta<typeof RestaurantMapView> = {
  title: 'Domain/RestaurantMapView',
  component: RestaurantMapView,
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }]
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof RestaurantMapView>;

export const CenteredDefaultLondon: Story = {
  render: () => (
    <View style={{ height: 500, width: '100%' }}>
      <RestaurantMapView
        stores={mockStores}
        userLocation={null}
        onRequestLocation={() => {}}
      />
    </View>
  )
};

export const CenteredUserLocation: Story = {
  render: () => (
    <View style={{ height: 500, width: '100%' }}>
      <RestaurantMapView
        stores={mockStores}
        userLocation={{ latitude: 51.52, longitude: -0.06 }}
      />
    </View>
  )
};
