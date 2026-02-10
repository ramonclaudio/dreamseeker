import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@get_started_dismissed';

type GetStartedCard = {
  id: string;
  title: string;
  description: string;
  action: string;
};

const ALL_CARDS: GetStartedCard[] = [
  { id: 'create-dream', title: 'Dream it', description: 'Name what calls you', action: '/(app)/create-dream' },
  { id: 'add-action', title: 'Break it down', description: 'Big dreams, small steps', action: '' },
  { id: 'complete-action', title: 'Make your first move', description: 'Start your momentum', action: '/(app)/(tabs)/today' },
];

export function useGetStarted() {
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => { if (val) setDismissed(JSON.parse(val)); })
      .catch(() => {});
  }, []);

  const dismiss = useCallback(async (id: string) => {
    setDismissed((prev) => {
      const updated = [...prev, id];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const cards = ALL_CARDS.filter((c) => !dismissed.includes(c.id));

  return { cards, dismiss };
}
