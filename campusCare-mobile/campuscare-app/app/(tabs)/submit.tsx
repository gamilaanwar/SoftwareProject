import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image, SafeAreaView, useWindowDimensions } from 'react-native';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/Colors';

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
  const { width } = useWindowDimensions();

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
      Alert.alert('Error', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Report an Issue</Text>
          <Text style={styles.subtitle}>Help us keep our campus in top shape</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.label}>Issue Details</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Category (e.g. Plumbing, Electrical)" 
              placeholderTextColor={Colors.accent}
              value={category} 
              onChangeText={setCategory} 
            />
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="Describe the issue in detail" 
              placeholderTextColor={Colors.accent}
              value={description} 
              onChangeText={setDescription} 
              multiline 
              numberOfLines={4} 
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Location</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Building Name" 
              placeholderTextColor={Colors.accent}
              value={building} 
              onChangeText={setBuilding} 
            />
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Floor" 
                  placeholderTextColor={Colors.accent}
                  value={floor} 
                  onChangeText={setFloor} 
                  keyboardType="numeric" 
                />
              </View>
              <View style={styles.halfWidth}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Room #" 
                  placeholderTextColor={Colors.accent}
                  value={room} 
                  onChangeText={setRoom} 
                />
              </View>
            </View>
            <TextInput 
              style={[styles.input, styles.textAreaSmall]} 
              placeholder="Additional location notes (Optional)" 
              placeholderTextColor={Colors.accent}
              value={locationNotes} 
              onChangeText={setLocationNotes} 
              multiline 
            />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.label}>Attach Photo</Text>
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <MaterialIcons name="photo-library" size={20} color={Colors.primary} />
                <Text style={styles.imageButtonText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <MaterialIcons name="camera-alt" size={20} color={Colors.primary} />
                <Text style={styles.imageButtonText}>Camera</Text>
              </TouchableOpacity>
            </View>
            {image && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={[styles.imagePreview, { height: width * 0.5 }]} resizeMode="cover" />
                <TouchableOpacity style={styles.removeImage} onPress={() => setImage(null)}>
                  <MaterialIcons name="cancel" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <MaterialIcons name="send" size={20} color={Colors.white} style={{ marginRight: 10 }} />
                <Text style={styles.buttonText}>Submit Report</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background, 
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: { 
    fontFamily: 'Cooper',
    fontSize: 26, 
    fontWeight: 'bold', 
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: 'Cooper',
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: 'normal',
    marginTop: 2,
  },
  form: { 
    backgroundColor: Colors.surface, 
    padding: 20, 
    borderRadius: 20, 
    shadowColor: Colors.primary, 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 20, 
    elevation: 5,
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  label: { 
    fontFamily: 'Cooper',
    fontSize: 12, 
    fontWeight: 'normal', 
    color: Colors.primary, 
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: { 
    fontFamily: 'Cooper',
    height: 48, 
    borderColor: Colors.accent, 
    borderWidth: 1.5, 
    borderRadius: 12, 
    marginBottom: 10, 
    paddingHorizontal: 15, 
    fontSize: 15,
    fontWeight: 'normal',
    color: Colors.primary,
    backgroundColor: '#fff',
  },
  textArea: { 
    height: 100, 
    paddingTop: 12, 
    textAlignVertical: 'top' 
  },
  textAreaSmall: {
    height: 60,
    paddingTop: 12,
    textAlignVertical: 'top'
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  halfWidth: { 
    width: '48%' 
  },
  imageActions: { 
    flexDirection: 'row', 
    marginBottom: 10, 
    gap: 12 
  },
  imageButton: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 48, 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: Colors.primary, 
    borderStyle: 'dashed',
    backgroundColor: 'rgba(11, 46, 51, 0.05)',
  },
  imageButtonText: { 
    fontFamily: 'Cooper',
    color: Colors.primary, 
    marginLeft: 8, 
    fontWeight: 'normal',
    fontSize: 13,
  },
  imagePreviewContainer: { 
    position: 'relative', 
    marginTop: 5, 
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  imagePreview: { 
    width: '100%', 
  },
  removeImage: { 
    position: 'absolute', 
    top: 8, 
    right: 8, 
    backgroundColor: '#fff', 
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  button: { 
    backgroundColor: Colors.primary, 
    height: 52, 
    borderRadius: 12, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { 
    fontFamily: 'Cooper',
    color: Colors.white, 
    fontSize: 16, 
    fontWeight: 'normal' 
  }
});
