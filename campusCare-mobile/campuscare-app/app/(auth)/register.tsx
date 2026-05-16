import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { Colors } from '../../src/constants/Colors';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('community_member');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.register({ 
        name, 
        email, 
        password, 
        role, 
        phone_number: phone 
      });
      
      if (response.success) {
        const message = role === 'worker' 
          ? 'Registration successful! Please wait for a Facility Manager to activate your worker account.'
          : 'Registration successful! You can now log in.';
        
        Alert.alert('Success', message, [
          { text: 'OK', onPress: () => router.replace('/(auth)') }
        ]);
      } else {
        Alert.alert('Registration Failed', response.message || 'Error occurred');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Join CampusCare</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.accent}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={Colors.accent}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={Colors.accent}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor={Colors.accent}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Register as:</Text>
            <View style={styles.roleContainer}>
              {[
                { label: 'Community Member', value: 'community_member' },
                { label: 'Worker', value: 'worker' },
                { label: 'Facility Manager', value: 'facility_manager' },
                { label: 'Admin', value: 'admin' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.roleButton,
                    role === item.value && styles.roleButtonActive
                  ]}
                  onPress={() => setRole(item.value)}
                >
                  <Text style={[
                    styles.roleButtonText,
                    role === item.value && styles.roleButtonTextActive
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.linkText}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 20,
  },
  title: {
    fontFamily: 'Cooper',
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: 'Cooper',
    fontSize: 14,
    color: Colors.secondary,
    marginTop: 5,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  form: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 25,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  label: {
    fontFamily: 'Cooper',
    fontSize: 12,
    fontWeight: 'normal',
    color: Colors.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontFamily: 'Cooper',
    height: 48,
    borderColor: Colors.accent,
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 15,
    fontWeight: 'normal',
    color: Colors.primary,
    backgroundColor: '#fff',
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  roleButton: {
    width: '48%',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  roleButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(11, 46, 51, 0.05)',
  },
  roleButtonText: {
    fontFamily: 'Cooper',
    color: Colors.secondary,
    fontWeight: 'normal',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  roleButtonTextActive: {
    fontFamily: 'Cooper',
    color: Colors.primary,
    fontWeight: 'normal',
  },
  button: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontFamily: 'Cooper',
    color: Colors.white,
    fontSize: 17,
    fontWeight: 'normal',
  },
  linkText: {
    fontFamily: 'Cooper',
    color: Colors.secondary,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'normal',
  },
});
