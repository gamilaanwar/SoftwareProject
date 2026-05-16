import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, TouchableOpacity, ScrollView, SafeAreaView, Image, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api, IMAGE_BASE_URL } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../src/constants/Colors';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();

  useEffect(() => {
    fetchTicketDetails();
    if (user?.role === 'facility_manager') {
      fetchWorkers();
    }
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      const response = await api.issues.getById(id as string);
      if (response.success) setTicket(response.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await api.manager.getWorkers();
      if (response.success) setWorkers(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await api.issues.updateStatus(id as string, status);
      Alert.alert('Success', 'Status updated');
      fetchTicketDetails();
    } catch (e) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const updatePriority = async (priority: string) => {
    const backendPriority = priority === 'medium' ? 'normal' : priority;
    try {
      await api.issues.updatePriority(id as string, backendPriority);
      Alert.alert('Success', 'Priority updated');
      fetchTicketDetails();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update priority');
    }
  };

  const assignWorker = async (workerId: string) => {
    try {
      await api.issues.assign(id as string, workerId);
      Alert.alert('Success', 'Worker assigned');
      fetchTicketDetails();
    } catch (e) {
      Alert.alert('Error', 'Failed to assign worker');
    }
  };

  const handleImagePick = async (useCamera: boolean) => {
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    };

    let result = useCamera 
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) {
      setUploading(true);
      const formData = new FormData();
      formData.append('photo', { 
        uri: result.assets[0].uri, 
        name: 'proof.jpg', 
        type: 'image/jpeg' 
      } as any);
      
      try {
        await api.issues.uploadPhoto(id as string, formData);
        Alert.alert('Success', 'Proof uploaded');
        fetchTicketDetails();
      } catch (e) {
        Alert.alert('Error', 'Failed to upload photo');
      } finally {
        setUploading(false);
      }
    }
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return '#FF3B30';
      case 'normal': return '#FF9500';
      case 'low': return '#FFCC00';
      default: return '#8E8E93';
    }
  };

  if (loading) return (
    <View style={styles.centeredContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
  
  if (!ticket) return (
    <View style={styles.centeredContainer}>
      <MaterialIcons name="error-outline" size={60} color={Colors.secondary} />
      <Text style={styles.errorText}>Ticket not found</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Ticket Details</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.categoryTitle}>{ticket.category}</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#F0F8F9' }]}>
              <Text style={[styles.statusBadgeText, { color: Colors.primary }]}>{ticket.status?.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>

          {ticket.image_url && (
            <View style={[styles.imageContainer, { height: width * 0.55 }]}>
                <Image 
                  source={{ uri: `${IMAGE_BASE_URL}${ticket.image_url}` }} 
                  style={styles.ticketImage} 
                  resizeMode="cover"
                />
                <View style={styles.reporterInfo}>
                  <MaterialIcons name="person" size={14} color={Colors.white} />
                  <Text style={styles.reporterText}>By {ticket.reporter_name}</Text>
                </View>
            </View>
          )}

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Priority</Text>
              <View style={styles.priorityContainer}>
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(ticket.priority) }]} />
                <Text style={[styles.detailValue, {color: getPriorityColor(ticket.priority), fontWeight: '700'}]}>
                  {ticket.priority === 'normal' ? 'MEDIUM' : (ticket.priority?.toUpperCase() || 'LOW')}
                </Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{ticket.building_name || 'N/A'} - {ticket.room_number || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.descriptionText}>{ticket.description}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Activity & Updates</Text>
        <View style={styles.updatesCard}>
          {ticket.comments && ticket.comments.length > 0 ? (
            ticket.comments.map((comment: any, index: number) => (
              <View key={index} style={[styles.commentItem, index === ticket.comments.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.commentMeta}>
                    <Text style={styles.commentAuthor}>
                        {comment.completion_photo_url ? 'WORKER UPDATE' : (comment.author_name || 'Worker')}
                    </Text>
                    <Text style={styles.commentDate}>{new Date(comment.created_at).toLocaleDateString()}</Text>
                </View>
                {comment.body !== 'Photo proof uploaded' && <Text style={styles.commentText}>{comment.body}</Text>}
                {comment.completion_photo_url && (
                  <View style={[styles.proofContainer, { height: width * 0.45 }]}>
                    <Image 
                      source={{ uri: `${IMAGE_BASE_URL}${comment.completion_photo_url}` }} 
                      style={styles.proofImage} 
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyActivity}>
              <MaterialIcons name="history" size={32} color={Colors.accent} />
              <Text style={styles.emptyText}>No activity recorded yet.</Text>
            </View>
          )}
        </View>

        {user?.role === 'worker' && (
            <View style={styles.actionSection}>
              <Text style={styles.sectionHeader}>Update Task</Text>
              <View style={styles.buttonRow}>
                {['in_progress', 'resolved'].map((s) => (
                    <TouchableOpacity 
                      key={s} 
                      style={[styles.actionButton, ticket.status === s && styles.actionButtonActive]} 
                      onPress={() => updateStatus(s)}
                    >
                        <Text style={[styles.actionButtonText, ticket.status === s && styles.actionButtonTextActive]}>{s.replace('_', ' ').toUpperCase()}</Text>
                    </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.sectionHeader}>Upload Proof</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.outlinedActionButton} onPress={() => handleImagePick(true)}>
                  <MaterialIcons name="camera-alt" size={20} color={Colors.primary} />
                  <Text style={styles.outlinedActionButtonText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.outlinedActionButton} onPress={() => handleImagePick(false)}>
                  <MaterialIcons name="photo-library" size={20} color={Colors.primary} />
                  <Text style={styles.outlinedActionButtonText}>Gallery</Text>
                </TouchableOpacity>
              </View>
              {uploading && <ActivityIndicator style={{marginTop: 10}} color={Colors.primary} />}
            </View>
        )}

        {user?.role === 'facility_manager' && (
          <View style={styles.actionSection}>
            <Text style={styles.sectionHeader}>Manage Priority</Text>
            <View style={styles.buttonRow}>
              {['low', 'normal', 'high'].map((p) => (
                <TouchableOpacity 
                  key={p} 
                  style={[styles.smallActionButton, (ticket.priority === p || (ticket.priority === 'normal' && p === 'medium')) && styles.actionButtonActive]} 
                  onPress={() => updatePriority(p)}
                >
                  <Text style={[styles.smallActionButtonText, (ticket.priority === p || (ticket.priority === 'normal' && p === 'medium')) && styles.actionButtonTextActive]}>{p === 'normal' ? 'MID' : p.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>            
            
            <Text style={styles.sectionHeader}>Update Ticket Status</Text>
            <View style={styles.buttonRowWrap}>
              {['pending', 'assigned', 'in_progress', 'resolved', 'denied'].map((s) => (
                <TouchableOpacity 
                  key={s} 
                  style={[styles.smallActionButton, ticket.status === s && styles.actionButtonActive]} 
                  onPress={() => updateStatus(s)}
                >
                  <Text style={[styles.smallActionButtonText, ticket.status === s && styles.actionButtonTextActive]}>{s.replace('_', ' ').toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionHeader}>Assign to Worker</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.workerScroll}>
              {workers.map((w) => (
                <TouchableOpacity 
                  key={w.user_id} 
                  style={[styles.workerChip, ticket.assigned_worker_id === w.user_id && styles.workerChipActive]} 
                  onPress={() => assignWorker(w.user_id)}
                >
                  <MaterialIcons name="person" size={16} color={ticket.assigned_worker_id === w.user_id ? Colors.white : Colors.primary} style={{marginRight: 6}} />
                  <Text style={ticket.assigned_worker_id === w.user_id ? styles.workerChipTextActive : styles.workerChipText}>{w.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
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
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.white, flex: 1, fontFamily: 'Cooper' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  mainCard: { 
    backgroundColor: Colors.surface, 
    padding: 20, 
    borderRadius: 25, 
    marginBottom: 25,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
    fontFamily: 'Cooper'
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginLeft: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'normal',
    fontFamily: 'Cooper'
  },
  imageContainer: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    backgroundColor: '#F0F0F0',
  },
  ticketImage: {
    width: '100%',
    height: '100%',
  },
  reporterInfo: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reporterText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: 'normal',
    marginLeft: 4,
    fontFamily: 'Cooper'
  },
  detailsGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 15,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: 'normal',
    textTransform: 'uppercase',
    marginBottom: 5,
    fontFamily: 'Cooper'
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: 'normal',
    fontFamily: 'Cooper'
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  descriptionSection: {
    marginTop: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.secondary,
    lineHeight: 20,
    fontFamily: 'Cooper',
    fontWeight: 'normal'
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
    marginTop: 5,
    fontFamily: 'Cooper'
  },
  updatesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 25,
    padding: 5,
    marginBottom: 25,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  commentItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  commentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentAuthor: {
    fontWeight: 'normal',
    fontSize: 11,
    color: Colors.primary,
    textTransform: 'uppercase',
    fontFamily: 'Cooper'
  },
  commentDate: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: 'normal',
    fontFamily: 'Cooper'
  },
  commentText: {
    fontSize: 13,
    color: Colors.secondary,
    lineHeight: 18,
    fontFamily: 'Cooper',
    fontWeight: 'normal'
  },
  proofContainer: {
    marginTop: 10,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#F0F0F0',
  },
  proofImage: {
    width: '100%',
    height: '100%',
  },
  emptyActivity: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.accent,
    fontSize: 14,
    marginTop: 10,
    fontWeight: 'normal',
    fontFamily: 'Cooper'
  },
  actionSection: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 25,
    marginBottom: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  buttonRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F0F8F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  actionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: 'normal',
    fontFamily: 'Cooper'
  },
  actionButtonTextActive: {
    color: Colors.white,
    fontFamily: 'Cooper',
    fontWeight: 'normal'
  },
  outlinedActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(11, 46, 51, 0.05)',
  },
  outlinedActionButtonText: {
    color: Colors.primary,
    fontWeight: 'normal',
    fontSize: 13,
    marginLeft: 8,
    fontFamily: 'Cooper'
  },
  smallActionButton: {
    backgroundColor: '#F0F8F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  smallActionButtonText: {
    fontSize: 10,
    fontWeight: 'normal',
    color: Colors.primary,
    fontFamily: 'Cooper'
  },
  workerScroll: {
    flexDirection: 'row',
    marginTop: 5,
  },
  workerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    marginRight: 10,
  },
  workerChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  workerChipText: {
    color: Colors.primary,
    fontWeight: 'normal',
    fontSize: 12,
    fontFamily: 'Cooper'
  },
  workerChipTextActive: {
    color: Colors.white,
    fontWeight: 'normal',
    fontFamily: 'Cooper'
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: 'normal',
    marginTop: 15,
    fontFamily: 'Cooper'
  }
});
