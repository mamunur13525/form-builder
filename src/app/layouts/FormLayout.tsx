import { Outlet } from "react-router-dom";
import { FormBuilderTopBar } from "../../pages/FormBuilder/components/FormBuilderTopBar";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFormById } from "@/entities/form/api/form.api";
import { useFormStore } from "../store/formStore";

export function FormLayout() {
  const { formId } = useParams<{ formId: string }>();
  const [isPublished, setIsPublished] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");

  
useEffect(() => {
    const loadForm = async () => {
      if (formId && formId !== "new") {
        try {
          const form = await getFormById(formId);
          setFormTitle(form.title);
          setFormDescription(form.description);
          setIsPublished(form.status === "published");
        } catch (error) {
          console.error("Failed to load form:", error);
        }
      }
    };

    loadForm();
  }, [formId]);

  const onPublish = () => {};
  const onPublishedClick = () => {};
  return (
    <div className="flex flex-col h-screen">
      <FormBuilderTopBar
        onPublish={onPublish}
        onPublishedClick={onPublishedClick}
        isPublished={isPublished}
        initialTitle={formTitle}
        initialDescription={formDescription}
      />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
