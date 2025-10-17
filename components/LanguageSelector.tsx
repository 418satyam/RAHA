import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LANGUAGES, Language, TRANSLATIONS } from '@/constants/languages';

interface LanguageSelectorProps {
  onLanguageSelect: (language: Language) => void;
  selectedLanguage?: string;
}

export default function LanguageSelector({ onLanguageSelect, selectedLanguage }: LanguageSelectorProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>
        {(TRANSLATIONS as any)[selectedLanguage || 'en']?.selectLanguage || TRANSLATIONS.en.selectLanguage}
      </Text>
      <Text style={styles.subtitle}>Choose your preferred language for the app</Text>
      
      <View style={styles.languageGrid}>
        {LANGUAGES.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageCard,
              selectedLanguage === language.code && styles.selectedCard
            ]}
            onPress={() => onLanguageSelect(language)}
          >
            <Text style={[
              styles.nativeName,
              selectedLanguage === language.code && styles.selectedText
            ]}>
              {language.nativeName}
            </Text>
            <Text style={[
              styles.englishName,
              selectedLanguage === language.code && styles.selectedSubText
            ]}>
              {language.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  languageGrid: {
    gap: 12,
  },
  languageCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedCard: {
    borderColor: '#3498db',
    backgroundColor: '#ebf3fd',
  },
  nativeName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
  },
  englishName: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  selectedText: {
    color: '#3498db',
  },
  selectedSubText: {
    color: '#2980b9',
  },
});