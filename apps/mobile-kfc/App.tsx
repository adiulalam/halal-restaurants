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
  KFC_THEME,
  RestaurantCard,
  AmenityChip,
  createAppQueryClient,
  useRestaurants
} from '@halal-restaurants/ui';
import kfcOfflineData from './assets/kfc-offline-data.json';

const queryClient = createAppQueryClient();

function KfcStoreFinderScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyHalal, setOnlyHalal] = useState(true);
  const [onlyDriveThru, setOnlyDriveThru] = useState(false);

  // TanStack Query: loads bundled offline JSON on first open or offline, and syncs when online
  const { data: stores = [], isLoading } = useRestaurants({
    queryKey: ['kfc-restaurants'],
    offlineData: kfcOfflineData
  });

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      if (onlyHalal && !store.isHalal) return false;
      if (onlyDriveThru) {
        const hasDriveThru = (store.amenitiesList || []).some((a) =>
          a.toLowerCase().includes('drive')
        );
        if (!hasDriveThru) return false;
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
  }, [stores, searchQuery, onlyHalal, onlyDriveThru]);

  const handleOpenDirections = (store: any) => {
    const addressPart = [store.name, store.street, store.postalCode].filter(Boolean).join(', ');
    const query = encodeURIComponent(`KFC, ${addressPart}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const totalHalalInUk = useMemo(() => stores.filter((s) => s.isHalal).length, [stores]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E4002B" />

      {/* Brand Header */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>HALAL KFC UK</Text>
        <Text style={styles.brandSubtitle}>
          Offline-Ready • TanStack Query • {totalHalalInUk} Halal Verified
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search town, postcode or branch (e.g. Bethnal Green, E2 0DJ)..."
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
          label="Drive-Thru"
          active={onlyDriveThru}
          onPress={() => setOnlyDriveThru(!onlyDriveThru)}
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
      <BrandThemeProvider theme={KFC_THEME}>
        <KfcStoreFinderScreen />
      </BrandThemeProvider>
    </QueryClientProvider>
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
