import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Text, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();

  const fetchTickets = async () => {
    setLoading(true); // Start loading immediately
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      console.log('Fetching tickets with params:', params);
      const response = await api.issues.getAll(params);
      if (response.success) {
        setTickets(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch tickets');
      }
    } catch (error: any) {
      console.error('Fetch tickets error:', error);
      // We'll show an error only if it's not a temporary UI glitch
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'facility_manager') {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [user, statusFilter]);

  if (user?.role !== 'facility_manager') {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="lock" size={60} color="#FF3B30" />
        <Text style={styles.errorText}>Access Denied</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.ticketCard} onPress={() => router.push(`/ticket/${item.ticket_id}`)}>
      <View style={styles.ticketHeader}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      {/* Access fields directly as returned by the backend join query */}
      <Text style={styles.location}>
        {item.building_name || item.location?.building_name || 'N/A'} - 
        Room {item.room_number || item.location?.room_number || 'N/A'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Tickets</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {['all', 'pending', 'assigned', 'in_progress', 'resolved', 'denied'].map((status) => (
          <TouchableOpacity 
            key={status} 
            style={[styles.filterButton, statusFilter === status && styles.filterButtonActive]}
            onPress={() => setStatusFilter(status)}
          >
            <Text style={[styles.filterText, statusFilter === status && styles.filterTextActive]}>{status.replace('_', ' ').toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={tickets}
        extraData={statusFilter}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.ticket_id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchTickets} />}
        ListEmptyComponent={<Text style={styles.empty}>No {statusFilter === 'all' ? 'tickets' : statusFilter + ' tickets'} found.</Text>}
      />
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch(status) {
    case 'pending': return '#FF9500';
    case 'assigned': return '#007AFF';
    case 'in_progress': return '#5856D6';
    case 'resolved': return '#4CD964';
    default: return '#8E8E93';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  filterContainer: { maxHeight: 50, marginBottom: 15 },
  filterContent: { paddingHorizontal: 5 },
  filterButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ddd', marginRight: 10 },
  filterButtonActive: { backgroundColor: '#007AFF' },
  filterText: { color: '#333' },
  filterTextActive: { color: '#fff' },
  ticketCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  category: { fontSize: 16, fontWeight: 'bold' },
  status: { fontSize: 12, fontWeight: 'bold' },
  description: { color: '#666', marginBottom: 5 },
  location: { fontSize: 12, color: '#999' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' },
  errorText: { fontSize: 20, marginTop: 10 }
});
