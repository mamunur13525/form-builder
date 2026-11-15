import { useCallback, useRef } from "react";
import {
  updatePage as updatePageApi,
  reorderPages as reorderPagesApi,
} from "@/entities/form/api/page.api";
import {
  updateEndPage as updateEndPageApi,
  reorderEndPages as reorderEndPagesApi,
} from "@/entities/form/api/end-page.api";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { SaveStatus } from "@/features/forms/hooks/form-context";

interface BuilderPersistenceOptions {
  formId?: string;
  showSaveStatus: (status: SaveStatus) => void;
  setHasUnpublishedChanges: (hasChanges: boolean) => void;
}

interface PendingPageUpdate {
  pageId: string;
  data: Record<string, unknown>;
}

interface PendingEndPageUpdate {
  endPageId: string;
  data: Record<string, unknown>;
}

/**
 * Debounced write path for builder edits. The latest payload per resource is
 * kept in a ref so rapid edits collapse into a single request, and callers can
 * flush everything synchronously before navigating or opening the preview.
 */
export function useBuilderPersistence({
  formId,
  showSaveStatus,
  setHasUnpublishedChanges,
}: BuilderPersistenceOptions) {
  const pendingPageUpdateRef = useRef<PendingPageUpdate | null>(null);
  const pendingEndPageUpdateRef = useRef<PendingEndPageUpdate | null>(null);
  const pendingReorderRef = useRef<string[] | null>(null);
  const pendingEndPageReorderRef = useRef<string[] | null>(null);

  const isPersisted = Boolean(formId && formId !== "new");

  const executePageUpdate = useCallback(async () => {
    const pending = pendingPageUpdateRef.current;
    if (!pending || !isPersisted) return;

    try {
      showSaveStatus("saving");
      const updated = await updatePageApi(formId!, pending.pageId, pending.data);
      // Drop the payload once it lands so a later flush cannot re-send it.
      // Only if a newer edit has not replaced it in the meantime.
      if (pendingPageUpdateRef.current === pending) {
        pendingPageUpdateRef.current = null;
      }
      showSaveStatus("saved");
      // The backend reports whether the published form is now out of date.
      if (updated.hasUnpublishedChanges !== undefined) {
        setHasUnpublishedChanges(updated.hasUnpublishedChanges);
      }
    } catch (error) {
      console.error("Failed to update page:", error);
      showSaveStatus("error");
    }
  }, [formId, isPersisted, showSaveStatus, setHasUnpublishedChanges]);

  const debouncedPageUpdate = useDebounce(executePageUpdate, 1000);

  const executeEndPageUpdate = useCallback(async () => {
    const pending = pendingEndPageUpdateRef.current;
    if (!pending || !isPersisted) return;

    try {
      showSaveStatus("saving");
      const updated = await updateEndPageApi(
        formId!,
        pending.endPageId,
        pending.data,
      );
      if (pendingEndPageUpdateRef.current === pending) {
        pendingEndPageUpdateRef.current = null;
      }
      showSaveStatus("saved");
      if (updated.hasUnpublishedChanges !== undefined) {
        setHasUnpublishedChanges(updated.hasUnpublishedChanges);
      }
    } catch (error) {
      console.error("Failed to update end page:", error);
      showSaveStatus("error");
    }
  }, [formId, isPersisted, showSaveStatus, setHasUnpublishedChanges]);

  const debouncedEndPageUpdate = useDebounce(executeEndPageUpdate, 1000);

  const executeReorder = useCallback(async () => {
    const pageIds = pendingReorderRef.current;
    pendingReorderRef.current = null;
    if (!pageIds || !isPersisted) return;

    try {
      showSaveStatus("saving");
      await reorderPagesApi(formId!, { pageIds });
      showSaveStatus("saved");
      // Reordering a published form makes it out of date.
      setHasUnpublishedChanges(true);
    } catch (error) {
      console.error("Failed to reorder pages:", error);
      showSaveStatus("error");
    }
  }, [formId, isPersisted, showSaveStatus, setHasUnpublishedChanges]);

  // Rapid "move up"/"move down" clicks would otherwise fire one PATCH per
  // click. The payload is the whole ordering, so only the last one matters.
  const debouncedReorder = useDebounce(executeReorder, 500);

  const executeEndPageReorder = useCallback(async () => {
    const endPageIds = pendingEndPageReorderRef.current;
    pendingEndPageReorderRef.current = null;
    if (!endPageIds || !isPersisted) return;

    try {
      showSaveStatus("saving");
      await reorderEndPagesApi(formId!, { endPageIds });
      showSaveStatus("saved");
      // Reordering a published form makes it out of date.
      setHasUnpublishedChanges(true);
    } catch (error) {
      console.error("Failed to reorder end pages:", error);
      showSaveStatus("error");
    }
  }, [formId, isPersisted, showSaveStatus, setHasUnpublishedChanges]);

  const debouncedEndPageReorder = useDebounce(executeEndPageReorder, 500);

  const queuePageUpdate = useCallback(
    (pageId: string, data: Record<string, unknown>) => {
      if (!isPersisted) return;
      pendingPageUpdateRef.current = { pageId, data };
      debouncedPageUpdate();
    },
    [isPersisted, debouncedPageUpdate],
  );

  const queueEndPageUpdate = useCallback(
    (endPageId: string, data: Record<string, unknown>) => {
      if (!isPersisted) return;
      pendingEndPageUpdateRef.current = { endPageId, data };
      debouncedEndPageUpdate();
    },
    [isPersisted, debouncedEndPageUpdate],
  );

  const queuePageReorder = useCallback(
    (pageIds: string[]) => {
      if (!isPersisted) return;
      pendingReorderRef.current = pageIds;
      debouncedReorder();
    },
    [isPersisted, debouncedReorder],
  );

  const queueEndPageReorder = useCallback(
    (endPageIds: string[]) => {
      if (!isPersisted) return;
      pendingEndPageReorderRef.current = endPageIds;
      debouncedEndPageReorder();
    },
    [isPersisted, debouncedEndPageReorder],
  );

  // Flush any pending debounced writes immediately (used before navigation).
  const flushPendingUpdate = useCallback(async () => {
    const pendingOrder = pendingReorderRef.current;
    pendingReorderRef.current = null;
    const pendingEndPageOrder = pendingEndPageReorderRef.current;
    pendingEndPageReorderRef.current = null;
    const pending = pendingPageUpdateRef.current;
    pendingPageUpdateRef.current = null;
    const pendingEndPage = pendingEndPageUpdateRef.current;
    pendingEndPageUpdateRef.current = null;

    if (!isPersisted) return;

    try {
      if (pending) {
        const updated = await updatePageApi(formId!, pending.pageId, pending.data);
        if (updated.hasUnpublishedChanges !== undefined) {
          setHasUnpublishedChanges(updated.hasUnpublishedChanges);
        }
      }
      if (pendingEndPage) {
        const updated = await updateEndPageApi(
          formId!,
          pendingEndPage.endPageId,
          pendingEndPage.data,
        );
        if (updated.hasUnpublishedChanges !== undefined) {
          setHasUnpublishedChanges(updated.hasUnpublishedChanges);
        }
      }
      if (pendingOrder) {
        await reorderPagesApi(formId!, { pageIds: pendingOrder });
        setHasUnpublishedChanges(true);
      }
      if (pendingEndPageOrder) {
        await reorderEndPagesApi(formId!, { endPageIds: pendingEndPageOrder });
        setHasUnpublishedChanges(true);
      }
    } catch (error) {
      console.error("Failed to flush pending update:", error);
    }
  }, [formId, isPersisted, setHasUnpublishedChanges]);

  return {
    isPersisted,
    queuePageUpdate,
    queueEndPageUpdate,
    queuePageReorder,
    queueEndPageReorder,
    flushPendingUpdate,
  };
}
