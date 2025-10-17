import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Define types locally
interface BloodBank {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  operatingHours: string;
  bloodTypes: string[];
  urgentNeeds: string[];
  latitude?: number;
  longitude?: number;
  distance?: number;
}

// Simple blood donation service
class BloodDonationService {
  static async getNearbyBloodBanks(): Promise<BloodBank[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sampleBloodBanks: BloodBank[] = [
          {
            id: '1',
            name: 'City Blood Bank',
            address: '123 Medical Center Drive, Downtown',
            phone: '+1-555-BLOOD',
            email: 'info@citybloodbank.org',
            operatingHours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-4PM',
            bloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            urgentNeeds: ['O-', 'AB+'],
            distance: 2.1,
          },
          {
            id: '2',
            name: 'Regional Medical Blood Center',
            address: '456 Hospital Avenue, Medical District',
            phone: '+1-555-DONATE',
            email: 'donations@regionalblood.org',
            operatingHours: 'Daily: 7AM-8PM',
            bloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            urgentNeeds: ['O+', 'A-'],
            distance: 3.5,
          },
        ];
        resolve(sampleBloodBanks);
      }, 500);
    });
  }
}

export default function BloodBanks() {
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadBloodBanks();
  }, []);

  const loadBloodBanks = async () => {
    try {
      const banks = await BloodDonationService.getNearbyBloodBanks();
      setBloodBanks(banks);
    } catch (error) {
      console.error('Error loading blood banks:', error);
      Alert.alert('Error', 'Failed to load blood banks');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string, name: string) => {
    Alert.alert(
      'Call Blood Bank',
      `Do you want to call ${name}?`,
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

  const handleDirections = (bloodBank: BloodBank) => {
    if (bloodBank.latitude && bloodBank.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${bloodBank.latitude},${bloodBank.longitude}`;
      Linking.openURL(url);
    } else {
      const encodedAddress = encodeURIComponent(bloodBank.address);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      Linking.openURL(url);
    }
  };

  const getUrgencyColor = (urgentNeeds: string[]) => {
    if (urgentNeeds.length === 0) return '#27ae60';
    if (urgentNeeds.length <= 2) return '#f39c12';
    return '#e74c3c';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading blood banks...</Text>
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
          <Text style={styles.title}>Blood Banks</Text>
          <Text style={styles.subtitle}>Find nearby blood donation centers</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}
      >
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3498db" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Before You Donate</Text>
            <Text style={styles.infoText}>
              Make sure you meet the eligibility criteria and have eaten a good meal. 
              Call ahead to confirm operating hours and availability.
            </Text>
          </View>
        </View>

        <View style={styles.bloodBanksList}>
          {bloodBanks.map((bloodBank) => (
            <View key={bloodBank.id} style={styles.bloodBankCard}>
              <View style={styles.bloodBankHeader}>
                <View style={styles.bloodBankInfo}>
                  <Text style={styles.bloodBankName}>{bloodBank.name}</Text>
                  <Text style={styles.bloodBankAddress}>{bloodBank.address}</Text>
                  <Text style={styles.operatingHours}>{bloodBank.operatingHours}</Text>
                  
                  <View style={styles.bloodBankMeta}>
                    <View style={styles.distanceContainer}>
                      <Ionicons name="location-outline" size={14} color="#7f8c8d" />
                      <Text style={styles.distance}>
                        {bloodBank.distance ? `${bloodBank.distance} km away` : 'Distance unknown'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.urgencyIndicator}>
                  <View style={[
                    styles.urgencyDot,
                    { backgroundColor: getUrgencyColor(bloodBank.urgentNeeds) }
                  ]} />
                </View>
              </View>

              {bloodBank.urgentNeeds.length > 0 && (
                <View style={styles.urgentNeedsSection}>
                  <Text style={styles.urgentNeedsTitle}>Urgent Blood Needs:</Text>
                  <View style={styles.urgentBloodTypes}>
                    {bloodBank.urgentNeeds.map((bloodType, index) => (
                      <View key={index} style={styles.urgentBloodType}>
                        <Text style={styles.urgentBloodTypeText}>{bloodType}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.bloodTypesSection}>
                <Text style={styles.bloodTypesTitle}>Accepted Blood Types:</Text>
                <View style={styles.bloodTypesGrid}>
                  {bloodBank.bloodTypes.map((bloodType, index) => (
                    <View key={index} style={styles.bloodTypeChip}>
                      <Text style={styles.bloodTypeChipText}>{bloodType}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.bloodBankActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.callButton]}
                  onPress={() => handleCall(bloodBank.phone, bloodBank.name)}
                >
                  <Ionicons name="call" size={18} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.directionsButton]}
                  onPress={() => handleDirections(bloodBank)}
                >
                  <Ionicons name="navigate" size={18} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Directions</Text>
                </TouchableOpacity>

                {bloodBank.email && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.emailButton]}
                    onPress={() => Linking.openURL(`mailto:${bloodBank.email}`)}
                  >
                    <Ionicons name="mail" size={18} color="#ffffff" />
                    <Text style={styles.actionButtonText}>Email</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.disclaimerSection}>
          <Ionicons name="warning" size={20} color="#f39c12" />
          <View style={styles.disclaimerTextContainer}>
            <Text style={styles.disclaimerText}>
              Always call ahead to confirm operating hours, availability, and any special requirements. 
              Blood donation eligibility may vary by location and current health guidelines.
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
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e8f4fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2980b9',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#2980b9',
    lineHeight: 20,
  },
  bloodBanksList: {
    gap: 16,
  },
  bloodBankCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
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
  bloodBankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bloodBankInfo: {
    flex: 1,
  },
  bloodBankName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  bloodBankAddress: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 4,
  },
  operatingHours: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
    marginBottom: 8,
  },
  bloodBankMeta: {
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
  urgencyIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgencyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  urgentNeedsSection: {
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  urgentNeedsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 8,
  },
  urgentBloodTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  urgentBloodType: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentBloodTypeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  bloodTypesSection: {
    marginBottom: 16,
  },
  bloodTypesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  bloodTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  bloodTypeChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  bloodTypeChipText: {
    color: '#6c757d',
    fontSize: 12,
    fontWeight: '500',
  },
  bloodBankActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  callButton: {
    backgroundColor: '#27ae60',
  },
  directionsButton: {
    backgroundColor: '#3498db',
  },
  emailButton: {
    backgroundColor: '#9b59b6',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  disclaimerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 20,
  },
  disclaimerTextContainer: {
    flex: 1,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});