import * as Location from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const LONDON_COORDINATES: Coordinates = {
  latitude: 51.5074,
  longitude: -0.1278
};

/**
 * Request device location with graceful fallback.
 * If permission is denied or location fails, returns null.
 */
export async function requestUserLocation(): Promise<Coordinates | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude
    };
  } catch (err) {
    console.warn('Location request fallback to default:', err);
    return null;
  }
}

/**
 * Calculates straight-line distance in miles using the Haversine formula.
 */
export function calculateDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

