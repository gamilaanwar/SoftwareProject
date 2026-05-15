import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

export default function SubmitIssueScreen() {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [room, setRoom] = useState('');
  const [locationNotes, setLocationNotes] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    console.log('--- SUBMIT DEBUG ---');
    console.log('States:', { category, description, building, floor, room, locationNotes });

    if (!category || !description || !building || !floor || !room) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description);
      formData.append('building_name', building);
      formData.append('floor', floor);
      formData.append('room_number', room);
      formData.append('location_notes', locationNotes);

      if (image) {
        const filename = image.split('/').pop() || 'photo.jpg';
        formData.append('image', { uri: image, name: filename, type: 'image/jpeg' } as any);
      }

      console.log('FormData ready. Submitting...');
      const response = await api.issues.submit(formData);

      if (response.success) {
        Alert.alert('Success', 'Issue reported successfully!', [
          { text: 'OK', onPress: () => {
            setCategory('');
            setDescription('');
            setBuilding('');
            setFloor('');
            setRoom('');
            setLocationNotes('');
            setImage(null);
            router.push('/(tabs)');
          }}
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to submit issue');
      }
    } catch (error: any) {
      console.error('Submit issue error:', error);
      Alert.alert('Error', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Report an Issue</Text>
      <View style={styles.form}>
        <Text style={styles.label}>Category</Text>
        <TextInput style={styles.input} placeholder="e.g. Plumbing, Electrical" value={category} onChangeText={setCategory} />
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Describe the issue" value={description} onChangeText={setDescription} multiline numberOfLines={4} />
        <Text style={styles.label}>Building Name</Text>
        <TextInput style={styles.input} placeholder="Building A" value={building} onChangeText={setBuilding} />
        <View style={styles.row}>
          <View style={styles.halfWidth}><TextInput style={styles.input} placeholder="Floor" value={floor} onChangeText={setFloor} keyboardType="numeric" /></View>
          <View style={styles.halfWidth}><TextInput style={styles.input} placeholder="Room #" value={room} onChangeText={setRoom} /></View>
        </View>
        <Text style={styles.label}>Additional Notes</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Optional" value={locationNotes} onChangeText={setLocationNotes} multiline />
        
        <Text style={styles.label}>Attach Photo</Text>
        <View style={styles.imageActions}>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}><Text style={styles.imageButtonText}>Gallery</Text></TouchableOpacity>
          <TouchableOpacity style={styles.imageButton} onPress={takePhoto}><Text style={styles.imageButtonText}>Camera</Text></TouchableOpacity>
        </View>
        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImage} onPress={() => setImage(null)}><MaterialIcons name="cancel" size={24} color="#FF3B30" /></TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Report</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, marginTop: 10 },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  input: { height: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: 5, marginBottom: 15, paddingHorizontal: 15, fontSize: 16 },
  textArea: { height: 100, paddingTop: 10, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
  imageActions: { flexDirection: 'row', marginBottom: 15, gap: 15 },
  imageButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 45, borderRadius: 5, borderWidth: 1, borderColor: '#007AFF', borderStyle: 'dashed' },
  imageButtonText: { color: '#007AFF', marginLeft: 8, fontWeight: '600' },
  imagePreviewContainer: { position: 'relative', marginBottom: 15, alignItems: 'center' },
  imagePreview: { width: '100%', height: 200, borderRadius: 10 },
  removeImage: { position: 'absolute', top: -10, right: -10, backgroundColor: '#fff', borderRadius: 12 },
  button: { backgroundColor: '#007AFF', height: 50, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
