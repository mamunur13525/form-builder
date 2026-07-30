import { useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { FormBuilderTopBar } from "../../pages/FormBuilder/components/FormBuilderTopBar";
import { FormProvider } from "@/features/forms/hooks/FormContext";
import { useFormContext } from "@/features/forms/hooks/useFormContext";
import { PublishDialog } from "../../pages/FormBuilder/components/PublishDialog";
import { useFormStore } from "../../app/store/formStore";

function FormLayoutContent() {
  const { form, isPublished, setIsPublished } = useFormContext();
  const { formId } = useParams();
  const { forms } = useFormStore();
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const onPublish = () => {
    setShowPublishDialog(true);
  };

  const onPublishedClick = () => {
    setShowPublishDialog(true);
  };

  const handleOpenForm = () => {
    setShowPublishDialog(false);
    const slug =
      formId && formId !== "new"
        ? forms.find((f) => f.id === formId)?.slug
        : "form-slug";
    window.open(`/form/${slug}`, "_blank");
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
        id={formId}
        isPublished={isPublished}
        slug={
          formId && formId !== "new"
            ? forms.find((f) => f.id === formId)?.slug
            : undefined
        }
        onIsPublishedChange={setIsPublished}
        onOpenForm={handleOpenForm}
      />
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