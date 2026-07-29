import { Outlet } from "react-router-dom";
import { FormBuilderTopBar } from "../../pages/FormBuilder/components/FormBuilderTopBar";
import { FormProvider } from "@/features/forms/hooks/FormContext";
import { useFormContext } from "@/features/forms/hooks/useFormContext";

function FormLayoutContent() {
  const { form, isPublished } = useFormContext();

  const onPublish = () => {};
  const onPublishedClick = () => {};

  return (
    <div className="flex flex-col h-screen">
      <FormBuilderTopBar
        onPublish={onPublish}
        onPublishedClick={onPublishedClick}
        isPublished={isPublished}
        initialTitle={form?.title ?? ""}
        initialDescription={form?.description ?? ""}
      />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
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