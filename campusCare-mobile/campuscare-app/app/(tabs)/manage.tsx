import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator, Switch, TouchableOpacity, Alert, SafeAreaView, useWindowDimensions } from 'react-native';
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
  const { width } = useWindowDimensions();

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
        <Text style={styles.workerName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.workerEmail} numberOfLines={1}>{item.email}</Text>
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
          trackColor={{ false: '#D1D1D6', true: Colors.primary + '80' }}
          thumbColor={item.is_active ? Colors.primary : '#F2F2F7'}
          ios_backgroundColor="#D1D1D6"
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Workers</Text>
        <Text style={styles.subtitle}>{workers.length} maintenance staff</Text>
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
    padding: 20,
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
  errorText: {
    fontFamily: 'Cooper',
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 20,
  },
  subErrorText: {
    fontFamily: 'Cooper',
    fontSize: 15,
    fontWeight: 'normal',
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
    marginRight: 10,
  },
  workerName: {
    fontFamily: 'Cooper',
    fontSize: 17,
    fontWeight: 'normal',
    color: Colors.primary,
  },
  workerEmail: {
    fontFamily: 'Cooper',
    fontSize: 13,
    fontWeight: 'normal',
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
    fontFamily: 'Cooper',
    fontSize: 9,
    fontWeight: 'normal',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  actionArea: {
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: 'Cooper',
    fontSize: 10,
    fontWeight: 'normal',
    marginBottom: 4,
    textTransform: 'uppercase',
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
