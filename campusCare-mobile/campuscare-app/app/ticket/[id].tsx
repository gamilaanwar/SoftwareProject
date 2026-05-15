import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

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

  const addComment = async () => {
    if (!comment) return;
    try {
      await api.issues.addComment(id as string, comment);
      setComment('');
      Alert.alert('Success', 'Comment added');
      fetchTicketDetails();
    } catch (e) {
      Alert.alert('Error', 'Failed to add comment');
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

  if (loading) return <ActivityIndicator style={styles.centered} size="large" />;
  if (!ticket) return <View style={styles.centered}><Text>Task not found</Text></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket Details</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Problem Details</Text>
          {ticket.image_url && (
            <View style={{ marginBottom: 15 }}>
                <Text style={styles.labelSmall}>Submitted by: {ticket.reporter_name}</Text>
                <Image source={{ uri: `http://192.168.1.136:5001${ticket.image_url}` }} style={styles.proofImage} />
            </View>
          )}
          <Text style={styles.label}>Category: <Text style={styles.value}>{ticket.category}</Text></Text>
          <Text style={styles.label}>Priority: <Text style={[styles.value, {color: getPriorityColor(ticket.priority)}]}>{ticket.priority === 'normal' ? 'MEDIUM' : (ticket.priority?.toUpperCase() || 'LOW')}</Text></Text>
          <Text style={styles.label}>Location: <Text style={styles.value}>{ticket.building_name || 'N/A'} - Room {ticket.room_number || 'N/A'}</Text></Text>
          <Text style={styles.label}>Status: <Text style={styles.value}>{ticket.status?.replace('_', ' ').toUpperCase()}</Text></Text>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>{ticket.description}</Text>
        </View>

        <Text style={styles.sectionTitle}>Comments & Proof</Text>
        <View style={styles.card}>
          {ticket.comments && ticket.comments.length > 0 ? (
            ticket.comments.map((comment: any, index: number) => (
              <View key={index} style={styles.comment}>
                <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>
                        {comment.completion_photo_url ? 'Uploaded by Worker' : (comment.author_name || 'Worker')}
                    </Text>
                    <Text style={styles.commentDate}>{new Date(comment.created_at).toLocaleDateString()}</Text>
                </View>
                {comment.body !== 'Photo proof uploaded' && <Text style={styles.commentBody}>{comment.body}</Text>}
                {comment.completion_photo_url && (
                  <Image source={{ uri: `http://192.168.1.136:5001${comment.completion_photo_url}` }} style={styles.proofImage} />
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No updates yet.</Text>
          )}
        </View>

        {user?.role === 'worker' && (
            <View style={styles.actions}>
              <Text style={styles.sectionTitle}>Update Status</Text>
              <View style={styles.statusButtons}>
                {['in_progress', 'resolved'].map((s) => (
                    <TouchableOpacity key={s} style={[styles.button, ticket.status === s && styles.buttonActive]} onPress={() => updateStatus(s)}>
                        <Text style={[styles.buttonText, ticket.status === s && styles.buttonTextActive]}>{s.toUpperCase()}</Text>
                    </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.sectionTitle}>Submit Proof</Text>
              <View style={styles.row}>
                <TouchableOpacity style={styles.outlinedButton} onPress={() => handleImagePick(true)}><Text style={styles.outlinedButtonText}>Take Photo</Text></TouchableOpacity>
                <TouchableOpacity style={styles.outlinedButton} onPress={() => handleImagePick(false)}><Text style={styles.outlinedButtonText}>From Gallery</Text></TouchableOpacity>
              </View>
            </View>
        )}

        {user?.role === 'facility_manager' && (
          <View style={styles.actions}>
            <Text style={styles.sectionTitle}>Manage Priority</Text>
            <View style={styles.statusButtons}>
              {['low', 'normal', 'high'].map((p) => (
                <TouchableOpacity 
                  key={p} 
                  style={[styles.button, (ticket.priority === p || (ticket.priority === 'normal' && p === 'medium')) && styles.buttonActive]} 
                  onPress={() => updatePriority(p)}
                >
                  <Text style={[styles.buttonText, (ticket.priority === p || (ticket.priority === 'normal' && p === 'medium')) && styles.buttonTextActive]}>{p === 'normal' ? 'MEDIUM' : p.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>            
            <Text style={styles.sectionTitle}>Manage Ticket Status</Text>
            <View style={styles.statusButtons}>
              {['pending', 'assigned', 'in_progress', 'resolved', 'denied'].map((s) => (
                <TouchableOpacity 
                  key={s} 
                  style={[styles.button, ticket.status === s && styles.buttonActive]} 
                  onPress={() => updateStatus(s)}
                >
                  <Text style={[styles.buttonText, ticket.status === s && styles.buttonTextActive]}>{s.replace('_', ' ').toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>Assign Worker</Text>
            <View style={styles.workerList}>
              {workers.map((w) => (
                <TouchableOpacity 
                  key={w.user_id} 
                  style={[styles.workerItem, ticket.assigned_worker_id === w.user_id && styles.workerItemActive]} 
                  onPress={() => assignWorker(w.user_id)}
                >
                  <Text style={ticket.assigned_worker_id === w.user_id ? styles.workerTextActive : styles.workerText}>{w.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 16 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, marginBottom: 16 },
  label: { fontSize: 15, fontWeight: '600', color: '#3A3A3C', marginBottom: 4 },
  labelSmall: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 4 },
  value: { fontSize: 15, fontWeight: '400', color: '#1C1C1E' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  actions: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, marginBottom: 40 },
  statusButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: { backgroundColor: '#E5E5EA', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginBottom: 8 },
  buttonActive: { backgroundColor: '#007AFF' },
  buttonText: { color: '#1C1C1E', fontSize: 12, fontWeight: '600' },
  buttonTextActive: { color: '#FFF' },
  outlinedButton: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#007AFF', paddingVertical: 12, borderRadius: 8, flex: 1, alignItems: 'center' },
  outlinedButtonText: { color: '#007AFF', fontWeight: '600', fontSize: 14 },
  workerList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  workerItem: { padding: 10, backgroundColor: '#E5E5EA', borderRadius: 6, marginBottom: 8 },
  workerItemActive: { backgroundColor: '#007AFF' },
  workerText: { color: '#1C1C1E' },
  workerTextActive: { color: '#FFF' },
  comment: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E5E5EA', paddingBottom: 10 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentAuthor: { fontWeight: '600', fontSize: 13, color: '#3A3A3C' },
  commentDate: { fontSize: 12, color: '#8E8E93' },
  commentBody: { fontSize: 14, color: '#1C1C1E' },
  proofImage: { width: '100%', height: 200, borderRadius: 8, marginTop: 8 },
  emptyText: { color: '#8E8E93', fontSize: 14 }
});
