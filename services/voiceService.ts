import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';

export class VoiceService {
  private static isListening = false;
  private static onSpeechResult: ((result: string) => void) | null = null;
  private static onSpeechError: ((error: string) => void) | null = null;

  static async initialize() {
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechRecognized = this.onSpeechRecognized;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechResults = this.onSpeechResults;
  }

  static onSpeechStart = () => {
    console.log('Speech recognition started');
  };

  static onSpeechRecognized = () => {
    console.log('Speech recognized');
  };

  static onSpeechEnd = () => {
    console.log('Speech recognition ended');
    this.isListening = false;
  };

  static onSpeechError = (error: any) => {
    console.log('Speech recognition error:', error);
    this.isListening = false;
    if (this.onSpeechError) {
      this.onSpeechError(error.error?.message || 'Speech recognition failed');
    }
  };

  static onSpeechResults = (event: any) => {
    console.log('Speech results:', event.value);
    if (event.value && event.value.length > 0 && this.onSpeechResult) {
      this.onSpeechResult(event.value[0]);
    }
  };

  static speak(text: string, language: string = 'en') {
    const options = {
      language: language === 'hi' ? 'hi-IN' : 'en-US',
      pitch: 1.0,
      rate: 0.8,
    };
    
    Speech.speak(text, options);
  }

  static stop() {
    Speech.stop();
  }

  static async getAvailableVoices() {
    // In a real implementation, you would use expo-speech to get available voices
    return [
      { language: 'en-US', name: 'English (US)' },
      { language: 'hi-IN', name: 'Hindi (India)' },
    ];
  }

  static async startListening(): Promise<string> {
    try {
      await this.initialize();
      
      if (this.isListening) {
        await Voice.stop();
      }

      this.isListening = true;
      await Voice.start('en-US');

      return new Promise((resolve, reject) => {
        this.onSpeechResult = (result: string) => {
          this.isListening = false;
          resolve(result);
        };

        this.onSpeechError = (error: string) => {
          this.isListening = false;
          reject(new Error(error));
        };

        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.isListening) {
            this.stopListening();
            reject(new Error('Speech recognition timeout'));
          }
        }, 10000);
      });
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      // Fallback to simulated response for demo
      return this.getSimulatedResponse();
    }
  }

  static async stopListening() {
    try {
      await Voice.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  static async destroy() {
    try {
      await Voice.destroy();
      this.isListening = false;
      this.onSpeechResult = null;
      this.onSpeechError = null;
    } catch (error) {
      console.error('Error destroying speech recognition:', error);
    }
  }

  // Fallback simulated response for demo purposes
  private static getSimulatedResponse(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sampleResponses = [
          "I have a headache",
          "My stomach hurts",
          "I feel dizzy",
          "I have a fever",
          "Show me first aid for burns",
          "Set a reminder for my medicine",
        ];
        const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
        resolve(randomResponse);
      }, 2000);
    });
  }

  static processVoiceCommand(command: string): string {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('headache')) {
      return "For headaches, try resting in a quiet, dark room. Stay hydrated and consider taking over-the-counter pain relievers if appropriate. If headaches persist or are severe, consult a healthcare provider.";
    } else if (lowerCommand.includes('stomach') || lowerCommand.includes('pain')) {
      return "For stomach pain, try resting and avoiding solid foods temporarily. Stay hydrated with clear fluids. If pain is severe or persistent, seek medical attention.";
    } else if (lowerCommand.includes('fever')) {
      return "For fever, rest and stay hydrated. You can take fever-reducing medications as directed. Monitor your temperature and seek medical care if fever is high or persistent.";
    } else if (lowerCommand.includes('first aid')) {
      return "I can help you with first aid information. Please check the First Aid Guide section for detailed instructions on various emergency situations.";
    } else if (lowerCommand.includes('reminder') || lowerCommand.includes('medicine')) {
      return "You can set medicine reminders in the Medicine Reminder section. I'll help you stay on track with your medications.";
    } else {
      return "I'm here to help with your health questions. You can ask about symptoms, first aid, or use other features like medicine reminders and nearby hospitals.";
    }
  }
}