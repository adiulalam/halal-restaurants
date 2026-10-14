import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import type { MobileRestaurantItem } from '@halal-restaurants/types';
import type { Coordinates } from '../location';
import { LONDON_COORDINATES } from '../location';
import { useBrandTheme } from '../theme';
import { Button } from './Button';

let WebViewComponent: any = null;
if (Platform.OS !== 'web') {
  try {
    // Dynamic require prevents bundler issues on Expo Web
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    WebViewComponent = require('react-native-webview').WebView;
  } catch {
    WebViewComponent = null;
  }
}

export interface RestaurantMapViewProps {
  stores: MobileRestaurantItem[];
  userLocation: Coordinates | null;
  isLocating?: boolean;
  onRequestLocation?: () => void;
}

function generateLeafletHtml(
  stores: MobileRestaurantItem[],
  center: Coordinates,
  userLocation: Coordinates | null,
  primaryColor: string
): string {
  const sanitizedStores = stores
    .filter((s) => s.latitude !== null && s.longitude !== null && !isNaN(Number(s.latitude)) && !isNaN(Number(s.longitude)))
    .map((s) => ({
      id: s.id,
      name: s.name,
      lat: Number(s.latitude),
      lng: Number(s.longitude),
      address: [s.street, s.city, s.postalCode].filter(Boolean).join(', '),
      isHalal: s.isHalal,
      amenities: (s.amenitiesList || []).slice(0, 4).join(' • ')
    }));

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background: #E5E7EB;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .restaurant-popup {
      font-size: 13px;
      line-height: 1.4;
      padding: 2px;
    }
    .restaurant-popup h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      font-weight: 700;
      color: #111827;
    }
    .restaurant-popup .halal-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .restaurant-popup .halal-yes {
      background: #15803D;
      color: #ffffff;
    }
    .restaurant-popup .halal-no {
      background: #E5E7EB;
      color: #374151;
    }
    .restaurant-popup p {
      margin: 2px 0;
      color: #4B5563;
      font-size: 12px;
    }
    .restaurant-popup .amenities {
      font-size: 11px;
      color: #6B7280;
      margin-top: 6px;
      border-top: 1px solid #E5E7EB;
      padding-top: 4px;
    }
    .restaurant-popup a.directions-btn {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 8px;
      background: ${primaryColor};
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: true }).setView([${center.latitude}, ${center.longitude}], ${userLocation ? 13 : 11});

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Custom marker styles
    function createPin(color, border, pulse) {
      return L.divIcon({
        className: 'custom-pin',
        html: '<div style="' +
          'width: 24px; height: 24px; border-radius: 50%;' +
          'background-color: ' + color + ';' +
          'border: 2px solid ' + border + ';' +
          'box-shadow: 0 2px 6px rgba(0,0,0,0.3);' +
          (pulse ? 'animation: pulse 1.5s infinite;' : '') +
          '"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });
    }

    const userPin = createPin('#3B82F6', '#FFFFFF', true);
    const halalPin = createPin('#15803D', '#FFFFFF', false);
    const standardPin = createPin('#9CA3AF', '#FFFFFF', false);

    ${
      userLocation
        ? `L.marker([${userLocation.latitude}, ${userLocation.longitude}], { icon: userPin })
            .addTo(map)
            .bindPopup('<b>Your Approximate Location</b>');`
        : ''
    }

    const stores = ${JSON.stringify(sanitizedStores)};

    stores.forEach(store => {
      const pin = store.isHalal ? halalPin : standardPin;
      const marker = L.marker([store.lat, store.lng], { icon: pin }).addTo(map);

      const halalBadge = store.isHalal
        ? '<span class="halal-badge halal-yes">✓ 100% HALAL CERTIFIED</span>'
        : '<span class="halal-badge halal-no">STANDARD STORE</span>';

      const directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + store.lat + ',' + store.lng;

      const content =
        '<div class="restaurant-popup">' +
          '<h4>' + store.name + '</h4>' +
          halalBadge +
          (store.address ? '<p>' + store.address + '</p>' : '') +
          (store.amenities ? '<div class="amenities">' + store.amenities + '</div>' : '') +
          '<a class="directions-btn" href="' + directionsUrl + '" target="_blank" rel="noopener noreferrer">Directions ↗</a>' +
        '</div>';

      marker.bindPopup(content);
    });
  </script>
</body>
</html>`;
}

export function RestaurantMapView({
  stores,
  userLocation,
  isLocating = false,
  onRequestLocation
}: RestaurantMapViewProps): React.JSX.Element {
  const theme = useBrandTheme();
  const effectiveCenter = userLocation || LONDON_COORDINATES;

  const htmlContent = useMemo(() => {
    return generateLeafletHtml(stores, effectiveCenter, userLocation, theme.primaryColor);
  }, [stores, effectiveCenter, userLocation, theme.primaryColor]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {/* Location Status Bar */}
      <View
        style={[
          styles.locationBar,
          {
            backgroundColor: theme.surfaceBackground,
            borderBottomColor: theme.borderColor
          }
        ]}
      >
        <View style={styles.locationInfo}>
          <Text style={[styles.locationTitle, { color: theme.textColor }]}>
            {userLocation ? '📍 Centered near you' : '📍 Centered on London (Default)'}
          </Text>
          <Text style={[styles.locationSubtitle, { color: theme.mutedTextColor }]}>
            {stores.length} restaurants mapped
          </Text>
        </View>

        {!userLocation && onRequestLocation && (
          <Button
            title="Use My Location"
            variant="primary"
            size="sm"
            onPress={onRequestLocation}
            loading={isLocating}
            accessibilityLabel="Use my current location on map"
          />
        )}
      </View>

      {/* Map Viewport */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            srcDoc={htmlContent}
            style={styles.webFrame as any}
            title="Restaurant Map"
          />
        ) : WebViewComponent ? (
          <WebViewComponent
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={styles.nativeFrame}
          />
        ) : (
          <View style={styles.fallbackContainer}>
            <Text style={[styles.fallbackText, { color: theme.mutedTextColor }]}>
              Map is available on Web or with WebView installed.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%'
  },
  locationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  locationInfo: {
    flex: 1
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  locationSubtitle: {
    fontSize: 11,
    marginTop: 1
  },
  mapContainer: {
    flex: 1,
    width: '100%'
  },
  webFrame: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block'
  } as any,
  nativeFrame: {
    flex: 1,
    width: '100%'
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  fallbackText: {
    fontSize: 14
  }
});

