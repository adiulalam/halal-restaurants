import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  StatusBar,
  Linking
} from 'react-native';
import { BrandThemeProvider, NANDOS_THEME, RestaurantCard, AmenityChip } from '@halal-restaurants/ui';

const SAMPLE_NANDOS_STORES = [
  {
    branchCode: 'N113',
    name: 'Baker Street',
    street: '113, Baker St',
    city: 'Marylebone, London',
    postalCode: 'W1U 6RS',
    isHalal: true,
    hasOutdoorSeating: true,
    hasDisabledAccess: true,
    distanceMiles: 0.5,
    amenities: ['HALAL', 'OUTDOOR_EATING_AREA', 'DISABLED_ACCESS', 'BABY_CHANGING', 'WIFI'],
    status: 'open'
  },
  {
    branchCode: 'N524',
    name: 'Liverpool Street Station',
    street: 'Unit 44, Concourse',
    city: 'London',
    postalCode: 'EC2M 7PY',
    isHalal: true,
    hasOutdoorSeating: false,
    hasDisabledAccess: true,
    distanceMiles: 1.2,
    amenities: ['HALAL', 'DISABLED_ACCESS', 'WIFI', 'COLLECTION'],
    status: 'open'
  },
  {
    branchCode: 'N133',
    name: 'The Brunswick',
    street: 'Unit 19, The Brunswick',
    city: 'Bloomsbury, London',
    postalCode: 'WC1N 1BS',
    isHalal: true,
    hasOutdoorSeating: true,
    hasDisabledAccess: true,
    distanceMiles: 1.4,
    amenities: ['HALAL', 'OUTDOOR_EATING_AREA', 'CINEMA', 'WIFI'],
    status: 'open'
  },
  {
    branchCode: 'N042',
    name: 'Covent Garden',
    street: '66-68 St Martins Lane',
    city: 'London',
    postalCode: 'WC2N 4JS',
    isHalal: false,
    hasOutdoorSeating: false,
    hasDisabledAccess: true,
    distanceMiles: 1.1,
    amenities: ['DISABLED_ACCESS', 'BABY_CHANGING', 'WIFI', 'DELIVERY'],
    status: 'open'
  },
  {
    branchCode: 'N380',
    name: 'Colindale',
    street: 'Unit 2, Beaufort Park',
    city: 'Colindale, London',
    postalCode: 'NW9 5JN',
    isHalal: true,
    hasOutdoorSeating: true,
    hasDisabledAccess: true,
    distanceMiles: 5.8,
    amenities: ['HALAL', 'OUTDOOR_EATING_AREA', 'DISABLED_ACCESS', 'WIFI'],
    status: 'open'
  }
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyHalal, setOnlyHalal] = useState(true);
  const [onlyOutdoor, setOnlyOutdoor] = useState(false);

  const filteredStores = useMemo(() => {
    return SAMPLE_NANDOS_STORES.filter((store) => {
      if (onlyHalal && !store.isHalal) return false;
      if (onlyOutdoor && !store.hasOutdoorSeating) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = store.name.toLowerCase().includes(q);
        const matchesCity = store.city.toLowerCase().includes(q);
        const matchesPostcode = store.postalCode.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesPostcode) return false;
      }
      return true;
    });
  }, [searchQuery, onlyHalal, onlyOutdoor]);

  const handleOpenDirections = (store: any) => {
    const query = encodeURIComponent(`Nando's ${store.name}, ${store.street}, ${store.postalCode}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <BrandThemeProvider theme={NANDOS_THEME}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#BA1B1D" />

        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>HALAL NANDO'S UK</Text>
          <Text style={styles.brandSubtitle}>Find 100% Halal Certified Nando's Across the UK</Text>
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
            label={onlyHalal ? '✓ Halal Only (107 in UK)' : 'All Stores (490)'}
            active={onlyHalal}
            onPress={() => setOnlyHalal(!onlyHalal)}
          />
          <AmenityChip
            label="Outdoor Seating"
            active={onlyOutdoor}
            onPress={() => setOnlyOutdoor(!onlyOutdoor)}
          />
        </View>

        {/* Results Counter */}
        <View style={styles.resultsBar}>
          <Text style={styles.resultsCount}>
            Showing {filteredStores.length} {onlyHalal ? 'Halal' : ''} Nando's restaurants
          </Text>
        </View>

        {/* Store List */}
        <FlatList
          data={filteredStores}
          keyExtractor={(item) => item.branchCode}
          renderItem={({ item }) => (
            <RestaurantCard
              name={item.name}
              street={item.street}
              city={item.city}
              postalCode={item.postalCode}
              distanceMiles={item.distanceMiles}
              isHalal={item.isHalal}
              amenitiesList={item.amenities}
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
    backgroundColor: '#FFFDF9'
  },
  header: {
    backgroundColor: '#BA1B1D',
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
    color: '#FED7AA',
    fontSize: 13,
    marginTop: 4
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3E8E2'
  },
  searchInput: {
    backgroundColor: '#FBF7F5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1C1917'
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
    color: '#78716C',
    fontWeight: '500'
  },
  listContent: {
    paddingBottom: 24
  }
});

