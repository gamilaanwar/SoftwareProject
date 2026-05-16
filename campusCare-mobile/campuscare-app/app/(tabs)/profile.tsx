import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, SafeAreaView, useWindowDimensions } from 'react-native';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/Colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { width } = useWindowDimensions();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Call backend logout while we still have the token
      await api.auth.logout().catch(err => console.error('Logout API error:', err));
    } finally {
      // Always cleanup locally and redirect, even if API logout fails
      await logout();
      router.replace('/');
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await api.auth.deleteAccount();
              await logout();
              Alert.alert("Success", "Account deleted successfully.");
              router.replace('/');
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete account.");
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={width * 0.15} color={Colors.primary} />
          </View>
          <Text style={styles.name} numberOfLines={1}>{user?.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="email" size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoText} numberOfLines={1}>{user?.email || 'N/A'}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="phone" size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoText} numberOfLines={1}>{user?.phone_number || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]} 
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator color="#FF3B30" size="small" />
            ) : (
              <>
                <MaterialIcons name="logout" size={22} color="#FF3B30" />
                <Text style={styles.logoutText}>Log Out</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]} 
            onPress={handleDeleteAccount}
            disabled={isDeleting || isLoggingOut}
          >
            {isDeleting ? (
              <ActivityIndicator color="#FF3B30" size="small" />
            ) : (
              <>
                <MaterialIcons name="delete-forever" size={22} color="#FF3B30" />
                <Text style={styles.deleteText}>Delete Account</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    backgroundColor: Colors.primary,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  name: {
    fontFamily: 'Cooper',
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: 'rgba(184, 227, 233, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  roleText: {
    fontFamily: 'Cooper',
    fontSize: 10,
    fontWeight: 'normal',
    color: Colors.accent,
    letterSpacing: 1,
  },
  infoSection: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Cooper',
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 5,
  },
  infoContainer: {
    backgroundColor: Colors.surface,
    padding: 8,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0F8F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'Cooper',
    fontSize: 11,
    color: Colors.accent,
    fontWeight: 'normal',
    marginBottom: 2,
  },
  infoText: {
    fontFamily: 'Cooper',
    fontSize: 15,
    color: Colors.primary,
    fontWeight: 'normal',
  },
  actionSection: {
    marginTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
    width: '100%',
    padding: 16,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    fontFamily: 'Cooper',
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: 'normal',
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
    width: '100%',
    padding: 16,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 59, 48, 0.2)',
    marginTop: 15,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteText: {
    fontFamily: 'Cooper',
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: 'normal',
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  versionText: {
    fontFamily: 'Cooper',
    marginTop: 15,
    fontSize: 11,
    color: Colors.accent,
    fontWeight: 'normal',
  },
});
