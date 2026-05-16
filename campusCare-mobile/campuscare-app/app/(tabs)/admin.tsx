import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Switch, Text, View, Alert, RefreshControl, SafeAreaView, useWindowDimensions } from 'react-native';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();

  const fetchUsers = async () => {
    try {
      const response = await api.admin.getAllUsers();
      if (response.success) setUsers(response.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchUsers();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

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
      <View style={styles.centered}>
        <MaterialIcons name="security" size={60} color={Colors.secondary} />
        <Text style={styles.errorText}>Access Denied</Text>
      </View>
    );
  }

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{item.role.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.toggleContainer}>
        <Text style={[styles.statusText, { color: item.is_active ? '#4CD964' : '#FF3B30' }]}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Text>
        <Switch 
          value={item.is_active} 
          onValueChange={() => toggleAccountStatus(item.user_id, item.is_active)}
          trackColor={{ false: '#D1D1D6', true: Colors.primary + '80' }}
          thumbColor={item.is_active ? Colors.primary : '#F2F2F7'}
          ios_backgroundColor="#D1D1D6"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSubtitle}>{users.length} total users in system</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item: any) => item.user_id.toString()}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="person-off" size={48} color={Colors.accent} />
              <Text style={styles.emptyText}>No users found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  headerTitle: { 
    fontFamily: 'Cooper',
    fontSize: 24, 
    fontWeight: 'bold', 
    color: Colors.white,
  },
  headerSubtitle: {
    fontFamily: 'Cooper',
    fontSize: 13,
    color: Colors.accent,
    fontWeight: 'normal',
    marginTop: 2,
  },
  listContent: { 
    padding: 20,
    paddingBottom: 30 
  },
  card: { 
    backgroundColor: Colors.surface, 
    padding: 18, 
    borderRadius: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  userInfo: { 
    flex: 1, 
    marginRight: 10 
  },
  userName: { 
    fontFamily: 'Cooper',
    fontSize: 17, 
    fontWeight: 'normal', 
    color: Colors.primary, 
    marginBottom: 2 
  },
  userEmail: { 
    fontFamily: 'Cooper',
    fontSize: 13, 
    fontWeight: 'normal',
    color: Colors.secondary, 
    marginBottom: 8 
  },
  roleBadge: { 
    backgroundColor: '#F0F8F9', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6, 
    alignSelf: 'flex-start' 
  },
  roleText: { 
    fontFamily: 'Cooper',
    fontSize: 9, 
    fontWeight: 'normal', 
    color: Colors.primary, 
    letterSpacing: 0.5 
  },
  toggleContainer: { 
    alignItems: 'center', 
    width: 70 
  },
  statusText: { 
    fontFamily: 'Cooper',
    fontSize: 10, 
    fontWeight: 'normal', 
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: { 
    fontFamily: 'Cooper',
    fontSize: 18, 
    color: Colors.primary, 
    fontWeight: 'bold',
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontFamily: 'Cooper',
    textAlign: 'center',
    color: Colors.accent,
    marginTop: 15,
    fontSize: 15,
    fontWeight: 'normal',
  },
});
