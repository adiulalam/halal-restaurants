import React, { useState, useMemo, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  StatusBar,
  Linking,
  Platform,
  ActivityIndicator
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
import type { MobileRestaurantItem } from '@halal-restaurants/types';
import nandosOfflineData from './assets/nandos-offline-data.json';

const queryClient = createAppQueryClient();

function NandosStoreFinderScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyHalal, setOnlyHalal] = useState(true);
  const [onlyOutdoor, setOnlyOutdoor] = useState(false);

  // TanStack Query: instant load from pre-bundled offline JSON, background sync when online
  const { data: stores = [], isLoading } = useRestaurants({
    queryKey: ['nandos-restaurants'],
    offlineData: nandosOfflineData
  });

  // Fast pre-indexed search
  const indexedStores = useMemo(() => {
    return stores.map((s) => ({
      ...s,
      searchIndex: `${s.name} ${s.city || ''} ${s.postalCode || ''}`.toLowerCase(),
      isOutdoor: (s.amenitiesList || []).includes('OUTDOOR_EATING_AREA')
    }));
  }, [stores]);

  const filteredStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return indexedStores.filter((store) => {
      if (onlyHalal && !store.isHalal) return false;
      if (onlyOutdoor && !store.isOutdoor) return false;
      if (q && !store.searchIndex.includes(q)) return false;
      return true;
    });
  }, [indexedStores, searchQuery, onlyHalal, onlyOutdoor]);

  const handleOpenDirections = useCallback((store: MobileRestaurantItem) => {
    const address = [store.name, store.street, store.postalCode].filter(Boolean).join(', ');
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Nando's, ${address}`)}`;
    Linking.openURL(url);
  }, []);

  const totalHalal = useMemo(() => stores.filter((s) => s.isHalal).length, [stores]);

  const renderItem = useCallback(
    ({ item }: { item: MobileRestaurantItem }) => (
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
    ),
    [handleOpenDirections]
  );

  const keyExtractor = useCallback((item: MobileRestaurantItem) => item.id, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#BA1B1D" />

      {/* Main Responsive Wrapper (Max width container for Web, full-bleed on Mobile) */}
      <View style={styles.appContainer}>
        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>HALAL NANDO'S UK</Text>
          <Text style={styles.brandSubtitle}>
            Web & Mobile Ready • TanStack Query • {totalHalal} Verified Halal
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
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Filter Controls */}
        <View style={styles.filterRow}>
          <AmenityChip
            label={onlyHalal ? `✓ Halal Only (${totalHalal})` : `All Stores (${stores.length})`}
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
            Showing {filteredStores.length} {onlyHalal ? 'Halal' : ''} restaurants in the UK
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#BA1B1D" />
          </View>
        ) : (
          <FlatList
            data={filteredStores}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            initialNumToRender={12}
            maxToRenderPerBatch={16}
            windowSize={7}
            removeClippedSubviews={Platform.OS !== 'web'}
          />
        )}
      </View>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDF9'
  },
  appContainer: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 820,
        alignSelf: 'center',
        boxShadow: '0 0 24px rgba(0,0,0,0.06)'
      }
    })
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
    paddingVertical: 11,
    fontSize: 15,
    color: '#1C1917',
    ...Platform.select({
      web: {
        outlineStyle: 'none'
      } as any
    })
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40
  },
  listContent: {
    paddingBottom: 28
  }
});
