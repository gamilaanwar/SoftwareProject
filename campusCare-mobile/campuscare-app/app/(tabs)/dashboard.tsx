import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Text, View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/constants/Colors';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();

  const fetchTickets = async () => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await api.issues.getAll(params);
      if (response.success) {
        setTickets(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch tickets');
      }
    } catch (error: any) {
      console.error('Fetch tickets error:', error);
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
        <MaterialIcons name="lock" size={60} color={Colors.secondary} />
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
      <View style={styles.locationContainer}>
        <MaterialIcons name="location-on" size={14} color={Colors.secondary} style={{ marginRight: 4 }} />
        <Text style={styles.location}>
          {item.building_name || item.location?.building_name || 'N/A'} - 
          Room {item.room_number || item.location?.room_number || 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Campus Issues</Text>
        <Text style={styles.subtitle}>{tickets.length} total tickets found</Text>
      </View>
      
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
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
      </View>

      <FlatList
        data={tickets}
        extraData={statusFilter}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.ticket_id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={fetchTickets} 
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inventory" size={48} color={Colors.accent} />
            <Text style={styles.empty}>No {statusFilter === 'all' ? 'tickets' : statusFilter + ' tickets'} found.</Text>
          </View>
        }
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
  container: { 
    flex: 1, 
    backgroundColor: Colors.background, 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  title: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500',
    marginTop: 4,
  },
  filterSection: {
    paddingVertical: 15,
  },
  filterContent: { 
    paddingHorizontal: 20 
  },
  filterButton: { 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 12, 
    backgroundColor: Colors.white, 
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: { 
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: { 
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: { 
    color: Colors.white 
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  ticketCard: { 
    backgroundColor: Colors.surface, 
    padding: 18, 
    borderRadius: 20, 
    marginBottom: 15,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  ticketHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10 
  },
  category: { 
    fontSize: 18, 
    fontWeight: '700',
    color: Colors.primary,
  },
  status: { 
    fontSize: 11, 
    fontWeight: '800',
  },
  description: { 
    color: Colors.secondary, 
    marginBottom: 12,
    lineHeight: 20,
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F9',
    padding: 8,
    borderRadius: 8,
  },
  location: { 
    fontSize: 12, 
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  empty: { 
    textAlign: 'center', 
    marginTop: 15, 
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: { 
    fontSize: 20, 
    marginTop: 10,
    color: Colors.primary,
    fontWeight: '700',
  }
});
