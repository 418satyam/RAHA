import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SymptomCheckerService } from '@/services/symptomChecker';
import { VoiceService } from '@/services/voiceService';
import { FirebaseService } from '@/services/firebase';
import { StorageService } from '@/services/storage';

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const insets = useSafeAreaInsets();

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      Alert.alert('Error', 'Please enter your symptoms');
      return;
    }

    setLoading(true);
    const symptomList = symptoms.split(',').map(s => s.trim()).filter(s => s);
    const analysis = SymptomCheckerService.analyzeSymptoms(symptomList);
    setResults(analysis);
    
    // Save to user's symptom history
    try {
      const user = await StorageService.getUser();
      if (user) {
        await FirebaseService.saveSymptomCheck(user.uid, {
          id: Date.now().toString(),
          symptoms: symptomList,
          result: analysis,
          timestamp: new Date().toISOString(),
          userId: user.uid,
        });
      }
    } catch (error) {
      console.error('Error saving symptom check:', error);
    }
    
    setLoading(false);
  };

  const handleVoiceInput = async () => {
    setIsListening(true);
    try {
      const voiceText = await VoiceService.startListening();
      setSymptoms(voiceText);
      
      // Auto-analyze if voice input contains symptoms
      if (voiceText && voiceText.trim()) {
        setTimeout(() => {
          handleAnalyze();
        }, 500);
      }
    } catch (error) {
      Alert.alert('Error', 'Voice recognition failed');
    } finally {
      setIsListening(false);
    }
  };

  const addCommonSymptom = (symptom: string) => {
    if (symptoms) {
      setSymptoms(symptoms + ', ' + symptom);
    } else {
      setSymptoms(symptom);
    }
  };

  const commonSymptoms = SymptomCheckerService.getCommonSymptoms();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
      >
      <View style={styles.header}>
        <Text style={styles.title}>Symptom Checker</Text>
        <Text style={styles.subtitle}>Describe your symptoms to get health advice</Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.label}>Describe your symptoms</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={symptoms}
            onChangeText={setSymptoms}
            placeholder="e.g., headache, fever, cough"
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={[styles.voiceButton, isListening && styles.listeningButton]}
            onPress={handleVoiceInput}
            disabled={isListening}
          >
            <Ionicons 
              name={isListening ? "radio-button-on" : "mic"} 
              size={24} 
              color={isListening ? "#e74c3c" : "#3498db"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.commonSymptomsSection}>
        <Text style={styles.sectionTitle}>Common Symptoms</Text>
        <View style={styles.symptomsGrid}>
          {commonSymptoms.map((symptom, index) => (
            <TouchableOpacity
              key={index}
              style={styles.symptomChip}
              onPress={() => addCommonSymptom(symptom)}
            >
              <Text style={styles.symptomChipText}>{symptom}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.analyzeButton, loading && styles.disabledButton]}
        onPress={handleAnalyze}
        disabled={loading}
      >
        <Text style={styles.analyzeButtonText}>
          {loading ? 'Analyzing...' : 'Analyze Symptoms'}
        </Text>
      </TouchableOpacity>

      {results && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Analysis Results</Text>
          
          {results.results.map((result: any, index: number) => (
            <View key={index} style={styles.resultCard}>
              <Text style={styles.conditionTitle}>{result.condition}</Text>
              
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>Common Causes:</Text>
                {result.commonCauses.map((cause: string, i: number) => (
                  <Text key={i} style={styles.listItem}>• {cause}</Text>
                ))}
              </View>

              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>Recommendations:</Text>
                {result.recommendations.map((rec: string, i: number) => (
                  <Text key={i} style={styles.listItem}>• {rec}</Text>
                ))}
              </View>

              <View style={styles.warningSection}>
                <Ionicons name="warning" size={20} color="#f39c12" />
                <Text style={styles.warningText}>{result.whenToSeekHelp}</Text>
              </View>
            </View>
          ))}

          <View style={styles.disclaimerSection}>
            <Ionicons name="information-circle" size={20} color="#3498db" />
            <Text style={styles.disclaimerText}>{results.disclaimer}</Text>
          </View>
        </View>
      )}
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
  inputSection: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  voiceButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningButton: {
    backgroundColor: '#e74c3c',
  },
  commonSymptomsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  symptomChipText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  analyzeButton: {
    backgroundColor: '#e74c3c',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultsSection: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  conditionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 16,
  },
  resultSection: {
    marginBottom: 16,
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
    lineHeight: 20,
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  disclaimerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#d1ecf1',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  disclaimerTextContainer: {
    flex: 1,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    color: '#0c5460',
    lineHeight: 20,
    fontStyle: 'italic',
  }
});