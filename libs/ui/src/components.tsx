import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useBrandTheme } from './theme';

export type ViewMode = 'list' | 'map';

export interface ViewModeTabsProps {
  activeTab: ViewMode;
  onTabChange: (tab: ViewMode) => void;
  listCount?: number;
}

export const ViewModeTabs: (props: ViewModeTabsProps) => React.JSX.Element = React.memo(
  function ViewModeTabs({
    activeTab,
    onTabChange,
    listCount
  }: ViewModeTabsProps): React.JSX.Element {
    const theme = useBrandTheme();

    return (
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onTabChange('list')}
          style={[
            styles.tabButton,
            activeTab === 'list' && [styles.activeTabButton, { borderBottomColor: theme.primaryColor }],
            Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'list' && [styles.activeTabText, { color: theme.primaryColor }]
            ]}
          >
            📋 List View {listCount !== undefined ? `(${listCount})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onTabChange('map')}
          style={[
            styles.tabButton,
            activeTab === 'map' && [styles.activeTabButton, { borderBottomColor: theme.primaryColor }],
            Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'map' && [styles.activeTabText, { color: theme.primaryColor }]
            ]}
          >
            🗺️ Map View
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
) as unknown as (props: ViewModeTabsProps) => React.JSX.Element;

export interface HalalBadgeProps {
  label?: string;
  isHalal: boolean;
}

export const HalalBadge: (props: HalalBadgeProps) => React.JSX.Element = React.memo(
  function HalalBadge({
    label = '100% HALAL CERTIFIED',
    isHalal
  }: HalalBadgeProps): React.JSX.Element {
    const theme = useBrandTheme();

    if (!isHalal) {
      return (
        <View style={[styles.badgeBase, styles.nonHalalBadge]}>
          <Text style={styles.nonHalalText}>STANDARD</Text>
        </View>
      );
    }

    return (
      <View style={[styles.badgeBase, { backgroundColor: theme.halalBadgeColor }]}>
        <Text style={[styles.badgeText, { color: theme.halalBadgeTextColor }]}>
          ✓ {label}
        </Text>
      </View>
    );
  }
) as unknown as (props: HalalBadgeProps) => React.JSX.Element;

export interface AmenityChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export const AmenityChip: (props: AmenityChipProps) => React.JSX.Element = React.memo(
  function AmenityChip({
    label,
    active = false,
    onPress
  }: AmenityChipProps): React.JSX.Element {
    const theme = useBrandTheme();

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={!onPress}
        onPress={onPress}
        style={[
          styles.chipBase,
          active && { backgroundColor: theme.primaryColor, borderColor: theme.primaryColor },
          Platform.OS === 'web' && ({ cursor: onPress ? 'pointer' : 'default' } as any)
        ]}
      >
        <Text style={[styles.chipText, active && { color: '#FFFFFF', fontWeight: 'bold' }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }
) as unknown as (props: AmenityChipProps) => React.JSX.Element;

export interface RestaurantCardProps {
  name: string;
  street?: string | null;
  city?: string | null;
  postalCode?: string | null;
  distanceMiles?: number | null;
  isHalal: boolean;
  amenitiesList: string[];
  status?: string | null;
  onOpenMap?: () => void;
}

export const RestaurantCard: (props: RestaurantCardProps) => React.JSX.Element = React.memo(
  function RestaurantCard({
    name,
    street,
    city,
    postalCode,
    distanceMiles,
    isHalal,
    amenitiesList,
    status,
    onOpenMap
  }: RestaurantCardProps): React.JSX.Element {
    const theme = useBrandTheme();
    const [expandedAmenities, setExpandedAmenities] = useState(false);

    const displayedAmenities = expandedAmenities ? amenitiesList : amenitiesList.slice(0, 5);
    const hasMore = amenitiesList.length > 5;

    return (
      <View
        style={[
          styles.cardContainer,
          { backgroundColor: theme.cardBackground }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={[styles.restaurantName, { color: theme.textColor }]}>{name}</Text>
            <Text style={[styles.addressText, { color: theme.mutedTextColor }]}>
              {[street, city, postalCode].filter(Boolean).join(', ')}
            </Text>
          </View>
          {distanceMiles !== undefined && distanceMiles !== null && (
            <View style={[styles.distanceContainer, { borderColor: theme.primaryColor }]}>
              <Text style={[styles.distanceText, { color: theme.primaryColor }]}>
                {distanceMiles} mi
              </Text>
            </View>
          )}
        </View>

        <View style={styles.badgeRow}>
          <HalalBadge isHalal={isHalal} />
          {status && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{status.toUpperCase()}</Text>
            </View>
          )}
        </View>

        {amenitiesList.length > 0 && (
          <View style={styles.amenitiesContainer}>
            {displayedAmenities.map((amenity, idx) => (
              <AmenityChip key={idx} label={amenity} />
            ))}
            {hasMore && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setExpandedAmenities(!expandedAmenities)}
                style={[
                  styles.moreButton,
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
                ]}
              >
                <Text style={[styles.moreButtonText, { color: theme.primaryColor }]}>
                  {expandedAmenities ? 'Show less' : `+${amenitiesList.length - 5} more`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {onOpenMap && (
          <View style={styles.cardFooter}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onOpenMap}
              style={[
                styles.mapButton,
                { borderColor: theme.primaryColor },
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
              ]}
            >
              <Text style={[styles.mapButtonText, { color: theme.primaryColor }]}>
                📍 Open in Maps
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
) as unknown as (props: RestaurantCardProps) => React.JSX.Element;

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent'
  },
  activeTabButton: {
    borderBottomWidth: 3
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280'
  },
  activeTabText: {
    fontWeight: '800'
  },
  badgeBase: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  nonHalalBadge: {
    backgroundColor: '#E5E7EB'
  },
  nonHalalText: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '600'
  },
  chipBase: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginRight: 6,
    marginBottom: 6
  },
  chipText: {
    fontSize: 12,
    color: '#374151'
  },
  cardContainer: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        border: '1px solid #F1F3F5'
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3
      }
    })
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  titleContainer: {
    flex: 1,
    marginRight: 8
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4
  },
  addressText: {
    fontSize: 13,
    lineHeight: 18
  },
  distanceContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700'
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8
  },
  statusBadge: {
    marginLeft: 8,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4F46E5'
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 6
  },
  moreButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 6,
    marginBottom: 6
  },
  moreButtonText: {
    fontSize: 12,
    fontWeight: '700'
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#FFFFFF'
  },
  mapButtonText: {
    fontSize: 13,
    fontWeight: '700'
  }
});
