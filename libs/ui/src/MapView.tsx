import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import type { MobileRestaurantItem } from '@halal-restaurants/types';
import type { Coordinates } from './location';
import { LONDON_COORDINATES } from './location';
import { useBrandTheme } from './theme';

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
    .leaflet-popup-content-wrapper {
      border-radius: 10px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.18);
      padding: 4px;
    }
    .leaflet-popup-content {
      margin: 10px 12px;
      line-height: 1.4;
      font-size: 13px;
    }
    .popup-title {
      font-size: 15px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 3px;
    }
    .popup-address {
      font-size: 12px;
      color: #4B5563;
      margin-bottom: 6px;
    }
    .popup-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 5px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.4px;
      margin-bottom: 6px;
    }
    .badge-halal {
      background-color: #15803D;
      color: #FFFFFF;
    }
    .badge-std {
      background-color: #E5E7EB;
      color: #4B5563;
    }
    .popup-amenities {
      font-size: 11px;
      color: #6B7280;
      margin-bottom: 10px;
    }
    .popup-btn {
      display: block;
      text-align: center;
      background-color: ${primaryColor};
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 7px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .custom-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 2px solid #FFFFFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      color: #FFFFFF;
      font-size: 12px;
      font-weight: bold;
    }
    .user-pin {
      width: 18px;
      height: 18px;
      background: #2563EB;
      border-radius: 50%;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.35);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const centerLat = ${center.latitude};
    const centerLng = ${center.longitude};
    const map = L.map('map', { zoomControl: true }).setView([centerLat, centerLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // User location marker
    ${
      userLocation
        ? `
    const userIcon = L.divIcon({
      className: '',
      html: '<div class="user-pin"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    L.marker([${userLocation.latitude}, ${userLocation.longitude}], { icon: userIcon })
      .addTo(map)
      .bindPopup('<div class="popup-title">📍 Your Location</div><div class="popup-address">Showing restaurants near you</div>');
    `
        : ''
    }

    const stores = ${JSON.stringify(sanitizedStores)};
    stores.forEach(s => {
      const pinColor = s.isHalal ? '#15803D' : '${primaryColor}';
      const iconHtml = '<div class="custom-pin" style="background-color:' + pinColor + '; width:26px; height:26px;">' + (s.isHalal ? '✓' : '•') + '</div>';
      const customIcon = L.divIcon({
        className: '',
        html: iconHtml,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -13]
      });

      const marker = L.marker([s.lat, s.lng], { icon: customIcon }).addTo(map);

      const query = encodeURIComponent(s.name + ', ' + s.address);
      const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + query;
      const badgeClass = s.isHalal ? 'badge-halal' : 'badge-std';
      const badgeText = s.isHalal ? '✓ 100% HALAL CERTIFIED' : 'STANDARD';

      const content = '<div class="popup-title">' + s.name + '</div>' +
        '<div class="popup-address">' + s.address + '</div>' +
        '<div class="popup-badge ' + badgeClass + '">' + badgeText + '</div>' +
        (s.amenities ? '<div class="popup-amenities">' + s.amenities + '</div>' : '') +
        '<a class="popup-btn" href="' + mapsUrl + '" target="_blank">📍 Open in Maps</a>';

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
    <View style={styles.container}>
      {/* Location Status Bar */}
      <View style={styles.locationBar}>
        <View style={styles.locationInfo}>
          <Text style={styles.locationTitle}>
            {userLocation ? '📍 Centered near you' : '📍 Centered on London (Default)'}
          </Text>
          <Text style={styles.locationSubtitle}>
            {stores.length} restaurants mapped
          </Text>
        </View>

        {!userLocation && onRequestLocation && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.locateButton, { backgroundColor: theme.primaryColor }]}
            onPress={onRequestLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.locateButtonText}>Use My Location</Text>
            )}
          </TouchableOpacity>
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
            <Text style={styles.fallbackText}>Map is available on Web or with WebView installed.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F3F4F6'
  },
  locationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  locationInfo: {
    flex: 1
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827'
  },
  locationSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1
  },
  locateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  locateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
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
    color: '#6B7280',
    fontSize: 14
  }
});
