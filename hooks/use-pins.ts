import { useQuery, useMutation } from 'convex/react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '@/convex/_generated/api';
import type { DreamCategory, PinType } from '@/convex/constants';
import type { Id } from '@/convex/_generated/dataModel';

type Pin = {
  _id: string;
  userId: string;
  type: PinType;
  title?: string;
  description?: string;
  category?: DreamCategory;
  tags?: string[];
  imageUrl?: string | null;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImageUrl?: string;
  linkDomain?: string;
  imageAspectRatio?: number;
  boardId?: string;
  originalPinId?: string;
  isPersonalOnly: boolean;
  customCategoryName?: string;
  customCategoryIcon?: string;
  customCategoryColor?: string;
  createdAt: number;
  username: string;
  displayName?: string;
  avatarInitial: string;
  authorIsPublic?: boolean;
};

export type { Pin };

export function useCommunityPins(options?: { category?: DreamCategory; type?: PinType }) {
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [cursorId, setCursorId] = useState<string | undefined>(undefined);
  const accumulatedRef = useRef<Pin[]>([]);

  const result = useQuery(api.pins.getCommunityPins, {
    cursor,
    cursorId,
    limit: 20,
    category: options?.category,
    type: options?.type,
  });

  // Reset accumulation when filters change
  const filterKey = `${options?.category ?? ''}-${options?.type ?? ''}`;
  const prevFilterRef = useRef(filterKey);
  useEffect(() => {
    if (prevFilterRef.current !== filterKey) {
      prevFilterRef.current = filterKey;
      accumulatedRef.current = [];
      setCursor(undefined);
      setCursorId(undefined);
    }
  }, [filterKey]);

  useEffect(() => {
    if (!result?.pins) return;
    if (cursor === undefined) {
      accumulatedRef.current = result.pins;
    } else {
      const existingIds = new Set(accumulatedRef.current.map((p) => p._id));
      const newPins = result.pins.filter((p) => !existingIds.has(p._id));
      accumulatedRef.current = [...accumulatedRef.current, ...newPins];
    }
  }, [result?.pins, cursor]);

  const pins = cursor === undefined ? (result?.pins ?? []) : accumulatedRef.current;
  const isLoading = result === undefined && cursor === undefined;
  const hasMore = result?.nextCursor !== null && result?.nextCursor !== undefined;
  const isPremium = result?.isPremium ?? false;

  const loadMore = useCallback(() => {
    if (result?.nextCursor != null) {
      setCursor(result.nextCursor);
      setCursorId(result.nextCursorId ?? undefined);
    }
  }, [result?.nextCursor, result?.nextCursorId]);

  return { pins, isLoading, hasMore, loadMore, isPremium };
}

export function useMyPins() {
  const result = useQuery(api.pins.getMyPins, {});
  return {
    pins: (result ?? []) as Pin[],
    isLoading: result === undefined,
  };
}

export function useMyBoards() {
  const result = useQuery(api.pins.listMyBoards, {});
  const createBoard = useMutation(api.pins.createBoard);
  const renameBoard = useMutation(api.pins.renameBoard);
  const deleteBoard = useMutation(api.pins.deleteBoard);

  return {
    boards: result ?? [],
    isLoading: result === undefined,
    createBoard: (name: string) => createBoard({ name }),
    renameBoard: (boardId: Id<'visionBoards'>, name: string) =>
      renameBoard({ boardId, name }),
    deleteBoard: (boardId: Id<'visionBoards'>) =>
      deleteBoard({ boardId }),
  };
}

export function useMyPinsByBoard(boardId: Id<'visionBoards'> | undefined) {
  const result = useQuery(
    api.pins.getMyPinsByBoard,
    boardId ? { boardId } : 'skip',
  );
  return {
    pins: (result ?? []) as Pin[],
    isLoading: result === undefined,
  };
}
