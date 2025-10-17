import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { StorageService } from '@/services/storage';
import { FirebaseService } from '@/services/firebase';

function randomRoom() {
  return 'raha-' + Math.random().toString(36).slice(2, 10);
}

export default function Consultation() {
  const [room, setRoom] = useState<string>('');
  const [userName, setUserName] = useState<string>('Patient');
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    (async () => {
      const user = await StorageService.getUser();
      const display = user?.displayName || user?.email?.split('@')[0] || 'Patient';
      setUserName(display);
      const r = randomRoom();
      setRoom(r);
      // Save session start in Firestore
      try {
        if (user?.uid) {
          const { db } = await import('@/services/firebaseClient');
          const { collection, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
          const col = collection(db, 'users', user.uid, 'consultations');
          const id = Math.random().toString(36).slice(2);
          await setDoc(doc(col, id), { room: r, startedAt: serverTimestamp(), userId: user.uid, userName: display });
          setSessionId(id);
        }
      } catch (e) {
        console.warn('Failed to log consultation start', e);
      }
    })();
  }, []);

  const handleEnd = async () => {
    try {
      const user = await StorageService.getUser();
      if (user?.uid && sessionId) {
        const { db } = await import('@/services/firebaseClient');
        const { doc, updateDoc, collection } = await import('firebase/firestore');
        const col = collection(db, 'users', user.uid, 'consultations');
        await updateDoc(doc(col, sessionId), { endedAt: new Date().toISOString() });
      }
    } catch (e) {
      console.warn('Failed to log consultation end', e);
    }
    Alert.alert('Session ended');
  };

  // Jitsi embed via web: works on native via WebView and on web builds directly
  const jitsiUrl = room
    ? `https://meet.jit.si/${room}#userInfo.displayName=%22${encodeURIComponent(userName)}%22`
    : '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="videocam" size={24} color="#2c3e50" />
        <Text style={styles.title}>Online Consultation</Text>
        <TouchableOpacity onPress={handleEnd} style={styles.endBtn}>
          <Ionicons name="close-circle" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
      {jitsiUrl ? (
        <WebView
          source={{ uri: jitsiUrl }}
          style={{ flex: 1 }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      ) : (
        <View style={styles.loading}> 
          <Text>Preparing consultation...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#fff', elevation: 2 },
  title: { fontSize: 18, fontWeight: '700', color: '#2c3e50' },
  endBtn: { padding: 6 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
