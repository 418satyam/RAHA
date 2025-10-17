import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FIRST_AID_CATEGORIES } from '@/constants/firstAidData';

export default function FirstAidGuide() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const getIconName = (iconName: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      fire: 'flame',
      droplet: 'water',
      bone: 'fitness',
      'alert-triangle': 'warning',
      heart: 'heart',
      'shield-alert': 'shield-checkmark',
    };
    return iconMap[iconName] || 'medical';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
      >
      <View style={styles.header}>
        <Text style={styles.title}>First Aid Guide</Text>
        <Text style={styles.subtitle}>Emergency first aid instructions for common situations</Text>
      </View>

      <View style={styles.emergencyNotice}>
        <Ionicons name="warning" size={24} color="#e74c3c" />
        <View style={styles.emergencyTextContainer}>
          <Text style={styles.emergencyTitle}>Emergency Notice</Text>
          <Text style={styles.emergencyText}>
            In case of serious emergency, call your local emergency number immediately. 
            This guide is for informational purposes only.
          </Text>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        {FIRST_AID_CATEGORIES.map((category) => (
          <View key={category.id} style={styles.categoryCard}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategory(category.id)}
            >
              <View style={styles.categoryHeaderLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name={getIconName(category.icon)} size={24} color="#e74c3c" />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </View>
              </View>
              <Ionicons
                name={expandedCategory === category.id ? "chevron-up" : "chevron-down"}
                size={24}
                color="#7f8c8d"
              />
            </TouchableOpacity>

            {expandedCategory === category.id && (
              <View style={styles.categoryContent}>
                <Text style={styles.stepsTitle}>Steps to follow:</Text>
                {category.steps.map((step, index) => (
                  <View key={index} style={styles.stepContainer}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.disclaimerSection}>
        <Ionicons name="information-circle" size={20} color="#3498db" />
        <View style={styles.disclaimerTextContainer}>
          <Text style={styles.disclaimerText}>
            This information is for educational purposes only and should not replace professional medical advice. 
            Always seek immediate medical attention for serious injuries or emergencies.
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
  emergencyNotice: {
    backgroundColor: '#fff5f5',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  emergencyTextContainer: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 14,
    color: '#721c24',
    lineHeight: 20,
  },
  categoriesContainer: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  categoryContent: {
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
  },
  disclaimerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#d1ecf1',
    margin: 20,
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
  },
});