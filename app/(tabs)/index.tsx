import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '@/services/storage';
import { FirebaseService } from '@/services/firebase';
import FeatureCard from '@/components/FeatureCard';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadUserData();
    setGreeting(getGreeting());
  }, []);

  const loadUserData = async () => {
    const userData = await StorageService.getUser();
    setUser(userData);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      // Web Alert with multiple buttons isn't supported; log out directly
      await FirebaseService.signOut();
      await StorageService.clearUser();
      router.replace('/auth');
      return;
    }
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await FirebaseService.signOut();
            await StorageService.clearUser();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const features = [
    {
      title: 'Symptom Checker',
      description: 'Check your symptoms and get health advice',
      icon: 'medical' as const,
      color: '#e74c3c',
      onPress: () => router.push('/(tabs)/symptom-checker'),
    },
    {
      title: 'First Aid Guide',
      description: 'Emergency first aid instructions',
      icon: 'medical-outline' as const,
      color: '#f39c12',
      onPress: () => router.push('/(tabs)/first-aid'),
    },
    {
      title: 'Medicine Reminder',
      description: 'Set and manage medication reminders',
      icon: 'alarm' as const,
      color: '#9b59b6',
      onPress: () => router.push('/(tabs)/reminders'),
    },
    {
      title: 'Voice Assistant',
      description: 'Talk to your health assistant',
      icon: 'mic' as const,
      color: '#1abc9c',
      onPress: () => router.push('/(tabs)/voice'),
    },
    {
      title: 'Nearby Hospitals',
      description: 'Find hospitals and clinics near you',
      icon: 'location' as const,
      color: '#3498db',
      onPress: () => router.push('/hospitals'),
    },
    {
      title: 'Settings',
      description: 'App settings and preferences',
      icon: 'settings' as const,
      color: '#95a5a6',
      onPress: () => router.push('/settings'),
    },
    {
      title: 'Blood Donation',
      description: 'Register as donor and save lives',
      icon: 'heart' as const,
      color: '#e74c3c',
      onPress: () => router.push('/(tabs)/blood-donation'),
    },
  ];

  useEffect(() => {
    // Request notification permissions on app start
    const requestNotificationPermissions = async () => {
      const { NotificationService } = await import('@/services/notificationService');
      await NotificationService.requestPermissions();
    };
    
    requestNotificationPermissions();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
      >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>{greeting}!</Text>
          <Text style={styles.userName}>
            {user?.displayName || user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text style={styles.subtitle}>How can we help you today?</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      <View style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureWrapper}>
            <FeatureCard
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              color={feature.color}
              onPress={feature.onPress}
            />
          </View>
        ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  userName: {
    fontSize: 20,
    color: '#3498db',
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  logoutButton: {
    padding: 8,
  },
  featuresGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureWrapper: {
    width: '47%',
  },
});