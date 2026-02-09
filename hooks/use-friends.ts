import { useQuery, useMutation } from 'convex/react';
import { useCallback } from 'react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

export function useFriends() {
  const friends = useQuery(api.friends.listFriends) ?? [];
  const incomingRequests = useQuery(api.friends.listIncomingRequests) ?? [];
  const outgoingRequests = useQuery(api.friends.listOutgoingRequests) ?? [];
  const pendingCount = useQuery(api.friends.getPendingCount) ?? 0;
  const isLoading = useQuery(api.friends.listFriends) === undefined;

  const sendRequestMutation = useMutation(api.friends.sendRequest);
  const respondMutation = useMutation(api.friends.respondToRequest);
  const cancelMutation = useMutation(api.friends.cancelRequest);
  const unfriendMutation = useMutation(api.friends.unfriend);

  const sendRequest = useCallback(
    (toUserId: string) => sendRequestMutation({ toUserId }),
    [sendRequestMutation],
  );

  const acceptRequest = useCallback(
    (requestId: Id<'friendRequests'>) =>
      respondMutation({ requestId, accept: true }),
    [respondMutation],
  );

  const rejectRequest = useCallback(
    (requestId: Id<'friendRequests'>) =>
      respondMutation({ requestId, accept: false }),
    [respondMutation],
  );

  const cancelRequest = useCallback(
    (requestId: Id<'friendRequests'>) => cancelMutation({ requestId }),
    [cancelMutation],
  );

  const unfriend = useCallback(
    (friendId: string) => unfriendMutation({ friendId }),
    [unfriendMutation],
  );

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    pendingCount,
    isLoading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    unfriend,
  };
}
