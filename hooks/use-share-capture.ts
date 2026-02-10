import { useRef, useCallback, useState } from 'react';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export function useShareCapture() {
  const viewShotRef = useRef<ViewShot>(null);
  const [isSharing, setIsSharing] = useState(false);

  const capture = useCallback(async () => {
    setIsSharing(true);
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (uri) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your achievement',
        });
      }
    } catch {
      // Sharing cancelled or failed
    } finally {
      setIsSharing(false);
    }
  }, []);

  return { viewShotRef, capture, isSharing };
}
