import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator, Switch, TouchableOpacity, Alert } from 'react-native';
import { Text, View } from 'react-native';
import { api } from '../../src/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/constants/Colors';

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
        <MaterialIcons name="lock" size={60} color={Colors.secondary} />
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
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>WORKER</Text>
        </View>
      </View>
      <View style={styles.actionArea}>
        <Text style={[styles.statusLabel, { color: item.is_active ? '#4CD964' : '#FF3B30' }]}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Text>
        <Switch
          value={item.is_active}
          onValueChange={() => toggleWorkerStatus(item.user_id, item.is_active)}
          trackColor={{ false: Colors.accent, true: Colors.secondary }}
          thumbColor={item.is_active ? Colors.primary : Colors.white}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Workers</Text>
        <Text style={styles.subtitle}>{workers.length} registered maintenance staff</Text>
      </View>
      
      <FlatList
        data={workers}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.user_id.toString()}
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
            <MaterialIcons name="people-outline" size={48} color={Colors.accent} />
            <Text style={styles.emptyText}>No workers found.</Text>
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
    padding: 20,
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
    fontWeight: '800',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500',
    marginTop: 4,
  },
  errorText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 20,
  },
  subErrorText: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: 10,
  },
  list: {
    padding: 20,
    paddingBottom: 30,
  },
  workerCard: {
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  workerEmail: {
    fontSize: 14,
    color: Colors.secondary,
    marginTop: 2,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#F0F8F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  actionArea: {
    alignItems: 'center',
    paddingLeft: 10,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
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
    fontWeight: '600',
  },
});
