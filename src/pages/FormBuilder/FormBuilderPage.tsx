import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../../components/ui/resizable";
import type { FormPage, EndPage, IFormTheme } from "../../shared/types/common";
import { PAGE_TYPE_LABELS } from "../../shared/constants/form-types";
import {
  createPage,
  updatePage as updatePageApi,
  deletePage as deletePageApi,
  duplicatePage as duplicatePageApi,
  reorderPages as reorderPagesApi,
} from "../../entities/form/api/page.api";
import {
  createEndPage as createEndPageApi,
  updateEndPage as updateEndPageApi,
  deleteEndPage as deleteEndPageApi,
  reorderEndPages as reorderEndPagesApi,
} from "../../entities/form/api/end-page.api";
import { updateFormTheme } from "@/entities/form/api/form.api";
import { useDebounce } from "../../shared/hooks/useDebounce";
import { useFormContext } from "@/features/forms/hooks/useFormContext";
import { useFormSettings } from "@/features/forms/hooks/useFormSettings";
import { buildVariableItems } from "@/shared/components/pages";
import { FormBuilderSidebar } from "./components/FormBuilderSidebar";
import { PageContentEditor } from "./components/PageContentEditor/PageContentEditor";
import { EndPageContentEditor } from "./components/EndPage/EndPageContentEditor";
import { SettingsPanel } from "./components/SettingsPanel";
import { EndPageSettingsPanel } from "./components/EndPage/EndPageSettingsPanel";
import { DesignDrawerSheet } from "./components/settings/DesignDrawerSheet";
import { AddPageDialog } from "./components/AddPageDialog";
import PageContentTopbar from "./components/PageContentEditor/PageContentTopbar";
import { Drawer } from "@/components/ui/drawer";
import { useIsDesktop } from "@/shared/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

export function FormBuilderPage() {
  const { formId } = useParams();
  const navigate = useNavigate();

  const {
    form,
    isLoading: isLoadingForm,
    error: formError,
    showSaveStatus,
    setHasUnpublishedChanges,
    formRevision,
    setPreviewForm,
    openPreview,
    updateFormData,
  } = useFormContext();

  // Variables (from the FormSettings page) offered in the @ menu inside the
  // editable label/helper-text, and resolved to values in the preview.
  const { data: settingsData } = useFormSettings(formId ?? "");
  const variableItems = useMemo(
    () => buildVariableItems(settingsData?.settings.variables, form?.title),
    [settingsData?.settings.variables, form?.title],
  );

  const [pages, setPages] = useState<FormPage[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [endPages, setEndPages] = useState<EndPage[]>([]);
  const [selectedEndPageIndex, setSelectedEndPageIndex] = useState(0);
  // True while a new end page is being created on the backend, so the list can
  // show a loading placeholder until the created record comes back.
  const [isAddingEndPage, setIsAddingEndPage] = useState(false);
  // Which list the middle editor and settings panel follow.
  const [selectedKind, setSelectedKind] = useState<"page" | "endPage">("page");
  const [showAddPageDialog, setShowAddPageDialog] = useState(false);
  const pendingPageUpdateRef = useRef<
    { pageId: string; data: Record<string, unknown> } | null
  >(null);
  const pendingEndPageUpdateRef = useRef<
    { endPageId: string; data: Record<string, unknown> } | null
  >(null);
  const pendingReorderRef = useRef<string[] | null>(null);
  const pendingEndPageReorderRef = useRef<string[] | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showPagesDrawer, setShowPagesDrawer] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [designDrawerOpen, setDesignDrawerOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(150, prev + 10));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(50, prev - 10));
  const handleResetZoom = () => setZoomLevel(100);
  const syncedKeyRef = useRef<string | undefined>(undefined);
  const isDesktop = useIsDesktop();

  // The drawers only exist on the compact layout. Reset them while the
  // breakpoint changes so a drawer left open on mobile does not reappear when
  // the viewport shrinks back down. (Adjusting state during render, rather than
  // in an effect, avoids a second render pass — see the React docs on deriving
  // state from props.)
  const [wasDesktop, setWasDesktop] = useState(isDesktop);
  if (wasDesktop !== isDesktop) {
    setWasDesktop(isDesktop);
    setShowPagesDrawer(false);
    setShowSettingsDrawer(false);
  }

  // Sync pages from context form data when a different form loads, or when the
  // form is re-fetched (formRevision changes) because the server rewrote the
  // pages underneath us — e.g. after discarding a draft.
  useEffect(() => {
    const currentFormId = form?.id;
    const syncKey = `${currentFormId}:${formRevision}`;
    if (form?.pages && syncKey !== syncedKeyRef.current) {
      syncedKeyRef.current = syncKey;
      setPages(form.pages);
      setSelectedPageIndex((prev) =>
        prev < form.pages.length ? prev : 0,
      );
      const nextEndPages = form.endPages ?? [];
      setEndPages(nextEndPages);
      setSelectedEndPageIndex((prev) =>
        prev < nextEndPages.length ? prev : 0,
      );
    }
  }, [form, formRevision]);

  const selectedPage = pages[selectedPageIndex];
  const selectedEndPage = endPages[selectedEndPageIndex];
  const isEndPageSelected = selectedKind === "endPage" && !!selectedEndPage;

  // Keep the preview form in sync with the latest builder edits, so the
  // preview dialog shows unsaved changes.
  useEffect(() => {
    if (!form) return;
    setPreviewForm({ ...form, pages, endPages });
  }, [form, pages, endPages, setPreviewForm]);

  const executePageUpdate = useCallback(async () => {
    const pending = pendingPageUpdateRef.current;
    if (!pending || !formId || formId === "new") return;

    try {
      showSaveStatus("saving");
      const updated = await updatePageApi(formId, pending.pageId, pending.data);
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
  }, [formId, showSaveStatus, setHasUnpublishedChanges]);

  const debouncedPageUpdate = useDebounce(executePageUpdate, 1000);

  const executeEndPageUpdate = useCallback(async () => {
    const pending = pendingEndPageUpdateRef.current;
    if (!pending || !formId || formId === "new") return;

    try {
      showSaveStatus("saving");
      const updated = await updateEndPageApi(
        formId,
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
  }, [formId, showSaveStatus, setHasUnpublishedChanges]);

  const debouncedEndPageUpdate = useDebounce(executeEndPageUpdate, 1000);

  const executeReorder = useCallback(async () => {
    const pageIds = pendingReorderRef.current;
    pendingReorderRef.current = null;
    if (!pageIds || !formId || formId === "new") return;

    try {
      showSaveStatus("saving");
      await reorderPagesApi(formId, { pageIds });
      showSaveStatus("saved");
      // Reordering a published form makes it out of date.
      setHasUnpublishedChanges(true);
    } catch (error) {
      console.error("Failed to reorder pages:", error);
      showSaveStatus("error");
    }
  }, [formId, showSaveStatus, setHasUnpublishedChanges]);

  // Rapid "move up"/"move down" clicks would otherwise fire one PATCH per
  // click. The payload is the whole ordering, so only the last one matters.
  const debouncedReorder = useDebounce(executeReorder, 500);

  const executeEndPageReorder = useCallback(async () => {
    const endPageIds = pendingEndPageReorderRef.current;
    pendingEndPageReorderRef.current = null;
    if (!endPageIds || !formId || formId === "new") return;

    try {
      showSaveStatus("saving");
      await reorderEndPagesApi(formId, { endPageIds });
      showSaveStatus("saved");
      // Reordering a published form makes it out of date.
      setHasUnpublishedChanges(true);
    } catch (error) {
      console.error("Failed to reorder end pages:", error);
      showSaveStatus("error");
    }
  }, [formId, showSaveStatus, setHasUnpublishedChanges]);

  const debouncedEndPageReorder = useDebounce(executeEndPageReorder, 500);

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
      setPages(reordered);

      if (!formId || formId === "new") return;

      const pageIds = reordered.map((page) => page._id).filter(Boolean) as string[];
      if (pageIds.length !== reordered.length) return;

      pendingReorderRef.current = pageIds;
      debouncedReorder();
    },
    [formId, debouncedReorder],
  );

  // Flush any pending debounced writes immediately (used before navigation)
  const flushPendingUpdate = useCallback(async () => {
    const pendingOrder = pendingReorderRef.current;
    pendingReorderRef.current = null;
    const pendingEndPageOrder = pendingEndPageReorderRef.current;
    pendingEndPageReorderRef.current = null;
    const pending = pendingPageUpdateRef.current;
    pendingPageUpdateRef.current = null;
    const pendingEndPage = pendingEndPageUpdateRef.current;
    pendingEndPageUpdateRef.current = null;

    if (!formId || formId === "new") return;

    try {
      if (pending) {
        const updated = await updatePageApi(formId, pending.pageId, pending.data);
        if (updated.hasUnpublishedChanges !== undefined) {
          setHasUnpublishedChanges(updated.hasUnpublishedChanges);
        }
      }
      if (pendingEndPage) {
        const updated = await updateEndPageApi(
          formId,
          pendingEndPage.endPageId,
          pendingEndPage.data,
        );
        if (updated.hasUnpublishedChanges !== undefined) {
          setHasUnpublishedChanges(updated.hasUnpublishedChanges);
        }
      }
      if (pendingOrder) {
        await reorderPagesApi(formId, { pageIds: pendingOrder });
        setHasUnpublishedChanges(true);
      }
      if (pendingEndPageOrder) {
        await reorderEndPagesApi(formId, { endPageIds: pendingEndPageOrder });
        setHasUnpublishedChanges(true);
      }
    } catch (error) {
      console.error("Failed to flush pending update:", error);
    }
  }, [formId, setHasUnpublishedChanges]);

  const updatePage = useCallback(
    async (index: number, updates: Partial<FormPage>) => {
      const page = pages[index];
      if (!page) return;

      const pageId = page._id as string | undefined;
      if (!pageId) return;

      // Optimistically update local state
      const updated = [...pages];
      updated[index] = { ...updated[index], ...updates };
      setPages(updated);

      // If form is persisted, debounce the API update
      if (formId && formId !== "new") {
        // Prepare the update data, ensuring appearance.icon is always provided
        const updateData: Record<string, unknown> = { ...updates };
        const appearance = updateData.appearance as
          | { width?: string; icon?: string }
          | undefined;
        if (appearance && !appearance.icon) {
          updateData.appearance = { ...appearance, icon: "" };
        }
        pendingPageUpdateRef.current = { pageId, data: updateData };
        debouncedPageUpdate();
      }
    },
    [formId, pages, debouncedPageUpdate],
  );

  const updateEndPage = useCallback(
    async (index: number, updates: Partial<EndPage>) => {
      const endPage = endPages[index];
      if (!endPage) return;

      // Optimistically update local state.
      const updated = [...endPages];
      updated[index] = { ...updated[index], ...updates };
      setEndPages(updated);

      const endPageId = endPage._id;
      // Debounce the API write once the form (and this end page) is persisted.
      if (formId && formId !== "new" && endPageId) {
        pendingEndPageUpdateRef.current = {
          endPageId,
          data: { ...updates } as Record<string, unknown>,
        };
        debouncedEndPageUpdate();
      }
    },
    [formId, endPages, debouncedEndPageUpdate],
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
      if (index <= 0 || index >= endPages.length) return;

      const reordered = [...endPages];
      const [moved] = reordered.splice(index, 1);
      reordered.unshift(moved);
      setEndPages(reordered);

      // The moved page is now first — keep it selected.
      setSelectedKind("endPage");
      setSelectedEndPageIndex(0);

      if (!formId || formId === "new") return;

      const endPageIds = reordered
        .map((endPage) => endPage._id)
        .filter(Boolean) as string[];
      if (endPageIds.length !== reordered.length) return;

      pendingEndPageReorderRef.current = endPageIds;
      debouncedEndPageReorder();
    },
    [formId, endPages, debouncedEndPageReorder],
  );

  const addEndPage = useCallback(async () => {
    if (!formId || formId === "new") return;

    try {
      setIsAddingEndPage(true);
      showSaveStatus("saving");
      const created = await createEndPageApi(formId, {});
      setEndPages((prev) => {
        const next = [...prev, created];
        setSelectedEndPageIndex(next.length - 1);
        return next;
      });
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
  }, [formId, showSaveStatus, setHasUnpublishedChanges]);

  const deleteEndPage = useCallback(
    async (index: number) => {
      if (endPages.length <= 1) return;

      const endPageToDelete = endPages[index];
      const endPageId = endPageToDelete?._id;

      // Optimistically update local state.
      const updatedEndPages = endPages.filter((_, i) => i !== index);
      setEndPages(updatedEndPages);
      setSelectedEndPageIndex((prev) =>
        prev >= updatedEndPages.length
          ? Math.max(0, updatedEndPages.length - 1)
          : prev > index
            ? prev - 1
            : prev,
      );

      if (formId && formId !== "new" && endPageId) {
        try {
          showSaveStatus("saving");
          await deleteEndPageApi(formId, endPageId);
          showSaveStatus("saved");
          // Removing an end page from a published form makes it out of date.
          setHasUnpublishedChanges(true);
        } catch (error) {
          console.error("Failed to delete end page:", error);
          showSaveStatus("error");
          // Revert on error.
          setEndPages(endPages);
        }
      }
    },
    [formId, endPages, showSaveStatus, setHasUnpublishedChanges],
  );

  /**
   * Persist the form theme via PATCH /forms/:formId/theme and update the
   * local form state so the builder, preview, and published views all
   * reflect the saved theme immediately.
   */
  const handleSaveTheme = useCallback(
    async (themeData: IFormTheme) => {
      if (!formId || formId === "new") {
        // For new (unsaved) forms, just update local state.
        updateFormData({ theme: themeData });
        return;
      }

      try {
        showSaveStatus("saving");
        const updated = await updateFormTheme(formId, themeData);
        // Update local form state with the server response theme.
        updateFormData({ theme: updated.theme });
        showSaveStatus("saved");
        // Changing the theme on a published form makes it out of date.
        setHasUnpublishedChanges(true);
      } catch (error) {
        console.error("Failed to save theme:", error);
        showSaveStatus("error");
        throw error;
      }
    },
    [formId, showSaveStatus, setHasUnpublishedChanges, updateFormData],
  );

  const addPage = useCallback(
    async (page: FormPage) => {
      if (!formId || formId === "new") {
        // For new forms, just add to local state
        setPages((prev) => [...prev, page]);
        setSelectedPageIndex(pages.length);
        return;
      }

      try {
        showSaveStatus("saving");
        // Create page via API
        const createdPage = await createPage(formId, {
          type: page.type,
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
        });

        // Update local state with the created page (which has id from server)
        setPages((prev) => [
          ...prev,
          { ...page, _id: createdPage._id, pageKey: createdPage.pageKey },
        ]);
        setSelectedPageIndex(pages.length);
        showSaveStatus("saved");
        // Adding a page to a published form makes it out of date.
        setHasUnpublishedChanges(true);
      } catch (error) {
        console.error("Failed to create page:", error);
        showSaveStatus("error");
      }
    },
    [formId, pages.length, showSaveStatus, setHasUnpublishedChanges],
  );

  const deletePage = useCallback(
    async (index: number) => {
      if (pages.length <= 1) return;

      const pageToDelete = pages[index];
      const pageId = "_id" in pageToDelete ? pageToDelete._id : undefined;

      // Optimistically update local state
      const updatedPages = pages.filter((_, i) => i !== index);
      setPages(updatedPages);

      if (selectedPageIndex >= updatedPages.length) {
        setSelectedPageIndex(Math.max(0, updatedPages.length - 1));
      }

      // If form is persisted, delete via API
      if (formId && formId !== "new" && pageId !== undefined) {
        try {
          showSaveStatus("saving");
          await deletePageApi(formId, pageId);
          showSaveStatus("saved");
          // Removing a page from a published form makes it out of date.
          setHasUnpublishedChanges(true);
        } catch (error) {
          console.error("Failed to delete page:", error);
          showSaveStatus("error");
          // Revert on error
          setPages(pages);
        }
      }
    },
    [formId, pages, selectedPageIndex, showSaveStatus, setHasUnpublishedChanges],
  );

  const duplicatePage = useCallback(
    async (index: number) => {
      const page = pages[index];
      const pageId = page._id as string | undefined;
      if (!pageId) return;

      // Optimistically update local state
      const newPage: FormPage = {
        ...page,
        pageKey: `page_${Date.now()}`,
        label: page.label + " (copy)",
        order: pages.length + 1,
        appearance: {
          width: page.appearance.width,
          icon: page.appearance.icon || "",
        },
      };

      const updatedPages = [...pages];
      updatedPages.splice(index + 1, 0, newPage);
      setPages(updatedPages);
      setSelectedPageIndex(index + 1);

      // If form is persisted, duplicate via API
      if (formId && formId !== "new") {
        try {
          showSaveStatus("saving");
          const duplicatedPage = await duplicatePageApi(formId, pageId);

          // Update the temporary page with the real one from server
          setPages((prev) => {
            const updated = [...prev];
            updated[index + 1] = {
              ...newPage,
              _id: duplicatedPage._id,
              pageKey: duplicatedPage.pageKey,
            } as FormPage;
            return updated;
          });
          showSaveStatus("saved");
          // Duplicating a page on a published form makes it out of date.
          setHasUnpublishedChanges(true);
        } catch (error) {
          console.error("Failed to duplicate page:", error);
          showSaveStatus("error");
          // Revert on error
          setPages(pages);
        }
      }
    },
    [formId, pages, showSaveStatus, setHasUnpublishedChanges],
  );

  // Show loading state while fetching form
  if (isLoadingForm) {
    return (
      <div className="editorial h-screen flex items-center justify-center bg-[var(--editorial-canvas)]">
        <div className="flex flex-col items-center text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--border)] border-t-[var(--primary)] mb-6"></div>
          <p className="font-display text-2xl text-[var(--foreground)]">
            Loading form
          </p>
          <p className="mt-2 text-base text-[var(--editorial-subtle)]">
            One moment while we gather your pages.
          </p>
        </div>
      </div>
    );
  }

  // Show error state if form failed to load
  if (formError) {
    return (
      <div className="editorial h-screen flex items-center justify-center bg-[var(--editorial-canvas)] px-8">
        <div className="editorial-shadow-md flex max-w-md flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--card)] px-10 py-12 text-center">
          <h2 className="font-display text-[32px] leading-tight text-[var(--foreground)]">
            Something went wrong
          </h2>
          <p className="mt-4 text-base leading-6 text-[var(--editorial-body)]">
            {formError}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="editorial-transition mt-8 h-[52px] rounded-[16px] bg-[var(--primary)] px-8 text-sm font-medium text-white  hover:-translate-y-0.5 hover:bg-[var(--editorial-primary-hover)] active:translate-y-0 active:scale-[.98] active:bg-[var(--editorial-primary-pressed)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const sidebarPanel = (
    <FormBuilderSidebar
      pages={pages}
      selectedPageIndex={selectedPageIndex}
      isPageSelected={selectedKind === "page"}
      onSelectPage={(index) => {
        setSelectedKind("page");
        setSelectedPageIndex(index);
      }}
      onPageOpened={() => setShowPagesDrawer(false)}
      onReorderPages={reorderPages}
      onAddPage={() => {
        setShowPagesDrawer(false);
        setShowAddPageDialog(true);
      }}
      onDeletePage={deletePage}
      onDuplicatePage={duplicatePage}
      endPages={endPages}
      selectedEndPageIndex={selectedEndPageIndex}
      isEndPageSelected={isEndPageSelected}
      onSelectEndPage={(index) => {
        setSelectedKind("endPage");
        setSelectedEndPageIndex(index);
      }}
      onAddEndPage={addEndPage}
      onDeleteEndPage={deleteEndPage}
      onReorderEndPageToFirst={moveEndPageToFirst}
      isAddingEndPage={isAddingEndPage}
    />
  );

  const settingsPanel = isEndPageSelected ? (
    <EndPageSettingsPanel
      endPage={selectedEndPage}
      endPageIndex={selectedEndPageIndex}
      onUpdate={updateEndPage}
      onOpenDesignDrawer={() => setDesignDrawerOpen(true)}
    />
  ) : selectedPage ? (
    <SettingsPanel
      page={selectedPage}
      pageIndex={selectedPageIndex}
      onUpdate={updatePage}
      onOpenDesignDrawer={() => setDesignDrawerOpen(true)}
    />
  ) : (
    <div className="flex h-full w-full flex-col overflow-hidden border-l border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#141418] text-slate-800 dark:text-zinc-100">
      <div className="border-b border-slate-200/80 dark:border-zinc-800/80 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Page settings
        </h3>
      </div>
      <div className="flex h-full items-center justify-center p-8 text-center">
        <p className="text-sm leading-6 text-slate-500 dark:text-zinc-500">
          Select a page to view its settings.
        </p>
      </div>
    </div>
  );

  const editorColumn = (
    <div className="relative flex h-full min-h-0 w-full flex-col gap-3 p-3 bg-[#f4f6fb] dark:bg-[#0c0c0f] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#22222a_1px,transparent_1px)] [background-size:24px_24px] overflow-hidden">
      {/* Ambient radiant spotlight glow behind canvas artboard */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[650px] rounded-full bg-gradient-to-tr from-purple-400/10 via-indigo-300/10 to-orange-400/10 dark:from-purple-600/25 dark:via-indigo-500/20 dark:to-purple-800/25 blur-[140px]" />
      <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#FF5722]/5 dark:bg-[#FF5722]/10 blur-[100px]" />

      <div className="relative z-10 w-full">
        <PageContentTopbar
          onAddPage={() => {
            setShowAddPageDialog(true);
          }}
          onPreview={async () => {
            // Flush any pending debounced updates before showing preview
            await flushPendingUpdate();
            openPreview(
              form
                ? {
                  ...form,
                  pages,
                  endPages,
                  // Carry the live variables so @tokens resolve in the preview.
                  settings: {
                    ...form.settings,
                    variables:
                      settingsData?.settings.variables ??
                      form.settings?.variables ??
                      [],
                  },
                }
                : null,
            );
          }}
          isMobileView={isMobileView}
          onToggleView={() => setIsMobileView((prev) => !prev)}
          onOpenPages={isDesktop ? undefined : () => setShowPagesDrawer(true)}
          onOpenSettings={
            isDesktop ? undefined : () => setShowSettingsDrawer(true)
          }
          onOpenDesignDrawer={() => setDesignDrawerOpen(true)}
        />
      </div>

      <div className="relative z-10 flex min-h-0 w-full flex-1 items-center justify-center overflow-auto p-1 sm:p-3">
        <div
          className={cn(
            "relative flex flex-col h-full max-h-[85vh] w-full overflow-hidden rounded-3xl border border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#141418] shadow-xl dark:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] transition-all duration-300",
          )}
          style={{
            width: isMobileView ? "min(420px, 100%)" : "100%",
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: "top center",
          }}
        >
          {/* Browser Mockup Window Header Bar */}
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-slate-200/80 dark:border-zinc-800/80 bg-slate-100/90 dark:bg-[#16161a] px-4">
            {/* Window control dots */}
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
              <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
              <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
            </div>

            {/* Address bar pill mockup */}
            <div className="h-5 w-48 sm:w-64 rounded-full bg-slate-200/80 dark:bg-zinc-800/70 border border-slate-300/60 dark:border-zinc-700/50 mx-auto flex items-center justify-center text-[11px] text-slate-500 dark:text-zinc-400 font-mono tracking-tight">
              forms.studio/preview
            </div>

            {/* Spacer for symmetry */}
            <div className="w-12" />
          </div>

          {/* Window Canvas Content with Studio Bounding Box */}
          <div className="flex-1 min-h-0 overflow-y-auto relative p-2 sm:p-4">
            {isEndPageSelected ? (
              <div className="relative h-full w-full rounded-2xl ring-2 ring-[#FF5722] ring-offset-2 ring-offset-white dark:ring-offset-[#141418] transition-all">
                {/* Top-left tag badge */}
                <div className="absolute -top-3 left-4 z-20 flex items-center gap-1.5 rounded-md bg-[#FF5722] px-2 py-0.5 text-[11px] font-semibold text-white shadow-md">
                  <span>End Page</span>
                </div>
                {/* 4 Corner pip handles */}
                <div className="absolute -top-1 -left-1 h-2 w-2 rounded-xs border border-[#FF5722] bg-white dark:bg-zinc-900 z-20 pointer-events-none" />
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-xs border border-[#FF5722] bg-white dark:bg-zinc-900 z-20 pointer-events-none" />
                <div className="absolute -bottom-1 -left-1 h-2 w-2 rounded-xs border border-[#FF5722] bg-white dark:bg-zinc-900 z-20 pointer-events-none" />
                <div className="absolute -bottom-1 -right-1 h-2 w-2 rounded-xs border border-[#FF5722] bg-white dark:bg-zinc-900 z-20 pointer-events-none" />

                <EndPageContentEditor
                  endPage={selectedEndPage}
                  endPageIndex={selectedEndPageIndex}
                  onUpdate={updateEndPage}
                  isMobileView={isMobileView}
                  theme={form?.theme}
                  variables={variableItems}
                />
              </div>
            ) : selectedPage ? (
              <div className="relative h-full w-full rounded-2xl ring-2 ring-[#FF5722] ring-offset-2 ring-offset-white dark:ring-offset-[#141418] transition-all">
                {/* Top-left tag badge */}
                <div className="absolute -top-3 left-4 z-20 flex items-center gap-1.5 rounded-md bg-[#FF5722] px-2 py-0.5 text-[11px] font-semibold text-white shadow-md">
                  <span>{selectedPageIndex + 1}. {PAGE_TYPE_LABELS[selectedPage.type] || selectedPage.label || "Page"}</span>
                </div>
                {/* 4 Corner pip handles */}
                <div className="absolute -top-1 -left-1 h-2 w-2 rounded-xs border border-[#FF5722] bg-white dark:bg-zinc-900 z-20 pointer-events-none" />
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-xs border border-[#FF5722] bg-white dark:bg-zinc-900 z-20 pointer-events-none" />
                <div className="absolute -bottom-1 -left-1 h-2 w-2 rounded-xs border border-[#FF5722] bg-white dark:bg-zinc-900 z-20 pointer-events-none" />
                <div className="absolute -bottom-1 -right-1 h-2 w-2 rounded-xs border border-[#FF5722] bg-white dark:bg-zinc-900 z-20 pointer-events-none" />

                <PageContentEditor
                  page={selectedPage}
                  pageIndex={selectedPageIndex}
                  onUpdate={updatePage}
                  isMobileView={isMobileView}
                  theme={form?.theme}
                  variables={variableItems}
                />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                <p className="font-semibold text-xl text-slate-800 dark:text-zinc-100 sm:text-2xl">
                  Nothing selected
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 sm:text-base">
                  {isDesktop
                    ? "Choose a page from the left to begin editing."
                    : "Open the pages panel to choose a page."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Zoom Controls at Bottom Right */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-3 rounded-2xl border border-slate-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-[#16161a]/95 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 shadow-xl dark:shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <span className="w-9 text-center tabular-nums select-none font-medium text-slate-800 dark:text-zinc-200">
          {zoomLevel}%
        </span>
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <div className="h-3.5 w-px bg-slate-200 dark:bg-zinc-800" />
        <button
          type="button"
          onClick={handleResetZoom}
          aria-label="Reset zoom"
          className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="editorial h-full flex bg-[var(--editorial-canvas)] text-[var(--foreground)]">
      {/* Main Resizable Workspace */}
      <div className="flex-1 min-w-0 h-full flex flex-col">
        {isDesktop ? (
          <ResizablePanelGroup
            orientation="horizontal"
            className="mx-auto w-full flex-1 min-h-0"
          >
            <ResizablePanel defaultSize={280} minSize={240} maxSize={380}>
              {sidebarPanel}
            </ResizablePanel>

            <ResizableHandle className="w-1.5 bg-transparent hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors after:hidden" />

            <ResizablePanel defaultSize={600} minSize={300} className="bg-transparent">
              {editorColumn}
            </ResizablePanel>

            <ResizableHandle className="w-1.5 bg-transparent hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors after:hidden" />

            <ResizablePanel defaultSize={340} minSize={300} maxSize={420}>
              {settingsPanel}
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <>
            <div className="flex min-h-0 w-full flex-1 flex-col">
              {editorColumn}
            </div>

            <Drawer
              open={showPagesDrawer}
              onOpenChange={setShowPagesDrawer}
              side="left"
              title="Pages"
            >
              {sidebarPanel}
            </Drawer>

            <Drawer
              open={showSettingsDrawer}
              onOpenChange={setShowSettingsDrawer}
              side="right"
              title="Settings"
            >
              {settingsPanel}
            </Drawer>
          </>
        )}
      </div>

      <AddPageDialog
        open={showAddPageDialog}
        onOpenChange={setShowAddPageDialog}
        id={formId}
        pagesLength={pages.length}
        onAddPage={addPage}
        onShowSaveStatus={showSaveStatus}
      />

      {/* One drawer for the whole workspace — it edits the form-wide theme and
          previews whichever page or end page is currently selected. Rendered
          here (not inside a settings panel) so it opens for both kinds and is
          not unmounted with the compact-layout settings drawer. */}
      <DesignDrawerSheet
        open={designDrawerOpen}
        onClose={() => setDesignDrawerOpen(false)}
        theme={form?.theme}
        onSaveTheme={handleSaveTheme}
        {...(isEndPageSelected
          ? {
            endPage: selectedEndPage,
            endPageIndex: selectedEndPageIndex,
            onUpdateEndPage: updateEndPage,
          }
          : {
            page: selectedPage,
            pageIndex: selectedPageIndex,
            onUpdatePage: updatePage,
          })}
      />

    </div>
  );
}
