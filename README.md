# RAHA 

A comprehensive health assistant mobile application built with React Native and Expo.

## Features

### 🔐 Authentication

- **Firebase Authentication**: Secure email/password signup and login
- **Persistent Sessions**: Automatic login state management
- **User Profile Management**: Store and manage user preferences

### 🌍 Multi-Language Support

- **Language Selection**: Choose from 10+ Indian languages
- **Persistent Language Settings**: Saves user's preferred language
- **Localized Interface**: Native language support for better accessibility

### 🏠 Dashboard

- **Personalized Welcome**: Greets users with their name and time-based messages
- **Feature Grid**: Easy access to all app features
- **Quick Navigation**: One-tap access to all major functions

### 🩺 Symptom Checker

- **Text Input**: Describe symptoms in natural language
- **Voice Input**: Use speech-to-text for hands-free symptom entry
- **AI Analysis**: Get health recommendations based on symptoms
- **History Tracking**: Save and review past symptom checks
- **Common Symptoms**: Quick-select from frequently reported symptoms

### 🚑 First Aid Guide

- **Emergency Categories**: Burns, fractures, bleeding, choking, heart attacks, allergic reactions
- **Step-by-Step Instructions**: Clear, numbered steps for each emergency
- **Expandable Cards**: Tap to view detailed instructions
- **Visual Indicators**: Icons and color coding for quick identification

### 💊 Medicine Reminders

- **Smart Scheduling**: Set reminders for daily, twice daily, three times daily, or weekly
- **Push Notifications**: Receive timely medication alerts
- **Dosage Tracking**: Record medicine names and dosages
- **Active/Inactive Toggle**: Enable or disable reminders as needed
- **Firebase Storage**: Sync reminders across devices

### 🎤 Voice Assistant

- **Speech Recognition**: Natural language voice commands
- **Conversational Interface**: Chat-like interaction with health assistant
- **Navigation Commands**: Voice-controlled app navigation
- **Health Q&A**: Ask health-related questions and get responses
- **AI Answers (ChatGPT-like)**: Configure an API key to get AI-generated answers. Without a key, it falls back to built-in rule-based replies.
- **Text-to-Speech**: Hear responses spoken aloud

### 🏥 Nearby Hospitals

- **Location Services**: Find hospitals near your current location
- **Hospital Details**: Names, addresses, phone numbers, and distances
- **Direct Actions**: Call hospitals or get directions with one tap
- **Google Maps Integration**: Seamless navigation to selected hospitals

### ⚙️ Settings & Preferences

- **Language Switching**: Change app language anytime
- **Profile Management**: View and manage user account
- **Notification Settings**: Control app notifications
- **Account Actions**: Logout and account deletion options

## Technical Stack

### Frontend

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe JavaScript development
- **React Navigation**: Screen navigation and routing

### Backend Services

- **Firebase Authentication**: User authentication and management
- **Firebase Realtime Database**: Real-time data synchronization
- **AsyncStorage**: Local data persistence

### Device Features

- **Push Notifications**: Medicine reminder alerts
- **Speech Recognition**: Voice input processing
- **Text-to-Speech**: Audio response playback
- **Location Services**: GPS-based hospital finding
- **Camera Access**: Future health scanning features

### UI/UX

- **Material Design**: Clean, modern interface
- **Responsive Layout**: Optimized for various screen sizes
- **Safe Area Handling**: Proper spacing for notches and navigation bars
- **Accessibility**: Screen reader and voice control support

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd raha-health-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Run on device/simulator**
   - Install Expo Go app on your mobile device
   - Scan the QR code displayed in the terminal
   - Or use Android/iOS simulator

## Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password
3. Set up Realtime Database
4. Add your Firebase configuration to the app

### Permissions

The app requires the following permissions:

- **Microphone**: For voice input and commands
- **Location**: For finding nearby hospitals
- **Notifications**: For medicine reminders
- **Camera**: For future health scanning features

## Project Structure

```
app/
├── (tabs)/                 # Tab navigation screens
│   ├── index.tsx          # Dashboard
│   ├── symptom-checker.tsx # Symptom analysis
│   ├── first-aid.tsx      # Emergency guide
│   ├── reminders.tsx      # Medicine reminders
│   └── voice.tsx          # Voice assistant
├── auth.tsx               # Authentication screen
├── hospitals.tsx          # Hospital finder
├── settings.tsx           # App settings
└── language-selection.tsx # Language picker

components/
├── AuthForm.tsx           # Login/signup form
├── FeatureCard.tsx        # Dashboard feature cards
└── LanguageSelector.tsx   # Language selection UI

services/
├── firebase.ts            # Firebase integration
├── storage.ts             # Local storage management
├── voiceService.ts        # Speech recognition/synthesis
├── symptomChecker.ts      # Health analysis logic
└── notificationService.ts # Push notifications

constants/
├── languages.ts           # Supported languages
└── firstAidData.ts       # Emergency procedures
```

## Features in Detail

### Authentication Flow

1. **First Launch**: Language selection screen
2. **Returning Users**: Automatic login if authenticated
3. **New Users**: Signup with email/password
4. **Existing Users**: Login with credentials

### Voice Assistant Capabilities

Configuration for AI responses:

- Create an API key and expose it as an Expo public env var: `EXPO_PUBLIC_OPENAI_API_KEY`
- You can set it when running locally: `EXPO_PUBLIC_OPENAI_API_KEY=sk-... npm run dev`
- Or via app.json under `extra.openAIApiKey` for development only (avoid committing secrets):

```
{
  "expo": {
    "extra": {
      "openAIApiKey": "sk-..."
    }
  }
}
```

Security note: For production, prefer proxying via your backend to keep the key private.

- "Check my symptoms" → Navigate to symptom checker
- "Show first aid guide" → Open emergency procedures
- "Set medicine reminder" → Go to reminders screen
- "Find nearby hospitals" → Open hospital finder
- Health questions → Get AI-powered responses

### Notification System

- **Scheduled Reminders**: Based on user-set times and frequencies
- **Smart Scheduling**: Handles different frequency patterns
- **Cross-Platform**: Works on both Android and iOS
- **Persistent**: Survives app restarts and device reboots

### Data Privacy

- **Local Storage**: Sensitive data stored locally when possible
- **Encrypted Transit**: All Firebase communications encrypted
- **User Control**: Users can delete their data anytime
- **Minimal Collection**: Only necessary health data collected

## Development

### Adding New Features

1. Create new screen in `app/` directory
2. Add navigation routes in `_layout.tsx`
3. Implement business logic in `services/`
4. Add UI components in `components/`
5. Update types in `types/index.ts`

### Testing

- **Device Testing**: Use Expo Go for real device testing
- **Simulator Testing**: iOS Simulator and Android Emulator support
- **Voice Testing**: Test speech recognition on physical devices
- **Notification Testing**: Verify reminder scheduling and delivery

### Building for Production

1. **Expo Build**: Use EAS Build for app store deployment
2. **Firebase Config**: Set up production Firebase project
3. **App Store**: Submit to Google Play Store and Apple App Store
4. **Analytics**: Implement crash reporting and usage analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on multiple devices
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Email: support@rahahealth.com
- Documentation: [Project Wiki](link-to-wiki)
- Issues: [GitHub Issues](link-to-issues)

---

**RAHA Health App** - Your comprehensive health assistant, always in your pocket.
"# RAHA" 
"# RAHA-health" 
"# RAHA-health" 
"# RAHA-health" 
