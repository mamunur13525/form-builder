import { createContext } from "react";
import type { Form } from "@/shared/types/common";

export interface FormContextValue {
  form: Form | null;
  isLoading: boolean;
  error: string | null;
  isPublished: boolean;
  refreshForm: () => Promise<void>;
  setIsPublished: (published: boolean) => void;
  updateFormData: (updates: Partial<Form>) => void;
}

export const FormContext = createContext<FormContextValue | undefined>(
  undefined,
);