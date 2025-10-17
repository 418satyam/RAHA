import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FirebaseService } from '@/services/firebase';
import { StorageService } from '@/services/storage';
import { NotificationService } from '@/services/notificationService';
import { MedicineReminder } from '@/types';
import { router } from 'expo-router';

export default function MedicineReminders() {
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notificationIds, setNotificationIds] = useState<{[key: string]: string}>({});
  const insets = useSafeAreaInsets();
  const [newReminder, setNewReminder] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'Daily',
    time: '09:00',
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const user = await StorageService.getUser();
      if (user) {
        const userReminders = await FirebaseService.getMedicineReminders(user.uid);
        setReminders(userReminders as MedicineReminder[]);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.medicineName || !newReminder.dosage) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const user = await StorageService.getUser();
      if (user) {
        const reminder: MedicineReminder = {
          id: Date.now().toString(),
          ...newReminder,
          isActive: true,
          userId: user.uid,
        };

        await FirebaseService.saveMedicineReminder(user.uid, reminder);
        
        // Schedule notification (non-blocking if permissions missing)
        const notificationId = await NotificationService.scheduleMedicineReminder(reminder);
        if (notificationId) {
          setNotificationIds(prev => ({ ...prev, [reminder.id]: notificationId }));
        }
        
        setReminders(prev => [...prev, reminder]);
        setShowAddModal(false);
        setNewReminder({
          medicineName: '',
          dosage: '',
          frequency: 'Daily',
          time: '09:00',
          startDate: new Date().toISOString().split('T')[0],
        });
        Alert.alert('Success', 'Reminder added successfully!');
      } else {
        Alert.alert(
          'Sign in required',
          'Please sign in to save medicine reminders.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Go to sign in', onPress: () => router.replace('/auth') }
          ]
        );
      }
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Failed to add reminder';
      Alert.alert('Error', message);
    }
  };

  const toggleReminder = (id: string) => {
    setReminders(prevReminders => {
      const reminders = prevReminders.map(reminder => {
      if (reminder.id === id) {
        const updatedReminder = { ...reminder, isActive: !reminder.isActive };
        
        // Handle notification scheduling/canceling
        if (updatedReminder.isActive) {
          NotificationService.scheduleMedicineReminder(updatedReminder).then(notificationId => {
            if (notificationId) {
              setNotificationIds(prev => ({ ...prev, [id]: notificationId }));
            }
          });
        } else {
          const notificationId = notificationIds[id];
          if (notificationId) {
            NotificationService.cancelNotification(notificationId);
            setNotificationIds(prev => {
              const newIds = { ...prev };
              delete newIds[id];
              return newIds;
            });
          }
        }
        
        return updatedReminder;
      }
      return reminder;
    });
    return reminders;
  });
  };

  const deleteReminder = (id: string) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Cancel notification if exists
            const notificationId = notificationIds[id];
            if (notificationId) {
              await NotificationService.cancelNotification(notificationId);
              setNotificationIds(prev => {
                const newIds = { ...prev };
                delete newIds[id];
                return newIds;
              });
            }
            setReminders(prev => prev.filter(reminder => reminder.id !== id));
          },
        },
      ]
    );
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'Daily': return '#3498db';
      case 'Twice Daily': return '#9b59b6';
      case 'Three Times Daily': return '#e74c3c';
      case 'Weekly': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text>Loading reminders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Medicine Reminders</Text>
        <Text style={styles.subtitle}>Manage your medication schedule</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
      >
        {reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyTitle}>No Reminders Yet</Text>
            <Text style={styles.emptyText}>
              Add your first medicine reminder to stay on track with your medications
            </Text>
          </View>
        ) : (
          <View style={styles.remindersList}>
            {reminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderInfo}>
                    <Text style={styles.medicineName}>{reminder.medicineName}</Text>
                    <Text style={styles.dosage}>{reminder.dosage}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => toggleReminder(reminder.id)}
                  >
                    <Ionicons
                      name={reminder.isActive ? "checkmark-circle" : "ellipse-outline"}
                      size={24}
                      color={reminder.isActive ? "#27ae60" : "#bdc3c7"}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.reminderDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time" size={16} color="#7f8c8d" />
                    <Text style={styles.detailText}>{reminder.time}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={[
                      styles.frequencyBadge,
                      { backgroundColor: getFrequencyColor(reminder.frequency) + '20' }
                    ]}>
                      <Text style={[
                        styles.frequencyText,
                        { color: getFrequencyColor(reminder.frequency) }
                      ]}>
                        {reminder.frequency}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteReminder(reminder.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, { bottom: insets.bottom + 100 }]}
        onPress={async () => {
          const user = await StorageService.getUser();
          if (user) {
            setShowAddModal(true);
          } else {
            Alert.alert(
              'Sign in required',
              'Please sign in to add reminders.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Go to sign in', onPress: () => router.replace('/auth') }
              ]
            );
          }
        }}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
        <Text style={styles.addButtonText}>Add Reminder</Text>
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Reminder</Text>
            <TouchableOpacity onPress={handleAddReminder}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medicine Name *</Text>
              <TextInput
                style={styles.input}
                value={newReminder.medicineName}
                onChangeText={(text) => setNewReminder({ ...newReminder, medicineName: text })}
                placeholder="Enter medicine name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dosage *</Text>
              <TextInput
                style={styles.input}
                value={newReminder.dosage}
                onChangeText={(text) => setNewReminder({ ...newReminder, dosage: text })}
                placeholder="e.g., 1 tablet, 5ml"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Frequency</Text>
              <View style={styles.frequencyOptions}>
                {['Daily', 'Twice Daily', 'Three Times Daily', 'Weekly'].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyOption,
                      newReminder.frequency === freq && styles.selectedFrequency
                    ]}
                    onPress={() => setNewReminder({ ...newReminder, frequency: freq })}
                  >
                    <Text style={[
                      styles.frequencyOptionText,
                      newReminder.frequency === freq && styles.selectedFrequencyText
                    ]}>
                      {freq}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                value={newReminder.time}
                onChangeText={(text) => setNewReminder({ ...newReminder, time: text })}
                placeholder="HH:MM"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Start Date</Text>
              <TextInput
                style={styles.input}
                value={newReminder.startDate}
                onChangeText={(text) => setNewReminder({ ...newReminder, startDate: text })}
                placeholder="YYYY-MM-DD"
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  remindersList: {
    gap: 16,
  },
  reminderCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  toggleButton: {
    padding: 4,
  },
  reminderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  frequencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#9b59b6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
    color: '#9b59b6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
  frequencyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectedFrequency: {
    backgroundColor: '#9b59b6',
    borderColor: '#9b59b6',
  },
  frequencyOptionText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  selectedFrequencyText: {
    color: '#ffffff',
  },
});