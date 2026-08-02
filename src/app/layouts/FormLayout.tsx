import { useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { FormBuilderTopBar } from "../../pages/FormBuilder/components/FormBuilderTopBar";
import { FormProvider } from "@/features/forms/hooks/FormContext";
import { useFormContext } from "@/features/forms/hooks/useFormContext";
import { PublishDialog } from "../../pages/FormBuilder/components/PublishDialog";
import { FormPreviewDialog } from "../../pages/FormBuilder/components/FormPreviewDialog";

function FormLayoutContent() {
  const {
    form,
    isPublished,
    setIsPublished,
    hasUnpublishedChanges,
    setHasUnpublishedChanges,
    refreshForm,
    previewForm,
    showPreview,
    setShowPreview,
  } = useFormContext();
  const { formId } = useParams();
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const onPublish = () => {
    setShowPublishDialog(true);
  };

  const onPublishedClick = () => {
    setShowPublishDialog(true);
  };

  const handleOpenForm = () => {
    setShowPublishDialog(false);
    
    window.open(`/form/${formId}`, "_blank");
  };

  return (
    <div className="flex flex-col h-screen">
      <FormBuilderTopBar
        onPublish={onPublish}
        onPublishedClick={onPublishedClick}
        isPublished={isPublished}
        initialTitle={form?.title ?? ""}
      />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      <PublishDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        formId={formId}
        isPublished={isPublished}
        hasUnpublishedChanges={hasUnpublishedChanges}
        onIsPublishedChange={setIsPublished}
        onHasUnpublishedChangesChange={setHasUnpublishedChanges}
        onOpenForm={handleOpenForm}
        onAfterDiscard={refreshForm}
      />

      {showPreview && (
        <FormPreviewDialog
          open={showPreview}
          onOpenChange={setShowPreview}
          form={previewForm ?? form}
        />
      )}
    </div>
  );
}

export function FormLayout() {
  return (
    <FormProvider>
      <FormLayoutContent />
    </FormProvider>
  );
}
