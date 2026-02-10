import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export type ImagePickerResult = { uri: string; canceled: false } | { canceled: true };
export type PinImagePickerResult = { uri: string; width: number; height: number; canceled: false } | { canceled: true };

export async function pickImage(useCamera: boolean): Promise<ImagePickerResult> {
  if (useCamera) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return { canceled: true };
    }
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library permission is required to select photos.');
      return { canceled: true };
    }
  }

  const result = useCamera
    ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });

  if (result.canceled || !result.assets[0]) return { canceled: true };
  return { uri: result.assets[0].uri, canceled: false };
}

/** Pick an image for pins — any aspect ratio, no forced square crop. */
export async function pickImageForPin(useCamera: boolean): Promise<PinImagePickerResult> {
  if (useCamera) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return { canceled: true };
    }
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library permission is required to select photos.');
      return { canceled: true };
    }
  }

  const result = useCamera
    ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });

  if (result.canceled || !result.assets[0]) return { canceled: true };
  const asset = result.assets[0];
  return { uri: asset.uri, width: asset.width, height: asset.height, canceled: false };
}
