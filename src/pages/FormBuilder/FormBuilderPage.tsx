import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../../components/ui/resizable";
import type { FormPage, IFormTheme } from "../../shared/types/common";
import {
  createPage,
  updatePage as updatePageApi,
  deletePage as deletePageApi,
  duplicatePage as duplicatePageApi,
  reorderPages as reorderPagesApi,
} from "../../entities/form/api/page.api";
import { updateFormTheme } from "@/entities/form/api/form.api";
import { useDebounce } from "../../shared/hooks/useDebounce";
import { useFormContext } from "@/features/forms/hooks/useFormContext";
import { FormBuilderSidebar } from "./components/FormBuilderSidebar";
import { PageContentEditor } from "./components/PageContentEditor/PageContentEditor";
import { SettingsPanel } from "./components/SettingsPanel";
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

  const [pages, setPages] = useState<FormPage[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [showAddPageDialog, setShowAddPageDialog] = useState(false);
  const pendingPageUpdateRef = useRef<
    { pageId: string; data: Record<string, unknown> } | null
  >(null);
  const pendingReorderRef = useRef<string[] | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showPagesDrawer, setShowPagesDrawer] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [designDrawerOpen, setDesignDrawerOpen] = useState(false);
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
    }
  }, [form, formRevision]);

  const selectedPage = pages[selectedPageIndex];

  // Keep the preview form in sync with the latest builder edits, so the
  // preview dialog shows unsaved changes.
  useEffect(() => {
    if (!form) return;
    setPreviewForm({ ...form, pages: pages });
  }, [form, pages, setPreviewForm]);

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
    const pending = pendingPageUpdateRef.current;
    pendingPageUpdateRef.current = null;

    if (!formId || formId === "new") return;

    try {
      if (pending) {
        const updated = await updatePageApi(formId, pending.pageId, pending.data);
        if (updated.hasUnpublishedChanges !== undefined) {
          setHasUnpublishedChanges(updated.hasUnpublishedChanges);
        }
      }
      if (pendingOrder) {
        await reorderPagesApi(formId, { pageIds: pendingOrder });
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
      onSelectPage={setSelectedPageIndex}
      onPageOpened={() => setShowPagesDrawer(false)}
      onReorderPages={reorderPages}
      onAddPage={() => {
        setShowPagesDrawer(false);
        setShowAddPageDialog(true);
      }}
      onDeletePage={deletePage}
      onDuplicatePage={duplicatePage}
    />
  );

  const settingsPanel = selectedPage ? (
    <SettingsPanel
      page={selectedPage}
      pageIndex={selectedPageIndex}
      onUpdate={updatePage}
      theme={form?.theme}
      designDrawerOpen={designDrawerOpen}
      onOpenDesignDrawer={() => setDesignDrawerOpen(true)}
      onCloseDesignDrawer={() => setDesignDrawerOpen(false)}
      onSaveTheme={handleSaveTheme}
    />
  ) : (
    <div className="editorial-shadow-md flex h-full w-full flex-col overflow-hidden border border-[var(--border)] bg-[var(--card)]">
      <div className="border-b border-[var(--editorial-border-light)] px-6 py-5">
        <h3 className="editorial-eyebrow text-[var(--editorial-subtle)]">
          Settings
        </h3>
      </div>
      <div className="flex h-full items-center justify-center p-8 text-center">
        <p className="text-base leading-6 text-[var(--editorial-subtle)]">
          Select a page to view its settings.
        </p>
      </div>
    </div>
  );

  const editorColumn = (
    <div className="flex h-full min-h-0 w-full flex-col gap-3 sm:gap-4 py-4">
      <PageContentTopbar
        onAddPage={() => {
          setShowAddPageDialog(true);
        }}
        onPreview={async () => {
          // Flush any pending debounced updates before showing preview
          await flushPendingUpdate();
          openPreview(form ? { ...form, pages: pages } : null);
        }}
        isMobileView={isMobileView}
        onToggleView={() => setIsMobileView((prev) => !prev)}
        onOpenPages={isDesktop ? undefined : () => setShowPagesDrawer(true)}
        onOpenSettings={
          isDesktop ? undefined : () => setShowSettingsDrawer(true)
        }
        onOpenDesignDrawer={() => setDesignDrawerOpen(true)}

      />

      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <div
          className={cn(
            "editorial-shadow h-full w-full overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--card)] sm:rounded-xl",
            "transition-all duration-500 ease-out",
          )}
          // The phone-frame preview must never exceed the available width.
          style={{ width: isMobileView ? "min(420px, 100%)" : "100%" }}
        >
          {selectedPage ? (
            <PageContentEditor
              page={selectedPage}
              pageIndex={selectedPageIndex}
              onUpdate={updatePage}
              isMobileView={isMobileView}
              theme={form?.theme}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <p className="font-display text-xl text-[var(--foreground)] sm:text-2xl">
                Nothing selected
              </p>
              <p className="mt-2 text-sm text-[var(--editorial-subtle)] sm:text-base">
                {isDesktop
                  ? "Choose a page from the left to begin editing."
                  : "Open the pages panel to choose a page."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="editorial h-full flex flex-col bg-[var(--editorial-canvas)]">
      {isDesktop ? (
        <ResizablePanelGroup
          orientation="horizontal"
          className="mx-auto w-full flex-1 min-h-0"
        >
          <ResizablePanel defaultSize={300} minSize={260} maxSize={400}>
            {sidebarPanel}
          </ResizablePanel>

          <ResizableHandle className="w-4 bg-transparent after:hidden" />

          <ResizablePanel defaultSize={600} minSize={300}>
            {editorColumn}
          </ResizablePanel>

          <ResizableHandle className="w-4 bg-transparent after:hidden" />

          <ResizablePanel defaultSize={340} minSize={300} maxSize={420}>
            {settingsPanel}
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <>
          <div className="flex min-h-0 w-full flex-1 flex-col px-3 py-3 sm:px-5 sm:py-4">
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

      <AddPageDialog
        open={showAddPageDialog}
        onOpenChange={setShowAddPageDialog}
        id={formId}
        pagesLength={pages.length}
        onAddPage={addPage}
        onShowSaveStatus={showSaveStatus}
      />

    </div>
  );
}
