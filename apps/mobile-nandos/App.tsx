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
import { QueryClientProvider } from '@tanstack/react-query';
import {
  BrandThemeProvider,
  NANDOS_THEME,
  RestaurantCard,
  AmenityChip,
  createAppQueryClient,
  useRestaurants
} from '@halal-restaurants/ui';
import nandosOfflineData from './assets/nandos-offline-data.json';

const queryClient = createAppQueryClient();

function NandosStoreFinderScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyHalal, setOnlyHalal] = useState(true);
  const [onlyOutdoor, setOnlyOutdoor] = useState(false);

  // TanStack Query: loads bundled offline JSON on first open or offline, and syncs when online
  const { data: stores = [], isLoading } = useRestaurants({
    queryKey: ['nandos-restaurants'],
    offlineData: nandosOfflineData
  });

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      if (onlyHalal && !store.isHalal) return false;
      if (onlyOutdoor) {
        const hasOutdoor = (store.amenitiesList || []).includes('OUTDOOR_EATING_AREA');
        if (!hasOutdoor) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = store.name.toLowerCase().includes(q);
        const matchesCity = store.city ? store.city.toLowerCase().includes(q) : false;
        const matchesPostcode = store.postalCode ? store.postalCode.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesCity && !matchesPostcode) return false;
      }
      return true;
    });
  }, [stores, searchQuery, onlyHalal, onlyOutdoor]);

  const handleOpenDirections = (store: any) => {
    const addressPart = [store.name, store.street, store.postalCode].filter(Boolean).join(', ');
    const query = encodeURIComponent(`Nando's, ${addressPart}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const totalHalalInUk = useMemo(() => stores.filter((s) => s.isHalal).length, [stores]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#BA1B1D" />

      {/* Brand Header */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>HALAL NANDO'S UK</Text>
        <Text style={styles.brandSubtitle}>
          Offline-Ready • TanStack Query • {totalHalalInUk} Halal Verified
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search town, postcode or branch (e.g. Baker Street, W1U 6RS)..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        <AmenityChip
          label={onlyHalal ? `✓ Halal Only (${totalHalalInUk})` : `All Stores (${stores.length})`}
          active={onlyHalal}
          onPress={() => setOnlyHalal(!onlyHalal)}
        />
        <AmenityChip
          label="Outdoor Seating"
          active={onlyOutdoor}
          onPress={() => setOnlyOutdoor(!onlyOutdoor)}
        />
      </View>

      {/* Results Bar */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsCount}>
          {isLoading
            ? 'Loading store data...'
            : `Showing ${filteredStores.length} ${onlyHalal ? 'Halal' : ''} restaurants`}
        </Text>
      </View>

      {/* Store List */}
      <FlatList
        data={filteredStores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RestaurantCard
            name={item.name}
            street={item.street}
            city={item.city}
            postalCode={item.postalCode}
            distanceMiles={item.distanceMiles}
            isHalal={item.isHalal}
            amenitiesList={item.amenitiesList}
            status={item.status}
            onPress={() => handleOpenDirections(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
        maxToRenderPerBatch={20}
        windowSize={10}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrandThemeProvider theme={NANDOS_THEME}>
        <NandosStoreFinderScreen />
      </BrandThemeProvider>
    </QueryClientProvider>
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
