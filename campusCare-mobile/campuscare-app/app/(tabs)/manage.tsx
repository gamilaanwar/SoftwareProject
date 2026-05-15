import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator, Switch, TouchableOpacity, Alert } from 'react-native';
import { Text, View } from 'react-native';
import { api } from '../../src/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';

export default function ManageWorkersScreen() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWorkers = async () => {
    try {
      const response = await api.manager.getWorkers();
      if (response.success) {
        setWorkers(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'facility_manager') {
      fetchWorkers();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (user?.role !== 'facility_manager') {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="lock" size={60} color="#FF3B30" />
        <Text style={styles.errorText}>Access Denied</Text>
        <Text style={styles.subErrorText}>Only Facility Managers can access this screen.</Text>
      </View>
    );
  }

  const toggleWorkerStatus = async (workerId: string, currentStatus: boolean) => {
    try {
      const response = await api.manager.updateWorkerStatus(workerId, !currentStatus);
      if (response.success) {
        setWorkers(workers.map((w: any) => 
          w.user_id === workerId ? { ...w, is_active: !currentStatus } : w
        ));
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update status');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkers();
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.workerCard}>
      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>{item.name}</Text>
        <Text style={styles.workerEmail}>{item.email}</Text>
      </View>
      <View style={styles.actionArea}>
        <Text style={[styles.statusLabel, { color: item.is_active ? '#4CD964' : '#FF3B30' }]}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Text>
        <Switch
          value={item.is_active}
          onValueChange={() => toggleWorkerStatus(item.user_id, item.is_active)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={item.is_active ? '#007AFF' : '#f4f3f4'}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Workers</Text>
      <FlatList
        data={workers}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.user_id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No workers found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  subErrorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  workerCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  workerEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actionArea: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 16,
  },
});
