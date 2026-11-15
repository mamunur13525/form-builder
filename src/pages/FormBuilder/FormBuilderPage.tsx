import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { IFormTheme } from "@/shared/types/common";
import { updateFormTheme } from "@/entities/form/api/form.api";
import { useFormContext } from "@/features/forms/hooks/useFormContext";
import { useFormSettings } from "@/features/forms/hooks/useFormSettings";
import { buildVariableItems } from "@/shared/components/pages";
import { useIsDesktop } from "@/shared/hooks/useMediaQuery";
import { useBuilderState } from "./hooks/useBuilderState";
import { FormBuilderSidebar } from "./components/FormBuilderSidebar";
import { SettingsPanel } from "./components/SettingsPanel";
import { EndPageSettingsPanel } from "./components/EndPage/EndPageSettingsPanel";
import { DesignDrawerSheet } from "./components/settings/DesignDrawerSheet";
import { AddPageDialog } from "./components/AddPageDialog";
import { BuilderCanvas } from "./components/BuilderCanvas";
import { BuilderWorkspace } from "./components/BuilderWorkspace";
import { BuilderError, BuilderLoading } from "./components/BuilderStatus";
import { EmptySettingsState } from "./components/EmptySettingsState";

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
    setPreviewDraft,
    openPreview,
    updateFormData,
  } = useFormContext();

  const {
    pages,
    endPages,
    selectedPage,
    selectedEndPage,
    selectedPageIndex,
    selectedEndPageIndex,
    selectedQuestionId,
    isEndPageSelected,
    isPageSelected,
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
  } = useBuilderState(form, formRevision);

  // Variables (from the FormSettings page) offered in the @ menu inside the
  // editable label/helper-text, and resolved to values in the preview.
  const { data: settingsData } = useFormSettings(formId ?? "");
  const variableItems = useMemo(
    () => buildVariableItems(settingsData?.settings.variables, form?.title),
    [settingsData?.settings.variables, form?.title],
  );

  const [showAddPageDialog, setShowAddPageDialog] = useState(false);
  const [showPagesDrawer, setShowPagesDrawer] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [designDrawerOpen, setDesignDrawerOpen] = useState(false);
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

  // Keep the next preview open in sync with the latest builder edits without
  // writing to context state on every keystroke (that would re-render the whole
  // provider subtree). The draft is only read when preview actually opens.
  useEffect(() => {
    if (!form) return;
    setPreviewDraft({ ...form, pages, endPages });
  }, [form, pages, endPages, setPreviewDraft]);

  const openAddPageDialog = useCallback(() => {
    setShowPagesDrawer(false);
    setShowAddPageDialog(true);
  }, []);

  const openPagesDrawer = useCallback(() => setShowPagesDrawer(true), []);
  const openSettingsDrawer = useCallback(() => setShowSettingsDrawer(true), []);
  const closePagesDrawer = useCallback(() => setShowPagesDrawer(false), []);
  const openDesignDrawer = useCallback(() => setDesignDrawerOpen(true), []);

  const handlePreview = useCallback(async () => {
    // Flush any pending debounced updates before showing preview.
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
  }, [flushPendingUpdate, openPreview, form, pages, endPages, settingsData]);

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

  // Show loading state while fetching form.
  if (isLoadingForm) {
    return <BuilderLoading />;
  }

  // Show error state if form failed to load.
  if (formError) {
    return (
      <BuilderError
        error={formError}
        onBack={() => navigate("/dashboard")}
      />
    );
  }

  const sidebarPanel = (
    <FormBuilderSidebar
      pages={pages}
      selectedPageIndex={selectedPageIndex}
      isPageSelected={isPageSelected}
      selectedQuestionId={selectedQuestionId}
      onSelectQuestion={selectQuestion}
      onSelectPage={selectPage}
      onPageOpened={closePagesDrawer}
      onReorderPages={reorderPages}
      onReorderQuestions={reorderPageQuestions}
      onReorderBlocks={reorderPageQuestions}
      onAddPage={openAddPageDialog}
      onDeletePage={deletePage}
      onDuplicatePage={duplicatePage}
      endPages={endPages}
      selectedEndPageIndex={selectedEndPageIndex}
      isEndPageSelected={isEndPageSelected}
      onSelectEndPage={selectEndPage}
      onAddEndPage={addEndPage}
      onDeleteEndPage={deleteEndPage}
      onReorderEndPageToFirst={moveEndPageToFirst}
      isAddingEndPage={isAddingEndPage}
    />
  );

  const settingsPanel =
    isEndPageSelected && selectedEndPage ? (
      <EndPageSettingsPanel
        endPage={selectedEndPage}
        endPageIndex={selectedEndPageIndex}
        onUpdate={updateEndPage}
        onOpenDesignDrawer={openDesignDrawer}
      />
    ) : selectedPage ? (
      <SettingsPanel
        page={selectedPage}
        pageIndex={selectedPageIndex}
        onUpdate={updatePage}
        onOpenDesignDrawer={openDesignDrawer}
        selectedQuestionId={selectedQuestionId}
        onSelectQuestion={selectQuestionId}
      />
    ) : (
      <EmptySettingsState />
    );

  const canvas = (
    <BuilderCanvas
      selectedPage={selectedPage}
      selectedPageIndex={selectedPageIndex}
      selectedEndPage={selectedEndPage}
      selectedEndPageIndex={selectedEndPageIndex}
      isEndPageSelected={isEndPageSelected}
      theme={form?.theme}
      variables={variableItems}
      selectedQuestionId={selectedQuestionId}
      onUpdatePage={updatePage}
      onUpdateEndPage={updateEndPage}
      onSelectQuestion={selectQuestionId}
      onAddPage={openAddPageDialog}
      onPreview={handlePreview}
      onOpenDesignDrawer={openDesignDrawer}
      onOpenPages={isDesktop ? undefined : openPagesDrawer}
      onOpenSettings={isDesktop ? undefined : openSettingsDrawer}
      isDesktop={isDesktop}
    />
  );

  return (
    <BuilderWorkspace
      isDesktop={isDesktop}
      sidebar={sidebarPanel}
      canvas={canvas}
      settings={settingsPanel}
      pagesDrawerOpen={showPagesDrawer}
      onPagesDrawerOpenChange={setShowPagesDrawer}
      settingsDrawerOpen={showSettingsDrawer}
      onSettingsDrawerOpenChange={setShowSettingsDrawer}
    >
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
        {...(isEndPageSelected && selectedEndPage
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
    </BuilderWorkspace>
  );
}
