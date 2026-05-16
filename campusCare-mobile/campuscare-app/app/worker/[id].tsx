import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, TouchableOpacity, ScrollView, TextInput, Image, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api, IMAGE_BASE_URL } from '../../src/services/api';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/Colors';

export default function WorkerTaskScreen() {
  const { id } = useLocalSearchParams();
  const [ticket, setTicket] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();

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

  if (loading) return (
    <View style={styles.centeredContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );

  if (!ticket) return (
    <View style={styles.centeredContainer}>
      <MaterialIcons name="error-outline" size={60} color={Colors.secondary} />
      <Text style={styles.errorText}>Task not found</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Task Details</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.categoryTitle}>{ticket.category}</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#F0F8F9' }]}>
              <Text style={[styles.statusBadgeText, { color: Colors.primary }]}>{ticket.status?.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.locationText} numberOfLines={1}>
              {ticket.building_name || ticket.location?.building_name || 'N/A'} - Room {ticket.room_number || ticket.location?.room_number || 'N/A'}
            </Text>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.detailLabel}>Task Description</Text>
            <Text style={styles.descriptionText}>{ticket.description}</Text>
          </View>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.sectionHeader}>Update Task Status</Text>
          <View style={styles.buttonRow}>
            {['in_progress', 'resolved'].map((s) => (
              <TouchableOpacity 
                key={s} 
                style={[styles.statusButton, ticket.status === s && styles.statusButtonActive]} 
                onPress={() => updateStatus(s)}
              >
                <Text style={[styles.statusButtonText, ticket.status === s && styles.statusButtonTextActive]}>{s.replace('_', ' ').toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionHeader}>Photo Proof</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.outlinedActionButton} onPress={() => handleImagePick(true)} disabled={uploading}>
              {uploading ? <ActivityIndicator color={Colors.primary} /> : (
                <>
                  <MaterialIcons name="camera-alt" size={20} color={Colors.primary} />
                  <Text style={styles.outlinedActionButtonText}>Camera</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlinedActionButton} onPress={() => handleImagePick(false)} disabled={uploading}>
              <MaterialIcons name="photo-library" size={20} color={Colors.primary} />
              <Text style={styles.outlinedActionButtonText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionHeader}>Add Completion Note</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Add any additional notes about the work..." 
            placeholderTextColor={Colors.accent}
            value={comment} 
            onChangeText={setComment} 
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity style={styles.submitButton} onPress={addComment}>
            <MaterialIcons name="check-circle" size={20} color={Colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.submitButtonText}>Submit Note</Text>
          </TouchableOpacity>
        </View>

        {ticket.comments && ticket.comments.length > 0 && (
          <View style={styles.historyCard}>
            <Text style={styles.sectionHeader}>Activity History</Text>
            {ticket.comments.map((comment: any, index: number) => (
              <View key={index} style={[styles.historyItem, index === ticket.comments.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.historyMeta}>
                  <Text style={styles.historyAuthor}>{comment.author_name || 'Worker'}</Text>
                  <Text style={styles.historyDate}>{new Date(comment.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.historyText}>{comment.body}</Text>
                {comment.completion_photo_url && (
                  <View style={[styles.proofImageContainer, { height: width * 0.45 }]}>
                    <Image 
                      source={{ uri: `${IMAGE_BASE_URL}${comment.completion_photo_url}` }} 
                      style={styles.proofImage} 
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>
            ))}
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
    marginBottom: 20,
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F9',
    padding: 12,
    borderRadius: 15,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'normal',
    flex: 1,
    fontFamily: 'Cooper'
  },
  descriptionSection: {
    marginTop: 5,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: 'normal',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
    fontFamily: 'Cooper'
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.secondary,
    lineHeight: 20,
    fontFamily: 'Cooper',
    fontWeight: 'normal'
  },
  actionCard: { 
    backgroundColor: Colors.surface, 
    padding: 20, 
    borderRadius: 25, 
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  sectionHeader: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: Colors.primary,
    marginBottom: 12, 
    marginTop: 5,
    fontFamily: 'Cooper'
  },
  buttonRow: { 
    flexDirection: 'row', 
    gap: 12,
    marginBottom: 20,
  },
  statusButton: { 
    flex: 1,
    backgroundColor: '#F0F8F9', 
    paddingVertical: 12, 
    borderRadius: 12, 
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  statusButtonActive: { 
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusButtonText: { 
    color: Colors.primary, 
    fontSize: 12, 
    fontWeight: 'normal',
    fontFamily: 'Cooper'
  },
  statusButtonTextActive: { 
    color: Colors.white,
    fontFamily: 'Cooper',
    fontWeight: 'normal'
  },
  outlinedActionButton: { 
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', 
    borderWidth: 1.5, 
    borderColor: Colors.primary, 
    borderStyle: 'dashed',
    paddingVertical: 12, 
    borderRadius: 12, 
  },
  outlinedActionButtonText: { 
    color: Colors.primary, 
    fontWeight: 'normal', 
    fontSize: 13,
    marginLeft: 8,
    fontFamily: 'Cooper'
  },
  input: { 
    borderWidth: 1.5, 
    borderColor: Colors.accent, 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 15, 
    backgroundColor: '#fff',
    color: Colors.primary,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    fontFamily: 'Cooper',
    fontWeight: 'normal'
  },
  submitButton: { 
    backgroundColor: Colors.primary, 
    flexDirection: 'row',
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: Colors.white,
    fontWeight: 'normal',
    fontSize: 15,
    fontFamily: 'Cooper'
  },
  historyCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 25,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  historyItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyAuthor: {
    fontWeight: 'normal',
    fontSize: 11,
    color: Colors.primary,
    textTransform: 'uppercase',
    fontFamily: 'Cooper'
  },
  historyDate: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: 'normal',
    fontFamily: 'Cooper'
  },
  historyText: {
    fontSize: 13,
    color: Colors.secondary,
    lineHeight: 18,
    fontFamily: 'Cooper',
    fontWeight: 'normal'
  },
  proofImageContainer: {
    width: '100%',
    borderRadius: 15,
    marginTop: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  proofImage: {
    width: '100%',
    height: '100%',
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
