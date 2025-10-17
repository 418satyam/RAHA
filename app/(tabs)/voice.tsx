import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VoiceService } from '@/services/voiceService';
import { router } from 'expo-router';

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const insets = useSafeAreaInsets();
  const [conversation, setConversation] = useState<Array<{ type: 'user' | 'assistant', message: string, timestamp: Date }>>([
    {
      type: 'assistant',
      message: 'Hello! I\'m your health assistant. You can ask me about symptoms, first aid, or use voice commands to navigate the app. How can I help you today?',
      timestamp: new Date(),
    }
  ]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleVoiceInput = async () => {
    setIsListening(true);
    try {
      const userInput = await VoiceService.startListening();
      
      // Add user message to conversation
      const userMessage = {
        type: 'user' as const,
        message: userInput,
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, userMessage]);

      // Process the voice command and get response
      const response = VoiceService.processVoiceCommand(userInput);
      
      // Handle navigation commands
      handleNavigationCommands(userInput);
      
      // Add assistant response to conversation
      const assistantMessage = {
        type: 'assistant' as const,
        message: response,
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, assistantMessage]);

      // Speak the response
      speakResponse(response);

    } catch (error) {
      Alert.alert('Error', 'Voice recognition failed. Please try again.');
    } finally {
      setIsListening(false);
    }
  };

  const handleNavigationCommands = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('symptom') || lowerCommand.includes('check')) {
      setTimeout(() => router.push('/(tabs)/symptom-checker'), 1000);
    } else if (lowerCommand.includes('first aid')) {
      setTimeout(() => router.push('/(tabs)/first-aid'), 1000);
    } else if (lowerCommand.includes('reminder') || lowerCommand.includes('medicine')) {
      setTimeout(() => router.push('/(tabs)/reminders'), 1000);
    } else if (lowerCommand.includes('hospital')) {
      setTimeout(() => router.push('/hospitals'), 1000);
    } else if (lowerCommand.includes('dashboard') || lowerCommand.includes('home')) {
      setTimeout(() => router.push('/(tabs)'), 1000);
    }
  };

  const speakResponse = (text: string) => {
    setIsSpeaking(true);
    VoiceService.speak(text);
    // Simulate speaking duration
    setTimeout(() => {
      setIsSpeaking(false);
    }, text.length * 50); // Rough estimate of speaking time
  };

  const stopSpeaking = () => {
    VoiceService.stop();
    setIsSpeaking(false);
  };

  const clearConversation = () => {
    setConversation([
      {
        type: 'assistant',
        message: 'Hello! I\'m your health assistant. How can I help you today?',
        timestamp: new Date(),
      }
    ]);
  };

  const quickCommands = [
    { text: 'Check my symptoms', icon: 'medical' as const },
    { text: 'Show first aid guide', icon: 'medical-outline' as const },
    { text: 'Set medicine reminder', icon: 'alarm' as const },
    { text: 'Find nearby hospitals', icon: 'location' as const },
  ];

  const handleQuickCommand = (command: string) => {
    const userMessage = {
      type: 'user' as const,
      message: command,
      timestamp: new Date(),
    };
    setConversation(prev => [...prev, userMessage]);

    const response = VoiceService.processVoiceCommand(command);
    const assistantMessage = {
      type: 'assistant' as const,
      message: response,
      timestamp: new Date(),
    };
    setConversation(prev => [...prev, assistantMessage]);

    speakResponse(response);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Assistant</Text>
        <Text style={styles.subtitle}>Talk to your health assistant</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearConversation}>
          <Ionicons name="refresh" size={20} color="#7f8c8d" />
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.conversation} 
        contentContainerStyle={[styles.conversationContent, { paddingBottom: 20 }]}
      >
        {conversation.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.type === 'user' ? styles.userMessage : styles.assistantMessage
            ]}
          >
            <View style={styles.messageHeader}>
              <Ionicons
                name={message.type === 'user' ? 'person' : 'medical'}
                size={16}
                color={message.type === 'user' ? '#3498db' : '#e74c3c'}
              />
              <View style={styles.messageHeaderText}>
                <Text style={styles.messageType}>
                  {message.type === 'user' ? 'You' : 'Assistant'}
                </Text>
                <Text style={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
            <Text style={styles.messageText}>{message.message}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.quickCommands}>
        <Text style={styles.quickCommandsTitle}>Quick Commands</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickCommandsScroll}>
          {quickCommands.map((command, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickCommandButton}
              onPress={() => handleQuickCommand(command.text)}
            >
              <Ionicons name={command.icon} size={20} color="#3498db" />
              <Text style={styles.quickCommandText}>{command.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.voiceButton, isListening && styles.listeningButton]}
          onPress={handleVoiceInput}
          disabled={isListening || isSpeaking}
        >
          <Ionicons
            name={isListening ? "radio-button-on" : "mic"}
            size={32}
            color="#ffffff"
          />
          <Text style={styles.voiceButtonText}>
            {isListening ? 'Listening...' : 'Tap to Speak'}
          </Text>
        </TouchableOpacity>

        {isSpeaking && (
          <TouchableOpacity style={styles.stopButton} onPress={stopSpeaking}>
            <Ionicons name="stop" size={24} color="#ffffff" />
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  conversation: {
    flex: 1,
  },
  conversationContent: {
    padding: 20,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: '#3498db',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  messageHeaderText: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  messageType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  messageTime: {
    fontSize: 10,
    color: '#bdc3c7',
    marginLeft: 'auto',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2c3e50',
  },
  quickCommands: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  quickCommandsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  quickCommandsScroll: {
    flexDirection: 'row',
  },
  quickCommandButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickCommandText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '500',
  },
  controls: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 12,
  },
  voiceButton: {
    backgroundColor: '#1abc9c',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listeningButton: {
    backgroundColor: '#e74c3c',
  },
  voiceButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});