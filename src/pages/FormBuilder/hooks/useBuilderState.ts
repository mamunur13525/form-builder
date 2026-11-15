import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { EndPage, Form, FormPage } from "@/shared/types/common";
import type { FormPage as ApiFormPage } from "@/entities/form/model/types";
import {
  createPage,
  deletePage as deletePageApi,
  duplicatePage as duplicatePageApi,
  reorderPages as reorderPagesApi,
} from "@/entities/form/api/page.api";
import {
  createEndPage as createEndPageApi,
  deleteEndPage as deleteEndPageApi,
} from "@/entities/form/api/end-page.api";
import { adaptApiPage } from "@/features/forms/model/adapters";
import { useFormContext } from "@/features/forms/hooks/useFormContext";
import { useBuilderPersistence } from "./useBuilderPersistence";

type SelectionKind = "page" | "endPage";

/**
 * Owns the builder's editable page/end-page lists and selection.
 *
 * Mutations read the latest lists from refs instead of closing over state, so
 * every handler keeps a stable identity. That lets memoised children skip
 * re-rendering on unrelated changes (zoom, drawers, question focus).
 */
export function useBuilderState(form: Form | null, formRevision: number) {
  const { formId } = useParams<{ formId: string }>();
  const { showSaveStatus, setHasUnpublishedChanges } = useFormContext();
  const {
    isPersisted,
    queuePageUpdate,
    queueEndPageUpdate,
    queuePageReorder,
    queueEndPageReorder,
    flushPendingUpdate,
  } = useBuilderPersistence({ formId, showSaveStatus, setHasUnpublishedChanges });

  const [pages, setPages] = useState<FormPage[]>([]);
  const pagesRef = useRef<FormPage[]>([]);
  const commitPages = useCallback((next: FormPage[]) => {
    pagesRef.current = next;
    setPages(next);
  }, []);

  const [endPages, setEndPages] = useState<EndPage[]>([]);
  const endPagesRef = useRef<EndPage[]>([]);
  const commitEndPages = useCallback((next: EndPage[]) => {
    endPagesRef.current = next;
    setEndPages(next);
  }, []);

  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );
  const [selectedEndPageIndex, setSelectedEndPageIndex] = useState(0);
  // Which list the middle editor and settings panel follow.
  const [selectedKind, setSelectedKind] = useState<SelectionKind>("page");
  // True while a new end page is being created on the backend, so the list can
  // show a loading placeholder until the created record comes back.
  const [isAddingEndPage, setIsAddingEndPage] = useState(false);

  const syncedKeyRef = useRef<string | undefined>(undefined);

  // Sync pages from context form data when a different form loads, or when the
  // form is re-fetched (formRevision changes) because the server rewrote the
  // pages underneath us — e.g. after discarding a draft.
  useEffect(() => {
    const currentFormId = form?.id;
    const syncKey = `${currentFormId}:${formRevision}`;
    if (form?.pages && syncKey !== syncedKeyRef.current) {
      syncedKeyRef.current = syncKey;
      commitPages(form.pages);
      setSelectedPageIndex((prev) => (prev < form.pages.length ? prev : 0));
      const nextEndPages = form.endPages ?? [];
      commitEndPages(nextEndPages);
      setSelectedEndPageIndex((prev) =>
        prev < nextEndPages.length ? prev : 0,
      );
    }
  }, [form, formRevision, commitPages, commitEndPages]);

  const selectedPage = pages[selectedPageIndex];
  const selectedEndPage = endPages[selectedEndPageIndex];
  const isPageSelected = selectedKind === "page";
  const isEndPageSelected = selectedKind === "endPage" && !!selectedEndPage;

  const selectPage = useCallback((index: number) => {
    setSelectedKind("page");
    setSelectedPageIndex(index);
    setSelectedQuestionId(null);
  }, []);

  const selectEndPage = useCallback((index: number) => {
    setSelectedKind("endPage");
    setSelectedEndPageIndex(index);
    setSelectedQuestionId(null);
  }, []);

  const selectQuestion = useCallback((pageIndex: number, questionId: string | null) => {
    setSelectedKind("page");
    setSelectedPageIndex(pageIndex);
    setSelectedQuestionId(questionId);
  }, []);

  const selectQuestionId = useCallback((questionId: string | null) => {
    setSelectedQuestionId(questionId);
  }, []);

  const updatePage = useCallback(
    (index: number, updates: Partial<FormPage>) => {
      const page = pagesRef.current[index];
      const pageId = page?._id as string | undefined;
      if (!page || !pageId) return;

      // Optimistically update local state.
      const updated = [...pagesRef.current];
      updated[index] = { ...page, ...updates };
      commitPages(updated);

      // Prepare the update data, ensuring appearance.icon is always provided.
      const updateData: Record<string, unknown> = { ...updates };
      const appearance = updateData.appearance as
        | { width?: string; icon?: string }
        | undefined;
      if (appearance && !appearance.icon) {
        updateData.appearance = { ...appearance, icon: "" };
      }
      queuePageUpdate(pageId, updateData);
    },
    [commitPages, queuePageUpdate],
  );

  const updateEndPage = useCallback(
    (index: number, updates: Partial<EndPage>) => {
      const endPage = endPagesRef.current[index];
      if (!endPage) return;

      // Optimistically update local state.
      const updated = [...endPagesRef.current];
      updated[index] = { ...endPage, ...updates };
      commitEndPages(updated);

      const endPageId = endPage._id;
      if (endPageId) {
        queueEndPageUpdate(endPageId, { ...updates } as Record<string, unknown>);
      }
    },
    [commitEndPages, queueEndPageUpdate],
  );

  /**
   * Apply a reordered page list and persist the new order.
   *
   * The reorder endpoint identifies pages by `_id`, so a page that has not
   * been created server-side yet (the window between adding/duplicating and
   * the POST resolving) cannot be described in the payload. Sending a partial
   * list would drop that page's ordering, so the persist is skipped and the
   * next re-fetch reconciles.
   */
  const reorderPages = useCallback(
    (reordered: FormPage[]) => {
      commitPages(reordered);

      const pageIds = reordered
        .map((page) => page._id)
        .filter(Boolean) as string[];
      if (pageIds.length !== reordered.length) return;

      queuePageReorder(pageIds);
    },
    [commitPages, queuePageReorder],
  );

  /**
   * Move an end page to the top of the list so it becomes the one shown on
   * submit — respondents only ever see `endPages[0]`. The end page that was
   * first shifts down. Mirrors reorderPages: the reorder endpoint identifies
   * end pages by `_id`, so if any end page is still mid-creation the persist
   * is skipped and the next re-fetch reconciles.
   */
  const moveEndPageToFirst = useCallback(
    (index: number) => {
      const current = endPagesRef.current;
      if (index <= 0 || index >= current.length) return;

      const reordered = [...current];
      const [moved] = reordered.splice(index, 1);
      reordered.unshift(moved);
      commitEndPages(reordered);

      // The moved page is now first — keep it selected.
      setSelectedKind("endPage");
      setSelectedEndPageIndex(0);

      const endPageIds = reordered
        .map((endPage) => endPage._id)
        .filter(Boolean) as string[];
      if (endPageIds.length !== reordered.length) return;

      queueEndPageReorder(endPageIds);
    },
    [commitEndPages, queueEndPageReorder],
  );

  const addEndPage = useCallback(async () => {
    if (!isPersisted) return;

    try {
      setIsAddingEndPage(true);
      showSaveStatus("saving");
      const created = await createEndPageApi(formId!, {});
      const next = [...endPagesRef.current, created];
      commitEndPages(next);
      setSelectedEndPageIndex(next.length - 1);
      setSelectedKind("endPage");
      showSaveStatus("saved");
      // Adding an end page to a published form makes it out of date.
      setHasUnpublishedChanges(true);
    } catch (error) {
      console.error("Failed to create end page:", error);
      showSaveStatus("error");
    } finally {
      setIsAddingEndPage(false);
    }
  }, [
    formId,
    isPersisted,
    commitEndPages,
    showSaveStatus,
    setHasUnpublishedChanges,
  ]);

  const deleteEndPage = useCallback(
    async (index: number) => {
      const current = endPagesRef.current;
      if (current.length <= 1) return;

      const endPageToDelete = current[index];
      const endPageId = endPageToDelete?._id;

      // Optimistically update local state.
      const updatedEndPages = current.filter((_, i) => i !== index);
      commitEndPages(updatedEndPages);
      setSelectedEndPageIndex((prev) =>
        prev >= updatedEndPages.length
          ? Math.max(0, updatedEndPages.length - 1)
          : prev > index
            ? prev - 1
            : prev,
      );

      if (isPersisted && endPageId) {
        try {
          showSaveStatus("saving");
          await deleteEndPageApi(formId!, endPageId);
          showSaveStatus("saved");
          // Removing an end page from a published form makes it out of date.
          setHasUnpublishedChanges(true);
        } catch (error) {
          console.error("Failed to delete end page:", error);
          showSaveStatus("error");
          // Revert on error.
          commitEndPages(current);
        }
      }
    },
    [
      formId,
      isPersisted,
      commitEndPages,
      showSaveStatus,
      setHasUnpublishedChanges,
    ],
  );

  const addPage = useCallback(
    async (page: FormPage) => {
      const current = pagesRef.current;
      // Insert directly below the selected page, otherwise at the end.
      const insertIndex =
        selectedKind === "page" &&
        selectedPageIndex >= 0 &&
        selectedPageIndex < current.length
          ? selectedPageIndex + 1
          : current.length;

      if (!isPersisted) {
        const updated = [...current];
        updated.splice(insertIndex, 0, page);
        commitPages(updated);
        setSelectedKind("page");
        setSelectedPageIndex(insertIndex);
        return;
      }

      try {
        showSaveStatus("saving");
        const createdPage = await createPage(formId!, {
          type: page.type,
          title: page.title,
          description: page.description,
          label: page.label,
          helperText: page.helperText,
          placeholder: page.placeholder,
          required: page.required,
          options: page.options,
          validation: page.validation,
          appearance: {
            width: page.appearance.width,
            icon: page.appearance.icon || "",
          },
          coverImage: page.coverImage ?? null,
          settings: page.settings,
          blocks: page.blocks as ApiFormPage["blocks"],
        });

        const adapted = adaptApiPage(createdPage, formId!);
        const newPageWithServerIds: FormPage = {
          ...page,
          ...adapted,
          _id: createdPage._id,
          pageKey: createdPage.pageKey,
        };

        // Insert below the selected page in local state.
        const updatedPages = [...current];
        updatedPages.splice(insertIndex, 0, newPageWithServerIds);
        commitPages(updatedPages);
        setSelectedKind("page");
        setSelectedPageIndex(insertIndex);

        // If the new page was not added at the very end, persist the ordering.
        if (insertIndex < current.length && createdPage._id) {
          const pageIds = updatedPages
            .map((p) => p._id)
            .filter(Boolean) as string[];
          if (pageIds.length === updatedPages.length) {
            await reorderPagesApi(formId!, { pageIds });
          }
        }

        showSaveStatus("saved");
        // Adding a page to a published form makes it out of date.
        setHasUnpublishedChanges(true);
      } catch (error) {
        console.error("Failed to create page:", error);
        showSaveStatus("error");
      }
    },
    [
      formId,
      isPersisted,
      selectedKind,
      selectedPageIndex,
      commitPages,
      showSaveStatus,
      setHasUnpublishedChanges,
    ],
  );

  const deletePage = useCallback(
    async (index: number) => {
      const current = pagesRef.current;
      if (current.length <= 1) return;

      const pageToDelete = current[index];
      const pageId = pageToDelete?._id;

      // Optimistically update local state.
      const updatedPages = current.filter((_, i) => i !== index);
      commitPages(updatedPages);

      setSelectedPageIndex((prev) =>
        prev >= updatedPages.length
          ? Math.max(0, updatedPages.length - 1)
          : prev,
      );

      if (isPersisted && pageId !== undefined) {
        try {
          showSaveStatus("saving");
          await deletePageApi(formId!, pageId);
          showSaveStatus("saved");
          // Removing a page from a published form makes it out of date.
          setHasUnpublishedChanges(true);
        } catch (error) {
          console.error("Failed to delete page:", error);
          showSaveStatus("error");
          // Revert on error.
          commitPages(current);
        }
      }
    },
    [
      formId,
      isPersisted,
      commitPages,
      showSaveStatus,
      setHasUnpublishedChanges,
    ],
  );

  const duplicatePage = useCallback(
    async (index: number) => {
      const current = pagesRef.current;
      const page = current[index];
      const pageId = page?._id as string | undefined;
      if (!pageId) return;

      // Optimistically update local state.
      const newPage: FormPage = {
        ...page,
        pageKey: `page_${Date.now()}`,
        label: page.label + " (copy)",
        order: current.length + 1,
        appearance: {
          width: page.appearance.width,
          icon: page.appearance.icon || "",
        },
      };

      const updatedPages = [...current];
      updatedPages.splice(index + 1, 0, newPage);
      commitPages(updatedPages);
      setSelectedPageIndex(index + 1);

      if (!isPersisted) return;

      try {
        showSaveStatus("saving");
        const duplicatedPage = await duplicatePageApi(formId!, pageId);
        const adapted = adaptApiPage(duplicatedPage, formId!);

        // Replace the temporary page with the real one from the server.
        const withServerPage = [...pagesRef.current];
        if (withServerPage[index + 1]) {
          withServerPage[index + 1] = {
            ...newPage,
            ...adapted,
            _id: duplicatedPage._id,
            pageKey: duplicatedPage.pageKey,
          } as FormPage;
          commitPages(withServerPage);
        }
        showSaveStatus("saved");
        // Duplicating a page on a published form makes it out of date.
        setHasUnpublishedChanges(true);
      } catch (error) {
        console.error("Failed to duplicate page:", error);
        showSaveStatus("error");
        // Revert on error.
        commitPages(current);
      }
    },
    [
      formId,
      isPersisted,
      commitPages,
      showSaveStatus,
      setHasUnpublishedChanges,
    ],
  );

  const reorderPageQuestions = useCallback(
    (pageIndex: number, oldIndex: number, newIndex: number) => {
      const page = pagesRef.current[pageIndex];
      const items =
        page?.questions && page.questions.length > 0
          ? page.questions
          : page?.blocks && page.blocks.length > 0
            ? page.blocks
            : [];
      if (!page || items.length <= 1 || oldIndex === newIndex) return;
      if (newIndex < 0 || newIndex >= items.length) return;

      const updated = [...items];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      const reindexed = updated.map((block, idx) => ({
        ...block,
        order: idx + 1,
      }));

      updatePage(pageIndex, {
        questions: reindexed,
        blocks: reindexed,
        type: reindexed[0]?.type ?? page.type,
        label: reindexed[0]?.title || reindexed[0]?.label || page.label,
        title: reindexed[0]?.title ?? page.title,
        description: reindexed[0]?.description ?? page.description,
        helperText: reindexed[0]?.helperText ?? page.helperText,
      });
    },
    [updatePage],
  );

  return {
    pages,
    endPages,
    selectedPage,
    selectedEndPage,
    selectedPageIndex,
    selectedEndPageIndex,
    selectedQuestionId,
    isPageSelected,
    isEndPageSelected,
    isAddingEndPage,
    selectPage,
    selectEndPage,
    selectQuestion,
    selectQuestionId,
    updatePage,
    updateEndPage,
    reorderPages,
    reorderPageQuestions,
    moveEndPageToFirst,
    addPage,
    deletePage,
    duplicatePage,
    addEndPage,
    deleteEndPage,
    flushPendingUpdate,
  };
}
