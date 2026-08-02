import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { getFormById } from "@/entities/form/api/form.api";
import { adaptApiForm } from "@/features/forms/model/adapters";
import type { Form as ApiForm } from "@/entities/form/model/types";
import type { Form } from "@/shared/types/common";
import { FormContext, type FormContextValue, type SaveStatus } from "./form-context";

export function FormProvider({ children }: { children: ReactNode }) {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [previewForm, setPreviewForm] = useState<Form | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const saveStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const refreshForm = useCallback(async () => {
    if (!formId || formId === "new") {
      setForm(null);
      setIsPublished(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const apiForm: ApiForm = await getFormById(formId);
      const adaptedForm = adaptApiForm(apiForm);
      setForm(adaptedForm);
      setIsPublished(adaptedForm.status === "published");
    } catch (err) {
      console.error("Failed to fetch form:", err);
      setError(err instanceof Error ? err.message : "Failed to load form");
    } finally {
      setIsLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    const loadForm = async () => {
      await refreshForm();
    };
    loadForm();
  }, [refreshForm]);

  const showSaveStatus = useCallback((status: SaveStatus) => {
    setSaveStatus(status);
    if (saveStatusTimeoutRef.current) {
      clearTimeout(saveStatusTimeoutRef.current);
    }
    if (status !== "idle") {
      saveStatusTimeoutRef.current = setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    }
  }, []);

  const updateFormData = useCallback((updates: Partial<Form>) => {
    setForm((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  // Opens the preview dialog. Pass a form to preview the latest (unsaved)
  // builder data, otherwise fall back to the previously staged preview form
  // or the loaded form.
  const openPreview = useCallback(
    (formToPreview?: Form | null) => {
      if (formToPreview !== undefined) {
        setPreviewForm(formToPreview);
      } else {
        setPreviewForm((prev) => prev ?? form);
      }
      setShowPreview(true);
    },
    [form],
  );

  const value: FormContextValue = {
    form,
    isLoading,
    error,
    isPublished,
    saveStatus,
    previewForm,
    showPreview,
    refreshForm,
    setIsPublished,
    updateFormData,
    showSaveStatus,
    setPreviewForm,
    setShowPreview,
    openPreview,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}