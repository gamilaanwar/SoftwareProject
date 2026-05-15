import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Switch, Text, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await api.admin.getAllUsers();
      if (response.success) setUsers(response.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchUsers();
  }, [user]);

  const toggleAccountStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.admin.updateUserStatus(userId, !currentStatus);
      setUsers(users.map((u: any) => u.user_id === userId ? { ...u, is_active: !currentStatus } : u));
    } catch (e) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <View style={styles.centered}><Text style={styles.errorText}>Access Denied</Text></View>
    );
  }

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{item.role.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.toggleContainer}>
        <Text style={[styles.statusText, { color: item.is_active ? '#34C759' : '#FF3B30' }]}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Text>
        <Switch 
          value={item.is_active} 
          onValueChange={() => toggleAccountStatus(item.user_id, item.is_active)}
          trackColor={{ false: '#D1D1D6', true: '#34C759' }}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>User Management</Text>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item: any) => item.user_id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', paddingHorizontal: 16 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1C1C1E', marginVertical: 20, marginLeft: 4 },
  listContent: { paddingBottom: 20 },
  card: { 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: { flex: 1, marginRight: 10 },
  userName: { fontSize: 17, fontWeight: '600', color: '#000', marginBottom: 2 },
  userEmail: { fontSize: 14, color: '#8E8E93', marginBottom: 6 },
  roleBadge: { 
    backgroundColor: '#F2F2F7', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6, 
    alignSelf: 'flex-start' 
  },
  roleText: { fontSize: 11, fontWeight: '700', color: '#3A3A3C', letterSpacing: 0.5 },
  toggleContainer: { alignItems: 'center', width: 70 },
  statusText: { fontSize: 10, fontWeight: '600', marginBottom: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#FF3B30', fontWeight: '500' }
});
