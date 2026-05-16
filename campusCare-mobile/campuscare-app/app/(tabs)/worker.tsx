import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/Colors';

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
        <MaterialIcons name="lock" size={60} color={Colors.secondary} />
        <Text style={styles.errorText}>Access Denied</Text>
      </View>
    );
  }

  // Handle Inactive Workers
  if (userState && !userState.is_active) {
    return (
      <View style={styles.centered}>
        <View style={styles.inactiveCard}>
          <MaterialIcons name="hourglass-top" size={64} color={Colors.secondary} />
          <Text style={styles.inactiveTitle}>Account Inactive</Text>
          <Text style={styles.inactiveDescription}>Please wait for a Facility Manager to activate your worker account.</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={() => router.replace('/')}>
            <Text style={styles.buttonText}>Log in again to refresh</Text>
          </TouchableOpacity>
        </View>
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
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={14} color={Colors.secondary} style={{ marginRight: 4 }} />
          <Text style={styles.location}>
            {item.building_name || item.location?.building_name || 'N/A'} - 
            Room {item.room_number || item.location?.room_number || 'N/A'}
          </Text>
        </View>
        <Text style={styles.status}>{item.status.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <Text style={styles.subtitle}>{tickets.length} active assignments</Text>
      </View>
      <FlatList
        data={tickets}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.ticket_id.toString()}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={fetchAssignedTickets} 
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="task-alt" size={48} color={Colors.accent} />
            <Text style={styles.emptyText}>No tasks assigned.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
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
    marginBottom: 10,
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: Colors.white,
    fontFamily: 'Cooper',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: 'normal',
    marginTop: 4,
    fontFamily: 'Cooper',
  },
  listContent: { 
    padding: 20, 
    paddingBottom: 30 
  },
  card: { 
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
    marginBottom: 8 
  },
  ticketFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  category: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: Colors.primary,
    fontFamily: 'Cooper',
  },
  description: { 
    fontSize: 14, 
    color: Colors.secondary, 
    lineHeight: 20,
    marginBottom: 4,
    fontFamily: 'Cooper',
    fontWeight: 'normal',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: { 
    fontSize: 12, 
    color: Colors.secondary,
    fontWeight: 'normal',
    fontFamily: 'Cooper',
  },
  status: { 
    fontSize: 11, 
    fontWeight: 'normal', 
    color: Colors.primary,
    fontFamily: 'Cooper',
  },
  priorityBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8, 
    color: '#FFF', 
    fontSize: 10, 
    fontWeight: 'normal',
    fontFamily: 'Cooper',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: { 
    textAlign: 'center', 
    color: Colors.secondary, 
    marginTop: 15, 
    fontSize: 16,
    fontWeight: 'normal',
    fontFamily: 'Cooper',
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: Colors.background,
  },
  inactiveCard: {
    backgroundColor: Colors.surface,
    padding: 30,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  inactiveTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'Cooper',
  },
  inactiveDescription: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    fontFamily: 'Cooper',
    fontWeight: 'normal',
  },
  refreshButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 12,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'normal',
    fontSize: 16,
    fontFamily: 'Cooper',
  },
  errorText: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: 'bold',
    marginTop: 10,
    fontFamily: 'Cooper',
  }
});
