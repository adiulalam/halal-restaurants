import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  StatusBar,
  Linking,
  TouchableOpacity
} from 'react-native';
import { BrandThemeProvider, KFC_THEME, RestaurantCard, AmenityChip } from '@halal-restaurants/ui';

// In production, this data loads from the API service.
// For initial offline preview, we embed the verified seed data.
const SAMPLE_KFC_STORES = [
  {
    storeId: '08921',
    name: 'Bethnal Green',
    street: '406 Bethnal Green Road',
    city: 'London',
    postalCode: 'E2 0DJ',
    isHalal: true,
    hasDriveThru: false,
    hasWifi: true,
    hasDisabilityAccess: true,
    distanceMiles: 0.4,
    facilities: ['100% Halal Certified', 'Free Wifi', 'Disability Access', 'Express', 'Rewards Arcade'],
    status: 'open'
  },
  {
    storeId: '12107',
    name: 'Welling - Bellegrove Road',
    street: '31 Bellegrove Road',
    city: 'Welling',
    postalCode: 'DA16 3PB',
    isHalal: false,
    hasDriveThru: false,
    hasWifi: true,
    hasDisabilityAccess: true,
    distanceMiles: 2.1,
    facilities: ['Free Wifi', 'Disability Access', 'Rewards Arcade', 'Baby Changing Room'],
    status: 'open'
  },
  {
    storeId: '02609',
    name: 'Huntingdon - Tower Field',
    street: 'KFC Towerfields, St Peters Road',
    city: 'Huntingdon',
    postalCode: 'PE29 7EG',
    isHalal: false,
    hasDriveThru: true,
    hasWifi: true,
    hasDisabilityAccess: true,
    distanceMiles: 14.5,
    facilities: ['Drive Thru', 'Free Wifi', 'Disability Access', 'Baby Changing Room'],
    status: 'open'
  },
  {
    storeId: '05432',
    name: 'Whitechapel - Mile End Road',
    street: '124 Mile End Road',
    city: 'London',
    postalCode: 'E1 4UN',
    isHalal: true,
    hasDriveThru: false,
    hasWifi: true,
    hasDisabilityAccess: true,
    distanceMiles: 0.9,
    facilities: ['100% Halal Certified', 'Free Wifi', 'Disability Access', 'Mobile Ordering'],
    status: 'open'
  },
  {
    storeId: '08716',
    name: 'Leigh - Parsonage Retail Park',
    street: 'Parsonage Retail Park, Atherleigh Way',
    city: 'Leigh',
    postalCode: 'WN7 5SJ',
    isHalal: false,
    hasDriveThru: true,
    hasWifi: true,
    hasDisabilityAccess: true,
    distanceMiles: 18.2,
    facilities: ['Drive Thru', 'Free Wifi', 'Disability Access', 'Rewards Arcade'],
    status: 'open'
  }
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyHalal, setOnlyHalal] = useState(true);
  const [onlyDriveThru, setOnlyDriveThru] = useState(false);

  const filteredStores = useMemo(() => {
    return SAMPLE_KFC_STORES.filter((store) => {
      if (onlyHalal && !store.isHalal) return false;
      if (onlyDriveThru && !store.hasDriveThru) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = store.name.toLowerCase().includes(q);
        const matchesCity = store.city.toLowerCase().includes(q);
        const matchesPostcode = store.postalCode.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesPostcode) return false;
      }
      return true;
    });
  }, [searchQuery, onlyHalal, onlyDriveThru]);

  const handleOpenDirections = (store: any) => {
    const query = encodeURIComponent(`${store.name}, ${store.street}, ${store.postalCode}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <BrandThemeProvider theme={KFC_THEME}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#E4002B" />

        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>HALAL KFC UK</Text>
          <Text style={styles.brandSubtitle}>Find 100% Halal Certified KFCs Across the UK</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search town, postcode or branch..."
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <AmenityChip
            label={onlyHalal ? '✓ Halal Only (225 in UK)' : 'All Stores (1,061)'}
            active={onlyHalal}
            onPress={() => setOnlyHalal(!onlyHalal)}
          />
          <AmenityChip
            label="Drive-Thru"
            active={onlyDriveThru}
            onPress={() => setOnlyDriveThru(!onlyDriveThru)}
          />
        </View>

        {/* Results Counter */}
        <View style={styles.resultsBar}>
          <Text style={styles.resultsCount}>
            Showing {filteredStores.length} {onlyHalal ? 'Halal' : ''} KFC restaurants
          </Text>
        </View>

        {/* Store List */}
        <FlatList
          data={filteredStores}
          keyExtractor={(item) => item.storeId}
          renderItem={({ item }) => (
            <RestaurantCard
              name={item.name}
              street={item.street}
              city={item.city}
              postalCode={item.postalCode}
              distanceMiles={item.distanceMiles}
              isHalal={item.isHalal}
              amenitiesList={item.facilities}
              status={item.status}
              onPress={() => handleOpenDirections(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </BrandThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    backgroundColor: '#E4002B',
    paddingVertical: 18,
    paddingHorizontal: 20
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  brandSubtitle: {
    color: '#FFCDD2',
    fontSize: 13,
    marginTop: 4
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE'
  },
  searchInput: {
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A1A'
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF'
  },
  resultsBar: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  resultsCount: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500'
  },
  listContent: {
    paddingBottom: 24
  }
});

