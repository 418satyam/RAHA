import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Local type to avoid depending on project types for initial integration
interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  distance?: number; // in km
}

// Helpers
const toRad = (v: number) => (v * Math.PI) / 180;
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const SPEED_KMH = 30; // assumed average urban driving speed
const MAX_MINUTES = 10;
const MAX_DISTANCE_KM = (MAX_MINUTES / 60) * SPEED_KMH; // ~5 km
function minutesFromKm(km: number): number {
  return Math.max(1, Math.round((km / SPEED_KMH) * 60));
}

// Overpass helpers
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
function buildPharmaciesQuery(lat: number, lon: number, radiusMeters: number): string {
  return `
    [out:json][timeout:25];
    (
      node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lon});
      way["amenity"="pharmacy"](around:${radiusMeters},${lat},${lon});
      relation["amenity"="pharmacy"](around:${radiusMeters},${lat},${lon});
    );
    out center tags 50;
  `;
}

function extractAddress(tags: Record<string, any> | undefined): string {
  if (!tags) return 'Address not available';
  const parts: string[] = [];
  const hn = tags['addr:housenumber'];
  const street = tags['addr:street'] || tags['addr:road'];
  const area = tags['addr:suburb'] || tags['addr:neighbourhood'];
  const city = tags['addr:city'] || tags['addr:town'] || tags['addr:village'];
  const state = tags['addr:state'];
  const pc = tags['addr:postcode'];

  const line1 = [hn, street].filter(Boolean).join(' ');
  const line2 = [area, city].filter(Boolean).join(', ');
  const line3 = [state, pc].filter(Boolean).join(' ');
  const addr = [line1, line2, line3].filter(Boolean).join(', ');

  return addr || tags['addr:full'] || 'Address not available';
}

function extractPhone(tags: Record<string, any> | undefined): string | undefined {
  if (!tags) return undefined;
  return tags['contact:phone'] || tags['phone'] || tags['contact:telephone'] || undefined;
}

export default function NearbyPharmacies() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadPharmacies();
  }, []);

  const loadPharmacies = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      let lat: number | null = null;
      let lon: number | null = null;
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        lat = location.coords.latitude;
        lon = location.coords.longitude;
      }

      if (lat != null && lon != null) {
        const radiusMeters = Math.max(500, Math.round(MAX_DISTANCE_KM * 1000));
        const query = buildPharmaciesQuery(lat, lon, radiusMeters);
        const url = `${OVERPASS_URL}?data=${encodeURIComponent(query)}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Overpass error ${resp.status}`);
        const data = await resp.json();
        const elements: any[] = Array.isArray(data?.elements) ? data.elements : [];

        const list: Pharmacy[] = elements
          .map((el) => {
            const id = String(el.id);
            const tags = el.tags || {};
            const name: string = tags.name || 'Pharmacy';
            const latLng = {
              lat: el.lat ?? el.center?.lat,
              lon: el.lon ?? el.center?.lon,
            };
            if (typeof latLng.lat !== 'number' || typeof latLng.lon !== 'number') return null;
            const distance = haversineDistanceKm(lat!, lon!, latLng.lat, latLng.lon);
            const address = extractAddress(tags);
            const phone = extractPhone(tags);
            return {
              id,
              name,
              address,
              phone,
              latitude: latLng.lat,
              longitude: latLng.lon,
              distance,
            } as Pharmacy;
          })
          .filter(Boolean) as Pharmacy[];

        list.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setPharmacies(list);
      } else {
        setPharmacies([]);
      }
    } catch (e) {
      console.error('Error loading pharmacies', e);
      Alert.alert('Error', 'Failed to load nearby pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone?: string) => {
    if (!phone) {
      Alert.alert('No phone available');
      return;
    }
    Alert.alert('Call Pharmacy', `Do you want to call ${phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) },
    ]);
  };

  const handleDirections = (pharmacy: Pharmacy) => {
    const hasCoords = typeof pharmacy.latitude === 'number' && typeof pharmacy.longitude === 'number';
    const destination = hasCoords
      ? `${pharmacy.latitude!.toFixed(6)},${pharmacy.longitude!.toFixed(6)}`
      : encodeURIComponent(pharmacy.address);
    const hasOrigin = !!userLocation;
    const origin = hasOrigin
      ? `${userLocation!.coords.latitude.toFixed(6)},${userLocation!.coords.longitude.toFixed(6)}`
      : '';

    let url: string;
    if (hasCoords) {
      url = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ''}&destination=${destination}&travelmode=driving`;
    } else {
      url = origin
        ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
        : `https://www.google.com/maps/search/?api=1&query=${destination}`;
    }
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="medkit" size={28} color="#2c3e50" />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Nearby Pharmacies</Text>
          <Text style={styles.subtitle}>Find pharmacies within ~10 min drive</Text>
        </View>
      </View>

      {loading ? (
        <View style={[styles.loadingContainer, { paddingBottom: insets.bottom + 40 }]}> 
          <Text>Loading nearby pharmacies...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}
        >
          {userLocation && (
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={16} color="#3498db" />
              <Text style={styles.locationText}>Using your current location</Text>
            </View>
          )}

          <View style={styles.list}>
            {pharmacies.map((p) => (
              <View key={p.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.name}>{p.name}</Text>
                  <Text style={styles.address}>{p.address}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={14} color="#7f8c8d" />
                    <Text style={styles.metaText}>
                      {typeof p.distance === 'number' ? `${p.distance.toFixed(1)} km (~${minutesFromKm(p.distance)} min)` : 'Distance unknown'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity style={[styles.actionButton, styles.callButton]} onPress={() => handleCall(p.phone)}>
                    <Ionicons name="call" size={18} color="#ffffff" />
                    <Text style={styles.actionText}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.directionsButton]} onPress={() => handleDirections(p)}>
                    <Ionicons name="navigate" size={18} color="#ffffff" />
                    <Text style={styles.actionText}>Directions</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {pharmacies.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="alert-circle" size={24} color="#7f8c8d" />
                <Text style={styles.emptyText}>No pharmacies found nearby.</Text>
              </View>
            )}
          </View>

          <View style={styles.disclaimerSection}>
            <Ionicons name="information-circle" size={20} color="#3498db" />
            <View style={styles.disclaimerTextContainer}>
              <Text style={styles.disclaimerText}>
                Data is sourced from OpenStreetMap. For emergencies, contact local services immediately.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerIcon: { marginRight: 12 },
  headerContent: { flex: 1 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#7f8c8d' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  contentContainer: { padding: 20, flexGrow: 1 },
  locationInfo: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f4fd', padding: 12, borderRadius: 8, marginBottom: 20, gap: 8,
  },
  locationText: { fontSize: 14, color: '#2980b9', fontWeight: '500' },
  list: { gap: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: { marginBottom: 16 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  address: { fontSize: 14, color: '#7f8c8d', lineHeight: 20, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#7f8c8d', fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 12 },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, gap: 6,
  },
  callButton: { backgroundColor: '#27ae60' },
  directionsButton: { backgroundColor: '#3498db' },
  actionText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  emptyState: { alignItems: 'center', padding: 20 },
  emptyText: { color: '#7f8c8d', marginTop: 8 },
  disclaimerSection: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#d1ecf1', padding: 16, borderRadius: 8, gap: 8, marginTop: 20,
  },
  disclaimerTextContainer: { flex: 1 },
  disclaimerText: { flex: 1, fontSize: 14, color: '#0c5460', lineHeight: 20, fontStyle: 'italic' },
});
