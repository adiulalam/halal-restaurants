import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useBrandTheme } from './theme';

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
  onPress?: () => void;
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
    onPress
  }: RestaurantCardProps): React.JSX.Element {
    const theme = useBrandTheme();

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[
          styles.cardContainer,
          { backgroundColor: theme.cardBackground },
          Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'transform 0.15s ease' } as any)
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
            {amenitiesList.slice(0, 5).map((amenity, idx) => (
              <AmenityChip key={idx} label={amenity} />
            ))}
            {amenitiesList.length > 5 && (
              <Text style={[styles.moreText, { color: theme.mutedTextColor }]}>
                +{amenitiesList.length - 5} more
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }
) as unknown as (props: RestaurantCardProps) => React.JSX.Element;

const styles = StyleSheet.create({
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
  moreText: {
    fontSize: 11,
    marginLeft: 4
  }
});
