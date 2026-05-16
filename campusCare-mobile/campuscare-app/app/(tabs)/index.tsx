import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, SafeAreaView, useWindowDimensions } from 'react-native';
import { Text, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/services/api';
import { Colors } from '../../src/constants/Colors';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const fetchIssues = async () => {
    try {
      const response = user?.role === 'facility_manager' 
        ? await api.issues.getAll() 
        : await api.issues.getMy();
      
      if (response.success) {
        setIssues(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchIssues();
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.issueCard}
      onPress={() => router.push(`/ticket/${item.ticket_id}`)}
    >
      <View style={styles.issueHeader}>
        <Text style={styles.category} numberOfLines={1}>{item.category}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status?.replace('_', ' ').toUpperCase() || 'PENDING'}</Text>
        </View>
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.locationContainer}>
        <MaterialIcons name="location-on" size={14} color={Colors.primary} style={{ marginRight: 6 }} />
        <Text style={styles.location} numberOfLines={1}>
          {item.building_name || 'N/A'}, Room {item.room_number || 'N/A'}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <View style={styles.priorityRow}>
          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
          <Text style={styles.priorityText}>{item.priority?.toUpperCase() || 'NORMAL'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return '#4CD964';
      case 'in_progress': return '#FF9500';
      case 'assigned': return '#007AFF';
      case 'denied': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#FF3B30';
      case 'normal': return '#FFCC00';
      case 'low': return '#4CD964';
      default: return '#8E8E93';
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.welcome} numberOfLines={1}>Hello, {user?.name}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {user?.role === 'facility_manager' ? 'All Issues' : 
           user?.role === 'worker' ? 'Assigned Tasks' : 'My Issues'}
        </Text>
      </View>

      <FlatList
        data={issues}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.ticket_id.toString()}
        contentContainerStyle={styles.list}
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
            <MaterialIcons name="inventory" size={48} color={Colors.accent} />
            <Text style={styles.emptyText}>No issues found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

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
  headerSection: {
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
  welcome: {
    fontFamily: 'Cooper',
    fontSize: 14,
    color: Colors.accent,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  title: {
    fontFamily: 'Cooper',
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  list: {
    padding: 20,
    paddingBottom: 30,
  },
  issueCard: {
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  statusText: {
    fontFamily: 'Cooper',
    fontSize: 10,
    fontWeight: 'normal',
  },
  description: {
    fontFamily: 'Cooper',
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F9',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  location: {
    fontFamily: 'Cooper',
    fontSize: 12,
    color: Colors.primary,
    fontWeight: 'normal',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  date: {
    fontFamily: 'Cooper',
    fontSize: 11,
    color: Colors.accent,
    fontWeight: 'normal',
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  priorityText: {
    fontFamily: 'Cooper',
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: 'normal',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontFamily: 'Cooper',
    color: Colors.accent,
    fontSize: 15,
    fontWeight: 'normal',
    marginTop: 10,
  },
});
