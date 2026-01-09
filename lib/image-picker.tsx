import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export type ImagePickerResult = { uri: string; canceled: false } | { canceled: true };

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

export function createImageInput(_onSelect: (uri: string) => void): null {
  return null;
}

export function triggerImageInput(_input: null, useCamera: boolean, onSelect: (uri: string) => void): void {
  pickImage(useCamera).then((result) => {
    if (!result.canceled) onSelect(result.uri);
  });
}
