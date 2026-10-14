import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ScrollView,
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
  KFC_THEME,
  RestaurantCard,
  AmenityChip,
  ViewModeTabs,
  RestaurantMapView,
  requestUserLocation,
  calculateDistanceMiles,
  LONDON_COORDINATES,
  createAppQueryClient,
  useRestaurants,
  type ViewMode,
  type Coordinates
} from '@halal-restaurants/ui';
import { fetchKfcMobileRestaurants } from '@halal-restaurants/scrapers';
import { registerRootComponent } from 'expo';
import type { MobileRestaurantItem } from '@halal-restaurants/types';
import kfcOfflineData from './assets/kfc-offline-data.json';

const queryClient = createAppQueryClient();

function KfcStoreFinderScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  // Requirement: Halal only is NOT pre-selected by default, but is the first amenity filter
  const [onlyHalal, setOnlyHalal] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  // Requirement: Default to list view, support map view tab
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const hasPromptedLocationRef = useRef(false);

  // TanStack Query: instant load from pre-bundled offline JSON, background live fetch directly from KFC
  const { data: rawStores = [], isLoading, isFetching, refetch } = useRestaurants({
    queryKey: ['kfc-restaurants'],
    offlineData: kfcOfflineData,
    fetcher: fetchKfcMobileRestaurants
  });

  // Calculate distance from user location (or London fallback)
  const storesWithDistance = useMemo(() => {
    const origin = userLocation || LONDON_COORDINATES;
    return rawStores.map((s) => {
      let distanceMiles = s.distanceMiles;
      if (s.latitude && s.longitude) {
        distanceMiles = calculateDistanceMiles(
          origin.latitude,
          origin.longitude,
          Number(s.latitude),
          Number(s.longitude)
        );
      }
      return {
        ...s,
        distanceMiles,
        searchIndex: `${s.name} ${s.city || ''} ${s.postalCode || ''}`.toLowerCase()
      };
    });
  }, [rawStores, userLocation]);

  // Requirement: Show all amenities on the filters dynamically
  const allAmenities = useMemo(() => {
    const set = new Set<string>();
    rawStores.forEach((store) => {
      (store.amenitiesList || []).forEach((amenity) => {
        if (amenity && amenity.trim() && !amenity.toLowerCase().includes('halal')) {
          set.add(amenity.trim());
        }
      });
    });
    return Array.from(set).sort();
  }, [rawStores]);

  const totalHalal = useMemo(() => rawStores.filter((s) => s.isHalal).length, [rawStores]);

  // Filter stores according to search query, Halal toggle, and selected amenities
  const filteredStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return storesWithDistance.filter((store) => {
      if (onlyHalal && !store.isHalal) return false;
      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every((sel) =>
          store.amenitiesList.some((a) => a.toLowerCase() === sel.toLowerCase())
        );
        if (!hasAllAmenities) return false;
      }
      if (q && !store.searchIndex.includes(q)) return false;
      return true;
    });
  }, [storesWithDistance, searchQuery, onlyHalal, selectedAmenities]);

  // Request location with fallback to London
  const handleRequestLocation = useCallback(async () => {
    setIsLocating(true);
    const coords = await requestUserLocation();
    if (coords) {
      setUserLocation(coords);
    }
    setIsLocating(false);
  }, []);

  // When clicking map view, ask for permission; if denied, default to London
  const handleTabChange = useCallback(
    async (tab: ViewMode) => {
      setViewMode(tab);
      if (tab === 'map' && !userLocation && !hasPromptedLocationRef.current) {
        hasPromptedLocationRef.current = true;
        await handleRequestLocation();
      }
    },
    [userLocation, handleRequestLocation]
  );

  const toggleAmenity = useCallback((amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  }, []);

  // Open in default maps app (Directions button)
  const handleOpenDirections = useCallback((store: MobileRestaurantItem) => {
    const address = [store.name, store.street, store.city, store.postalCode].filter(Boolean).join(', ');
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`KFC, ${address}`)}`;
    Linking.openURL(url);
  }, []);

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
        onOpenMap={() => handleOpenDirections(item)}
      />
    ),
    [handleOpenDirections]
  );

  const keyExtractor = useCallback((item: MobileRestaurantItem) => item.id, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#E4002B" />

      {/* Main Responsive Container */}
      <View style={styles.appContainer}>
        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>HALAL KFC UK</Text>
          <Text style={styles.brandSubtitle}>
            {isFetching ? '⚡ Fetching latest stores from KFC...' : `Offline-Ready • ${totalHalal} Verified Halal`}
          </Text>
        </View>

        {/* View Mode Tabs: List View & Map View */}
        <ViewModeTabs
          activeTab={viewMode}
          onTabChange={handleTabChange}
          listCount={filteredStores.length}
        />

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search town, postcode or branch (e.g. Bethnal Green, E2 0DJ)..."
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Dynamic Amenities Filter Row: Halal is first, followed by all amenities */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {/* First amenity: Halal Only (not pre-selected) */}
            <AmenityChip
              label={onlyHalal ? `✓ Halal Only (${totalHalal})` : `Halal Only (${totalHalal})`}
              active={onlyHalal}
              onPress={() => setOnlyHalal(!onlyHalal)}
            />

            {/* All remaining amenities dynamically shown */}
            {allAmenities.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity);
              return (
                <AmenityChip
                  key={amenity}
                  label={isSelected ? `✓ ${amenity}` : amenity}
                  active={isSelected}
                  onPress={() => toggleAmenity(amenity)}
                />
              );
            })}
          </ScrollView>
        </View>

        {/* Results Counter */}
        <View style={styles.resultsBar}>
          <Text style={styles.resultsCount}>
            Showing {filteredStores.length} {onlyHalal ? 'Halal' : ''} restaurants in the UK
            {selectedAmenities.length > 0 ? ` (filtered by ${selectedAmenities.length} amenities)` : ''}
          </Text>
        </View>

        {/* Content View: List or Map */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E4002B" />
          </View>
        ) : viewMode === 'map' ? (
          <RestaurantMapView
            stores={filteredStores}
            userLocation={userLocation}
            isLocating={isLocating}
            onRequestLocation={handleRequestLocation}
          />
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
            refreshing={isFetching}
            onRefresh={refetch}
          />
        )}
      </View>
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

registerRootComponent(App);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  appContainer: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 860,
        alignSelf: 'center',
        boxShadow: '0 0 24px rgba(0,0,0,0.06)'
      }
    })
  },
  header: {
    backgroundColor: '#E4002B',
    paddingVertical: 16,
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
    marginTop: 3
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE'
  },
  searchInput: {
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
    ...Platform.select({
      web: {
        outlineStyle: 'none'
      } as any
    })
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE'
  },
  filterScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10
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
