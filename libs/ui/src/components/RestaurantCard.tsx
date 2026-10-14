import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useBrandTheme } from '../theme';
import { Card } from './Card';
import { Typography } from './Typography';
import { Badge } from './Badge';
import { Button } from './Button';
import { HalalBadge } from './HalalBadge';
import { AmenityChip } from './AmenityChip';

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

export const RestaurantCard: React.FC<RestaurantCardProps> = React.memo(
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
    const address = [street, city, postalCode].filter(Boolean).join(', ');

    return (
      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Typography variant="h3">{name}</Typography>
            {address ? (
              <Typography variant="muted" style={styles.addressText}>
                {address}
              </Typography>
            ) : null}
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
            <Badge
              label={status.toUpperCase()}
              variant="default"
              style={styles.statusBadge}
            />
          )}
        </View>

        {amenitiesList.length > 0 && (
          <View style={styles.amenitiesContainer}>
            {displayedAmenities.map((amenity, idx) => (
              <AmenityChip key={idx} label={amenity} />
            ))}
            {hasMore && (
              <Button
                title={expandedAmenities ? 'Show less' : `+${amenitiesList.length - 5} more`}
                variant="chip-action"
                size="sm"
                onPress={() => setExpandedAmenities(!expandedAmenities)}
                accessibilityLabel={expandedAmenities ? 'Show fewer amenities' : 'Show all amenities'}
                style={styles.moreButton}
              />
            )}
          </View>
        )}

        {onOpenMap && (
          <View style={[styles.cardFooter, { borderTopColor: theme.borderColor }]}>
            <Button
              title="Open in Maps"
              icon="📍"
              variant="outline"
              size="sm"
              onPress={onOpenMap}
              accessibilityLabel={`Open directions to ${name} in maps`}
            />
          </View>
        )}
      </Card>
    );
  }
);

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  titleContainer: {
    flex: 1,
    marginRight: 8
  },
  addressText: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16
  },
  distanceContainer: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '700'
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5
  },
  statusBadge: {
    marginLeft: 6
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 3
  },
  moreButton: {
    marginRight: 6,
    marginVertical: 1,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  cardFooter: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
});

