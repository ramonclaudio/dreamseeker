import { useQuery } from 'convex/react';
import { useState, useEffect } from 'react';
import { api } from '@/convex/_generated/api';

export function useCommunity() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    if (!searchQuery.trim()) {
      setDebouncedQuery('');
      return;
    }
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchResults = useQuery(
    api.community.searchUsers,
    debouncedQuery.length > 0 ? { query: debouncedQuery } : 'skip',
  );

  const isSearching = debouncedQuery.length > 0 && searchResults === undefined;

  return { searchQuery, setSearchQuery, searchResults, isSearching };
}
