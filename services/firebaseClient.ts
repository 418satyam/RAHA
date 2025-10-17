import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
// Provided by user
const firebaseConfig = {
  apiKey: 'AIzaSyBHtr0SWljowKY5XfsPzRTLnubOCHNmWl8',
  authDomain: 'raha-healthcare.firebaseapp.com',
  projectId: 'raha-healthcare',
  storageBucket: 'raha-healthcare.firebasestorage.app',
  messagingSenderId: '771214808254',
  appId: '1:771214808254:web:e0c73aa447582eff897aef',
};

// Initialize Firebase app (guard against re-initialization during dev/hot reload)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth with React Native persistence (AsyncStorage)
let auth = getAuth(app);
try {
  if (Platform.OS !== 'web') {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
} catch (e) {
  // Fallback to default auth if initializeAuth throws due to being already initialized
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };