import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { StorageService } from '@/services/storage';
import { auth } from '@/services/firebaseClient';

export default function IndexScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      // Check if user has selected a language
      const selectedLanguage = await StorageService.getLanguage();
      
      if (!selectedLanguage) {
        // First time user - show language selection
        router.replace('/language-selection');
        return;
      }

      // Check if user is logged in
      const user = await StorageService.getUser();
      
      if (user) {
        // If Firebase Auth is not actually signed in, clear local user and redirect to auth
        if (!auth.currentUser) {
          await StorageService.clearUser();
          router.replace('/auth');
          return;
        }
        // User is logged in - go to dashboard
        router.replace('/(tabs)');
      } else {
        // User not logged in - show auth screen
        router.replace('/auth');
      }
    } catch (error) {
      console.error('Error checking initial route:', error);
      router.replace('/language-selection');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
});