import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

export default function WorkerTaskScreen() {
  const { id } = useLocalSearchParams();
  const [ticket, setTicket] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await api.issues.getById(id as string);
      if (response.success) setTicket(response.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await api.issues.updateStatus(id as string, status);
      Alert.alert('Success', 'Status updated');
      fetchTicket();
    } catch (e) {
      Alert.alert('Error', 'Failed to update');
    }
  };

  const addComment = async () => {
    if (!comment) return;
    try {
      await api.issues.addComment(id as string, comment);
      setComment('');
      Alert.alert('Success', 'Comment added');
      fetchTicket();
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

    let result;
    if (useCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required');
        return;
      }
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

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
        fetchTicket();
      } catch (e) {
        Alert.alert('Error', 'Failed to upload photo');
      } finally {
        setUploading(false);
      }
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
        <Text style={styles.headerTitle}>Task Details</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.label}>Category: <Text style={styles.value}>{ticket.category}</Text></Text>
          <Text style={styles.label}>Location: <Text style={styles.value}>{ticket.building_name || ticket.location?.building_name || 'N/A'} - Room {ticket.room_number || ticket.location?.room_number || 'N/A'}</Text></Text>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>{ticket.description}</Text>
        </View>

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
            <TouchableOpacity style={styles.outlinedButton} onPress={() => handleImagePick(true)} disabled={uploading}>
              {uploading ? <ActivityIndicator color="#007AFF" /> : <Text style={styles.outlinedButtonText}>Take Photo</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlinedButton} onPress={() => handleImagePick(false)} disabled={uploading}>
              <Text style={styles.outlinedButtonText}>From Gallery</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionTitle}>Add Comment</Text>
          <TextInput style={styles.input} placeholder="Work notes..." value={comment} onChangeText={setComment} />
          <TouchableOpacity style={styles.submitButton} onPress={addComment}>
            <Text style={styles.buttonText}>Submit Comment</Text>
          </TouchableOpacity>
        </View>
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
  value: { fontSize: 15, fontWeight: '400', color: '#1C1C1E' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  actions: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, marginBottom: 40 },
  statusButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: { backgroundColor: '#E5E5EA', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginBottom: 8 },
  buttonActive: { backgroundColor: '#007AFF' },
  buttonText: { color: '#1C1C1E', fontSize: 12, fontWeight: '600' },
  buttonTextActive: { color: '#FFF' },
  outlinedButton: { 
    backgroundColor: 'transparent', 
    borderWidth: 1.5, 
    borderColor: '#007AFF', 
    paddingVertical: 12, 
    borderRadius: 8, 
    flex: 1, 
    alignItems: 'center' 
  },
  outlinedButtonText: { color: '#007AFF', fontWeight: '600', fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#E5E5EA', padding: 12, borderRadius: 8, marginBottom: 10, backgroundColor: '#FAFAFA' },
  submitButton: { backgroundColor: '#4CD964', padding: 14, borderRadius: 8, alignItems: 'center' },
  row: { flexDirection: 'row', gap: 10 }
});
