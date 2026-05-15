import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/services/api';
import { Colors } from '../../src/constants/Colors';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

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
        <Text style={styles.category}>{item.category}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status || 'Pending'}</Text>
        </View>
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.locationContainer}>
        <Text style={styles.location}>
          {item.building_name}, Floor {item.floor}, Room {item.room_number}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <Text style={styles.priorityText}>Priority: {item.priority || 'Low'}</Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return '#4CD964';
      case 'in_progress': return '#FFCC00';
      default: return '#FF3B30';
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
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.welcome}>Hello, {user?.name}</Text>
        <Text style={styles.title}>
          {user?.role === 'facility_manager' ? 'All Campus Issues' : 
           user?.role === 'worker' ? 'Assigned Tasks' : 'My Reported Issues'}
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
            <Text style={styles.emptyText}>No issues found.</Text>
          </View>
        }
      />
    </View>
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
    padding: 20,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  welcome: {
    fontSize: 16,
    color: Colors.accent,
    marginBottom: 4,
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  category: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 15,
    color: Colors.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  locationContainer: {
    backgroundColor: '#F0F8F9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  location: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
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
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '500',
  },
  priorityText: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
