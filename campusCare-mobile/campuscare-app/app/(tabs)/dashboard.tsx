import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Text, View, ScrollView, Alert, SafeAreaView, useWindowDimensions } from 'react-native';
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
  const { width } = useWindowDimensions();

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
        <Text style={styles.category} numberOfLines={1}>{item.category}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>{item.status.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <View style={styles.locationContainer}>
        <MaterialIcons name="location-on" size={14} color={Colors.primary} style={{ marginRight: 4 }} />
        <Text style={styles.location} numberOfLines={1}>
          {item.building_name || item.location?.building_name || 'N/A'} - 
          Room {item.room_number || item.location?.room_number || 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Campus Issues</Text>
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
            <Text style={styles.empty}>No {statusFilter === 'all' ? 'tickets' : statusFilter.replace('_', ' ') + ' tickets'} found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch(status) {
    case 'pending': return '#FF9500';
    case 'assigned': return '#007AFF';
    case 'in_progress': return '#5856D6';
    case 'resolved': return '#4CD964';
    case 'denied': return '#FF3B30';
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
  title: { 
    fontFamily: 'Cooper',
    fontSize: 24, 
    fontWeight: 'bold', 
    color: Colors.white,
  },
  subtitle: {
    fontFamily: 'Cooper',
    fontSize: 13,
    color: Colors.accent,
    fontWeight: 'normal',
    marginTop: 2,
  },
  filterSection: {
    paddingVertical: 12,
  },
  filterContent: { 
    paddingHorizontal: 20 
  },
  filterButton: { 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 10, 
    backgroundColor: Colors.white, 
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  filterButtonActive: { 
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: { 
    fontFamily: 'Cooper',
    color: Colors.secondary,
    fontSize: 11,
    fontWeight: 'normal',
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
    fontFamily: 'Cooper',
    fontSize: 18, 
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },
  status: { 
    fontFamily: 'Cooper',
    fontSize: 10, 
    fontWeight: 'normal',
  },
  description: { 
    fontFamily: 'Cooper',
    color: Colors.secondary, 
    marginBottom: 12,
    lineHeight: 18,
    fontSize: 13,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F9',
    padding: 8,
    borderRadius: 8,
  },
  location: { 
    fontFamily: 'Cooper',
    fontSize: 12, 
    color: Colors.primary,
    fontWeight: 'normal',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  empty: { 
    fontFamily: 'Cooper',
    textAlign: 'center', 
    marginTop: 15, 
    color: Colors.secondary,
    fontSize: 15,
    fontWeight: 'normal',
  },
  errorText: { 
    fontFamily: 'Cooper',
    fontSize: 18, 
    marginTop: 10,
    color: Colors.primary,
    fontWeight: 'bold',
  }
});
