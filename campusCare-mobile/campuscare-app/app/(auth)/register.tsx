import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
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
    <ScrollView contentContainerStyle={styles.container}>
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
            { label: 'Community', value: 'community_member' },
            { label: 'Worker', value: 'worker' },
            { label: 'Manager', value: 'facility_manager' },
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    marginTop: 5,
    fontWeight: '500',
  },
  form: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    height: 50,
    borderColor: Colors.accent,
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: Colors.primary,
    backgroundColor: '#fff',
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  roleButton: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  roleButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  roleButtonText: {
    color: Colors.secondary,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  button: {
    backgroundColor: Colors.primary,
    height: 55,
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
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  linkText: {
    color: Colors.secondary,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
});
