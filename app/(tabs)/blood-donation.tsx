import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '@/services/storage';
import { router } from 'expo-router';
import { db } from '@/services/firebaseClient';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

// Define types locally to avoid import issues
interface BloodDonor {
  id: string;
  userId: string;
  name: string;
  bloodType: string;
  age: number;
  weight: number;
  phone: string;
  email: string;
  address: string;
  lastDonationDate?: string;
  isEligible: boolean;
  medicalConditions: string[];
  emergencyContact: {
    name: string;
    phone: string;
  };
  createdAt: string;
}

interface BloodDonation {
  id: string;
  donorId: string;
  donationDate: string;
  bloodBankId: string;
  bloodBankName: string;
  donationType: 'whole_blood' | 'plasma' | 'platelets' | 'red_cells';
  volume: number;
  notes?: string;
  nextEligibleDate: string;
}

// Simple blood donation service
class BloodDonationService {
  static async registerDonor(donor: BloodDonor): Promise<void> {
    const donorRef = doc(db, 'donors', donor.userId);
    await setDoc(
      donorRef,
      {
        ...donor,
        id: donor.userId,
        createdAtServer: serverTimestamp(),
      },
      { merge: true }
    );
  }

  static async getDonorProfile(userId: string): Promise<BloodDonor | null> {
    const snap = await getDoc(doc(db, 'donors', userId));
    if (!snap.exists()) return null;
    const data: any = snap.data();
    return {
      ...data,
      id: data.id || userId,
      createdAt:
        data.createdAt ||
        (data.createdAtServer?.toDate
          ? data.createdAtServer.toDate().toISOString()
          : new Date().toISOString()),
    } as BloodDonor;
  }

  static async getDonationHistory(userId: string): Promise<BloodDonation[]> {
    const q = query(collection(db, 'donations'), where('donorId', '==', userId));
    const snap = await getDocs(q);
    const items: BloodDonation[] = [];
    snap.forEach((docSnap) => {
      const d: any = docSnap.data();
      items.push({
        id: docSnap.id,
        donorId: d.donorId,
        donationDate:
          d.donationDate?.toDate?.() instanceof Date
            ? d.donationDate.toDate().toISOString()
            : d.donationDate || new Date().toISOString(),
        bloodBankId: d.bloodBankId,
        bloodBankName: d.bloodBankName,
        donationType: d.donationType,
        volume: d.volume,
        notes: d.notes,
        nextEligibleDate: d.nextEligibleDate || '',
      });
    });
    items.sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime());
    return items;
  }

  static checkEligibility(age: number, weight: number, medicalConditions: string[]): boolean {
    if (age < 18 || age > 65) return false;
    if (weight < 50) return false;
    return medicalConditions.length === 0;
  }
}

export default function BloodDonation() {
  const [donor, setDonor] = useState<BloodDonor | null>(null);
  const [donations, setDonations] = useState<BloodDonation[]>([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const [registrationData, setRegistrationData] = useState({
    name: '',
    bloodType: 'A+',
    age: '',
    weight: '',
    phone: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: [] as string[],
  });

  useEffect(() => {
    loadDonorData();
  }, []);

  const loadDonorData = async () => {
    try {
      const user = await StorageService.getUser();
      if (user) {
        const donorData = await BloodDonationService.getDonorProfile(user.uid);
        const donationHistory = await BloodDonationService.getDonationHistory(user.uid);
        
        setDonor(donorData);
        setDonations(donationHistory);
      }
    } catch (error) {
      console.error('Error loading donor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDonor = async () => {
    if (!registrationData.name || !registrationData.age || !registrationData.weight || !registrationData.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const user = await StorageService.getUser();
      if (user) {
        const newDonor: BloodDonor = {
          id: user.uid,
          userId: user.uid,
          name: registrationData.name,
          bloodType: registrationData.bloodType,
          age: parseInt(registrationData.age),
          weight: parseFloat(registrationData.weight),
          phone: registrationData.phone,
          email: registrationData.email,
          address: registrationData.address,
          isEligible: BloodDonationService.checkEligibility(
            parseInt(registrationData.age),
            parseFloat(registrationData.weight),
            registrationData.medicalConditions
          ),
          medicalConditions: registrationData.medicalConditions,
          emergencyContact: {
            name: registrationData.emergencyContactName,
            phone: registrationData.emergencyContactPhone,
          },
          createdAt: new Date().toISOString(),
        };

        await BloodDonationService.registerDonor(newDonor);
        setDonor(newDonor);
        setShowRegistrationModal(false);
        Alert.alert('Success', 'You have been registered as a blood donor!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to register as donor');
    }
  };

  const getNextEligibleDate = () => {
    if (!donor?.lastDonationDate) return 'Eligible now';
    
    const lastDonation = new Date(donor.lastDonationDate);
    const nextEligible = new Date(lastDonation);
    nextEligible.setDate(nextEligible.getDate() + 56); // 8 weeks
    
    const now = new Date();
    if (now >= nextEligible) return 'Eligible now';
    
    return `Eligible on ${nextEligible.toLocaleDateString()}`;
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading donor information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Blood Donation</Text>
          <Text style={styles.subtitle}>Save lives by donating blood</Text>
        </View>

        {!donor ? (
          <View style={styles.registrationPrompt}>
            <View style={styles.heroSection}>
              <Ionicons name="heart" size={64} color="#e74c3c" />
              <Text style={styles.heroTitle}>Become a Life Saver</Text>
              <Text style={styles.heroText}>
                Register as a blood donor and help save lives in your community. 
                One donation can save up to three lives.
              </Text>
            </View>

            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>Why Donate Blood?</Text>
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Ionicons name="heart-outline" size={20} color="#e74c3c" />
                  <Text style={styles.benefitText}>Save up to 3 lives with one donation</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="medical-outline" size={20} color="#e74c3c" />
                  <Text style={styles.benefitText}>Free health checkup before donation</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="people-outline" size={20} color="#e74c3c" />
                  <Text style={styles.benefitText}>Help your community in emergencies</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="fitness-outline" size={20} color="#e74c3c" />
                  <Text style={styles.benefitText}>Health benefits for regular donors</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => setShowRegistrationModal(true)}
            >
              <Ionicons name="person-add" size={20} color="#ffffff" />
              <Text style={styles.registerButtonText}>Register as Donor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: '#3498db', marginTop: 12 }]}
              onPress={() => router.push('/blood-banks')}
            >
              <Ionicons name="location" size={20} color="#ffffff" />
              <Text style={styles.registerButtonText}>Find Blood Banks</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.donorDashboard}>
            <View style={styles.donorCard}>
              <View style={styles.donorHeader}>
                <View style={styles.bloodTypeIcon}>
                  <Text style={styles.bloodTypeText}>{donor.bloodType}</Text>
                </View>
                <View style={styles.donorInfo}>
                  <Text style={styles.donorName}>{donor.name}</Text>
                  <Text style={styles.donorDetails}>
                    {donor.age} years • {donor.weight} kg
                  </Text>
                  <View style={styles.eligibilityBadge}>
                    <Ionicons 
                      name={donor.isEligible ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={donor.isEligible ? "#27ae60" : "#e74c3c"} 
                    />
                    <Text style={[
                      styles.eligibilityText,
                      { color: donor.isEligible ? "#27ae60" : "#e74c3c" }
                    ]}>
                      {donor.isEligible ? "Eligible to Donate" : "Not Eligible"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.nextDonationSection}>
                <Text style={styles.nextDonationLabel}>Next Eligible Date:</Text>
                <Text style={styles.nextDonationDate}>{getNextEligibleDate()}</Text>
              </View>
            </View>

            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push('/blood-banks')}
              >
                <Ionicons name="location" size={32} color="#3498db" />
                <Text style={styles.actionTitle}>Find Blood Banks</Text>
                <Text style={styles.actionDescription}>Locate nearby blood banks</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push('/donation-history')}
              >
                <Ionicons name="calendar" size={32} color="#9b59b6" />
                <Text style={styles.actionTitle}>Donation History</Text>
                <Text style={styles.actionDescription}>View your donations</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push('/blood-requests')}
              >
                <Ionicons name="notifications" size={32} color="#e74c3c" />
                <Text style={styles.actionTitle}>Blood Requests</Text>
                <Text style={styles.actionDescription}>Urgent blood needs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push('/donation-tips')}
              >
                <Ionicons name="information-circle" size={32} color="#f39c12" />
                <Text style={styles.actionTitle}>Donation Tips</Text>
                <Text style={styles.actionDescription}>Preparation guidelines</Text>
              </TouchableOpacity>
            </View>

            {donations.length > 0 && (
              <View style={styles.recentDonationsSection}>
                <Text style={styles.sectionTitle}>Recent Donations</Text>
                {donations.slice(0, 3).map((donation) => (
                  <View key={donation.id} style={styles.donationItem}>
                    <View style={styles.donationInfo}>
                      <Text style={styles.donationDate}>
                        {new Date(donation.donationDate).toLocaleDateString()}
                      </Text>
                      <Text style={styles.donationLocation}>{donation.bloodBankName}</Text>
                    </View>
                    <View style={styles.donationDetails}>
                      <Text style={styles.donationType}>{donation.donationType.replace('_', ' ')}</Text>
                      <Text style={styles.donationVolume}>{donation.volume}ml</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Registration Modal */}
      <Modal
        visible={showRegistrationModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowRegistrationModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Register as Donor</Text>
            <TouchableOpacity onPress={handleRegisterDonor}>
              <Text style={styles.saveButton}>Register</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={registrationData.name}
                onChangeText={(text) => setRegistrationData({ ...registrationData, name: text })}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Blood Type *</Text>
              <View style={styles.bloodTypeGrid}>
                {bloodTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.bloodTypeOption,
                      registrationData.bloodType === type && styles.selectedBloodType
                    ]}
                    onPress={() => setRegistrationData({ ...registrationData, bloodType: type })}
                  >
                    <Text style={[
                      styles.bloodTypeOptionText,
                      registrationData.bloodType === type && styles.selectedBloodTypeText
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Age *</Text>
                <TextInput
                  style={styles.input}
                  value={registrationData.age}
                  onChangeText={(text) => setRegistrationData({ ...registrationData, age: text })}
                  placeholder="Age"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Weight (kg) *</Text>
                <TextInput
                  style={styles.input}
                  value={registrationData.weight}
                  onChangeText={(text) => setRegistrationData({ ...registrationData, weight: text })}
                  placeholder="Weight"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={registrationData.phone}
                onChangeText={(text) => setRegistrationData({ ...registrationData, phone: text })}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={registrationData.email}
                onChangeText={(text) => setRegistrationData({ ...registrationData, email: text })}
                placeholder="Enter email address"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={registrationData.address}
                onChangeText={(text) => setRegistrationData({ ...registrationData, address: text })}
                placeholder="Enter your address"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Emergency Contact Name</Text>
              <TextInput
                style={styles.input}
                value={registrationData.emergencyContactName}
                onChangeText={(text) => setRegistrationData({ ...registrationData, emergencyContactName: text })}
                placeholder="Emergency contact name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Emergency Contact Phone</Text>
              <TextInput
                style={styles.input}
                value={registrationData.emergencyContactPhone}
                onChangeText={(text) => setRegistrationData({ ...registrationData, emergencyContactPhone: text })}
                placeholder="Emergency contact phone"
                keyboardType="phone-pad"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  registrationPrompt: {
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 12,
  },
  heroText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#34495e',
    flex: 1,
  },
  registerButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  donorDashboard: {
    padding: 20,
  },
  donorCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  donorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  bloodTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodTypeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  donorInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  donorDetails: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  eligibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eligibilityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nextDonationSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  nextDonationLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  nextDonationDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  recentDonationsSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  donationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  donationInfo: {
    flex: 1,
  },
  donationDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  donationLocation: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  donationDetails: {
    alignItems: 'flex-end',
  },
  donationType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 2,
  },
  donationVolume: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  cancelButton: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  saveButton: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  bloodTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodTypeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectedBloodType: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  bloodTypeOptionText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  selectedBloodTypeText: {
    color: '#ffffff',
  },
});