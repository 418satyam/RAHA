import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AuthForm from '@/components/AuthForm';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  const handleAuthSuccess = (user: any) => {
    router.replace('/(tabs)');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AuthForm
        isLogin={isLogin}
        onAuthSuccess={handleAuthSuccess}
        onToggleMode={toggleMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});