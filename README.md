🩺 RAHA Health 

A next-generation AI-powered health assistant mobile application developed using React Native and Expo, designed to empower users with instant medical guidance, first-aid assistance, medicine reminders, and nearby hospital discovery — all in one place.

🌟 Overview

The RAHA Health App provides a unified digital healthcare experience by integrating AI-driven symptom analysis, voice interaction, real-time hospital tracking, and personalized reminders.
Built with accessibility and multilingual support in mind, RAHA ensures that every user — regardless of language or technical expertise — can manage their health with ease.

🚀 Core Features
🔐 Authentication

Secure Firebase Authentication with Email/Password

Persistent sessions to keep users signed in

Profile Management for user preferences and health data

🌍 Multi-Language Support

Choose from 10+ Indian languages

Localized UI for inclusive user experience

Persistent language settings across sessions

🏠 Dashboard

Personalized greeting with time-based messages

Feature grid layout for easy navigation

Quick-access to all app functionalities

🩺 AI Symptom Checker

Input symptoms via text or voice

AI-based health recommendations

Symptom history tracking for easy reference

Quick-select for common health issues

🚑 First Aid Guide

Step-by-step guides for emergencies like burns, fractures, choking, and bleeding

Expandable cards with concise visuals and clear instructions

Color-coded categories for faster recognition

💊 Medicine Reminders

Smart scheduling: daily, twice daily, or weekly

Push notifications with reminder alerts

Dosage tracking with medicine details

Firebase sync to preserve reminders across devices

🎤 AI Voice Assistant

Natural language recognition for voice commands

Conversational, chat-like health interaction

Control app features using voice:

“Check my symptoms” → Opens Symptom Checker

“Find nearby hospitals” → Opens Hospital Finder

“Set a reminder” → Opens Reminder Scheduler

Text-to-Speech for spoken responses

Optional AI (OpenAI/Gemini API) for enhanced Q&A responses

🏥 Nearby Hospitals

Real-time GPS hospital detection

Display name, address, contact, and distance

Call or navigate directly from the app

Google Maps integration for directions

⚙️ Settings & Preferences

Switch app language anytime

Manage profile and notification preferences

Logout or delete account securely

🧩 Technical Architecture
Frontend

React Native + Expo for cross-platform support

TypeScript for safer, scalable code

React Navigation for smooth routing

Backend & Services

Firebase Authentication for secure login

Firebase Realtime Database for live sync

AsyncStorage for local persistence

Device Integrations

Push Notifications for reminders

Speech Recognition for AI voice assistant

Text-to-Speech for responses

Location Services for nearby hospitals

Camera Access (for future scanning features)

UI/UX

Based on Material Design guidelines

Responsive layouts for all screen sizes

Accessible with voice and screen-reader support

🛠️ Installation Guide
1. Clone the Repository
git clone <repository-url>
cd raha-health-app

2. Install Dependencies
npm install

3. Start the Development Server
npm run dev

4. Run on Mobile Device

Install Expo Go from Play Store/App Store

Scan the QR Code in the terminal

Or use Android/iOS Emulator

🔧 Configuration
Firebase Setup

Create a Firebase project: Firebase Console

Enable Email/Password Authentication

Configure Realtime Database

Add Firebase credentials to your project configuration

Required Permissions

🎙️ Microphone → For voice assistant

📍 Location → To find nearby hospitals

🔔 Notifications → For medicine reminders

📷 Camera → For upcoming health scanning features

🗂️ Project Structure
app/
├── (tabs)/                 
│   ├── index.tsx            # Dashboard
│   ├── symptom-checker.tsx  # Symptom analysis
│   ├── first-aid.tsx        # Emergency guide
│   ├── reminders.tsx        # Medicine reminders
│   └── voice.tsx            # Voice assistant
├── auth.tsx                 # Authentication screen
├── hospitals.tsx            # Hospital finder
├── settings.tsx             # App settings
└── language-selection.tsx   # Language picker

components/
├── AuthForm.tsx             # Login/signup form
├── FeatureCard.tsx          # Dashboard feature cards
└── LanguageSelector.tsx     # Language selection UI

services/
├── firebase.ts              # Firebase integration
├── storage.ts               # Local storage management
├── voiceService.ts          # Speech recognition & synthesis
├── symptomChecker.ts        # AI-based analysis
└── notificationService.ts   # Push notifications

constants/
├── languages.ts             # Supported languages
└── firstAidData.ts          # Emergency procedures

🧠 Voice Assistant Configuration

To enable AI-powered replies:

Obtain an OpenAI/Gemini API key

Add it as an environment variable:

EXPO_PUBLIC_OPENAI_API_KEY=sk-xxxx npm run dev


Alternatively, set it under:

{
  "expo": {
    "extra": {
      "openAIApiKey": "sk-..."
    }
  }
}


⚠️ Security Tip: For production, use a backend proxy to hide API keys.

🧾 Notification System

Scheduled reminders with smart frequency patterns

Works across Android and iOS

Persists after app restarts or device reboots

🔒 Data Privacy & Security

Sensitive data stored locally or securely in Firebase

All communications encrypted in transit

Users can delete their data anytime

Minimal personal data collected — strictly necessary only

🧑‍💻 Development Workflow
Adding a New Feature

Add a screen in app/

Define navigation in _layout.tsx

Implement logic in services/

Add UI in components/

Update global types if needed

Testing

Expo Go for real device testing

Android/iOS emulators for debugging

Verify voice, notification, and location features on device

Production Build
eas build --platform android


Configure production Firebase

Deploy on Google Play / Apple App Store

Add analytics and crash reporting

🤝 Contributing

Fork the repository

Create a feature branch

Implement and test your updates

Submit a pull request

⚖️ License

Licensed under the MIT License.
See the LICENSE file for complete details.

💬 Support & Contact

📧 Email: support@rahahealth.com

📘 Docs: RAHA Wiki

🐛 Issues: GitHub Tracker

❤️ RAHA Health App — Your AI-powered personal health companion, anywhere, anytime.
