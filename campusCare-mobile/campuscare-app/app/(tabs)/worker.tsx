import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function WorkerDashboardScreen() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const [userState, setUserState] = useState(user);

  const fetchAssignedTickets = async () => {
    // Only fetch if worker is active
    if (!user || !user.is_active) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.issues.getMy();
      if (response.success) {
        setTickets(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setUserState(user);
    if (user?.role === 'worker' && user?.is_active) {
      fetchAssignedTickets();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (user?.role !== 'worker') {
    return (
      <View style={styles.centered}>
        <Text>Access Denied</Text>
      </View>
    );
  }

  // Handle Inactive Workers
  if (userState && !userState.is_active) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="lock" size={60} color="#FF3B30" />
        <Text style={styles.title}>Account Inactive</Text>
        <Text style={styles.description}>Please wait for a Facility Manager to activate your account.</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>Log in again to refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return '#FF3B30';
      case 'normal': return '#FF9500';
      case 'low': return '#FFCC00';
      default: return '#8E8E93';
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/worker/${item.ticket_id}`)}>
      <View style={styles.ticketHeader}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          {item.priority === 'normal' ? 'MEDIUM' : item.priority?.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <View style={styles.ticketFooter}>
        <Text style={styles.location}>
          {item.building_name || item.location?.building_name || 'N/A'} - 
          Room {item.room_number || item.location?.room_number || 'N/A'}
        </Text>
        <Text style={styles.status}>{item.status.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Tasks</Text>
      <FlatList
        data={tickets}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.ticket_id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAssignedTickets} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks assigned.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  title: { fontSize: 28, fontWeight: '700', color: '#1C1C1E', marginVertical: 20, marginHorizontal: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  category: { fontSize: 16, fontWeight: '600', color: '#000' },
  description: { fontSize: 14, color: '#3A3A3C', marginBottom: 6 },
  location: { fontSize: 12, color: '#8E8E93' },
  status: { fontSize: 11, fontWeight: '700', color: '#007AFF' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 50, fontSize: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }
});
