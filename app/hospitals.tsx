import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Hospital } from '@/types';
import { HospitalsService } from '@/services/hospitalsService';

// Approximate travel calculation (10 minutes by car ~ 5 km at ~30 km/h)
const SPEED_KMH = 30; // assumed average urban driving speed
const MAX_MINUTES = 10;
const MAX_DISTANCE_KM = (MAX_MINUTES / 60) * SPEED_KMH; // ~5 km

const toRad = (v: number) => (v * Math.PI) / 180;
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

function minutesFromKm(km: number): number {
  return Math.max(1, Math.round((km / SPEED_KMH) * 60));
}

export default function NearbyHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      let lat: number | null = null;
      let lon: number | null = null;
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        lat = location.coords.latitude;
        lon = location.coords.longitude;
      }

      // Use live data from OpenStreetMap Overpass around current location, fallback to ~5km if location missing

      if (lat != null && lon != null) {
        const list = await HospitalsService.getNearbyHospitals(lat, lon, MAX_DISTANCE_KM);
        setHospitals(list);
      } else {
        // If no permission/location, keep list empty and show message via UI
        setHospitals([]);
      }
    } catch (error) {
      console.error('Error loading hospitals:', error);
      Alert.alert('Error', 'Failed to load nearby hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    Alert.alert(
      'Call Hospital',
      `Do you want to call ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${phone}`);
          },
        },
      ]
    );
  };

  const handleDirections = (hospital: Hospital) => {
    const hasCoords = typeof hospital.latitude === 'number' && typeof hospital.longitude === 'number';
    const destination = hasCoords
      ? `${hospital.latitude!.toFixed(6)},${hospital.longitude!.toFixed(6)}`
      : encodeURIComponent(hospital.address);
    const hasOrigin = !!userLocation;
    const origin = hasOrigin
      ? `${userLocation!.coords.latitude.toFixed(6)},${userLocation!.coords.longitude.toFixed(6)}`
      : '';

    let url: string;
    if (hasCoords) {
      url = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ''}&destination=${destination}&travelmode=driving`;
    } else {
      // If we only have address, use query search
      url = origin
        ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
        : `https://www.google.com/maps/search/?api=1&query=${destination}`;
    }
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text>Loading nearby hospitals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Nearby Hospitals</Text>
          <Text style={styles.subtitle}>Find medical facilities near you</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}
      >
        {userLocation && (
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={16} color="#3498db" />
            <Text style={styles.locationText}>
              Showing hospitals within ~10 min drive of your location
            </Text>
          </View>
        )}

        <View style={styles.hospitalsList}>
          {hospitals.map((hospital) => (
            <View key={hospital.id} style={styles.hospitalCard}>
              <View style={styles.hospitalHeader}>
                <View style={styles.hospitalInfo}>
                  <Text style={styles.hospitalName}>{hospital.name}</Text>
                  <Text style={styles.hospitalAddress}>{hospital.address}</Text>
                  <View style={styles.hospitalMeta}>
                    <View style={styles.distanceContainer}>
                      <Ionicons name="location-outline" size={14} color="#7f8c8d" />
                      <Text style={styles.distance}>
                        {typeof hospital.distance === 'number'
                          ? `${hospital.distance.toFixed(1)} km (~${minutesFromKm(hospital.distance)} min) away`
                          : 'Distance unknown'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.hospitalActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.callButton]}
                  onPress={() => handleCall(hospital.phone)}
                >
                  <Ionicons name="call" size={18} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.directionsButton]}
                  onPress={() => handleDirections(hospital)}
                >
                  <Ionicons name="navigate" size={18} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.disclaimerSection}>
          <Ionicons name="information-circle" size={20} color="#3498db" />
          <View style={styles.disclaimerTextContainer}>
            <Text style={styles.disclaimerText}>
              Hospital information is provided for reference only. In case of emergency, 
              contact your local emergency services immediately.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  disclaimerTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#2980b9',
    fontWeight: '500',
  },
  hospitalsList: {
    gap: 16,
  },
  hospitalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  hospitalHeader: {
    marginBottom: 16,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 8,
  },
  hospitalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  hospitalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  callButton: {
    backgroundColor: '#27ae60',
  },
  directionsButton: {
    backgroundColor: '#3498db',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#d1ecf1',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 20,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    color: '#0c5460',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});