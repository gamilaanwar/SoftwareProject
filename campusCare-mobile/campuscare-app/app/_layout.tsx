import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    // Must be authenticated to access tabs
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)');
    } 
    // Already logged in, redirect to role-specific dashboard if trying to access auth
    else if (isAuthenticated && inAuthGroup) {
      const role = user?.role;
      if (role === 'admin') router.replace('/(tabs)/admin');
      else if (role === 'facility_manager') router.replace('/(tabs)/dashboard');
      else if (role === 'worker') router.replace('/(tabs)/worker');
      else router.replace('/(tabs)');    }
  }, [isAuthenticated, segments, loading, user?.role]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard>
        <Slot />
      </AuthGuard>
    </AuthProvider>
  );
}
