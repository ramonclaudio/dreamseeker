import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { router } from "expo-router";

import { api } from "@/convex/_generated/api";
import type { Id, Doc } from "@/convex/_generated/dataModel";
import type { DreamCategory } from "@/constants/dreams";
import { haptics } from "@/lib/haptics";
import { timezone } from "@/lib/timezone";

type Action = Doc<"actions">;
export type DreamWithActions = Doc<"dreams"> & { actions: Action[] };

function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  buttonText = "Confirm",
  style: "destructive" | "default" = "default"
) {
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: buttonText, style, onPress: onConfirm },
  ]);
}

export function useDreamDetail(id: string) {
  const { isLoading: authLoading } = useConvexAuth();
  const [newActionText, setNewActionText] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [showEditDream, setShowEditDream] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);

  const dreamId = id as Id<"dreams">;
  const dream = useQuery(api.dreams.get, { id: dreamId });
  const journalEntries = useQuery(
    api.journal.listByDream,
    dream ? { dreamId } : "skip"
  );

  const createAction = useMutation(api.actions.create);
  const toggleAction = useMutation(api.actions.toggle);
  const updateAction = useMutation(api.actions.update);
  const removeAction = useMutation(api.actions.remove);
  const updateDream = useMutation(api.dreams.update);
  const completeDream = useMutation(api.dreams.complete);
  const archiveDream = useMutation(api.dreamLifecycle.archive);
  const reopenDream = useMutation(api.dreamLifecycle.reopen);
  const restoreDream = useMutation(api.dreamLifecycle.restore);
  const removeDream = useMutation(api.dreamLifecycle.remove);

  const handleAddAction = async () => {
    if (!newActionText.trim() || !dream) return;
    try {
      await createAction({ dreamId: dream._id, text: newActionText.trim() });
      haptics.success();
      setNewActionText("");
    } catch {
      haptics.error();
    }
  };

  const handleToggleAction = useCallback(
    async (actionId: Id<"actions">) => {
      // Get action state before toggle
      const actionToToggle = dream?.actions?.find((a: Action) => a._id === actionId);
      const wasCompleted = actionToToggle?.isCompleted ?? false;

      // Use selection haptic for the initial toggle
      haptics.selection();

      try {
        await toggleAction({ id: actionId, timezoneOffsetMinutes: new Date().getTimezoneOffset(), timezone });

        // Add success haptic when completing (not uncompleting)
        if (!wasCompleted) {
          haptics.success();
        }
      } catch {
        haptics.error();
      }
    },
    [toggleAction, dream?.actions]
  );

  const handleEditAction = useCallback((action: Action) => {
    haptics.selection();
    setEditingAction(action);
  }, []);

  const handleSaveAction = useCallback(
    async (text: string) => {
      if (!editingAction) return;
      try {
        await updateAction({ id: editingAction._id, text });
        haptics.success();
        setEditingAction(null);
      } catch {
        haptics.error();
      }
    },
    [editingAction, updateAction]
  );

  const handleDeleteAction = useCallback(
    (actionId: Id<"actions">) => {
      confirmAction(
        "Delete Action",
        "Are you sure? This will also deduct any XP earned from this action.",
        async () => {
          try {
            await removeAction({ id: actionId });
            haptics.warning();
          } catch {
            haptics.error();
          }
        },
        "Delete",
        "destructive"
      );
    },
    [removeAction]
  );

  const handleSaveDream = useCallback(
    async (data: {
      title?: string;
      whyItMatters?: string;
      targetDate?: number;
      category?: DreamCategory;
      customCategoryName?: string;
      customCategoryIcon?: string;
      customCategoryColor?: string;
    }) => {
      if (!dream) return;
      try {
        await updateDream({ id: dream._id, ...data });
        haptics.success();
      } catch {
        haptics.error();
      }
    },
    [dream, updateDream]
  );

  const handleCompleteDream = async () => {
    if (!dream || isCompleting) return;

    const doComplete = async () => {
      setIsCompleting(true);
      try {
        await completeDream({ id: dream._id });
        haptics.success();
        router.replace(`/(app)/dream-complete/${dream._id}` as never);
      } catch (error) {
        if (__DEV__) console.error("[Dream] Complete failed:", error);
        haptics.error();
      } finally {
        setIsCompleting(false);
      }
    };

    const hasIncompleteActions = dream.actions?.some((a: Action) => !a.isCompleted);
    if (hasIncompleteActions) {
      confirmAction(
        "Incomplete Actions",
        "You still have incomplete actions. Are you sure you want to mark this dream as complete?",
        doComplete,
        "Complete Anyway"
      );
      return;
    }

    doComplete();
  };

  const handleArchiveDream = () => {
    if (!dream) return;
    confirmAction(
      "Archive Dream",
      "Are you sure you want to archive this dream? You can restore it later.",
      async () => {
        try {
          await archiveDream({ id: dream._id });
          haptics.warning();
          router.back();
        } catch {
          haptics.error();
        }
      },
      "Archive",
      "destructive"
    );
  };

  const handleReopenDream = () => {
    if (!dream) return;
    confirmAction(
      "Reopen Dream",
      "This will mark the dream as active again and deduct the 100 XP that was awarded for completing it. Continue?",
      async () => {
        setIsCompleting(true);
        try {
          await reopenDream({ id: dream._id });
          haptics.warning();
        } catch (e) {
          haptics.error();
          if (e instanceof Error && e.message === "LIMIT_REACHED") {
            Alert.alert(
              "Dream Limit Reached",
              "You have reached your free dream limit. Upgrade to premium for unlimited dreams."
            );
          }
        } finally {
          setIsCompleting(false);
        }
      },
      "Reopen"
    );
  };

  const handleRestoreDream = () => {
    if (!dream) return;
    confirmAction(
      "Restore Dream",
      "This will restore the dream to your active dreams. Continue?",
      async () => {
        setIsCompleting(true);
        try {
          await restoreDream({ id: dream._id });
          haptics.success();
        } catch (e) {
          if (e instanceof Error && e.message === "LIMIT_REACHED") {
            Alert.alert(
              "Dream Limit Reached",
              "You have reached your free dream limit. Upgrade to premium for unlimited dreams."
            );
          } else {
            haptics.error();
          }
        } finally {
          setIsCompleting(false);
        }
      },
      "Restore"
    );
  };

  const handleDeleteDream = () => {
    if (!dream) return;
    confirmAction(
      "Delete Forever",
      "This will permanently delete this dream and all its actions. This cannot be undone.",
      async () => {
        try {
          await removeDream({ id: dream._id });
          haptics.warning();
          router.back();
        } catch {
          haptics.error();
        }
      },
      "Delete Forever",
      "destructive"
    );
  };

  return {
    authLoading,
    dream,
    dreamId,
    journalEntries,
    newActionText,
    setNewActionText,
    isCompleting,
    showEditDream,
    setShowEditDream,
    editingAction,
    setEditingAction,
    handleAddAction,
    handleToggleAction,
    handleEditAction,
    handleSaveAction,
    handleDeleteAction,
    handleSaveDream,
    handleCompleteDream,
    handleArchiveDream,
    handleReopenDream,
    handleRestoreDream,
    handleDeleteDream,
  } as const;
}
