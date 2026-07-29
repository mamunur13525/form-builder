import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { getFormById } from "@/entities/form/api/form.api";
import { adaptApiForm } from "@/features/forms/model/adapters";
import type { Form as ApiForm } from "@/entities/form/model/types";
import type { Form } from "@/shared/types/common";
import { FormContext, type FormContextValue } from "./form-context";

export function FormProvider({ children }: { children: ReactNode }) {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);

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

  const updateFormData = useCallback((updates: Partial<Form>) => {
    setForm((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const value: FormContextValue = {
    form,
    isLoading,
    error,
    isPublished,
    refreshForm,
    setIsPublished,
    updateFormData,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}