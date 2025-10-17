// Firebase configuration and services backed by Firebase Auth + Firestore
import { auth, db } from './firebaseClient';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export class FirebaseService {
  static async signUp(email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    // Set a default displayName
    await updateProfile(user, { displayName: email.split('@')[0] });

    // Create user profile doc
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        profile: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        },
        language: 'en',
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    return {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || email.split('@')[0],
      },
    };
  }

  static async signIn(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    return {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || email.split('@')[0],
      },
    };
  }

  static async signOut() {
    await fbSignOut(auth);
    return true;
  }

  static async saveUserData(uid: string, data: any) {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, data, { merge: true });
    return true;
  }

  static async getUserData(uid: string) {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return {
      language: 'en',
      profile: null,
    };
  }

  static async saveMedicineReminder(uid: string, reminder: any) {
    const remindersCol = collection(db, 'users', uid, 'reminders');
    const reminderRef = doc(remindersCol, reminder.id);
    const payload = {
      ...reminder,
      startDate: reminder.startDate
        ? Timestamp.fromDate(new Date(reminder.startDate))
        : null,
      updatedAt: serverTimestamp(),
    };
    await setDoc(reminderRef, payload, { merge: true });
    return true;
  }

  static async getMedicineReminders(uid: string) {
    const q = query(collection(db, 'users', uid, 'reminders'), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    const items: any[] = [];
    snap.forEach((docSnap) => {
      const data: any = docSnap.data();
      items.push({
        ...data,
        startDate: data.startDate && data.startDate.toDate
          ? data.startDate.toDate().toISOString().split('T')[0]
          : data.startDate || '',
      });
    });
    return items;
  }

  static async saveSymptomCheck(uid: string, symptomCheck: any) {
    const col = collection(db, 'users', uid, 'symptomHistory');
    const itemRef = doc(col, symptomCheck.id || undefined);
    const payload = {
      ...symptomCheck,
      timestamp: symptomCheck.timestamp
        ? Timestamp.fromDate(new Date(symptomCheck.timestamp))
        : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(itemRef, payload, { merge: true });
    return true;
  }

  static async getSymptomHistory(uid: string) {
    const q = query(collection(db, 'users', uid, 'symptomHistory'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    const items: any[] = [];
    snap.forEach((docSnap) => {
      const data: any = docSnap.data();
      items.push({
        ...data,
        timestamp: data.timestamp && data.timestamp.toDate
          ? data.timestamp.toDate().toISOString()
          : data.timestamp || null,
      });
    });
    return items;
  }
}