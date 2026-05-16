import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../src/constants/Colors';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Caprasimo_400Regular } from '@expo-google-fonts/caprasimo';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Cooper': Caprasimo_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (authLoading || !fontsLoaded) return;

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
  }, [isAuthenticated, segments, authLoading, user?.role, fontsLoaded]);

  if (authLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
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
