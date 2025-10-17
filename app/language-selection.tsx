import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StorageService } from '@/services/storage';
import LanguageSelector from '@/components/LanguageSelector';
import { Language } from '@/constants/languages';

export default function LanguageSelectionScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const insets = useSafeAreaInsets();

  const handleLanguageSelect = async (language: Language) => {
    setSelectedLanguage(language.code);
  };

  const handleContinue = async () => {
    if (selectedLanguage) {
      await StorageService.setLanguage(selectedLanguage);
      router.replace('/auth');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LanguageSelector
        onLanguageSelect={handleLanguageSelect}
        selectedLanguage={selectedLanguage}
      />
      
      {selectedLanguage && (
        <TouchableOpacity 
          style={[styles.continueButton, { marginBottom: Math.max(insets.bottom, 20) }]} 
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  continueButton: {
    backgroundColor: '#3498db',
    margin: 20,
    padding: 16,
    borderRadius: 12,
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
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});